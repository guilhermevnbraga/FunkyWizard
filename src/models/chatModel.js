import prisma from '../config/db.js';

export const createChat = async (userId, title = 'Novo Chat') => {
    return prisma.chat.create({
        data: {
            userId,
            title,
        },
    });
};

export const findChatsByUserId = async (userId) => {
    return prisma.chat.findMany({
        where: { userId },
        include: { messages: true },
        orderBy: { createdAt: 'desc' },
    });
};

export const findChatById = async (chatId) => {
    return prisma.chat.findUnique({
        where: { id: chatId },
    });
};

export const deleteChatById = async (chatId) => {
    return prisma.chat.delete({
        where: { id: chatId },
    });
};