import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './src/middlewares/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import chatsRoutes from './src/routes/chatsRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default app;