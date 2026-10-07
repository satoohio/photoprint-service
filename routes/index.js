const express = require('express');
const { renderHome } = require('../controllers/homeController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(renderHome));

module.exports = router;
