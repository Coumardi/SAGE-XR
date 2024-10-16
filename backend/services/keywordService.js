// services/keywordService.js
const axios = require('axios');

const extractKeywords = async (text) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `You will be provided with a block of text, and your task is to extract a list of keywords from it and comma-separate them. Utilize stopwords and stemming.`}, //Input examples here (can be pages long)
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
        const keywordsString = response.data.choices[0].message.content.trim();

        // If the response is empty, return an empty array
        if (!keywordsString) {
            return [];
        }

        // Split the response by commas and trim each keyword
        const keywordsArray = keywordsString.split(',').map(keyword => keyword.trim());

        // Return the array of keywords
        return keywordsArray;


        } catch (error) {
            console.error('Error response from OpenAI:', error.response ? error.response.data : error.message);
            throw new Error('Failed to extract keywords');
        }
    };

module.exports = extractKeywords;
