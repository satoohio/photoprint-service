const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { getServiceApi } = require('../controllers/serviceController');
const { getGalleryApi } = require('../controllers/galleryController');
const { createOrder } = require('../controllers/orderController');

const router = express.Router();
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Слишком много заявок. Попробуйте позже.'
});

router.get('/services', asyncHandler(getServiceApi));
router.get('/gallery', asyncHandler(getGalleryApi));

router.post('/orders', orderLimiter, [
  body('name').isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа'),
  body('phone').notEmpty().withMessage('Телефон обязателен'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Некорректный email')
], asyncHandler(createOrder));

module.exports = router;
