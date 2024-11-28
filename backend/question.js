require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser'); // To manage cookies
const { v4: uuidv4 } = require('uuid'); // For generating unique userId
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Middleware to parse cookies

// MongoDB connection
const uri = "mongodb+srv://SE:SE490Group@cluster0.2ilsj.mongodb.net/";
const client = new MongoClient(uri);
let collection;

// Initialize database connection
async function initializeDatabase() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        const database = client.db("test_database");
        collection = database.collection("user_question_storage");
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); // Stop the server if database connection fails
    }
}

// Middleware to assign or retrieve `userId` from cookies
app.use((req, res, next) => {
    if (!req.cookies.userId) {
        const userId = uuidv4(); // Generate unique userId
        res.cookie('userId', userId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 1-week expiry
        req.userId = userId; // Attach to request
        console.log(`Assigned new userId: ${userId}`);
    } else {
        req.userId = req.cookies.userId; // Use existing userId
        console.log(`Retrieved userId from cookies: ${req.userId}`);
    }
    next();
});

// POST endpoint to handle AI interaction and save data
app.post('/call-ai', async (req, res) => {
    const userId = req.userId; // Retrieve userId from middleware
    const { question } = req.body; // Question from user input

    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        const responseId = uuidv4(); // Generate unique responseId
        const timeStamp = new Date().toISOString(); // Current timestamp

        // Simulate AI response (replace with actual AI response logic)
        const aiResponse = `Response for your question: "${question}"`;

        // Save interaction to the database
        const document = { userId, question, responseId, timeStamp };
        console.log("Saving to database:", document);

        const result = await collection.insertOne(document);
        if (result.acknowledged) {
            console.log("Interaction saved successfully");

            res.status(200).json({
                success: true,
                message: aiResponse,
                data: {
                    userId,
                    responseId,
                    timeStamp,
                },
            });
        } else {
            throw new Error("Insert not acknowledged by MongoDB");
        }
    } catch (error) {
        console.error("Error handling AI interaction:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process request",
            details: error.message,
        });
    }
});

// Start the server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error("Failed to initialize server:", error);
});
