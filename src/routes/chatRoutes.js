const express = require('express');
const authenticate = require('../utils/authenticate');
const { startConversation } = require('../controllers/chatController');

const router = express.Router();

router.post('/conversa', authenticate, startConversation);

module.exports = router;
