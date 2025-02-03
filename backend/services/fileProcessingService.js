const vectorStore = require('./vectorStoreService');

// Average characters per token (rough estimate)
const CHARS_PER_TOKEN = 4;
const MAX_TOKENS_PER_CHUNK = 500;
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_CHUNK * CHARS_PER_TOKEN;

async function splitIntoChunks(text) {
    const chunks = [];
    let currentChunk = '';
    
    // Split on sentence boundaries
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim().length > 0);

    console.log(`Split text into ${sentences.length} sentences`);

    for (const sentence of sentences) {
        const tempChunk = currentChunk 
            ? `${currentChunk} ${sentence.trim()}`
            : sentence.trim();
            
        if (tempChunk.length > MAX_CHARS_PER_CHUNK) {
            if (currentChunk) {
                console.log(`Pushing chunk of length: ${currentChunk.length}`);
                chunks.push(currentChunk);
            }
            currentChunk = sentence.trim();
        } else {
            currentChunk = tempChunk;
        }
    }

    if (currentChunk) {
        console.log(`Pushing final chunk of length: ${currentChunk.length}`);
        chunks.push(currentChunk);
    }

    console.log(`Created ${chunks.length} chunks`);
    chunks.forEach((chunk, i) => {
        console.log(`Chunk ${i + 1} length: ${chunk.length} characters (≈${Math.round(chunk.length/CHARS_PER_TOKEN)} tokens)`);
    });

    return chunks;
}

async function processFile(fileContent, metadata = {}) {
    try {
        const text = fileContent.toString();
        console.log(`Processing text of length: ${text.length}`);
        
        const chunks = await splitIntoChunks(text);
        console.log(`Split content into ${chunks.length} chunks`);
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkMetadata = {
                ...metadata,
                chunkIndex: i,
                totalChunks: chunks.length
            };
            
            await vectorStore.storeMemory(chunks[i], chunkMetadata);
        }
        
        return {
            success: true,
            message: `Content split and stored in ${chunks.length} chunks`,
            metadata
        };
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
}

module.exports = {
    processFile,
    splitIntoChunks
};