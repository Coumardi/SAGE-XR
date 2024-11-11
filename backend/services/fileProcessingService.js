const { OpenAIApi } = require('openai');
const { MongoClient } = require('mongodb');
const tiktoken = require('tiktoken');
const { initializeDatabaseWithRetry } = require('../config/database');
const axios = require('axios');


async function extractKeywordsFromChunk(chunk) {
    console.log('Extracting keywords from chunk:', chunk);
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini', 
            messages: [
                { role: 'system', content: 'Extract keywords from the following text and comma-separate them. All keywords should be lowercase.' },
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
    } catch (error) {
        throw error;
    }
}

async function calculateChunks(text, maxTokensPerChunk = 500) {
    const encoding = tiktoken.get_encoding("cl100k_base");
    const totalTokens = encoding.encode(text).length;
    encoding.free();

    // Determine the number of chunks needed
    const numChunks = Math.ceil(totalTokens / maxTokensPerChunk);
    return numChunks;
}

function splitTextIntoChunks(text, numChunks) {
    const chunkSize = Math.ceil(text.length / numChunks);
    const chunks = [];

    for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        chunks.push(text.slice(start, end));
    }

    return chunks;
}


async function processFile(fileContent) {
    const textContent = fileContent.toString('utf-8');

    // Calculate number of chunks based on total token count
    const numChunks = await calculateChunks(textContent, 500);
    
    // Split text content into equal-sized chunks based on character length
    const chunks = splitTextIntoChunks(textContent, numChunks);

    for (const chunk of chunks) {
        try {
            const keywords = await extractKeywordsFromChunk(chunk);
            const timestamp = new Date();

            // Insert chunk as plain text, with keywords and timestamp
            await insertChunk({
                context: chunk,       // Plain text chunk
                keywords,    // Array of keywords
                timestamp,   // Timestamp
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