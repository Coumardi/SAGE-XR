// Mock environment variables for testing
process.env.QDRANT_URL = 'http://localhost:6333';
process.env.QDRANT_API_KEY = 'test-api-key';
process.env.QDRANT_COLLECTION = 'test-collection';
process.env.LLAMA_API_ENDPOINT = 'http://localhost:8000';

// Mock console.log to keep test output clean
console.log = jest.fn(); 