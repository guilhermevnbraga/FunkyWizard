import express from 'express';
import authenticate from '../utils/authenticate.js';
import { startConversation } from '../controllers/chatController.js';

const router = express.Router();

router.post('/conversa', authenticate, startConversation);

export default router;
