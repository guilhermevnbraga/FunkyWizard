const prisma = require('../config/db');

const createMessage = async (content, role, chatId) => {
    return prisma.message.create({
        data: {
            content,
            role,
            chatId
        },
    });
};

const findMessagesByChatId = async (chatId) => {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });
};

const deleteMessagesByChatId = async (chatId) => {
    return prisma.message.deleteMany({ where: { chatId } });
};

module.exports = {
    createMessage,
    findMessagesByChatId,
    deleteMessagesByChatId,
};
