const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authenticate, authController.profile);
router.get('/profile', authenticate, authController.profile);

module.exports = router;
