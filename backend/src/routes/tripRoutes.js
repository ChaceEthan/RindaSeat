const express = require('express');
const tripController = require('../controllers/tripController');

const router = express.Router();

router.get('/', tripController.listTrips);
router.get('/health', tripController.health);

module.exports = router;
