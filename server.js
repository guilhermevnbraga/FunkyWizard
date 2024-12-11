const express = require('express');
const path = require('path');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/conversa', async (req, res) => {
    const { mensagem } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const result = await model.generateContent(mensagem);
    const response = await result.response;
    const text = response.text();
    res.json({ resposta: text});
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
