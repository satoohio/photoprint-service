const express = require('express');
const rateLimit = require('express-rate-limit');
const { loginUser, logoutUser } = require('../controllers/authController');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа. Попробуйте позже.'
});

router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);

module.exports = router;
