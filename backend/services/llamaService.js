const axios = require('axios');

class LlamaService {
    constructor() {
        this.baseURL = process.env.LLAMA_API_ENDPOINT;
    }

    async generateResponse(prompt, context = '') {
        try {
            let fullPrompt;
            if (context) {
                fullPrompt = `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer:`;
            } else {
                fullPrompt = `You are not to answer the question unless it is absolutely trivial. Feel free to engage in small talk with the user. For example, "I do not have enough information to answer that question. Is there something else I can help you with?".Question: ${prompt}`;
            }

            console.log('Sending request to:', `${this.baseURL}/v1/chat/completions`);
            
            const response = await axios.post(`${this.baseURL}/v1/chat/completions`, {
                model: "llama-3.2-3b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly and casual AI assistant. If you have relevant context, use it naturally in your response without mentioning that you have context. If you don't have enough context to answer accurately, assess the complexity of the question. Answer simple or trivial questions if possible, but for complex questions, indicate that more context is needed. Keep responses concise and natural."
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