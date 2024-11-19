const express = require('express');
const Interaction = require('../models/Interaction');
const router = express.Router();

// Route to add a new interaction
router.post('/interaction', async (req, res) => {
  const { userId, question, responseId, timeStamp } = req.body;

  // Validate incoming data
  if (!userId || !question || !responseId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check for duplicate interaction
    const existingInteraction = await Interaction.findOne({ userId, question });
    if (existingInteraction) {
      return res.status(409).json({ message: 'Duplicate interaction' });
    }

    // Create a new interaction
    const interaction = new Interaction({
      userId,
      question,
      responseId,
      timeStamp,
    });

    // Save the interaction to the database
    await interaction.save();

    // Return success message and the saved interaction data
    res.json({
      message: 'Interaction saved successfully!',
      interaction: { userId, question, responseId, timeStamp }
    });
  } catch (error) {
    console.error('Error saving interaction:', error, 'Request data:', req.body);
    res.status(500).json({ message: 'Error saving interaction' });
  }
});

module.exports = router;
