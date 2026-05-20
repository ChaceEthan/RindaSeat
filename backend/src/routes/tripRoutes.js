const express = require('express');
const tripController = require('../controllers/tripController');

const router = express.Router();

router.get('/', tripController.listTrips);
router.get('/health', tripController.health);
router.get('/meta', tripController.getTripMeta);
router.get('/search', tripController.searchTrips);
router.get('/company/:companyId', tripController.getTripsByCompany);
router.get('/:id/seats', tripController.getTripSeats);
router.get('/:id', tripController.getTripById);

module.exports = router;
