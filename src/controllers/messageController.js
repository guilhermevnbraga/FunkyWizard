const { saveMessage, getMessages, deleteMessages } = require('../services/messageService');

const createMessage = async (req, res) => {
    const { content, role } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Conteúdo da mensagem não pode estar vazio' });
    }

    try {
        const message = await saveMessage(content, role, req.userId);
        res.status(201).json({ message: 'Mensagem salva com sucesso', message });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar mensagem', error: error.message });
    }
};

const getAllMessages = async (req, res) => {
    try {
        const messages = await getMessages(req.userId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recuperar mensagens', error: error.message });
    }
};

const deleteAllMessages = async (req, res) => {
    try {
        await deleteMessages(req.userId);
        res.status(200).json({ message: 'Conversa reiniciada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reiniciar conversa', error: error.message });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    deleteAllMessages,
};
