// Initialize express router
// Create a route for the /api/query endpoint
// Acts as a middle layer to connect requests from the frontend to the controller
// POST route receives the prompt from the frontend and delegates it to the query controller
// Having routes in a separate file helps in organizing the code and separating concerns

const express = require('express');
const { query } = require('../controllers/queryController');

const router = express.Router();

router.post('/query', query);

module.exports = router;