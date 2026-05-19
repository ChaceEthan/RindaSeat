// @ts-nocheck
const { query } = require('../config/db');
const { generateBookingQrCode } = require('../services/qrService');
const { queueBookingConfirmationNotifications } = require('../services/bookingNotificationService');
const { lockSeat, releaseSeat } = require('../services/seatLockService');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat booking service is ready'
  });
};

const createBooking = async (req, res, next) => {
  try {
    const { tripId, seatNumber } = req.body;
    const userId = req.user.id;

    if (!tripId || !seatNumber) {
      return res.status(400).json({
        success: false,
        message: 'tripId and seatNumber are required'
      });
    }

    const seatLock = lockSeat({ tripId, seatNumber, userId });

    if (!seatLock.locked) {
      return res.status(409).json({
        success: false,
        message: 'Seat is temporarily locked by another customer',
        data: {
          expiresAt: new Date(seatLock.expiresAt).toISOString()
        }
      });
    }

    const existingBooking = await query(
      `SELECT id FROM bookings
       WHERE trip_id = $1
       AND seat_number = $2
       AND booking_status IN ('reserved', 'confirmed')`,
      [tripId, seatNumber]
    );

    if (existingBooking.rowCount > 0) {
      releaseSeat({ tripId, seatNumber, userId });
      return res.status(409).json({
        success: false,
        message: 'Seat is already booked'
      });
    }

    const bookingResult = await query(
      `INSERT INTO bookings (user_id, trip_id, seat_number, payment_status, booking_status)
       VALUES ($1, $2, $3, 'pending', 'reserved')
       RETURNING id, user_id, trip_id, seat_number, payment_status, booking_status, created_at`,
      [userId, tripId, seatNumber]
    );

    const booking = bookingResult.rows[0];
    const qrCode = await generateBookingQrCode(booking);

    const updatedBooking = await query(
      `UPDATE bookings
       SET qr_code = $1
       WHERE id = $2
       RETURNING id, user_id, trip_id, seat_number, qr_code, payment_status, booking_status, created_at`,
      [qrCode, booking.id]
    );

    queueBookingConfirmationNotifications({
      bookingId: updatedBooking.rows[0].id,
      qrImage: qrCode
    });

    return res.status(201).json({
      success: true,
      data: updatedBooking.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  createBooking
};
