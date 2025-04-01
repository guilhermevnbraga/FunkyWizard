import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, findUserByEmail } from '../../../src/models/userModel.js';
import prisma from '../../../src/config/db.js';
import bcrypt from 'bcryptjs';

// Mock do Prisma e bcrypt
vi.mock('../../../src/config/db.js', () => ({
    default: {
        user: {
            create: vi.fn(),
            findUnique: vi.fn()
        }
    }
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn()
    }
}));

describe('User Model', () => {
    const mockUser = {
        id: 1,
        email: 'dev@example.com',
        username: 'devuser',
        password: 'hashedpassword123'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser()', () => {
        it('should create user with hashed password', async () => {
            // Configura os mocks
            bcrypt.hash.mockResolvedValue('hashedpassword123');
            prisma.user.create.mockResolvedValue(mockUser);

            // Executa a função
            const result = await createUser('dev@example.com', 'devuser', 'plainpassword');

            // Verifica o bcrypt
            expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);

            // Verifica o Prisma
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'dev@example.com',
                    username: 'devuser',
                    password: 'hashedpassword123'
                }
            });

            // Verifica o retorno
            expect(result).toEqual(mockUser);
        });

        it('should throw error when password hashing fails', async () => {
            bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

            await expect(createUser('test@test.com', 'user', 'pass'))
                .rejects.toThrow('Hashing failed');
        });

        it('should throw error when user creation fails', async () => {
            bcrypt.hash.mockResolvedValue('hashedpass');
            prisma.user.create.mockRejectedValue(new Error('DB Error'));

            await expect(createUser('test@test.com', 'user', 'pass'))
                .rejects.toThrow('DB Error');
        });
    });

    describe('findUserByEmail()', () => {
        it('should return user by email', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await findUserByEmail('dev@example.com');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'dev@example.com' }
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await findUserByEmail('notfound@example.com');

            expect(result).toBeNull();
        });

        it('should throw error when database fails', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await expect(findUserByEmail('test@test.com'))
                .rejects.toThrow('DB Error');
        });
    });
});
