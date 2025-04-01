import express from 'express';
import authenticate from '../utils/authenticate.js';
import {
    createNewChat,
    getUserChats,
    getChatMessages,
    createMessageInChat,
    deleteChatMessages,
    deleteChat,
} from '../controllers/chatsController.js';

const chatsRouter = express.Router();

chatsRouter.post('/', authenticate, createNewChat);
chatsRouter.get('/', authenticate, getUserChats);

chatsRouter.get('/:chatId/messages', authenticate, getChatMessages);
chatsRouter.post('/:chatId/messages', authenticate, createMessageInChat);
chatsRouter.delete('/:chatId/messages', authenticate, deleteChatMessages);

chatsRouter.delete('/:chatId', authenticate, deleteChat);

export default chatsRouter;
