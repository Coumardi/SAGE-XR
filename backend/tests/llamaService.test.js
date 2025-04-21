const llamaService = require('../services/llamaService');
const axios = require('axios');

// We need to mock axios and MetricsService before requiring llamaService
jest.mock('axios');
jest.mock('../services/metricsService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      collectMetrics: jest.fn().mockResolvedValue({}),
    };
  });
});

describe('LlamaService', () => {
  beforeEach(() => {
    process.env.LLAMA_API_ENDPOINT = 'http://test-url';
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should call API with correct parameters when no context provided', async () => {
      const testPrompt = 'test prompt';
      const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from BOTH the provided context AND the conversation history to answer questions. Pay special attention to previous messages in the conversation, as they may contain important information about the user and the ongoing discussion. You can engage in friendly conversation with the user.If neither the context nor the conversation history contains enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
      const expectedFullPrompt = `${systemInstructions}\n\nQuestion: ${testPrompt}\n\nAnswer:`;
      
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ text: 'test response' }],
          model: 'test-model'
        }
      });

      await llamaService.generateResponse(testPrompt);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/completions',
        expect.objectContaining({
          prompt: expectedFullPrompt,
          max_tokens: 1000,
          temperature: 0.6,
          stop: ["Question:", "\n\n"]
        })
      );
    });

    it('should call API with correct parameters when memory context is provided', async () => {
      const testPrompt = 'test prompt';
      const testMemoryContext = 'test memory context';
      const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from BOTH the provided context AND the conversation history to answer questions. Pay special attention to previous messages in the conversation, as they may contain important information about the user and the ongoing discussion. You can engage in friendly conversation with the user.If neither the context nor the conversation history contains enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
      const expectedFullPrompt = `${systemInstructions}\n\nContext:\n${testMemoryContext}\n\nQuestion: ${testPrompt}\n\nAnswer:`;

      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ text: 'test response' }],
          model: 'test-model'
        }
      });

      await llamaService.generateResponse(testPrompt, testMemoryContext);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/completions',
        expect.objectContaining({
          prompt: expectedFullPrompt,
          max_tokens: 1000,
          temperature: 0.6,
          stop: ["Question:", "\n\n"]
        })
      );
    });

    it('should call API with correct parameters when conversation context is provided', async () => {
      const testPrompt = 'test prompt';
      const testConversationContext = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      const formattedConversationContext = 'Human: Hello\nAssistant: Hi there';
      const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from BOTH the provided context AND the conversation history to answer questions. Pay special attention to previous messages in the conversation, as they may contain important information about the user and the ongoing discussion. You can engage in friendly conversation with the user.If neither the context nor the conversation history contains enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
      const expectedFullPrompt = `${systemInstructions}\n\nContext:\n${formattedConversationContext}\n\nQuestion: ${testPrompt}\n\nAnswer:`;

      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ text: 'test response' }],
          model: 'test-model'
        }
      });

      await llamaService.generateResponse(testPrompt, '', testConversationContext);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/completions',
        expect.objectContaining({
          prompt: expectedFullPrompt,
          max_tokens: 1000,
          temperature: 0.6,
          stop: ["Question:", "\n\n"]
        })
      );
    });

    it('should call API with correct parameters when both memory and conversation contexts are provided', async () => {
      const testPrompt = 'test prompt';
      const testMemoryContext = 'test memory context';
      const testConversationContext = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      const formattedConversationContext = 'Human: Hello\nAssistant: Hi there';
      const systemInstructions = `You are SAGE, an educational AI assistant. You must ONLY use information from BOTH the provided context AND the conversation history to answer questions. Pay special attention to previous messages in the conversation, as they may contain important information about the user and the ongoing discussion. You can engage in friendly conversation with the user.If neither the context nor the conversation history contains enough information to answer the question, respond with: "I don't have enough information in my knowledge base to answer this question. Please provide more context or ask another question."`;
      const expectedFullPrompt = `${systemInstructions}\n\nContext:\n${testMemoryContext}\n\n${formattedConversationContext}\n\nQuestion: ${testPrompt}\n\nAnswer:`;

      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{ text: 'test response' }],
          model: 'test-model'
        }
      });

      await llamaService.generateResponse(testPrompt, testMemoryContext, testConversationContext);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-url/v1/completions',
        expect.objectContaining({
          prompt: expectedFullPrompt,
          max_tokens: 1000,
          temperature: 0.6,
          stop: ["Question:", "\n\n"]
        })
      );
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

    it('should return text response when API call succeeds', async () => {
      const expectedResponse = 'test response';
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            text: expectedResponse
          }],
          model: 'test-model'
        }
      });

      const result = await llamaService.generateResponse('test prompt');
      expect(result).toBe(expectedResponse);
    });
  });
});