const express = require('express');
const { query } = require('../controllers/queryController');

const router = express.Router();

router.post('/query', query);

module.exports = router;