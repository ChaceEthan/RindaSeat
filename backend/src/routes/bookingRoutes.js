const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', bookingController.health);
router.post('/', authenticate, bookingController.createBooking);

module.exports = router;
