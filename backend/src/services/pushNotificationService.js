// @ts-nocheck
const { initializeFirebase, getFirebaseAdmin } = require('../config/firebase');

const notificationProviderNotConfigured = () => ({
  success: false,
  message: 'Firebase messaging not configured'
});

const sendNotification = async ({ token, title, body, data = {} }) => {
  if (!token) {
    return {
      success: false,
      message: 'Notification token is required'
    };
  }

  const app = initializeFirebase();

  if (!app) {
    console.warn('[NOTIFICATION] Firebase not configured - skipping push notification');
    return notificationProviderNotConfigured();
  }

  try {
    const admin = getFirebaseAdmin();
    const messaging = admin.messaging();

    const messageId = await messaging.send({
      token,
      notification: {
        title,
        body
      },
      data,
      webpush: {
        fcmOptions: {
          link: process.env.CLIENT_URL || 'http://localhost:3000'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default'
          }
        }
      },
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      }
    });

    return {
      success: true,
      messageId
    };
  } catch (error) {
    console.error(`[NOTIFICATION] Push notification failed: ${error.message}`);

    if (error.code === 'messaging/invalid-registration-token') {
      return {
        success: false,
        message: 'Invalid notification token',
        code: 'INVALID_TOKEN'
      };
    }

    return {
      success: false,
      message: 'Notification could not be sent'
    };
  }
};

const sendBookingConfirmationNotification = async ({ token, booking }) => {
  if (!token) {
    console.warn('[NOTIFICATION] No token provided for booking notification');
    return {
      success: false,
      message: 'No notification token'
    };
  }

  return sendNotification({
    token,
    title: 'Booking Confirmed',
    body: `Seat ${booking.seat_number || booking.seatNumber} is reserved for your trip.`,
    data: {
      bookingId: String(booking.id || booking.bookingId || ''),
      tripId: String(booking.trip_id || booking.tripId || ''),
      type: 'booking_confirmation'
    }
  });
};

const sendPaymentSuccessNotification = async ({ token, booking }) => {
  if (!token) {
    return {
      success: false,
      message: 'No notification token'
    };
  }

  return sendNotification({
    token,
    title: 'Payment Successful',
    body: 'Your payment has been confirmed. See you on your trip!',
    data: {
      bookingId: String(booking.id || booking.bookingId || ''),
      type: 'payment_success'
    }
  });
};

module.exports = {
  sendBookingConfirmationNotification,
  sendPaymentSuccessNotification,
  sendNotification
};

