// routes/keywordRoutes.js
const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');

// Route to handle both storing and querying keywords
router.post('/handleText', keywordController.handleText);

module.exports = router;
