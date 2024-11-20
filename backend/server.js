require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase } = require('./config/database');
const queryRoutes = require('./routes/queryRoutes');
const keywordRoutes = require('./routes/keywordRoutes');
const extractKeywords = require('./services/keywordService');
const openaiService = require('./services/openaiService');
const documentMatcher = require('./services/documentMatcherService');
const uploadRoutes = require('./routes/uploadRoutes');
<<<<<<< Updated upstream
const interactionRoutes = require('./routes/interaction');
const Question = require('./models/question');  // Import the Question model

=======
const mongoose = require('mongoose');
const ResponseModel = require('./models/response');  // Assuming you have a Response model
>>>>>>> Stashed changes
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Initialize the database and services
const startServer = async () => {
  try {
    // Initialize database connection
    const { collection } = await initializeDatabase();
<<<<<<< Updated upstream
    
    // Initialize document matcher service with your collection
    console.log('Initializing DocumentMatcherService...');
    documentMatcher.initialize(collection);
    
=======

    // Initialize document matcher service
    console.log('Initializing DocumentMatcherService...');
    documentMatcher.initialize(collection);

>>>>>>> Stashed changes
    // Verify initialization
    if (!documentMatcher.collection) {
      throw new Error('Failed to initialize DocumentMatcherService');
    }

<<<<<<< Updated upstream
    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Serve index.html at root URL
=======
    // Serve static files (React frontend)
    app.use(express.static(path.join(__dirname, 'public')));

    // Root route serves index.html
>>>>>>> Stashed changes
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

<<<<<<< Updated upstream
    // Define the /call-ai route
    app.post('/call-ai', async (req, res) => {
      try {
        // Extract keywords from user input using LLM
        const keywordList = await extractKeywords(req.body.data);
        console.log('Extracted keywords:', keywordList);

        // Find best matching document using our service
=======
    // POST route for AI processing
    app.post('/call-ai', async (req, res) => {
      try {
        const { userId, question, time } = req.body;
        // Extract keywords from the input data
        const keywordList = await extractKeywords(question);
        console.log('Extracted keywords:', keywordList);

        // Find the best matching document using document matcher
>>>>>>> Stashed changes
        const bestMatch = await documentMatcher.findBestMatch(keywordList);
        console.log('Best matching document:', bestMatch);

        let aiResponse;
        if (bestMatch) {
          // Generate AI response using the matched context
          aiResponse = await openaiService.generateResponse(
<<<<<<< Updated upstream
            req.body.data,
=======
            question,
>>>>>>> Stashed changes
            bestMatch.context
          );
        } else {
          // Handle cases where no matching document is found
<<<<<<< Updated upstream
          aiResponse = await openaiService.handleNoMatch(req.body.data);
        }

        res.json({ 
          message: aiResponse,
          matchedDocument: bestMatch || null
=======
          aiResponse = await openaiService.handleNoMatch(question);
        }

        // Generate a responseId for this request (can be a UUID or any identifier)
        const responseId = new mongoose.Types.ObjectId();  // Example

        // Save user data in the database (userId, question, responseId, time)
        const responseDoc = new ResponseModel({
          userId,
          question,
          responseId,
          time,
          responseMessage: aiResponse
        });

        // Save the document in the database
        await responseDoc.save();

        res.json({
          message: aiResponse,
          matchedDocument: bestMatch || null,
          responseId: responseId,
>>>>>>> Stashed changes
        });

      } catch (error) {
        console.error('Error in /call-ai:', error);
<<<<<<< Updated upstream
        res.status(500).json({ 
          error: 'Error processing request',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined 
=======
        res.status(500).json({
          error: 'Error processing request',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
>>>>>>> Stashed changes
        });
      }
    });

<<<<<<< Updated upstream
    // Define the /api/question/add route to store questions and responses
    app.post('/api/question/add', async (req, res) => {
        
        const { userId, question, responseId, timeStamp } = req.body;
      
        // Check if all fields are provided
        if (!userId || !question || !responseId || !timeStamp) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
      
        // Logic to save the question goes here
        try {
          const newQuestion = new Question({ userId, question, responseId, timeStamp });
          await newQuestion.save();
          res.status(200).json({ message: 'Question stored successfully' });
        } catch (error) {
          console.error('Error storing question:', error);
          res.status(500).json({ message: 'Failed to store question' });
        }
      });

    // API routes for queries, keywords, uploads, and interactions
    app.use('/api', queryroutes);
    app.use('/api', keywordroutes);
    app.use('/api', uploadRoutes);
    app.use('/api', interactionRoutes);

    // Only start the server if not running tests
    if (process.env.NODE_ENV !== 'test') {
      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
=======
    // Register additional API routes
    app.use('/api', queryRoutes);
    app.use('/api', keywordRoutes);
    app.use('/api', uploadRoutes);

    // Only start server in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
>>>>>>> Stashed changes
    }

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
