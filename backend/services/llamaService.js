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

            const systemInstructions = `You are SAGE, an educational AI assistant.

            Answer using ONLY the retrieved context below as your source of facts. Never invent information, infer unstated rankings/comparisons/superlatives, or connect two separate facts unless the context directly links them. A fact stated with different wording (e.g. a named tool or framework) still counts as explicitly stated, even if it doesn't use the same words as the question.

            Use the conversation history only to understand follow-up questions and resolve references (pronouns, "that," "the second one"). Never treat conversation history as a source of new facts, and never describe-knoledge base content as something the user said or mentioned.

            When anwering questions about people mentioned in the retrieved documents, refer to them in the third person unless the user explicitly ask about themselves.

            If the context doen't explicitly support the answer, respond with ONLY:
            "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."

            Keep answers clear, concise, and friendly.`;

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
                temperature: 0.3
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