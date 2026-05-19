const bookingController = require('./bookingController');
const paymentController = require('./paymentController');

module.exports = {
  createBooking: bookingController.createBooking,
  createPayment: paymentController.createPayment,
  health: bookingController.health
};
