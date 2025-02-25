const { createUser } = require('../models/userModel');
const { login } = require('../services/authService');

const register = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Preencha todos os campos!' });
    }

    try {
        await createUser(email, username, password);
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Preencha todos os campos!' });
    }

    try {
        const token = await login(email, password);
        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

module.exports = {
    register,
    loginUser,
};
