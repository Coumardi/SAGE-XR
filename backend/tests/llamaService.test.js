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
      const expectedFullPrompt = `IMPORTANT INSTRUCTION: You are a teaching assistant that MUST NOT provide answers to questionsunless you have been given specific context about the topic. You should respond with: "I don't have any context or information about this topic in my knowledge base. Please provide relevant course materials or documentation first." You may respond to SIMPLE queries, such as "Hello" and "Whats up?". Question: ${testPrompt}`;
      
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
              content: "You are a strict teaching assistant that ONLY provides answers when given explicit context. You must never make assumptions or provide information beyond what is directly available in the given context. If you don't have relevant context, always indicate that you need more information. Never try to be helpful by providing general information or guesses."
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
      const expectedFullPrompt = `Context: ${testContext}\n\nQuestion: ${testPrompt}\n\nAnswer: Please answer based ONLY on the context provided above. If the context doesn't contain enough information to fully answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;

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
              content: "You are a strict teaching assistant that ONLY provides answers when given explicit context. You must never make assumptions or provide information beyond what is directly available in the given context. If you don't have relevant context, always indicate that you need more information. Never try to be helpful by providing general information or guesses."
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

    it('should return message content when response has message format', async () => {
      const expectedResponse = 'test response message';
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: expectedResponse
            }
          }]
        }
      });

      const result = await llamaService.generateResponse('test prompt');
      expect(result).toBe(expectedResponse);
    });

    it('should return text when response has text format', async () => {
      const expectedResponse = 'test response text';
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            text: expectedResponse
          }]
        }
      });

      const result = await llamaService.generateResponse('test prompt');
      expect(result).toBe(expectedResponse);
    });

    it('should prioritize message content over text when both are present', async () => {
      const expectedResponse = 'message content response';
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: expectedResponse
            },
            text: 'text response'
          }]
        }
      });

      const result = await llamaService.generateResponse('test prompt');
      expect(result).toBe(expectedResponse);
    });
  });
});