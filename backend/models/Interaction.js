// backend/models/Interaction.js

const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  responseId: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interaction', interactionSchema);