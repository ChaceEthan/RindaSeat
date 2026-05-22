const express = require('express');
const tripController = require('../controllers/tripController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', tripController.listTrips);
router.get('/health', tripController.health);
router.get('/meta', tripController.getTripMeta);
router.get('/search', tripController.searchTrips);
router.get('/company/:companyId', tripController.getTripsByCompany);
router.get('/:id/tracking', tripController.getTripTracking);
router.get('/:id/driver-dashboard', authenticate, tripController.getDriverDashboard);
router.post('/:id/location', authenticate, tripController.updateTripLocation);
router.patch('/:id/location', authenticate, tripController.updateTripLocation);
router.post('/:id/passenger-location', authenticate, tripController.sharePassengerLocation);
router.get('/:id/seats', tripController.getTripSeats);
router.get('/:id', tripController.getTripById);

module.exports = router;
