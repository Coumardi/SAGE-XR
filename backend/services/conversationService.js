const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://SE:SE490Group@cluster0.2ilsj.mongodb.net/SageXR', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB SageXR database');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

const conversationService = {
    // Save a new message to an existing conversation or create a new one
    async saveMessage(userId, message) {
        try {
            // Find the most recent active conversation for this user
            let conversation = await Conversation.findOne({ 
                userId, 
                isActive: true 
            }).sort({ updatedAt: -1 });

            if (!conversation) {
                // Create a new conversation if none exists
                conversation = new Conversation({
                    userId,
                    messages: [message]
                });
            } else {
                // Add message to existing conversation
                conversation.messages.push(message);
            }

            return await conversation.save();
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    },

    // Get the most recent active conversation for a user
    async getCurrentConversation(userId) {
        try {
            return await Conversation.findOne({ 
                userId, 
                isActive: true 
            }).sort({ updatedAt: -1 });
        } catch (error) {
            console.error('Error getting current conversation:', error);
            throw error;
        }
    },

    // Get all conversations for a user
    async getUserConversations(userId) {
        try {
            return await Conversation.find({ userId })
                .sort({ updatedAt: -1 });
        } catch (error) {
            console.error('Error getting user conversations:', error);
            throw error;
        }
    },

    // Get a specific conversation by ID
    async getConversationById(conversationId) {
        try {
            return await Conversation.findById(conversationId);
        } catch (error) {
            console.error('Error getting conversation by ID:', error);
            throw error;
        }
    },

    // Mark a conversation as inactive (ended)
    async endConversation(conversationId) {
        try {
            return await Conversation.findByIdAndUpdate(
                conversationId,
                { isActive: false },
                { new: true }
            );
        } catch (error) {
            console.error('Error ending conversation:', error);
            throw error;
        }
    },

    // Continue a specific conversation
    async continueConversation(conversationId, message) {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            // Reactivate the conversation if it was inactive
            if (!conversation.isActive) {
                conversation.isActive = true;
            }

            conversation.messages.push(message);
            return await conversation.save();
        } catch (error) {
            console.error('Error continuing conversation:', error);
            throw error;
        }
    }
};

module.exports = conversationService; 