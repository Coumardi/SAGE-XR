const axios = require('axios');
const MetricsService = require('./metricsService');
const { performance } = require('perf_hooks');

// Create an instance of MetricsService
const metricsService = new MetricsService();

class LlamaService {
    constructor() {
        this.baseURL = process.env.LLAMA_API_ENDPOINT;
    }

    async generateResponse(prompt, context = '') {
        try {
            let fullPrompt;
            if (context && context.trim().length > 0) {
                fullPrompt = `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer: Please answer based ONLY on the context provided above. If the context doesn't contain enough information to fully answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
            } else {
                fullPrompt = `IMPORTANT INSTRUCTION: You are a teaching assistant that MUST NOT provide answers to questions unless you have been given specific context about the topic. For all subject matter questions, you MUST respond with EXACTLY: "I don't have any context or information about this topic in my knowledge base. Please provide relevant course materials or documentation first."\n\nYou should ONLY respond to basic greetings such as "Hello", "How are you?", or simple clarification questions about how to use the system. For ALL other queries, use the exact response above.\n\nQuestion: ${prompt}`;
            }

            const modelConfig = {
                model: "hermes-3-llama-3.2-3b",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teaching assistant that ONLY provides answers when given explicit context. You must never make assumptions or provide information beyond what is directly available in the given context. If you don't have relevant context, always indicate that you need more information. Never try to be helpful by providing general information or guesses. Your primary directive is to ONLY answer with information contained in the provided context."
                    },
                    {
                        role: "user",
                        content: fullPrompt
                    }
                ],
                temperature: 0.2, // Lower temperature for more deterministic responses
                max_tokens: 2000,
                stream: false
            };

            const startTime = performance.now();
            const response = await axios.post(`${this.baseURL}/v1/chat/completions`, modelConfig);

            // Collect metrics asynchronously
            metricsService.collectMetrics(startTime, response.data, modelConfig, prompt)
                .catch(err => console.error('Error collecting metrics:', err));

            if (response.data.choices && response.data.choices[0]) {
                if (response.data.choices[0].message) {
                    return response.data.choices[0].message.content;
                } else if (response.data.choices[0].text) {
                    return response.data.choices[0].text;
                }
            }
            
            throw new Error('Unexpected response format from LLM API');
        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
}

module.exports = new LlamaService(); 