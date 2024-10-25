const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const initializeDatabase = async () => {
    // Add this debug line to check if variables are loading
    console.log('Environment variables:', {
        MONGODB_URI: process.env.MONGODB_URI ? 'defined' : 'undefined',
        COLLECTION_NAME: process.env.COLLECTION_NAME ? 'defined' : 'undefined'
    });

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    if (!process.env.COLLECTION_NAME) {
        throw new Error('COLLECTION_NAME is not defined in environment variables');
    }

    try {
        // Connect to MongoDB
        console.log('Attempting to connect with URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        const db = mongoose.connection.db;
        const collection = db.collection(process.env.COLLECTION_NAME);

        await collection.createIndex({ keywords: 1 });
        await collection.createIndex({ timestamp: 1 });

        return { db, collection };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = { initializeDatabase };