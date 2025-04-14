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
    // Create a new conversation with initial messages
    async createNewConversation(userId, initialMessages = []) {
        try {
            const conversation = new Conversation({
                userId,
                messages: initialMessages,
                isActive: true
            });
            return await conversation.save();
        } catch (error) {
            console.error('Error creating new conversation:', error);
            throw error;
        }
    },

    // End all active conversations for a user
    async endActiveConversations(userId) {
        try {
            await Conversation.updateMany(
                { userId, isActive: true },
                { isActive: false }
            );
        } catch (error) {
            console.error('Error ending active conversations:', error);
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

            conversation.messages.push(message);
            return await conversation.save();
        } catch (error) {
            console.error('Error continuing conversation:', error);
            throw error;
        }
    }
};

module.exports = conversationService; 