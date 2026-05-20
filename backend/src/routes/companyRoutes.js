const express = require('express');
const companyController = require('../controllers/companyController');

const router = express.Router();

router.get('/', companyController.listCompanies);
router.get('/health', companyController.health);
router.get('/:id/trips', companyController.getCompanyTrips);
router.get('/:id', companyController.getCompanyById);

module.exports = router;
