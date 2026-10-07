const express = require('express');
const { renderContacts } = require('../controllers/homeController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(renderContacts));

module.exports = router;
