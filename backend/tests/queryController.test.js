process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server'); // Your Express app

// Mock the OpenAI service
jest.mock('../services/openaiService', () => ({
    openaiService: jest.fn()
}));

describe('POST /api/query', () => {
    // Mock success for this specific test
    it('should return 200 OK and a result for a valid prompt', async () => {
        // Mock a successful OpenAI response
        const { openaiService } = require('../services/openaiService');
        openaiService.mockResolvedValue('The capital of France is Paris.');

        const res = await request(app)
            .post('/api/query')
            .send({ prompt: 'What is the capital of France?' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.result).toEqual('The capital of France is Paris.');
    });

    it('should return 400 Bad Request when prompt is missing', async () => {
        const res = await request(app)
            .post('/api/query')
            .send({}); // No prompt

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('Prompt is required');
    });

    it('should handle OpenAI API errors gracefully', async () => {
        // Mock an error response from OpenAI for this test
        const { openaiService } = require('../services/openaiService');
        openaiService.mockRejectedValue(new Error('OpenAI Error'));

        const res = await request(app)
            .post('/api/query')
            .send({ prompt: 'What is the capital of France?' });

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toEqual('Error processing query');
    });
});

