const express = require('express');
const Response = require('../models/response');  // Import the Response model

const router = express.Router();

// POST route to store the question and response data
router.post('/question/add', async (req, res) => {
  try {
    const { userId, question, responseId, timeStamp } = req.body;

    // Create a new document in the Response collection
    const newResponse = new Response({
      userId,
      question,
      responseId,
      timeStamp,
    });

    // Save to the database
    await newResponse.save();
    res.status(201).json({ message: 'Question stored successfully!' });
  } catch (error) {
    console.error('Error storing question:', error);
    res.status(500).json({ error: 'Failed to store question' });
  }
});

module.exports = router;
