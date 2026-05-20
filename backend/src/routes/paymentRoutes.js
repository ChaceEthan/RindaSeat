const express = require('express');
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', paymentController.health);
router.post('/', authenticate, paymentController.createPayment);
router.post('/initiate', authenticate, paymentController.createPayment);
router.get('/verify/:transactionId', authenticate, paymentController.verifyPayment);
router.get('/status/:bookingId', authenticate, paymentController.getPaymentStatus);

// Webhook routes - no authentication required
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);
router.post('/webhooks/momo', webhookController.handleMomoWebhook);

module.exports = router;
