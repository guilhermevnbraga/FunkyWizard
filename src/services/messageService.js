const { createMessage, findMessagesByUserId, deleteMessagesByUserId } = require('../models/messageModel');

const saveMessage = async (content, role, userId) => {
    return createMessage(content, role, userId);
};

const getMessages = async (userId) => {
    return findMessagesByUserId(userId);
};

const deleteMessages = async (userId) => {
    return deleteMessagesByUserId(userId);
};

module.exports = {
    saveMessage,
    getMessages,
    deleteMessages,
};
