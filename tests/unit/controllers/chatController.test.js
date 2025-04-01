import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startConversation } from '../../../src/controllers/chatController.js';
import * as chatService from '../../../src/services/chatService.js';

describe('Chat Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock do request
    req = {
      body: {},
      userId: 'user123',
      headers: {}
    };

    // Mock do response com SSE
    res = {
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      status: vi.fn(() => res)
    };
  });

  describe('startConversation()', () => {
    it('should set proper SSE headers', async () => {
      req.body = { mensagem: 'Olá, como vai?' };
      vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce();

      await startConversation(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    });

    it('should call sendMessage with correct parameters', async () => {
      const testMessage = 'Como implementar testes com Vitest?';
      req.body = { mensagem: testMessage };
      const mockMessages = [
        {
          role: "system",
          content: expect.any(String) // Verificamos que existe sem validar todo o conteúdo
        },
        {
          role: "user",
          content: testMessage
        }
      ];
      vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce();

      await startConversation(req, res);

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining(mockMessages),
        res,
        'user123'
      );
    });

    it('should handle errors properly', async () => {
      req.body = { mensagem: 'Mensagem de erro' };
      const testError = new Error('Erro simulado');
      vi.spyOn(chatService, 'sendMessage').mockRejectedValueOnce(testError);

      await startConversation(req, res);

      expect(res.write).toHaveBeenCalledWith(`data: [ERROR] ${testError.message}\n\n`);
      expect(res.end).toHaveBeenCalled();
    });

    it('should always call res.end() in finally block', async () => {
      req.body = { mensagem: 'Mensagem normal' };
      vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce();

      await startConversation(req, res);

      expect(res.end).toHaveBeenCalled();
    });
  });
});
