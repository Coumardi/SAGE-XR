const llamaService = require('../services/llamaService');
const axios = require('axios');

jest.mock('axios');

describe('LlamaService', () => {
  beforeEach(() => {
    process.env.LLAMA_API_ENDPOINT = 'http://test-url';
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should generate response with context', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Test response with context'
            }
          }]
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await llamaService.generateResponse('test prompt', 'test context');
      
      expect(result).toBe('Test response with context');
      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/chat/completions',
        expect.objectContaining({
          messages: [
            {
              role: "system",
              content: expect.any(String)
            },
            {
              role: "user",
              content: "Context: test context\n\nQuestion: test prompt\n\nAnswer:"
            }
          ],
          model: "llama-3.2-3b-instruct",
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      );
    });

    it('should generate response without context', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Test response without context'
            }
          }]
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await llamaService.generateResponse('test prompt');
      
      expect(result).toBe('Test response without context');
      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/chat/completions',
        expect.objectContaining({
          messages: [
            {
              role: "system",
              content: expect.any(String)
            },
            {
              role: "user",
              content: "test prompt"
            }
          ]
        })
      );
    });

    it('should handle unexpected response format', async () => {
      const mockResponse = {
        data: {
          choices: [{}]
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      await expect(llamaService.generateResponse('test prompt'))
        .rejects
        .toThrow('Unexpected response format from LLM API');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      mockError.response = {
        data: { error: 'Invalid request' },
        status: 400
      };
      axios.post.mockRejectedValueOnce(mockError);

      await expect(llamaService.generateResponse('test prompt'))
        .rejects
        .toThrow('API Error');
    });
  });
});