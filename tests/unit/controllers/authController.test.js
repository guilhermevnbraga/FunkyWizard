import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, loginUser } from '../../../src/controllers/authController.js';
import * as userModel from '../../../src/models/userModel.js';
import * as authService from '../../../src/services/authService.js';

vi.mock('../../../src/models/userModel.js');
vi.mock('../../../src/services/authService.js');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {} };
    res = {
      status: vi.fn(() => res),
      json: vi.fn(),
    };
  });

  describe('register()', () => {
    it('deve retornar 400 se faltar campos obrigatórios', async () => {
      req.body = { email: 'test@example.com' };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Preencha todos os campos!',
      });
    });

    it('deve criar usuário com sucesso (status 201)', async () => {
      req.body = { 
        email: 'dev@example.com', 
        username: 'devuser', 
        password: 'senha123' 
      };
      userModel.createUser.mockResolvedValueOnce();

      await register(req, res);

      expect(userModel.createUser).toHaveBeenCalledWith(
        'dev@example.com',
        'devuser',
        'senha123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso!',
      });
    });

    it('deve retornar 500 em caso de erro no banco de dados', async () => {
      req.body = { 
        email: 'fail@example.com', 
        username: 'failuser', 
        password: 'senha123' 
      };
      userModel.createUser.mockRejectedValueOnce(new Error('Erro de conexão com o DB'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao criar usuário',
        error: 'Erro de conexão com o DB',
      });
    });
  });

  describe('loginUser()', () => {
    it('deve retornar 400 se faltar email ou password', async () => {
      req.body = { email: 'test@example.com' };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Preencha todos os campos!',
      });
    });

    it('deve retornar token JWT no login válido (status 200)', async () => {
      req.body = { email: 'dev@example.com', password: 'senha123' };
      authService.login.mockResolvedValueOnce('token-gerado-123');

      await loginUser(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        'dev@example.com',
        'senha123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login bem-sucedido',
        token: 'token-gerado-123',
      });
    });

    it('deve retornar 401 se credenciais forem inválidas', async () => {
      req.body = { email: 'wrong@example.com', password: 'senhaerrada' };
      authService.login.mockRejectedValueOnce(new Error('Credenciais inválidas'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
    });
  });
});
