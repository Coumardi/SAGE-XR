const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const initializeDatabase = async () => {
    console.log('Starting database initialization...');
    
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    if (!process.env.COLLECTION_NAME) {
        throw new Error('COLLECTION_NAME is not defined in environment variables');
    }

    // Set mongoose debug mode to true
    mongoose.set('debug', true);

    try {
        const mongooseOptions = {
            serverSelectionTimeoutMS: 15000,
            heartbeatFrequencyMS: 2000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            family: 4
        };

        // Log the sanitized connection string (remove password)
        const sanitizedUri = process.env.MONGODB_URI.replace(
            /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/,
            '$1*****$3'
        );
        console.log('Attempting connection with URI:', sanitizedUri);

        // Set up connection event listeners before connecting
        mongoose.connection.on('connecting', () => {
            console.log('Initiating MongoDB connection...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Attempt connection
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

        console.log('Successfully connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection(process.env.COLLECTION_NAME);

        // Test the collection by attempting to find one document
        try {
            console.log(`Checking collection ${process.env.COLLECTION_NAME}...`);
            const collectionExists = await db.listCollections({ name: process.env.COLLECTION_NAME }).hasNext();
            
            if (!collectionExists) {
                console.log(`Collection ${process.env.COLLECTION_NAME} does not exist. Creating it...`);
                await db.createCollection(process.env.COLLECTION_NAME);
                console.log('Collection created successfully');
            } else {
                console.log(`Collection ${process.env.COLLECTION_NAME} exists`);
            }
        } catch (collectionError) {
            console.error('Error accessing collection:', collectionError);
            throw collectionError;
        }

        // Create indexes
        console.log('Creating indexes...');
        await collection.createIndex({ keywords: 1 });
        await collection.createIndex({ timestamp: 1 });
        console.log('Indexes created successfully');

        return { db, collection };
    } catch (error) {
        console.error('Detailed connection error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            codeName: error.codeName,
        });

        throw error;
    }
};

// Export a function that retries the connection
const initializeDatabaseWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Connection attempt ${attempt} of ${maxRetries}`);
            return await initializeDatabase();
        } catch (error) {
            if (attempt === maxRetries) {
                console.error('All connection attempts failed');
                throw error;
            }
            console.log(`Attempt ${attempt} failed, retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = { initializeDatabase, initializeDatabaseWithRetry };