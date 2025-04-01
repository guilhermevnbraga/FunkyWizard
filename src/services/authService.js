import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.SECRET_KEY || "secret_key";

export const login = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    return token;
};
