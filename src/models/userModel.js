const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (email, username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
        },
    });
};

const findUserByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};

module.exports = {
    createUser,
    findUserByEmail,
};
