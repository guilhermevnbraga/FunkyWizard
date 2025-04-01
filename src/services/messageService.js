import { createMessage, findMessagesByChatId, deleteMessagesByChatId } from '../models/messageModel.js';

export const saveMessage = async (content, role, chatId) => {
    return createMessage(content, role, chatId);
};

export const getMessages = async (chatId) => {
    return findMessagesByChatId(chatId);
};

export const deleteMessages = async (chatId) => {
    return deleteMessagesByChatId(chatId);
};
