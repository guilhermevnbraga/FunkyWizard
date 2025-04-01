import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMessage, 
  findMessagesByChatId, 
  deleteMessagesByChatId 
} from '../../../src/models/messageModel.js';
import prisma from '../../../src/config/db.js';

vi.mock('../../../src/config/db.js', () => ({
    default: {
        message: {
            create: vi.fn(),
            findMany: vi.fn(),
            deleteMany: vi.fn()
        }
    }
}));

describe('Message Model', () => {
    const mockMessage = {
        id: 1,
        content: 'Test message',
        role: 'user',
        chatId: 1,
        createdAt: new Date()
    };

    const mockMessages = [
        mockMessage,
        {
            id: 2,
            content: 'Another message',
            role: 'assistant',
            chatId: 1,
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createMessage()', () => {
        it('should create a new message successfully', async () => {
            prisma.message.create.mockResolvedValue(mockMessage);

            const result = await createMessage('Test message', 'user', 1);

            expect(prisma.message.create).toHaveBeenCalledWith({
                data: {
                    content: 'Test message',
                    role: 'user',
                    chatId: 1
                }
            });
            expect(result).toEqual(mockMessage);
        });

        it('should throw error when creation fails', async () => {
            prisma.message.create.mockRejectedValue(new Error('DB Error'));

            await expect(createMessage('Test', 'user', 1))
                .rejects.toThrow('DB Error');
        });
    });

    describe('findMessagesByChatId()', () => {
        it('should return messages ordered by createdAt asc', async () => {
            prisma.message.findMany.mockResolvedValue(mockMessages);

            const result = await findMessagesByChatId(1);

            expect(prisma.message.findMany).toHaveBeenCalledWith({
                where: { chatId: 1 },
                orderBy: { createdAt: 'asc' }
            });
            expect(result).toEqual(mockMessages);
        });

        it('should return empty array if no messages found', async () => {
            prisma.message.findMany.mockResolvedValue([]);

            const result = await findMessagesByChatId(999);

            expect(result).toEqual([]);
        });
    });

    describe('deleteMessagesByChatId()', () => {
        it('should delete all messages for a chat', async () => {
            const deleteResult = { count: 2 };
            prisma.message.deleteMany.mockResolvedValue(deleteResult);

            const result = await deleteMessagesByChatId(1);

            expect(prisma.message.deleteMany).toHaveBeenCalledWith({
                where: { chatId: 1 }
            });
            expect(result).toEqual(deleteResult);
        });

        it('should return count 0 if no messages to delete', async () => {
            prisma.message.deleteMany.mockResolvedValue({ count: 0 });

            const result = await deleteMessagesByChatId(999);

            expect(result.count).toBe(0);
        });

        it('should throw error when deletion fails', async () => {
            prisma.message.deleteMany.mockRejectedValue(new Error('Deletion Error'));

            await expect(deleteMessagesByChatId(1))
                .rejects.toThrow('Deletion Error');
        });
    });
});
