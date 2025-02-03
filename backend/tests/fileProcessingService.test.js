const { processFile, splitIntoChunks } = require('../services/fileProcessingService');
const vectorStore = require('../services/vectorStoreService');

jest.mock('../services/vectorStoreService', () => ({
  storeMemory: jest.fn().mockResolvedValue('mock-id'),
  initialize: jest.fn().mockResolvedValue({}),
  getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
}));

describe('FileProcessingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('splitIntoChunks', () => {
    it('should keep short text as single chunk', async () => {
      const text = 'This is a short sentence. And another one.';
      const chunks = await splitIntoChunks(text);
      
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(text);
    });

    it('should split long text at sentence boundaries', async () => {
      // Create a text with multiple sentences that exceeds MAX_CHARS_PER_CHUNK
      const sentence = 'This is a test sentence that will be repeated.';
      const longText = Array(100).fill(sentence).join(' ');
      
      const chunks = await splitIntoChunks(longText);
      
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        // Each chunk should end with a sentence boundary
        expect(chunk).toMatch(/[.!?]$/);
        // Each chunk should be under the maximum size
        expect(chunk.length).toBeLessThanOrEqual(2000);
      });
    });

    it('should handle text with no sentence boundaries', async () => {
      const longWord = 'a'.repeat(3000);
      const chunks = await splitIntoChunks(longWord);
      
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(longWord);
    });

    it('should handle empty text', async () => {
      const chunks = await splitIntoChunks('');
      expect(chunks).toEqual([]);
    });
  });

  describe('processFile', () => {
    it('should process and store file content', async () => {
      const mockContent = Buffer.from('Test content');
      const mockMetadata = { documentId: 'test-123' };

      const result = await processFile(mockContent, mockMetadata);
      
      expect(result.success).toBe(true);
      expect(vectorStore.storeMemory).toHaveBeenCalledWith(
        'Test content',
        expect.objectContaining({
          documentId: 'test-123',
          chunkIndex: 0,
          totalChunks: 1
        })
      );
    });

    it('should handle processing errors', async () => {
      vectorStore.storeMemory.mockRejectedValueOnce(new Error('Storage failed'));
      
      await expect(processFile(Buffer.from('test'), {}))
        .rejects
        .toThrow('Storage failed');
    });
  });
});
