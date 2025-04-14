const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Save a new conversation
router.post('/', conversationController.saveConversation);

// Get conversations for a specific user
router.get('/user/:userId', conversationController.getUserConversations);

// Get all conversations
router.get('/', conversationController.getAllConversations);

module.exports = router; 