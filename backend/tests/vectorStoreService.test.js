const { QdrantClient } = require('@qdrant/js-client-rest');
const axios = require('axios');
const vectorStoreService = require('../services/vectorStoreService');

// Mock external dependencies
jest.mock('@qdrant/js-client-rest');
jest.mock('axios');

describe('VectorStoreService', () => {
    let mockQdrantClient;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup Qdrant client mock
        mockQdrantClient = {
            getCollections: jest.fn(),
            createCollection: jest.fn(),
            upsert: jest.fn(),
            search: jest.fn()
        };
        QdrantClient.mockImplementation(() => mockQdrantClient);

        // Replace the client in the service instance
        vectorStoreService.client = mockQdrantClient;

        // Setup axios mock for getEmbedding
        axios.post = jest.fn();
    });

    describe('initialize', () => {
        it('should create collection if it does not exist', async () => {
            // Mock collection check
            mockQdrantClient.getCollections.mockResolvedValue({
                collections: []
            });

            await vectorStoreService.initialize();

            expect(mockQdrantClient.createCollection).toHaveBeenCalledWith(
                process.env.QDRANT_COLLECTION,
                {
                    vectors: {
                        size: 768,
                        distance: 'Cosine'
                    }
                }
            );
        });

        it('should not create collection if it already exists', async () => {
            // Mock existing collection
            mockQdrantClient.getCollections.mockResolvedValue({
                collections: [{ name: process.env.QDRANT_COLLECTION }]
            });

            await vectorStoreService.initialize();

            expect(mockQdrantClient.createCollection).not.toHaveBeenCalled();
        });

        it('should handle errors during initialization', async () => {
            mockQdrantClient.getCollections.mockRejectedValue(new Error('Test error'));

            await expect(vectorStoreService.initialize()).rejects.toThrow('Test error');
        });
    });

    describe('getEmbedding', () => {
        it('should return embedding from API response', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            axios.post.mockResolvedValue({
                data: {
                    data: [{ embedding: mockEmbedding }]
                }
            });

            const result = await vectorStoreService.getEmbedding('test text');

            expect(result).toEqual(mockEmbedding);
            expect(axios.post).toHaveBeenCalledWith(
                `${process.env.LLAMA_API_ENDPOINT}/v1/embeddings`,
                {
                    input: 'test text',
                    model: 'text-embedding-nomic-embed-text-v1.5'
                }
            );
        });

        it('should handle alternative response format', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            axios.post.mockResolvedValue({
                data: {
                    embedding: mockEmbedding
                }
            });

            const result = await vectorStoreService.getEmbedding('test text');

            expect(result).toEqual(mockEmbedding);
        });

        it('should handle API errors', async () => {
            axios.post.mockRejectedValue(new Error('API error'));

            await expect(vectorStoreService.getEmbedding('test text')).rejects.toThrow('API error');
        });
    });

    describe('storeMemory', () => {
        it('should store memory with vector and metadata', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            axios.post.mockResolvedValue({
                data: {
                    data: [{ embedding: mockEmbedding }]
                }
            });

            // Mock initialize to avoid the error
            mockQdrantClient.getCollections.mockResolvedValue({
                collections: [{ name: process.env.QDRANT_COLLECTION }]
            });

            const text = 'test memory';
            const metadata = { source: 'test' };

            await vectorStoreService.storeMemory(text, metadata);

            expect(mockQdrantClient.upsert).toHaveBeenCalledWith(
                process.env.QDRANT_COLLECTION,
                expect.objectContaining({
                    points: expect.arrayContaining([
                        expect.objectContaining({
                            vector: mockEmbedding,
                            payload: expect.objectContaining({
                                text,
                                timestamp: expect.any(Number),
                                source: 'test'
                            })
                        })
                    ])
                })
            );
        });
    });

    describe('queryMemories', () => {
        it('should return formatted search results', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            axios.post.mockResolvedValue({
                data: {
                    data: [{ embedding: mockEmbedding }]
                }
            });

            // Mock initialize to avoid the error
            mockQdrantClient.getCollections.mockResolvedValue({
                collections: [{ name: process.env.QDRANT_COLLECTION }]
            });

            const mockSearchResults = [
                {
                    score: 0.9,
                    payload: {
                        text: 'result 1',
                        documentId: 'doc1',
                        fileName: 'test.txt',
                        chunkIndex: 1,
                        totalChunks: 5,
                        uploadDate: '2024-01-01'
                    }
                }
            ];

            mockQdrantClient.search.mockResolvedValue(mockSearchResults);

            const results = await vectorStoreService.queryMemories('test query', 1);

            expect(results).toEqual([
                {
                    text: 'result 1',
                    score: 0.9,
                    metadata: {
                        documentId: 'doc1',
                        fileName: 'test.txt',
                        chunkIndex: 1,
                        totalChunks: 5,
                        uploadDate: '2024-01-01'
                    }
                }
            ]);

            expect(mockQdrantClient.search).toHaveBeenCalledWith(
                process.env.QDRANT_COLLECTION,
                {
                    vector: mockEmbedding,
                    limit: 1,
                    score_threshold: 0.75
                }
            );
        });
    });
}); 