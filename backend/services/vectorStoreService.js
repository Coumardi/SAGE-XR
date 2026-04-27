const { Pinecone } = require('@pinecone-database/pinecone');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class VectorStoreService {
    constructor() {
        this.client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

        this.indexName = process.env.PINECONE_INDEX;
        this.index = null;
    }

    async initialize() {
        if (this.index) return;

        try {
            this.index = this.client.index(this.indexName);
            console.log(`Pinecone index "${this.indexName}" ready`);
        } catch (error) {
            console.error('Error initializing Pinecone:', error);
            throw error;
        }
    }

    async getEmbedding(text) {
        try {
            console.log(`Getting embedding for text (${text.length} chars)...`);

            const response = await axios.post(process.env.LOCAL_EMBEDDING_ENDPOINT, {
                input: text,
                model: process.env.LOCAL_EMBEDDING_MODEL
            });

            let embedding;

            if (response.data?.data?.[0]?.embedding) {
                embedding = response.data.data[0].embedding;
            } else if (response.data?.embedding) {
                embedding = response.data.embedding;
            } else {
                console.error('Unexpected embedding response:', response.data);
                throw new Error('Unexpected embedding response format');
            }

            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error('Invalid embedding returned');
            }

            console.log(`Got embedding of dimension ${embedding.length}`);
            return embedding;

        } catch (error) {
            if (error.response) {
                console.error('Embedding server error:', error.response.status, error.response.data);
            }

            console.error('Error getting embedding:', error.message);
            throw error;
        }
    }

    async storeMemory(text, metadata = {}) {
        await this.initialize();

        if (!text || text.trim().length === 0) {
            console.warn('storeMemory called with empty text — skipping');
            return null;
        }

        const vector = await this.getEmbedding(text);

        if (!vector || vector.length === 0) {
            console.warn('Empty vector returned — skipping upsert');
            return null;
        }

        const id = uuidv4();

        const records = [
            {
                id,
                values: vector,
                metadata: {
                    text,
                    timestamp: Date.now(),
                    ...metadata
                }
            }
        ];

        await this.index.upsert({ records });

        console.log(
            `Stored chunk ${(metadata.chunkIndex ?? 0) + 1}/${metadata.totalChunks ?? '?'} for ${metadata.fileName ?? 'unknown file'}`
        );

        return id;
    }

    async queryMemories(query, limit = 5) {
        await this.initialize();

        if (!query || query.trim().length === 0) {
            console.warn('queryMemories called with empty query');
            return [];
        }

        const queryVector = await this.getEmbedding(query);

        console.log(`Searching for top ${limit} relevant documents...`);

        const results = await this.index.query({
            topK: limit,
            vector: queryVector,
            includeValues: false,
            includeMetadata: true
        });

        const matches = results.matches || [];

        console.log(`Found ${matches.length} relevant documents`);

        return matches.map(hit => ({
            text: hit.metadata?.text || '',
            score: hit.score,
            metadata: {
                documentId: hit.metadata?.documentId,
                fileName: hit.metadata?.fileName,
                chunkIndex: hit.metadata?.chunkIndex,
                totalChunks: hit.metadata?.totalChunks,
                uploadDate: hit.metadata?.uploadDate
            }
        }));
    }
}

module.exports = new VectorStoreService();