const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: "Dados inválidos." });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ success: false, message: "Acesso negado." });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({ success: false, message: "Recurso não encontrado." });
    }

    res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
};

module.exports = errorHandler;