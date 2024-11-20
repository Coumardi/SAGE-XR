const mongoose = require('mongoose');

// Define the Response schema
const responseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  responseId: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: String,
    required: true,
  },
});

// Create the Response model
const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
