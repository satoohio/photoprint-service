const express = require('express');
const { listPublicGallery } = require('../controllers/galleryController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listPublicGallery));

module.exports = router;
