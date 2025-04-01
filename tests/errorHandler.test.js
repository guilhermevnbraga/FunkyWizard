import { describe, expect, it } from "vitest";
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('errorHandler', () => {
    it('deve retornar erro 400 caso o nome do erro seja Validation error', () => {
        // Arrange
        const err = {stack: "esse eh um stack", name: "Validation error"};
        let req = {};
        let res = { status: (num) => {
                return {
                    json: ({success, message}) => {
                        return {status: num, success, message}
                    }
                }
            }
        };
        let next = undefined;
        // Act
        const resposta = errorHandler(err, req, res, next);
        // Assert
        expect(resposta).toBe(res.status(400).json({ success: false, message: "Dados inválidos"}));
    })
})