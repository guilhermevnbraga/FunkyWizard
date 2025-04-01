import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/authRoutes.js';
import * as authController from '../../../src/controllers/authController.js';

vi.mock('../../../src/controllers/authController.js', () => ({
    register: vi.fn(),
    loginUser: vi.fn()
}));

describe('Auth Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/auth', authRoutes);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should call register controller with valid data', async () => {
            const mockUser = {
                email: 'dev@example.com',
                username: 'devuser',
                password: 'password123'
            };

            authController.register.mockImplementation((req, res) => {
                if (!req.body.email || !req.body.username || !req.body.password) {
                    return res.status(400).json({ message: 'Preencha todos os campos!' });
                }
                res.status(201).json({ message: 'User created' });
            });

            await request(app)
                .post('/auth/register')
                .send(mockUser)
                .expect(201);

            expect(authController.register).toHaveBeenCalled();
        });

        it('should return 400 if missing fields', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com' }) // faltam username e password
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/login', () => {
        it('should call loginUser controller with valid credentials', async () => {
            const credentials = {
                email: 'dev@example.com',
                password: 'password123'
            };

            authController.loginUser.mockImplementation((req, res) => {
                res.status(200).json({ token: 'fake-token' });
            });

            await request(app)
                .post('/auth/login')
                .send(credentials)
                .expect(200);

            expect(authController.loginUser).toHaveBeenCalled();
        });
    });
});
