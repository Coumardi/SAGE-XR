require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const path = require('path');
const { initializeDatabase } = require('./config/database');
const queryroutes = require('./routes/queryRoutes');
const keywordroutes = require('./routes/keywordRoutes');
const extractKeywords = require('./services/keywordService');
const openaiService = require('./services/openaiService');
const documentMatcher = require('./services/documentMatcherService');

const app = express();

// middleware
app.use(cors());
app.use(bodyparser.json({ limit: '1mb' }));

// Initialize database and services
const startServer = async () => {
    try {
        // Initialize database connection
        const { collection } = await initializeDatabase();
        
        // Initialize document matcher service with your collection
        documentMatcher.initialize(collection);

        // serve static files
        app.use(express.static(path.join(__dirname, 'public')));

        // routes
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.post('/call-ai', async (req, res) => {
            try {
                // Extract keywords from user input using LLM
                const keywordList = await extractKeywords(req.body.data);
                
                // Find best matching document using our service
                const bestMatch = await documentMatcher.findBestMatch(keywordList);
                
                if (!bestMatch) {
                    return res.status(404).json({ 
                        error: 'No matching document found',
                        message: 'Unable to find relevant context for your query'
                    });
                }

                // Generate AI response using the matched context
                const aiResponse = await openaiService.generateResponse(
                    req.body.data,
                    bestMatch.context
                );
                
                res.json({ 
                    message: aiResponse,
                    matchedDocument: bestMatch
                });

            } catch (error) {
                console.error('Error in /call-ai:', error);
                res.status(500).json({ 
                    error: 'Error processing request',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
                });
            }
        });

        app.use('/api', queryroutes);
        app.use('/api', keywordroutes);

        // only start the server if not running tests
        if (process.env.NODE_ENV !== 'test') {
            const port = process.env.PORT || 5000;
            app.listen(port, () => {
                console.log(`Server running on port ${port}`);
            });
        }

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app;