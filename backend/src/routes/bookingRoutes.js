const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', bookingController.health);
router.get('/my-bookings', authenticate, bookingController.listUserBookings);
router.get('/history', authenticate, bookingController.listUserBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.post('/', authenticate, bookingController.createBooking);
router.post('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
