const express = require('express');
const { listPublicGallery } = require('../controllers/galleryController');

const router = express.Router();

router.get('/', listPublicGallery);

module.exports = router;
