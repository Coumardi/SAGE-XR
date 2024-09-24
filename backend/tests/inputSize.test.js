process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');

describe('POST /api/query with large inputs', () => {
    it('should handle a very large prompt gracefully', async () => {
        const largePrompt = 'a'.repeat(10000); // 10,000 characters

        const res = await request(app)
            .post('/api/query')
            .send({ prompt: largePrompt });

        expect(res.statusCode).toEqual(200); // Assuming it handles large inputs correctly
        expect(res.body.result).toBeDefined();
    });

    it('should handle a very small prompt gracefully', async () => {
        const smallPrompt = 'a'.repeat(2); // 2 characters

        const res = await request(app)
            .post('/api/query')
            .send({ prompt: smallPrompt });

        expect(res.statusCode).toEqual(200); // Assuming it handles large inputs correctly
        expect(res.body.result).toBeDefined();
    });
});