const axios = require('axios');

class OpenAIService {
    constructor() {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not defined in environment variables');
        }
        
        this.client = axios.create({
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    createPrompt(userInput, context) {
        return `
Context: ${context}

User Question: ${userInput}

Please answer the question based on the context provided above.`;
    }

    async generateResponse(userInput, context) {
        try {
            const prompt = this.createPrompt(userInput, context);
            
            const response = await this.client.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. Use the provided context to answer the user\'s question accurately. Only use information from the context and acknowledge when you need more information.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 10000,
                temperature: 0.7
            });

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate AI response');
        }
    }
}

// Export a singleton instance
module.exports = new OpenAIService();