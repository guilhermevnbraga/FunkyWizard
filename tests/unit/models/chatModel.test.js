import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChat, findChatsByUserId, findChatById, deleteChatById } from '../../../src/models/chatModel.js';
import prisma from '../../../src/config/db.js';

vi.mock('../../../src/config/db.js', () => ({
    default: {
        chat: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn()
        }
    }
}));

describe('Chat Model', () => {
    const mockChat = {
        id: 1,
        userId: 123,
        title: 'Test Chat',
        createdAt: new Date()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createChat()', () => {
        it('should create a new chat with default title', async () => {
            prisma.chat.create.mockResolvedValue(mockChat);

            const result = await createChat(123);

            expect(prisma.chat.create).toHaveBeenCalledWith({
                data: {
                    userId: 123,
                    title: 'Novo Chat'
                }
            });
            expect(result).toEqual(mockChat);
        });

        it('should create a chat with custom title', async () => {
            prisma.chat.create.mockResolvedValue(mockChat);

            const result = await createChat(123, 'Custom Title');

            expect(prisma.chat.create).toHaveBeenCalledWith({
                data: {
                    userId: 123,
                    title: 'Custom Title'
                }
            });
            expect(result).toEqual(mockChat);
        });

        it('should throw error when creation fails', async () => {
            prisma.chat.create.mockRejectedValue(new Error('DB Error'));

            await expect(createChat(123)).rejects.toThrow('DB Error');
        });
    });

    describe('findChatsByUserId()', () => {
        it('should return user chats ordered by createdAt desc', async () => {
            const mockChats = [mockChat];
            prisma.chat.findMany.mockResolvedValue(mockChats);

            const result = await findChatsByUserId(123);

            expect(prisma.chat.findMany).toHaveBeenCalledWith({
                where: { userId: 123 },
                include: { messages: true },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(mockChats);
        });

        it('should return empty array if no chats found', async () => {
            prisma.chat.findMany.mockResolvedValue([]);

            const result = await findChatsByUserId(999);

            expect(result).toEqual([]);
        });
    });

    describe('findChatById()', () => {
        it('should return chat by ID', async () => {
            prisma.chat.findUnique.mockResolvedValue(mockChat);

            const result = await findChatById(1);

            expect(prisma.chat.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual(mockChat);
        });

        it('should return null if chat not found', async () => {
            prisma.chat.findUnique.mockResolvedValue(null);

            const result = await findChatById(999);

            expect(result).toBeNull();
        });
    });

    describe('deleteChatById()', () => {
        it('should delete chat by ID', async () => {
            prisma.chat.delete.mockResolvedValue(mockChat);

            const result = await deleteChatById(1);

            expect(prisma.chat.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual(mockChat);
        });

        it('should throw error if deletion fails', async () => {
            prisma.chat.delete.mockRejectedValue(new Error('Deletion Error'));

            await expect(deleteChatById(1)).rejects.toThrow('Deletion Error');
        });
    });
});
