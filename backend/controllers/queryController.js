// Controller handles incoming request logic.
// It processes the data sent by the frontend and uses the appropriate service to perform the required operations. (OpenAI API)
// Ensures the request is valid, retrieves appropriate data, and sends a response back to the frontend.

const vectorStore = require('../services/vectorStoreService');
const llamaService = require('../services/llamaService');
const conversationService = require('../services/conversationService');

// Minimum similarity score for a result to be considered relevant
const MIN_RELEVANCE_SCORE = 0.6;
// Minimum number of characters needed for context to be considered useful
const MIN_CONTEXT_LENGTH = 50;

const query = async (req, res) => {
    const { prompt, context = [], userId, conversationId, isNewConversation = false } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
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
        const memoryContext = highQualityMemories
            .map(memory => memory.text)
            .join('\n\n');
        console.log('Combined memory context:', memoryContext);

        // Check if memory context is too short or empty
        const effectiveMemoryContext = memoryContext.length >= MIN_CONTEXT_LENGTH ? memoryContext : '';
        
        if (!effectiveMemoryContext) {
            console.log('Memory context is insufficient, passing empty context to LlamaService');
        }

        // Generate response with both conversation context and memory context
        const result = await llamaService.generateResponse(prompt, effectiveMemoryContext, context);

        // Create message objects
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const userMessage = {
            type: 'user',
            text: prompt,
            timeStamp: currentTime
        };

        const aiMessage = {
            type: 'ai',
            text: result,
            timeStamp: currentTime,
            relevantMemories: highQualityMemories
        };

        let conversation;
        // Store messages in the conversation
        if (!isNewConversation && conversationId) {
            // Continue existing conversation
            await conversationService.continueConversation(conversationId, userMessage);
            conversation = await conversationService.continueConversation(conversationId, aiMessage);
        } else {
            // If it's a new conversation or no conversation ID exists
            if (isNewConversation) {
                // Mark any existing active conversation as inactive
                await conversationService.endActiveConversations(userId);
            }
            // Get current active conversation or create new one
            conversation = await conversationService.getCurrentConversation(userId);
            if (!conversation) {
                conversation = await conversationService.createNewConversation(userId, [userMessage, aiMessage]);
            } else {
                // Add messages to existing active conversation
                conversation.messages.push(userMessage);
                conversation.messages.push(aiMessage);
                conversation = await conversation.save();
            }
        }

        res.status(200).json({ 
            result,
            relevantMemories: effectiveMemoryContext ? highQualityMemories : [], // Only return used memories
            conversationId: conversation._id
        });
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ error: 'Error processing query' });
    }
};

module.exports = {
    query
};