const axios = require('axios');
const MetricsService = require('./metricsService');
const { performance } = require('perf_hooks');

// Create an instance of MetricsService
const metricsService = new MetricsService();

class LlamaService {
    constructor() {
        this.baseURL = process.env.LLAMA_API_ENDPOINT;
    }

    async generateResponse(prompt, memoryContext = '', conversationContext = []) {
        const startTime = performance.now();
        
        try {
            // Format the conversation context into a string
            const formattedConversationContext = conversationContext
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');

            // Combine all context
            const fullContext = [
                memoryContext,
                formattedConversationContext
            ].filter(Boolean).join('\n\n');

            // Prepare the prompt with strict instructions
            const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from the provided context or conversation history to answer questions. Never use your general knowledge or make assumptions. If the context doesn't contain enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;

            // Prepare the prompt with context
            const fullPrompt = fullContext ? 
                `${systemInstructions}\n\nContext:\n${fullContext}\n\nQuestion: ${prompt}\n\nAnswer:` :
                `${systemInstructions}\n\nQuestion: ${prompt}\n\nAnswer:`;

            // Make the API call to LM Studio
            const response = await axios.post(`${this.baseURL}/v1/completions`, {
                prompt: fullPrompt,
                max_tokens: 1000,
                temperature: 0.6, // Lower temperature for more deterministic responses
                stop: ["Question:", "\n\n"]
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Log metrics
            await metricsService.collectMetrics(
                startTime,
                response.data,
                {
                    model: "nomic-embed-text-v1.5",
                    temperature: 0.6,
                    max_tokens: 1000
                },
                prompt
            );

            return response.data.choices[0].text.trim();
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}

module.exports = new LlamaService(); 