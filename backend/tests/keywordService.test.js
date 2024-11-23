const axios = require('axios');
const extractKeywords = require('../services/keywordService');

// Mock axios
jest.mock('axios');

describe('extractKeywords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    // Original successful case
    it('should successfully extract keywords from text', async () => {
        axios.post.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: 'keyword1, keyword2, hyphenated-word'
                    }
                }]
            }
        });

        const result = await extractKeywords('Some test text');
        expect(result).toEqual(['keyword1', 'keyword2', 'hyphenated-word']);
        expect(axios.post).toHaveBeenCalledWith(
            'https://api.openai.com/v1/chat/completions',
            expect.objectContaining({
                model: 'gpt-4o-mini',
                messages: [
                    expect.objectContaining({ role: 'system' }),
                    expect.objectContaining({ 
                        role: 'user',
                        content: 'Some test text'
                    })
                ]
            }),
            expect.any(Object)
        );
    });

    // Input validation cases
    describe('Input Validation', () => {
        it('should handle empty string input', async () => {
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: ''
                        }
                    }]
                }
            });

            const result = await extractKeywords('');
            expect(result).toEqual([]);
        });

        it('should handle very long text input', async () => {
            const longText = 'a'.repeat(10000);
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'keyword1, keyword2'
                        }
                    }]
                }
            });

            const result = await extractKeywords(longText);
            expect(result).toEqual(['keyword1', 'keyword2']);
        });

        it('should handle text with special characters', async () => {
            const specialText = 'Hello! @#$%^&* World';
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'hello, world'
                        }
                    }]
                }
            });

            const result = await extractKeywords(specialText);
            expect(result).toEqual(['hello', 'world']);
        });

    });

    // API response variations
    describe('API Response Variations', () => {
        it('should handle multiple choices in response', async () => {
            axios.post.mockResolvedValue({
                data: {
                    choices: [
                        { message: { content: 'keyword1, keyword2' } },
                        { message: { content: 'keyword3, keyword4' } }
                    ]
                }
            });

            const result = await extractKeywords('test text');
            expect(result).toEqual(['keyword1', 'keyword2']);
        });

        it('should handle malformed response content', async () => {
            const malformedResponses = [
                { data: { choices: [{ message: null }] } },
                { data: { choices: [{ message: { content: null } }] } },
                { data: { choices: [{}] } },
                { data: null },
                { data: {} }
            ];

            for (const response of malformedResponses) {
                axios.post.mockResolvedValue(response);
                await expect(extractKeywords('test text'))
                    .rejects
                    .toThrow('Failed to extract keywords');
            }
        });
    });

    // Edge cases
    describe('Edge Cases', () => {
        it('should handle rate limiting responses', async () => {
            axios.post.mockRejectedValue({
                response: {
                    status: 429,
                    data: 'Rate limit exceeded'
                }
            });

            await expect(extractKeywords('test text'))
                .rejects
                .toThrow('Failed to extract keywords');
            
            expect(console.error).toHaveBeenCalledWith(
                'Error response from OpenAI:',
                'Rate limit exceeded'
            );
        });

        it('should handle timeout errors', async () => {
            axios.post.mockRejectedValue({
                code: 'ECONNABORTED',
                message: 'timeout of 10000ms exceeded'
            });

            await expect(extractKeywords('test text'))
                .rejects
                .toThrow('Failed to extract keywords');
        });

        it('should handle multiple concurrent calls', async () => {
            axios.post.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'keyword1, keyword2'
                        }
                    }]
                }
            });

            const promises = Array(5).fill().map(() => 
                extractKeywords('test text')
            );

            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect(result).toEqual(['keyword1', 'keyword2']);
            });
            expect(axios.post).toHaveBeenCalledTimes(5);
        });
    });

    // Original error cases
    it('should return empty array when API returns empty response', async () => {
        axios.post.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: ''
                    }
                }]
            }
        });

        const result = await extractKeywords('Some test text');
        expect(result).toEqual([]);
    });

    it('should handle API response with no choices', async () => {
        axios.post.mockResolvedValue({
            data: {
                choices: []
            }
        });

        await expect(extractKeywords('Some test text'))
            .rejects
            .toThrow('Failed to extract keywords');

        expect(console.error).toHaveBeenCalledWith(
            'Error response from OpenAI:',
            'Invalid response from OpenAI'
        );
    });

    it('should handle API error responses', async () => {
        const errorMessage = 'API rate limit exceeded';
        axios.post.mockRejectedValue({
            response: {
                data: errorMessage
            }
        });

        await expect(extractKeywords('Some test text'))
            .rejects
            .toThrow('Failed to extract keywords');
        
        expect(console.error).toHaveBeenCalledWith(
            'Error response from OpenAI:',
            errorMessage
        );
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network Error';
        axios.post.mockRejectedValue(new Error(errorMessage));

        await expect(extractKeywords('Some test text'))
            .rejects
            .toThrow('Failed to extract keywords');
        
        expect(console.error).toHaveBeenCalledWith(
            'Error response from OpenAI:',
            errorMessage
        );
    });
});