const express = require('express');
const router = express.Router();
const { register, login, getMe, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', protect, authorize('Admin'), register);
router.get('/me', protect, getMe);
router.put('/reset-password', protect, resetPassword);

module.exports = router;
