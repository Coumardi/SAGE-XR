// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  responseId: { type: String, required: true },
  timeStamp: { type: Date, required: true },
});

const Question = mongoose.model('Question', questionSchema, 'test_collection');

module.exports = Question;
