const express = require('express');
const { createLimiter } = require('../middleware/rateLimit');
const asyncHandler = require('../utils/asyncHandler');
const { loginUser, logoutUser } = require('../controllers/authController');

const router = express.Router();
const authLimiter = createLimiter('auth', {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа. Попробуйте позже.'
});

router.post('/login', authLimiter, asyncHandler(loginUser));
router.post('/logout', asyncHandler(logoutUser));

module.exports = router;
