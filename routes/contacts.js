const express = require('express');
const { renderContacts } = require('../controllers/homeController');

const router = express.Router();

router.get('/', renderContacts);

module.exports = router;
