const { QdrantClient } = require('@qdrant/js-client-rest');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class VectorStoreService {
    constructor() {
        this.client = new QdrantClient({ 
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });
        this.collectionName = process.env.QDRANT_COLLECTION;
    }

    async initialize() {
        try {
            // Check if collection exists
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(c => c.name === this.collectionName);

            if (!exists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: 768,  // Embedding dimension
                        distance: 'Cosine'
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing Qdrant:', error);
            throw error;
        }
    }

    async getEmbedding(text) {
        try {
            const response = await axios.post(`${process.env.LLAMA_API_ENDPOINT}/v1/embeddings`, {
                input: text,
                model: "text-embedding-nomic-embed-text-v1.5"
            });

            if (response.data.data && Array.isArray(response.data.data)) {
                return response.data.data[0].embedding;
            } else if (response.data.embedding) {
                return response.data.embedding;
            }

            throw new Error('Unexpected embedding response format');
        } catch (error) {
            console.error('Error getting embedding:', error);
            throw error;
        }
    }

    async storeMemory(text, metadata = {}) {
        await this.initialize();
        const vector = await this.getEmbedding(text);
        const id = uuidv4();

        await this.client.upsert(this.collectionName, {
            points: [{
                id,
                vector,
                payload: {
                    text,
                    timestamp: Date.now(),
                    ...metadata
                }
            }]
        });

        return id;
    }

    async queryMemories(query, limit = 5) {
        await this.initialize();
        const queryVector = await this.getEmbedding(query);

        console.log(`Searching for top ${limit} relevant documents...`);
        
        const results = await this.client.search(this.collectionName, {
            vector: queryVector,
            limit: limit,
            score_threshold: 0.75
        });

        console.log(`Found ${results.length} relevant documents`);
        
        return results.map(hit => ({
            text: hit.payload.text,
            score: hit.score,
            metadata: {
                documentId: hit.payload.documentId,
                fileName: hit.payload.fileName,
                chunkIndex: hit.payload.chunkIndex,
                totalChunks: hit.payload.totalChunks,
                uploadDate: hit.payload.uploadDate
            }
        }));
    }
}

module.exports = new VectorStoreService(); 