const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const chatsRoutes = require('./src/routes/chatsRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/chat', chatRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
