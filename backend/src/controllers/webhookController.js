// @ts-nocheck
/**
 * Payment Webhook Handlers
 * Processes webhooks from Stripe and MTN MoMo safely
 */

const { query } = require('../config/db');

const WEBHOOK_EVENT_TYPES = {
  STRIPE_CHARGE_SUCCEEDED: 'charge.succeeded',
  STRIPE_CHARGE_FAILED: 'charge.failed',
  STRIPE_PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  STRIPE_PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  MOMO_TRANSACTION_SUCCESS: 'transaction.success',
  MOMO_TRANSACTION_FAILED: 'transaction.failed'
};

const parseStripeSignatureHeader = (signature) => (
  String(signature || '').split(',').reduce((parts, item) => {
    const [key, value] = item.split('=');

    if (key && value) {
      parts[key] = value;
    }

    return parts;
  }, {})
);

const validateStripeWebhookSignature = (body, signature) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[WEBHOOK] Stripe webhook secret not configured');
    return false;
  }

  try {
    const crypto = require('crypto');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signatureParts = parseStripeSignatureHeader(signature);

    if (!signatureParts.t || !signatureParts.v1) {
      return false;
    }

    const payload = `${signatureParts.t}.${Buffer.isBuffer(body) ? body.toString('utf8') : String(body)}`;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    const expected = signatureParts.v1;

    if (computed.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
  } catch (error) {
    console.error(`[WEBHOOK] Stripe signature validation failed: ${error.message}`);
    return false;
  }
};

const validateMomoWebhookSignature = (body, signature) => {
  if (!process.env.MTN_MOMO_API_SECRET) {
    console.warn('[WEBHOOK] MoMo webhook secret not configured');
    return false;
  }

  try {
    const crypto = require('crypto');
    const secret = process.env.MTN_MOMO_API_SECRET;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error(`[WEBHOOK] MoMo signature validation failed: ${error.message}`);
    return false;
  }
};

const updatePaymentStatus = async (transactionId, status) => {
  try {
    const result = await query(
      `UPDATE payments
       SET status = $1
       WHERE transaction_id = $2
       RETURNING id, booking_id, status`,
      [status, transactionId]
    );

    if (result.rowCount === 0) {
      console.warn(`[WEBHOOK] Payment not found for transaction: ${transactionId}`);
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update payment status: ${error.message}`);
    return null;
  }
};

const updateBookingStatus = async (bookingId, bookingStatus, paymentStatus) => {
  try {
    const result = await query(
      `UPDATE bookings
       SET booking_status = $1, payment_status = $2
       WHERE id = $3
       RETURNING id, user_id, booking_status, payment_status`,
      [bookingStatus, paymentStatus, bookingId]
    );

    if (result.rowCount === 0) {
      console.warn(`[WEBHOOK] Booking not found: ${bookingId}`);
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update booking status: ${error.message}`);
    return null;
  }
};

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));

  if (!signature) {
    console.warn('[WEBHOOK] Stripe webhook missing signature header');
    return res.status(400).json({
      success: false,
      message: 'Missing webhook signature'
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[WEBHOOK] Stripe webhook secret not configured');
    return res.status(503).json({
      success: false,
      message: 'Webhook provider not configured'
    });
  }

  if (!validateStripeWebhookSignature(rawBody, signature)) {
    console.warn('[WEBHOOK] Stripe webhook signature validation failed');
    return res.status(400).json({
      success: false,
      message: 'Invalid signature'
    });
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8'));

    switch (event.type) {
      case WEBHOOK_EVENT_TYPES.STRIPE_PAYMENT_INTENT_SUCCEEDED: {
        const paymentIntent = event.data.object;
        const payment = await updatePaymentStatus(paymentIntent.id, 'paid');

        if (payment) {
          await updateBookingStatus(payment.booking_id, 'confirmed', 'paid');
          console.log(`[WEBHOOK] Stripe payment confirmed: ${paymentIntent.id}`);
        }

        break;
      }

      case WEBHOOK_EVENT_TYPES.STRIPE_PAYMENT_INTENT_PAYMENT_FAILED: {
        const paymentIntent = event.data.object;
        const payment = await updatePaymentStatus(paymentIntent.id, 'failed');

        if (payment) {
          await updateBookingStatus(payment.booking_id, 'cancelled', 'failed');
          console.log(`[WEBHOOK] Stripe payment failed: ${paymentIntent.id}`);
        }

        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled Stripe event type: ${event.type}`);
    }

    return res.json({
      success: true,
      received: true
    });
  } catch (error) {
    console.error(`[WEBHOOK] Stripe webhook processing failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

const handleMomoWebhook = async (req, res) => {
  const signature = req.headers['x-signature'] || req.headers['signature'];

  if (!signature) {
    console.warn('[WEBHOOK] MoMo webhook missing signature header');
    return res.status(400).json({
      success: false,
      message: 'Missing webhook signature'
    });
  }

  if (!validateMomoWebhookSignature(req.body, signature)) {
    console.warn('[WEBHOOK] MoMo webhook signature validation failed');
    return res.status(401).json({
      success: false,
      message: 'Invalid signature'
    });
  }

  try {
    const event = req.body;

    switch (event.type) {
      case WEBHOOK_EVENT_TYPES.MOMO_TRANSACTION_SUCCESS: {
        const payment = await updatePaymentStatus(event.transactionId, 'paid');

        if (payment) {
          await updateBookingStatus(payment.booking_id, 'confirmed', 'paid');
          console.log(`[WEBHOOK] MoMo payment confirmed: ${event.transactionId}`);
        }

        break;
      }

      case WEBHOOK_EVENT_TYPES.MOMO_TRANSACTION_FAILED: {
        const payment = await updatePaymentStatus(event.transactionId, 'failed');

        if (payment) {
          await updateBookingStatus(payment.booking_id, 'cancelled', 'failed');
          console.log(`[WEBHOOK] MoMo payment failed: ${event.transactionId}`);
        }

        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled MoMo event type: ${event.type}`);
    }

    return res.json({
      success: true,
      received: true
    });
  } catch (error) {
    console.error(`[WEBHOOK] MoMo webhook processing failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

module.exports = {
  handleStripeWebhook,
  handleMomoWebhook,
  validateStripeWebhookSignature,
  validateMomoWebhookSignature,
  WEBHOOK_EVENT_TYPES
};
