// Handles logic of constructing the request to the OpenAI API.
// Since this logic is isolated, we can reuse it in other parts of the application where OpenAI API is needed.

const axios = require('axios');

const openaiService = async (userInput, context) => {
    try {

        const prompt = this.createPrompt(userInput, context);
        
        const response = await this.client.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
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
        return response.data.choices[0].message.content.trim(); // Parsing response
    } catch (error) {
        console.error(error);
        return error;
    }
};

module.exports = openaiService;