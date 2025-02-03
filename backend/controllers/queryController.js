// Controller handles incoming request logic.
// It processes the data sent by the frontend and uses the appropriate service to perform the required operations. (OpenAI API)
// Ensures the request is valid, retrieves appropriate data, and sends a response back to the frontend.

const vectorStore = require('../services/vectorStoreService');
const llamaService = require('../services/llamaService');

const query = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Get relevant memories
        console.log('Querying vector store for:', prompt);
        const relevantMemories = await vectorStore.queryMemories(prompt);
        console.log('Found relevant memories:', relevantMemories);
        
        // Format context from memories
        const context = relevantMemories
            .map(memory => memory.text)
            .join('\n\n');
        console.log('Combined context:', context);

        // Generate response
        const result = await llamaService.generateResponse(prompt, context);

        res.status(200).json({ 
            result,
            relevantMemories: relevantMemories
        });
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ error: 'Error processing query' });
    }
};

module.exports = {
    query
};