const express = require('express');
const authenticate = require('../utils/authenticate');
const { createMessage, getAllMessages, deleteAllMessages } = require('../controllers/messageController');

const router = express.Router();

router.post('/', authenticate, createMessage);
router.get('/', authenticate, getAllMessages);
router.delete('/', authenticate, deleteAllMessages);

module.exports = router;
