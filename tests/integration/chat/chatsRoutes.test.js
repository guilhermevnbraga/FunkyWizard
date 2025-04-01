import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatsRoutes from '../../../src/routes/chatsRoutes.js';
import * as chatsController from '../../../src/controllers/chatsController.js';
import authenticate from '../../../src/utils/authenticate.js';

// Mock dos controllers e middleware
vi.mock('../../../src/controllers/chatsController.js', () => ({
    createNewChat: vi.fn(),
    getUserChats: vi.fn(),
    getChatMessages: vi.fn(),
    createMessageInChat: vi.fn(),
    deleteChatMessages: vi.fn(),
    deleteChat: vi.fn()
}));

vi.mock('../../../src/utils/authenticate.js', () => ({
    default: vi.fn((req, res, next) => {
        req.userId = '123'; // Mock user ID
        next();
    })
}));

describe('Chats Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/chats', chatsRoutes);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/chats', () => {
        it('should get user chats', async () => {
            chatsController.getUserChats.mockImplementation((req, res) => {
                res.status(200).json([{ id: 1, title: 'Chat 1' }]);
            });

            const response = await request(app)
                .get('/api/chats')
                .expect(200);

            expect(response.body).toBeInstanceOf(Array);
            expect(chatsController.getUserChats).toHaveBeenCalled();
        });
    });

    describe('GET /api/chats/:chatId/messages', () => {
        it('should get chat messages', async () => {
            chatsController.getChatMessages.mockImplementation((req, res) => {
                res.status(200).json([{ content: 'Hello' }]);
            });

            await request(app)
                .get('/api/chats/1/messages')
                .expect(200);

            expect(chatsController.getChatMessages).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: { chatId: '1' }
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('POST /api/chats/:chatId/messages', () => {
        it('should create message in chat', async () => {
            chatsController.createMessageInChat.mockImplementation((req, res) => {
                res.status(201).json({ message: 'Message created' });
            });

            await request(app)
                .post('/api/chats/1/messages')
                .send({ content: 'Hello', role: 'user' })
                .expect(201);

            expect(chatsController.createMessageInChat).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/chats/:chatId/messages', () => {
        it('should delete chat messages', async () => {
            chatsController.deleteChatMessages.mockImplementation((req, res) => {
                res.status(200).json({ message: 'Messages deleted' });
            });

            await request(app)
                .delete('/api/chats/1/messages')
                .expect(200);

            expect(chatsController.deleteChatMessages).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/chats/:chatId', () => {
        it('should delete chat', async () => {
            chatsController.deleteChat.mockImplementation((req, res) => {
                res.status(200).json({ message: 'Chat deleted' });
            });

            await request(app)
                .delete('/api/chats/1')
                .expect(200);

            expect(chatsController.deleteChat).toHaveBeenCalled();
        });
    });
});
