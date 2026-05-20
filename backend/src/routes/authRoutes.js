const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authController.health);
router.post('/register', authController.register);
router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/logout', authController.logout);
router.post('/refresh', authenticate, authController.refresh);
router.get('/profile', authenticate, authController.profile);

module.exports = router;
