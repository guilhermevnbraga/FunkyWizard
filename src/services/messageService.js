const { createMessage, findMessagesByChatId, deleteMessagesByChatId } = require('../models/messageModel');

const saveMessage = async (content, role, chatId) => {
    return createMessage(content, role, chatId);
};

const getMessages = async (chatId) => {
    return findMessagesByChatId(chatId);
};

const deleteMessages = async (chatId) => {
    return deleteMessagesByChatId(chatId);
};

module.exports = {
    saveMessage,
    getMessages,
    deleteMessages,
};
