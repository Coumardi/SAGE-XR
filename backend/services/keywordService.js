// services/keywordService.js
const axios = require('axios');

const extractKeywords = async (text) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'user', content: `Extract keywords from only the following text and comma-separate them: ${text}`}
            ],
            max_tokens: 10000,
            temperature: 0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error response from OpenAI:', error.response ? error.response.data : error.message);
        throw new Error('Failed to extract keywords');
    }
};

module.exports = extractKeywords;
