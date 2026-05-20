// @ts-nocheck
const { query } = require('../config/db');
const { initializePayment, verifyPayment: verifyPaymentProvider } = require('../services/paymentService');
const { queueBookingConfirmationNotifications } = require('../services/bookingNotificationService');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat payment service is ready'
  });
};

const normalizeMethod = (method) => {
  const normalized = String(method || '').trim().toLowerCase();

  if (['momo', 'mtn', 'mtn_momo', 'mtn momo'].includes(normalized)) return 'mtn_momo';
  if (['airtel', 'airtel_money', 'airtel money'].includes(normalized)) return 'airtel_money';
  if (['stripe', 'card', 'credit_card', 'debit_card'].includes(normalized)) return 'stripe';
  if (['mobile', 'mobile_money', 'mobile money'].includes(normalized)) return 'mobile_money';
  if (['cash', 'bank_transfer'].includes(normalized)) return normalized;

  return 'mobile_money';
};

const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, phoneNumber } = req.body;
    const method = normalizeMethod(req.body.method);

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and amount are required'
      });
    }

    const bookingResult = await query(
      `SELECT id, user_id, total_amount, payment_status, booking_status
       FROM bookings
       WHERE id = $1 AND user_id = $2`,
      [bookingId, req.user.id]
    );

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];
    const expectedAmount = Number(booking.total_amount || amount);

    const paymentIntent = await initializePayment({
      bookingId,
      amount: expectedAmount,
      method
    });

    if (!paymentIntent.success) {
      return res.status(503).json(paymentIntent);
    }

    const paidStatus = 'paid';
    const result = await query(
      `INSERT INTO payments (
        booking_id,
        amount,
        payment_method,
        method,
        transaction_id,
        payment_status,
        status,
        provider,
        phone_number,
        paid_at,
        metadata
       )
       VALUES ($1, $2, $3, $3, $4, $5, $5, $6, $7, NOW(), $8::JSONB)
       RETURNING id, booking_id, amount, payment_method, method, transaction_id, payment_status, status, provider, phone_number, paid_at, created_at`,
      [
        paymentIntent.bookingId,
        expectedAmount,
        method,
        paymentIntent.transactionId,
        paidStatus,
        paymentIntent.provider || 'rindaseat_demo',
        phoneNumber || null,
        JSON.stringify({
          simulated: true,
          currency: process.env.DEFAULT_CURRENCY || 'RWF',
          note: 'Demo payment confirmed instantly for local RindaSeat testing'
        })
      ]
    );

    await query(
      `UPDATE bookings
       SET payment_status = 'paid',
           booking_status = 'confirmed',
           confirmed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    );

    await query(
      `UPDATE booking_seats
       SET status = 'confirmed'
       WHERE booking_id = $1`,
      [bookingId]
    );

    queueBookingConfirmationNotifications({
      bookingId
    });

    return res.status(201).json({
      success: true,
      payment: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const verification = await verifyPaymentProvider(req.params.transactionId);
    const paymentResult = await query(
      `SELECT id, booking_id, amount, payment_method, method, transaction_id, payment_status, status, paid_at, created_at
       FROM payments
       WHERE transaction_id = $1`,
      [req.params.transactionId]
    );

    return res.json({
      success: true,
      data: {
        ...verification,
        payment: paymentResult.rows[0] || null
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT payments.id, payments.booking_id, payments.amount, payments.payment_method, payments.method, payments.transaction_id, payments.payment_status, payments.status, payments.paid_at, payments.created_at
       FROM payments
       JOIN bookings ON bookings.id = payments.booking_id
       WHERE payments.booking_id = $1 AND bookings.user_id = $2
       ORDER BY payments.created_at DESC
       LIMIT 1`,
      [req.params.bookingId, req.user.id]
    );

    return res.json({
      success: true,
      data: result.rows[0] || {
        bookingId: req.params.bookingId,
        status: 'pending'
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  createPayment,
  verifyPayment,
  getPaymentStatus
};
