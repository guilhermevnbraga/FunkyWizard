import prisma from '../config/db.js';

export const createMessage = async (content, role, chatId) => {
    return prisma.message.create({
        data: {
            content,
            role,
            chatId,
        },
    });
};

export const findMessagesByChatId = async (chatId) => {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });
};

export const deleteMessagesByChatId = async (chatId) => {
    return prisma.message.deleteMany({ where: { chatId } });
};
