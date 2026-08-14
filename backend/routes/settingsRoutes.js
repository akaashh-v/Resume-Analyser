const express = require('express');
const router = express.Router();
const { updateApiKey } = require('../controllers/settingsController');

router.post('/api-key', updateApiKey);

module.exports = router;
