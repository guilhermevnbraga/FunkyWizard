const express = require('express');
const authenticate = require('../utils/authenticate');
const {
    createNewChat,
    getUserChats,
    getChatMessages,
    createMessageInChat,
    deleteChatMessages,
    deleteChat,
} = require('../controllers/chatsController');

const chatsRouter = express.Router();

chatsRouter.post('/', authenticate, createNewChat);
chatsRouter.get('/', authenticate, getUserChats);

chatsRouter.get('/:chatId/messages', authenticate, getChatMessages);
chatsRouter.post('/:chatId/messages', authenticate, createMessageInChat);
chatsRouter.delete('/:chatId/messages', authenticate, deleteChatMessages);

chatsRouter.delete('/:chatId', authenticate, deleteChat);

module.exports = chatsRouter;