const prisma = require('../config/db');

const createMessage = async (content, role, userId) => {
    return prisma.message.create({
        data: {
            content,
            role,
            userId,
        },
    });
};

const findMessagesByUserId = async (userId) => {
    return prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
    });
};

const deleteMessagesByUserId = async (userId) => {
    return prisma.message.deleteMany({ where: { userId } });
};

module.exports = {
    createMessage,
    findMessagesByUserId,
    deleteMessagesByUserId,
};
