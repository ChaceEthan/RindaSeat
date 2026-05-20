const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, bookingController.listUserBookings);
router.get('/:id', authenticate, bookingController.getBooking);

module.exports = router;
