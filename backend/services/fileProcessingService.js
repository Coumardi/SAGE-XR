const { OpenAIApi } = require('openai');
const { MongoClient } = require('mongodb');
const tiktoken = require('tiktoken');
const { initializeDatabaseWithRetry } = require('../config/database');
const axios = require('axios');

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db;

function tokenizeText(text, maxTokens = 1200){
    const encoding = tiktoken.get_encoding("cl100k_base");
    const tokens = encoding.encode(text);

    const chunks = [];
    let start = 0;

    while (start < tokens.length) {
        const chunkTokens = tokens.slice(start, start + maxTokens);
        const chunkText = encoding.decode(chunkTokens);
        chunks.push(chunkText);
        start += maxTokens;
    }

    encoding.free();
    return chunks;
}

async function extractKeywordsFromChunk(chunk) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini', 
            messages: [
                { role: 'system', content: 'Extract keywords from the following text and comma-separate them.' },
                { role: 'user', content: String(chunk) }
            ],
            max_tokens: 1500,
            temperature: 0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const keywords = response.data.choices[0].message.content.trim().split(',');
        return keywords.map(keyword => keyword.trim());
    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        throw new Error('Failed to extract keywords from chunk');
    }
}

async function insertChunk(chunkData) {
    const { db, collection } = await initializeDatabaseWithRetry();
    try {
        await collection.insertOne(chunkData);
        console.log("Chunk stored successfully.");
    } catch (error) {
        console.error("Failed to insert chunk:", error.message);
        throw error;
    }
}

async function processFile(fileContent) {
    const textContent = fileContent.toString('utf-8');
    const chunks = tokenizeText(textContent, 1200);

    for (const chunk of chunks) {
        try {
            const keywords = await extractKeywordsFromChunk(chunk);
            const timestamp = new Date();

            await insertChunk({
                chunk,
                keywords,
                timestamp,
            });
            console.log("Chunk stored successfully.");
        } catch (error) {
            console.error("Failed to process chunk:", error.message);
        }
    }
}

module.exports = {
    processFile,
};