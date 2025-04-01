import { describe, expect, it } from "vitest";
import errorHandler from '../src/middlewares/errorHandler.js';

const respostaErro = { status: (num) => {
    return {
        json: ({success, message}) => {
            return {status: num, success, message}
            }
        }
    }
};

describe('errorHandler', () => {
    it('deve retornar erro 400 caso o nome do erro seja ValidationError', () => {
        const err = {stack: "esse eh um stack", name: "ValidationError"};
        const res = respostaErro;
        const resposta = errorHandler(err, undefined, res, undefined);
        expect(resposta).toStrictEqual(res.status(400).json({ success: false, message: "Dados inválidos."}));
    });
    it('deve retornar erro 401 caso o nome do erro seja UnauthorizedError', () => {
        const err = {stack: "esse eh um stack", name: "UnauthorizedError"};
        const res = respostaErro;
        const resposta = errorHandler(err, undefined, res, undefined);
        expect(resposta).toStrictEqual(res.status(401).json({ success: false, message: "Acesso negado."}));
    });
    it('deve retornar erro 404 caso o nome do erro seja NotFoundError', () => {
        const err = {stack: "esse eh um stack", name: "NotFoundError"};
        const res = respostaErro;
        const resposta = errorHandler(err, undefined, res, undefined);
        expect(resposta).toStrictEqual(res.status(404).json({ success: false, message: "Recurso não encontrado."}));
    })
    it('deve retornar erro 500 caso nao seja nenhum dos outros erros', () => {
        const err = {stack: "esse eh um stack", name: "OtherError"};
        const res = respostaErro;
        const resposta = errorHandler(err, undefined, res, undefined);
        expect(resposta).toStrictEqual(res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde."}));
    })
})