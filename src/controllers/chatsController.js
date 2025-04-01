import { createChat, findChatsByUserId, findChatById, deleteChatById } from '../models/chatModel.js';
import { saveMessage, getMessages, deleteMessages } from '../services/messageService.js';

export const createNewChat = async (req, res) => {
    try {
        const { userId } = req;
        const { title } = req.body;
        const chat = await createChat(parseInt(userId), title);
        res.status(201).json({ message: 'Chat criado com sucesso', chat });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar chat', error: error.message });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const { userId } = req;
        const chats = await findChatsByUserId(parseInt(userId));
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar chats', error: error.message });
    }
};

export const getChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await getMessages(parseInt(chatId));
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recuperar mensagens do chat', error: error.message });
    }
};

export const createMessageInChat = async (req, res) => {
    const { chatId } = req.params;
    const { content, role } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Conteúdo da mensagem não pode estar vazio' });
    }

    try {
        const message = await saveMessage(content, role, parseInt(chatId));
        res.status(201).json({ message: 'Mensagem salva com sucesso', message });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar mensagem', error: error.message });
    }
};

export const deleteChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        await deleteMessages(parseInt(chatId));
        res.status(200).json({ message: 'Mensagens do chat excluídas com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir mensagens do chat', error: error.message });
    }
};

export const deleteChat = async (req, res) => {
    const { chatId } = req.params;

    try {
        await deleteChatById(chatId);
        res.status(200).json({ message: 'Chat excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir chat', error: error.message });
    }
};
