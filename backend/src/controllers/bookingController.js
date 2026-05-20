// @ts-nocheck
const { pool, query } = require('../config/db');
const { generateBookingQrCode } = require('../services/qrService');
const { queueBookingConfirmationNotifications } = require('../services/bookingNotificationService');
const { lockSeat, releaseSeat } = require('../services/seatLockService');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat booking service is ready'
  });
};

const normalizeSeatInput = (body) => {
  if (Array.isArray(body.seats)) {
    return body.seats
      .map((seat) => (typeof seat === 'string' ? seat : seat.number || seat.seatNumber))
      .filter(Boolean);
  }

  if (Array.isArray(body.seatNumbers)) {
    return body.seatNumbers.filter(Boolean);
  }

  if (body.seatNumber) {
    return [String(body.seatNumber)];
  }

  return [];
};

const seatLabelToIndex = (seatLabel) => {
  const normalized = String(seatLabel).toUpperCase().trim();
  const match = normalized.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    const numeric = Number(normalized);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  }

  const rowLetters = match[1];
  const col = Number(match[2]);
  const rowIndex = rowLetters.split('').reduce((total, letter) => total * 26 + (letter.charCodeAt(0) - 64), 0);
  return ((rowIndex - 1) * 4) + col;
};

const mapBookingRow = (row) => ({
  id: row.id,
  bookingReference: row.booking_reference,
  tripId: row.trip_id,
  userId: row.user_id,
  passengerName: row.passenger_name,
  passengerPhone: row.passenger_phone,
  passengerEmail: row.passenger_email,
  departure: row.origin_city || row.origin,
  arrival: row.destination_city || row.destination,
  departureStation: row.origin,
  arrivalStation: row.destination,
  company: row.company_name,
  companyName: row.company_name,
  companyLogoUrl: row.logo_url,
  date: row.departure_time,
  departureDate: row.departure_time,
  arrivalDate: row.arrival_time,
  seats: row.seats || row.seat_numbers || [],
  totalPrice: Number(row.total_amount || 0),
  paymentStatus: row.payment_status,
  bookingStatus: row.booking_status,
  qrCode: row.qr_code,
  createdAt: row.created_at
});

const bookingSelect = () => `
  SELECT
    bookings.id,
    bookings.booking_reference,
    bookings.user_id,
    bookings.trip_id,
    bookings.passenger_name,
    bookings.passenger_phone,
    bookings.passenger_email,
    bookings.seat_numbers,
    bookings.total_amount,
    bookings.qr_code,
    bookings.payment_status,
    bookings.booking_status,
    bookings.created_at,
    trips.departure_time,
    trips.arrival_time,
    companies.name AS company_name,
    companies.logo_url,
    origin.name AS origin,
    origin.city AS origin_city,
    destination.name AS destination,
    destination.city AS destination_city,
    COALESCE(
      ARRAY_AGG(booking_seats.seat_number ORDER BY booking_seats.seat_number)
        FILTER (WHERE booking_seats.id IS NOT NULL),
      bookings.seat_numbers
    ) AS seats
  FROM bookings
  JOIN trips ON trips.id = bookings.trip_id
  JOIN buses ON buses.id = trips.bus_id
  JOIN companies ON companies.id = buses.company_id
  JOIN routes ON routes.id = trips.route_id
  JOIN stations origin ON origin.id = routes.origin_station_id
  JOIN stations destination ON destination.id = routes.destination_station_id
  LEFT JOIN booking_seats ON booking_seats.booking_id = bookings.id
`;

const bookingGroup = () => `
  GROUP BY
    bookings.id,
    trips.id,
    companies.id,
    origin.id,
    destination.id
`;

