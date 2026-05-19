// @ts-nocheck
const { query } = require('../config/db');
const { initializePayment } = require('../services/paymentService');
const { queueBookingConfirmationNotifications } = require('../services/bookingNotificationService');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat payment service is ready'
  });
};

const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, method = 'mobile_money' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and amount are required'
      });
    }

    const paymentIntent = await initializePayment({ bookingId, amount, method });

    if (!paymentIntent.success) {
      return res.status(503).json(paymentIntent);
    }

    const result = await query(
      `INSERT INTO payments (booking_id, amount, method, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, booking_id, amount, method, transaction_id, status, created_at`,
      [
        paymentIntent.bookingId,
        paymentIntent.amount,
        paymentIntent.method,
        paymentIntent.transactionId,
        paymentIntent.status
      ]
    );

    if (['paid', 'verified', 'confirmed'].includes(paymentIntent.status)) {
      queueBookingConfirmationNotifications({
        bookingId: paymentIntent.bookingId
      });
    }

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  createPayment
};
