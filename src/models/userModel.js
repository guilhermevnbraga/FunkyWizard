import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async (email, username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
        },
    });
};

export const findUserByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};
