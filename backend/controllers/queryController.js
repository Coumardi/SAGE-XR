// Controller handles incoming request logic.
// It processes the data sent by the frontend and uses the appropriate service to perform the required operations. (OpenAI API)
// Ensures the request is valid, retrieves appropriate data, and sends a response back to the frontend.

const vectorStore = require('../services/vectorStoreService');
const llamaService = require('../services/llamaService');

// Minimum similarity score for a result to be considered relevant
const MIN_RELEVANCE_SCORE = 0.75;
// Minimum number of characters needed for context to be considered useful
const MIN_CONTEXT_LENGTH = 50;

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
        
        // Filter memories by relevance score
        const highQualityMemories = relevantMemories.filter(memory => memory.score >= MIN_RELEVANCE_SCORE);
        console.log(`Filtered to ${highQualityMemories.length} high-quality memories with score >= ${MIN_RELEVANCE_SCORE}`);
        
        // Format context from high-quality memories
        const context = highQualityMemories
            .map(memory => memory.text)
            .join('\n\n');
        console.log('Combined context:', context);

        // Check if context is too short or empty
        const effectiveContext = context.length >= MIN_CONTEXT_LENGTH ? context : '';
        
        if (!effectiveContext) {
            console.log('Context is insufficient, passing empty context to LlamaService');
        }

        // Generate response with proper context handling
        const result = await llamaService.generateResponse(prompt, effectiveContext);

        res.status(200).json({ 
            result,
            relevantMemories: effectiveContext ? highQualityMemories : [] // Only return used memories
        });
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ error: 'Error processing query' });
    }
};

module.exports = {
    query
};