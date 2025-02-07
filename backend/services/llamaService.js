const axios = require('axios');

class LlamaService {
    constructor() {
        this.baseURL = process.env.LLAMA_API_ENDPOINT;
    }

    async generateResponse(prompt, context = '') {
        try {
            let fullPrompt;
            if (context) {
                fullPrompt = `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer: Please answer based ONLY on the context provided above. If the context doesn't contain enough information to fully answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
            } else {
                fullPrompt = `IMPORTANT INSTRUCTION: You are a teaching assistant that MUST NOT provide answers to questionsunless you have been given specific context about the topic. You should respond with: "I don't have any context or information about this topic in my knowledge base. Please provide relevant course materials or documentation first." You may respond to SIMPLE queries, such as "Hello" and "Whats up?". Question: ${prompt}`;
            }

            console.log('Sending request to:', `${this.baseURL}/v1/chat/completions`);
            
            const response = await axios.post(`${this.baseURL}/v1/chat/completions`, {
                model: "llama-3.2-3b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teaching assistant that ONLY provides answers when given explicit context. You must never make assumptions or provide information beyond what is directly available in the given context. If you don't have relevant context, always indicate that you need more information. Never try to be helpful by providing general information or guesses."
                    },
                    {
                        role: "user",
                        content: fullPrompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 2000,
                stream: false
            });

            console.log('Raw API response:', response.data);

            // Handle different response formats
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