import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRoutes from '../../../src/routes/chatRoutes.js';
import * as chatController from '../../../src/controllers/chatController.js';
import authenticate from '../../../src/utils/authenticate.js';

// Mock dos controllers e middleware
vi.mock('../../../src/controllers/chatController.js', () => ({
    startConversation: vi.fn()
}));

vi.mock('../../../src/utils/authenticate.js', () => ({
    default: vi.fn((req, res, next) => next()) // Mock que sempre chama next()
}));

describe('Chat Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/chat', chatRoutes);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('POST /chat/conversa', () => {
        it('should call authenticate middleware', async () => {
            chatController.startConversation.mockImplementation((req, res) => {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });
                res.end();
            });

            await request(app)
                .post('/chat/conversa')
                .send({ mensagem: 'Olá' })
                .expect(200);

            expect(authenticate).toHaveBeenCalled();
        });

        it('should call startConversation controller with SSE headers', async () => {
            const mockSSE = vi.fn((req, res) => {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.end();
            });
            chatController.startConversation.mockImplementation(mockSSE);

            const response = await request(app)
                .post('/chat/conversa')
                .send({ mensagem: 'Teste SSE' });

            expect(chatController.startConversation).toHaveBeenCalled();
            expect(response.headers['content-type']).toMatch(/text\/event-stream/);
        });
    });
});
