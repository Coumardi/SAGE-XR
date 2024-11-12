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

Please answer the question only based on the context provided above. You may respond to simple messages, such as "Hello". If you need more information, please ask for it, and indicate that you don't have a response.`;
    }

    async generateResponse(userInput, context) {
        try {
            const prompt = this.createPrompt(userInput, context);
            
            const response = await this.client.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. Use the provided context to answer the user\'s question accurately. Only use information from the context and acknowledge when you need more information. If the context is irrelevant, indicate that you cannot answer the question. Do not reference the incorrect context in your message.")'
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

    //Method for when no context match is found in the database.
    async handleNoMatch(userInput) {
        try {
            const response = await this.client.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You were unable to be provided with context. Engage in simple responses only for trivial or social queries. Politely indicate that you cannot answer the question due to lack of context.'},
                    {
                        role: 'user',
                        content: userInput
                    }
                ],
                max_tokens: 10000,
                temperature: 0.2
            });
    
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate AI response');
        }
    }
}

module.exports = new OpenAIService();