const axios = require('axios');
const tiktoken = require('tiktoken');
const { 
    processFile, 
    calculateChunks, 
    splitTextIntoChunks,
    extractKeywordsFromChunk 
} = require('../services/fileProcessingService');
const { initializeDatabaseWithRetry } = require('../config/database');

// Mock dependencies
jest.mock('axios');
jest.mock('tiktoken');
jest.mock('../config/database');

describe('fileProcessingService', () => {
    // Mock environment variable
    process.env.API_KEY = 'test-api-key';

    // Setup database mocks
    const mockCollection = {
        insertOne: jest.fn()
    };
    
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Setup database mock implementation
        initializeDatabaseWithRetry.mockResolvedValue({
            db: {},
            collection: mockCollection
        });

        // Setup tiktoken mock
        const mockEncoding = {
            encode: jest.fn(),
            free: jest.fn()
        };
        tiktoken.get_encoding.mockReturnValue(mockEncoding);
    });

    describe('calculateChunks', () => {
        it('should calculate correct number of chunks based on token count', async () => {
            const mockText = 'Test text content';
            const mockTokens = new Array(1000); // Simulate 1000 tokens
            
            const mockEncoding = tiktoken.get_encoding();
            mockEncoding.encode.mockReturnValue(mockTokens);
            
            const result = await calculateChunks(mockText, 500);
            
            expect(result).toBe(2); // 1000 tokens / 500 tokens per chunk = 2 chunks
            expect(mockEncoding.encode).toHaveBeenCalledWith(mockText);
            expect(mockEncoding.free).toHaveBeenCalled();
        });

        it('should handle empty text', async () => {
            const mockEncoding = tiktoken.get_encoding();
            mockEncoding.encode.mockReturnValue([]);
            
            const result = await calculateChunks('');
            
            expect(result).toBe(0); 
        });

        it('should round up number of chunks', async () => {
            const mockTokens = new Array(750); // 750 tokens
            const mockEncoding = tiktoken.get_encoding();
            mockEncoding.encode.mockReturnValue(mockTokens);
            
            const result = await calculateChunks('test', 500);
            
            expect(result).toBe(2); // Should round up 750/500 to 2 chunks
        });
    });

    describe('splitTextIntoChunks', () => {
        it('should split text into equal-sized chunks', () => {
            const text = 'abcdefghijklmnop'; // 16 characters
            const numChunks = 4;
            
            const chunks = splitTextIntoChunks(text, numChunks);
            
            expect(chunks).toHaveLength(4);
            expect(chunks).toEqual(['abcd', 'efgh', 'ijkl', 'mnop']);
        });

        it('should handle text that doesn\'t divide evenly', () => {
            const text = 'abcdefghijk'; // 11 characters
            const numChunks = 3;
            
            const chunks = splitTextIntoChunks(text, numChunks);
            
            expect(chunks).toHaveLength(3);
            // First chunks should be equal, last chunk might be shorter
            expect(chunks[0].length).toBe(chunks[1].length);
        });

        it('should handle empty text', () => {
            const chunks = splitTextIntoChunks('', 5);
            
            expect(chunks).toHaveLength(5);
            expect(chunks.every(chunk => chunk === '')).toBe(true);
        });
    });

    describe('extractKeywordsFromChunk', () => {
        it('should extract keywords from text chunk', async () => {
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'keyword1, keyword2, keyword3'
                        }
                    }]
                }
            });

            const result = await extractKeywordsFromChunk('test chunk');
            expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
        });

        it('should handle API errors', async () => {
            axios.post.mockRejectedValue(new Error('API Error'));
            console.error = jest.fn(); // Mock console.error

            await expect(extractKeywordsFromChunk('test chunk'))
                .rejects
                .toThrow('Failed to extract keywords from chunk');
        });
    });

    describe('processFile', () => {
        it('should process file content correctly', async () => {
            // Mock tiktoken to return 1000 tokens
            const mockEncoding = tiktoken.get_encoding();
            mockEncoding.encode.mockReturnValue(new Array(1000));
            
            // Mock successful API response
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'keyword1, keyword2, keyword3'
                        }
                    }]
                }
            });

            const fileContent = Buffer.from('Test content for processing');
            await processFile(fileContent);

            // Verify API calls
            expect(axios.post).toHaveBeenCalledWith(
                'https://api.openai.com/v1/chat/completions',
                expect.any(Object),
                expect.objectContaining({
                    headers: {
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json'
                    }
                })
            );

            // Verify database insertions
            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    context: expect.any(String),
                    keywords: ['keyword1', 'keyword2', 'keyword3'],
                    timestamp: expect.any(Date)
                })
            );
        });

        // ... rest of the tests remain the same ...
    });
});