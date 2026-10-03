const express = require('express');
const { listPublicServices, showSingleService } = require('../controllers/serviceController');

const router = express.Router();

router.get('/', listPublicServices);
router.get('/:slug', showSingleService);

module.exports = router;
