const axios = require('axios');
const extractKeywords = require('../services/keywordService');

// Mock axios using Jest
jest.mock('axios');

describe('Keyword Extraction Service', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should extract keywords from valid text input', async () => {
        const testText = 'The sky is blue and the grass is green.';
        const expectedKeywords = 'sky, blue, grass, green';

        // Mocking the API response
        axios.post.mockResolvedValueOnce({
            data: {
                choices: [{ message: { content: expectedKeywords } }]
            }
        });

        const result = await extractKeywords(testText);
        expect(result).toBe(expectedKeywords);
    });

    it('should handle empty input text', async () => {
        const testText = '';

        // Mock the API response
        axios.post.mockResolvedValueOnce({
            data: {
                choices: [{ message: { content: '' } }]
            }
        });

        const result = await extractKeywords(testText);
        expect(result).toBe(''); // Expect an empty string
    });

    it('should throw an error on API failure', async () => {
        const testText = 'Some text input';

        // Mock a failed API response
        axios.post.mockRejectedValueOnce(new Error('Network Error'));

        await expect(extractKeywords(testText)).rejects.toThrow('Failed to extract keywords');
    });

    it('should handle a long text input', async () => {
        const testText = 'This is a long text that contains many words, but we will still attempt to extract keywords.';
        const expectedKeywords = 'long, text, many, words, keywords';

        // Mocking the API response for a long text input
        axios.post.mockResolvedValueOnce({
            data: {
                choices: [{ message: { content: expectedKeywords } }]
            }
        });

        const result = await extractKeywords(testText);
        expect(result).toBe(expectedKeywords);
    });

    it('should handle malformed API response', async () => {
        const testText = 'Test with malformed response';

        // Mocking a malformed API response
        axios.post.mockResolvedValueOnce({
            data: {
                choices: [] // Malformed or missing choices array
            }
        });

        await expect(extractKeywords(testText)).rejects.toThrow('Failed to extract keywords');
    });
});