const createBooking = async (req, res, next) => {
  const client = await pool.connect();
  const locks = [];

  try {
    const { tripId, passengerInfo = {} } = req.body;
    const userId = req.user.id;
    const seats = normalizeSeatInput(req.body);

    if (!tripId || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tripId and at least one seat are required'
      });
    }

    if (seats.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'A single booking can include up to 6 seats'
      });
    }

    for (const seatNumber of seats) {
      const seatLock = lockSeat({ tripId, seatNumber, userId });
      locks.push(seatNumber);

      if (!seatLock.locked) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatNumber} is temporarily locked by another customer`,
          data: {
            expiresAt: new Date(seatLock.expiresAt).toISOString()
          }
        });
      }
    }

    await client.query('BEGIN');

    const tripResult = await client.query(
      `SELECT trips.id, trips.ticket_price, trips.status, buses.total_seats
       FROM trips
       JOIN buses ON buses.id = trips.bus_id
       WHERE trips.id = $1
       FOR UPDATE`,
      [tripId]
    );

    if (tripResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const trip = tripResult.rows[0];
    if (!['scheduled', 'boarding'].includes(trip.status)) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'This trip is no longer available for booking'
      });
    }

    const existingSeats = await client.query(
      `SELECT seat_number
       FROM booking_seats
       WHERE trip_id = $1
       AND seat_number = ANY($2::TEXT[])
       AND status IN ('reserved', 'confirmed')`,
      [tripId, seats]
    );

    if (existingSeats.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Seat ${existingSeats.rows[0].seat_number} is already booked`
      });
    }

    const totalAmount = Number(trip.ticket_price) * seats.length;
    const firstSeatIndex = seatLabelToIndex(seats[0]);
    const bookingReference = `RS${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id,
        trip_id,
        seat_number,
        seat_numbers,
        passenger_name,
        passenger_phone,
        passenger_email,
        total_amount,
        booking_reference,
        payment_status,
        booking_status
       )
       VALUES ($1, $2, $3, $4::TEXT[], $5, $6, $7, $8, $9, 'pending', 'reserved')
       RETURNING id, user_id, trip_id, seat_number, seat_numbers, booking_reference, payment_status, booking_status, created_at`,
      [
        userId,
        tripId,
        firstSeatIndex,
        seats,
        passengerInfo.fullName || passengerInfo.name || null,
        passengerInfo.phone || null,
        passengerInfo.email || null,
        totalAmount,
        bookingReference
      ]
    );

    const booking = bookingResult.rows[0];

    for (const seatNumber of seats) {
      await client.query(
        `INSERT INTO booking_seats (booking_id, trip_id, seat_number, status)
         VALUES ($1, $2, $3, 'reserved')`,
        [booking.id, tripId, seatNumber]
      );
    }

    const qrCode = await generateBookingQrCode({
      ...booking,
      seat_number: seats.join(', ')
    });

    await client.query(
      `UPDATE bookings
       SET qr_code = $1, updated_at = NOW()
       WHERE id = $2`,
      [qrCode, booking.id]
    );

    await client.query('COMMIT');

    const fullBooking = await query(
      `${bookingSelect()}
       WHERE bookings.id = $1
       ${bookingGroup()}
       LIMIT 1`,
      [booking.id]
    );

    queueBookingConfirmationNotifications({
      bookingId: booking.id,
      qrImage: qrCode
    });

    return res.status(201).json({
      success: true,
      booking: mapBookingRow(fullBooking.rows[0]),
      data: mapBookingRow(fullBooking.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return next(error);
  } finally {
    locks.forEach((seatNumber) => releaseSeat({ tripId: req.body.tripId, seatNumber, userId: req.user?.id }));
    client.release();
  }
};

const listUserBookings = async (req, res, next) => {
  try {
    const result = await query(
      `${bookingSelect()}
       WHERE bookings.user_id = $1
       ${bookingGroup()}
       ORDER BY bookings.created_at DESC`,
      [req.user.id]
    );

    const bookings = result.rows.map(mapBookingRow);

    return res.json({
      success: true,
      bookings,
      data: bookings
    });
  } catch (error) {
    return next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const result = await query(
      `${bookingSelect()}
       WHERE bookings.id = $1 AND bookings.user_id = $2
       ${bookingGroup()}
       LIMIT 1`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      booking: mapBookingRow(result.rows[0]),
      data: mapBookingRow(result.rows[0])
    });
  } catch (error) {
    return next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE bookings
       SET booking_status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND booking_status IN ('reserved', 'confirmed')
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Active booking not found'
      });
    }

    await client.query(
      `UPDATE booking_seats
       SET status = 'cancelled'
       WHERE booking_id = $1`,
      [req.params.id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Booking cancelled'
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  health,
  createBooking,
  listUserBookings,
  getBooking,
  cancelBooking
};
