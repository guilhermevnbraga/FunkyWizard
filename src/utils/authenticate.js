import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || "secret_key";

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

export default authenticate;
