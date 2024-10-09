// services/keywordService.js
const axios = require('axios');

const extractKeywords = async (text) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `You will be provided with a block of text, and your task is to extract a list of keywords from it and comma-separate them.`},
                { role: 'user', content: text },
            ],
            max_tokens: 10000,
            temperature: 0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from OpenAI');
        }

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error response from OpenAI:', error.response ? error.response.data : error.message);
        throw new Error('Failed to extract keywords');
    }
};

module.exports = extractKeywords;
