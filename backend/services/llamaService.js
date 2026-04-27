const axios = require('axios');
const MetricsService = require('./metricsService');
const { performance } = require('perf_hooks');

const metricsService = new MetricsService();

class LlamaService {
    constructor() {
        this.baseURL = process.env.LLAMA_API_ENDPOINT;
    }

    async generateResponse(prompt, memoryContext = '', conversationContext = []) {
        const startTime = performance.now();
        
        try {
            const safeConversationContext = Array.isArray(conversationContext) ? conversationContext : [];
            
            const formattedConversationContext = safeConversationContext
                .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
                .join('\n');

            console.log('=== Conversation Context ===');
            console.log(formattedConversationContext);
            console.log('=========================\n');

            const fullContext = [
                memoryContext,
                formattedConversationContext
            ].filter(Boolean).join('\n\n');

            const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from BOTH the provided context AND the conversation history to answer questions. Pay special attention to previous messages in the conversation, as they may contain important information about the user and the ongoing discussion. You can engage in friendly conversation with the user. If neither the context nor the conversation history contains enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;

            // Build user message with context
            const userMessage = fullContext
                ? `Context:\n${fullContext}\n\nQuestion: ${prompt}`
                : `Question: ${prompt}`;

            console.log('=== Full Prompt Being Sent to Model ===');
            console.log(userMessage);
            console.log('====================================\n');

            //  Updated to chat/completions format
            const response = await axios.post(`${this.baseURL}/v1/chat/completions`, {
                model: process.env.LLAMA_MODEL,
                messages: [
                    { role: "system", content: systemInstructions },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.6
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            await metricsService.collectMetrics(
                startTime,
                response.data,
                {
                    model: response.data.model || 'unknown',
                    temperature: 0.6,
                    max_tokens: 300
                },
                prompt
            );

            //  Updated response extraction for chat format
            return response.data.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}

module.exports = new LlamaService();