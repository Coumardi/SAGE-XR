// Code to run the backend server. This is the entry point of the backend application.
// Cors is a middleware that allows the frontend to communicate with the backend.
// Body-parser is a middleware that parses incoming request bodies in a middleware before the handlers.
// This makes it easier to read the data from the request.
// The queryRoutes file contains the routes for the backend application.
// Linking to the queryRoutes file allows the backend to handle requests to the /api/query will be handled by the query function in the queryController file.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const axios = require('axios'); // Add axios for making HTTP requests
const queryroutes = require('./routes/queryRoutes');
const keywordroutes = require('./routes/keywordRoutes');
const path = require('path'); // Add path module
const extractKeywords = require('./services/keywordService');
const app = express();

// middleware
app.use(cors());
app.use(bodyparser.json({ limit: '1mb' }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// a simple route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// route to call AI service
app.post('/call-ai', async (req, res) => {
  extractKeywords(req.body.text);
});

app.use('/api', queryroutes);
app.use('/api', keywordroutes);

// only start the server if not running tests
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
}

module.exports = app;
