const express = require('express');
const companyController = require('../controllers/companyController');

const router = express.Router();

router.get('/', companyController.listCompanies);
router.get('/health', companyController.health);

module.exports = router;
