const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    },
    relevantMemories: {
        type: Array,
        default: []
    }
});

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Update updatedAt before saving
conversationSchema.pre('save', function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('Conversation', conversationSchema, 'conversations');