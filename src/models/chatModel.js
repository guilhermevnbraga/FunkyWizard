const prisma = require('../config/db');

const createChat = async (userId, title = 'Novo Chat') => {
    return prisma.chat.create({
        data: {
            userId,
            title,
        },
    });
};

const findChatsByUserId = async (userId) => {
    return prisma.chat.findMany({
        where: { userId },
        include: { messages: true },
        orderBy: { createdAt: 'desc' },
    });
};

const findChatById = async (chatId) => {
    return prisma.chat.findUnique({
        where: { id: chatId },
    });
};

const deleteChatById = async (chatId) => {
    return prisma.chat.delete({
        where: { id: chatId },
    });
};

module.exports = {
    createChat,
    findChatsByUserId,
    findChatById,
    deleteChatById,
};