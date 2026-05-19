// @ts-nocheck
const { query } = require('../config/db');
const { getSocket } = require('../config/socket');
const { sendBookingConfirmationEmail } = require('./emailService');
const { sendBookingSMS } = require('./smsService');

const getBookingNotificationDetails = async (bookingId) => {
  const result = await query(
    `SELECT
      bookings.id,
      bookings.user_id,
      bookings.trip_id,
      bookings.seat_number,
      bookings.qr_code,
      bookings.payment_status,
      bookings.booking_status,
      users.full_name,
      users.email,
      users.phone,
      companies.name AS company_name,
      origin.name AS origin,
      destination.name AS destination,
      trips.departure_time,
      trips.arrival_time
     FROM bookings
     JOIN users ON users.id = bookings.user_id
     JOIN trips ON trips.id = bookings.trip_id
     JOIN buses ON buses.id = trips.bus_id
     JOIN companies ON companies.id = buses.company_id
     JOIN routes ON routes.id = trips.route_id
     JOIN stations origin ON origin.id = routes.origin_station_id
     JOIN stations destination ON destination.id = routes.destination_station_id
     WHERE bookings.id = $1`,
    [bookingId]
  );

  return result.rows[0] || null;
};

const buildSmsMessage = (booking) => (
  `RindaSeat: Your ticket from ${booking.origin} to ${booking.destination} is confirmed. `
  + `Seat ${booking.seat_number}. Booking ID: ${booking.id}`
);

const emitBookingConfirmed = (booking) => {
  try {
    getSocket().emit('booking_confirmed', {
      bookingId: booking.id,
      userId: booking.user_id,
      tripId: booking.trip_id,
      seatNumber: booking.seat_number,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status
    });
  } catch (error) {
    console.warn(`[SOCKET] booking_confirmed emit skipped: ${error.message}`);
  }
};

const sendBookingConfirmationNotifications = async ({ bookingId, qrImage }) => {
  try {
    const booking = await getBookingNotificationDetails(bookingId);

    if (!booking) {
      console.warn(`[NOTIFICATION] Booking not found for confirmation: ${bookingId}`);
      return;
    }

    const user = {
      full_name: booking.full_name,
      email: booking.email,
      phone: booking.phone
    };

    await Promise.allSettled([
      sendBookingConfirmationEmail(user, booking, qrImage || booking.qr_code),
      sendBookingSMS(booking.phone, buildSmsMessage(booking))
    ]);

    emitBookingConfirmed(booking);
  } catch (error) {
    console.warn(`[NOTIFICATION] Booking confirmation notifications failed: ${error.message}`);
  }
};

const queueBookingConfirmationNotifications = ({ bookingId, qrImage }) => {
  setImmediate(() => {
    sendBookingConfirmationNotifications({ bookingId, qrImage }).catch((error) => {
      console.warn(`[NOTIFICATION] Background notification failed: ${error.message}`);
    });
  });
};

module.exports = {
  queueBookingConfirmationNotifications,
  sendBookingConfirmationNotifications
};
