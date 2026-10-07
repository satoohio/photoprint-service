const express = require('express');
const { listPublicServices, showSingleService } = require('../controllers/serviceController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listPublicServices));
router.get('/:slug', asyncHandler(showSingleService));

module.exports = router;
