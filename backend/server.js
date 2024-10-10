// Code to run the backend server. This is the entry point of the backend application.
// Cors is a middleware that allows the frontend to communicate with the backend.
// Body-parser is a middleware that parses incoming request bodies in a middleware before the handlers.
// This makes it easier to read the data from the request.
// The queryRoutes file contains the routes for the backend application.
// Linking to the queryRoutes file allows the backend to handle requests to the /api/query will be handled by the query function in the queryController file.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const queryRoutes = require('./routes/queryRoutes');
const keywordRoutes = require('./routes/keywordRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// A simple route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/api', queryRoutes);
app.use('/api', keywordRoutes);

// Only start the server if not running tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;