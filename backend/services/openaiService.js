// Handles logic of constructing the request to the OpenAI API.
// Since this logic is isolated, we can reuse it in other parts of the application where OpenAI API is needed.

const axios = require('axios');

const openaiService = async (prompt) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'user', content: prompt}
            ],
            max_tokens: 500,
            temperature: 1.5,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error(error);
        return error;
    }
};

module.exports = { openaiService };