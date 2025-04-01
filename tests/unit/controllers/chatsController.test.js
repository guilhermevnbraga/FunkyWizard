import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createNewChat,
  getUserChats,
  getChatMessages,
  createMessageInChat,
  deleteChatMessages,
  deleteChat
} from '../../../src/controllers/chatsController.js';
import * as chatModel from '../../../src/models/chatModel.js';
import * as messageService from '../../../src/services/messageService.js';

describe('Chats Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.resetAllMocks();
    
    req = {
      userId: '123',
      body: {},
      params: {}
    };
    
    res = {
      status: vi.fn(() => res),
      json: vi.fn()
    };
  });

  describe('createNewChat()', () => {
    it('should create a new chat successfully', async () => {
      req.body = { title: 'Novo Chat' };
      const mockChat = { id: 1, userId: 123, title: 'Novo Chat' };
      vi.spyOn(chatModel, 'createChat').mockResolvedValueOnce(mockChat);

      await createNewChat(req, res);

      expect(chatModel.createChat).toHaveBeenCalledWith(123, 'Novo Chat');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Chat criado com sucesso',
        chat: mockChat
      });
    });

    it('should handle errors when creating chat', async () => {
      req.body = { title: 'Chat com erro' };
      vi.spyOn(chatModel, 'createChat').mockRejectedValueOnce(new Error('DB Error'));

      await createNewChat(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao criar chat',
        error: 'DB Error'
      });
    });
  });

  describe('getUserChats()', () => {
    it('should return user chats successfully', async () => {
      const mockChats = [{ id: 1, title: 'Chat 1' }, { id: 2, title: 'Chat 2' }];
      vi.spyOn(chatModel, 'findChatsByUserId').mockResolvedValueOnce(mockChats);

      await getUserChats(req, res);

      expect(chatModel.findChatsByUserId).toHaveBeenCalledWith(123);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChats);
    });

    it('should handle errors when fetching chats', async () => {
      vi.spyOn(chatModel, 'findChatsByUserId').mockRejectedValueOnce(new Error('DB Error'));

      await getUserChats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar chats',
        error: 'DB Error'
      });
    });
  });

  describe('getChatMessages()', () => {
    it('should return chat messages successfully', async () => {
      req.params = { chatId: '1' };
      const mockMessages = [
        { id: 1, content: 'Message 1' },
        { id: 2, content: 'Message 2' }
      ];
      vi.spyOn(messageService, 'getMessages').mockResolvedValueOnce(mockMessages);

      await getChatMessages(req, res);

      expect(messageService.getMessages).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle errors when fetching messages', async () => {
      req.params = { chatId: '1' };
      vi.spyOn(messageService, 'getMessages').mockRejectedValueOnce(new Error('Service Error'));

      await getChatMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao recuperar mensagens do chat',
        error: 'Service Error'
      });
    });
  });

  describe('createMessageInChat()', () => {
    it('should create a message successfully', async () => {
      req.params = { chatId: '1' };
      req.body = { content: 'Hello', role: 'user' };
      const mockMessage = { id: 1, content: 'Hello', role: 'user' };
      vi.spyOn(messageService, 'saveMessage').mockResolvedValueOnce(mockMessage);

      await createMessageInChat(req, res);

      expect(messageService.saveMessage).toHaveBeenCalledWith('Hello', 'user', 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mensagem salva com sucesso',
        message: mockMessage
      });
    });

    it('should return 400 if content is empty', async () => {
      req.params = { chatId: '1' };
      req.body = { content: '', role: 'user' };

      await createMessageInChat(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conteúdo e role são obrigatórios'
      });
    });

    it('should handle errors when saving message', async () => {
      req.params = { chatId: '1' };
      req.body = { content: 'Error', role: 'user' };
      vi.spyOn(messageService, 'saveMessage').mockRejectedValueOnce(new Error('Save Error'));

      await createMessageInChat(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao salvar mensagem',
        error: 'Save Error'
      });
    });
  });

  describe('deleteChatMessages()', () => {
    it('should delete chat messages successfully', async () => {
      req.params = { chatId: '1' };
      vi.spyOn(messageService, 'deleteMessages').mockResolvedValueOnce();

      await deleteChatMessages(req, res);

      expect(messageService.deleteMessages).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mensagens do chat excluídas com sucesso'
      });
    });

    it('should handle errors when deleting messages', async () => {
      req.params = { chatId: '1' };
      vi.spyOn(messageService, 'deleteMessages').mockRejectedValueOnce(new Error('Delete Error'));

      await deleteChatMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir mensagens do chat',
        error: 'Delete Error'
      });
    });
  });

  describe('deleteChat()', () => {
    it('should delete chat successfully', async () => {
      req.params = { chatId: '1' };
      vi.spyOn(chatModel, 'deleteChatById').mockResolvedValueOnce();

      await deleteChat(req, res);

      expect(chatModel.deleteChatById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Chat excluído com sucesso'
      });
    });

    it('should handle errors when deleting chat', async () => {
      req.params = { chatId: '1' };
      vi.spyOn(chatModel, 'deleteChatById').mockRejectedValueOnce(new Error('Delete Error'));

      await deleteChat(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir chat',
        error: 'Delete Error'
      });
    });
  });
});
