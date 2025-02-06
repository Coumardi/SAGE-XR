const llamaService = require('../services/llamaService');
const axios = require('axios');

jest.mock('axios');

describe('LlamaService', () => {
  beforeEach(() => {
    process.env.LLAMA_API_ENDPOINT = 'http://test-url';
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should call API with correct parameters when no context provided', async () => {
      const testPrompt = 'test prompt';
      const expectedFullPrompt = `You are not to answer the question unless it is absolutely trivial. Feel free to engage in small talk with the user. For example, "I do not have enough information to answer that question. Is there something else I can help you with?".Question: ${testPrompt}`;
      
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'test response' } }]
        }
      });

      await llamaService.generateResponse(testPrompt);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/chat/completions',
        expect.objectContaining({
          model: "llama-3.2-3b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a friendly and casual AI assistant. If you have relevant context, use it naturally in your response without mentioning that you have context. If you don't have enough context to answer accurately, assess the complexity of the question. Answer simple or trivial questions if possible, but for complex questions, indicate that more context is needed. Keep responses concise and natural."
            },
            {
              role: "user",
              content: expectedFullPrompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
          stream: false
        })
      );
    });

    it('should call API with correct parameters when context is provided', async () => {
      const testPrompt = 'test prompt';
      const testContext = 'test context';
      const expectedFullPrompt = `Context: ${testContext}\n\nQuestion: ${testPrompt}\n\nAnswer:`;

      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'test response' } }]
        }
      });

      await llamaService.generateResponse(testPrompt, testContext);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/chat/completions',
        expect.objectContaining({
          model: "llama-3.2-3b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a friendly and casual AI assistant. If you have relevant context, use it naturally in your response without mentioning that you have context. If you don't have enough context to answer accurately, assess the complexity of the question. Answer simple or trivial questions if possible, but for complex questions, indicate that more context is needed. Keep responses concise and natural."
            },
            {
              role: "user",
              content: expectedFullPrompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
          stream: false
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