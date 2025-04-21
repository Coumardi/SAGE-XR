const conversationService = require('../services/conversationService');

const conversationController = {
    // Save a new conversation
    async saveConversation(req, res) {
        try {
            const { userId, conversation } = req.body;
            const savedConversation = await conversationService.saveConversation(userId, conversation);
            res.status(201).json(savedConversation);
        } catch (error) {
            res.status(500).json({ error: 'Error saving conversation' });
        }
    },

    // Get conversations for a specific user
    async getUserConversations(req, res) {
        try {
            const { userId } = req.params;
            const conversations = await conversationService.getUserConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ error: 'Error getting user conversations' });
        }
    },

    // Get all conversations
    async getAllConversations(req, res) {
        try {
            const conversations = await conversationService.getAllConversations();
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ error: 'Error getting all conversations' });
        }
    }
};

module.exports = conversationController; 