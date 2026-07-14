const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updateFcmToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Stricter rate limit for auth endpoints (20 requests per 15 min per IP)
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 20, message: 'Too many auth attempts, please try again later.' });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;
