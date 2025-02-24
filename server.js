const express = require('express');
const path = require('path');
const { JSDOM } = require("jsdom");
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");
const { createSseStream } = require("@azure/core-sse");
const axios = require("axios");
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const SECRET_KEY = process.env.SECRET_KEY || "secret_key";

const client = new ModelClient(
    process.env.AZURE_ENDPOINT_URI,
    new AzureKeyCredential(process.env.AZURE_API_KEY)
);

const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

async function sendMessage(messages, res, userId) {
    const response = await client.path("/chat/completions").post({
        body: {
            messages: messages,
            max_tokens: 2048,
            model: "DeepSeek-R1",
            stream: true
        }
    }).asNodeStream();

    const stream = response.body;
    if (!stream) {
        throw new Error("The response stream is undefined");
    }
    if (response.status !== "200") {
        stream.destroy();
        throw new Error(`Request failed with status ${response.status}`);
    }

    const sseStream = createSseStream(stream);
    let answer = "";
    let buffer = "", responses = [];

    for await (const event of sseStream) {
        if (event.data === "[DONE]") break;

        for (const choice of (JSON.parse(event.data)).choices) {
            const chunk = choice.delta?.content ?? "";
            answer += chunk;
            buffer += chunk;

            res.write(chunk);

            const context = await processBuffer({ buffer, responses });
            buffer = context.buffer;
            responses = context.responses;
        }
    }

    answer = answer.slice(answer.lastIndexOf("</think>") + "</think>".length);
    messages.push({ role: "assistant", content: answer });
    if (responses.length > 0) {
        messages.push({ role: "user", content: responses.join("\n") });
        await sendMessage(messages, res, userId);
    }
}

tools = {
    "search": searchGoogle,
    "get": (urls) => fetchPage(urls[0]).then(result => JSON.stringify(result))
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let messages = [
    { role: "system", content: "You are FunkyWizard, an assistent assigned to the task of providing technical information and code snippets based on reliable and updated documentation. You are able to call functions after thinking, by using the tags <tool> and </tool>, with the function and its paremeters lying between the tags. The sintax is function name folowed by the parameters separeted by space (no parenthesis). function calls should be answered alone, without any additional text. Currently, you have the following functions: - `search keyword1 keyword2 ... keywordn` : searchs google using the specified keywords, returns top 5 links. - `get url` : gets the parsed content of a page corresponding to `url`, should be used after getting the urls from system after calling `search`. Instructions: - If you get a question, dont think much. use search; - If you get links from search, use get; - keep using get until you are satisfyed" }
]

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

app.post('/api/conversa', authenticate, async (req, res) => {
    const { mensagem } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        messages.push({ role: "user", content: mensagem });

        await sendMessage(messages, res, req.userId);
    } catch (error) {
        console.error("Erro:", error);
        res.write(`data: [ERROR] ${error.message}\n\n`);
    } finally {
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

async function processBuffer({ buffer, responses }) {
    const regex = /<tool>([\s\S]*?)<\/tool>/g;
    let match;
    let pendingCalls = [];
    while ((match = regex.exec(buffer)) !== null) {
        const toolContent = match[1].split(" ");
        const tool = toolContent[0];
        const args = toolContent.slice(1);
        if (tools[tool]) {
            pendingCalls.push(tools[tool](args));
        }
    }

    if (pendingCalls.length > 0) {
        const results = await Promise.all(pendingCalls);
        responses.push(...results);
    }

    const lastToolCloseIndex = buffer.lastIndexOf("</tool>");
    if (lastToolCloseIndex !== -1) {
        buffer = buffer.slice(lastToolCloseIndex + "</tool>".length);
    }

    return { buffer, responses };
}

async function searchGoogle(args) {
    query = args.join(" ");
    console.log("\n chamand search para " + query + "\n");
    const apiKey = process.env.SEARCH_API_KEY;
    const cx = process.env.SEARCH_ENGINE_ID;

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url);
        const results = response.data.items || [];

        const lista = results.slice(0, 5).map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));
        const object = Object.fromEntries(
            lista.map((item, index) => [`result_${index + 1}`, item])
        );
        return JSON.stringify(object)

    } catch (error) {
        console.error("Erro ao fazer pesquisa no Google:", error.message);
        throw new Error("Erro ao buscar resultados no Google.");
    }
}

async function fetchPage(url) {
    console.log("get " + url + "\n")
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const elements = await page.evaluate(() => {
            const extractedElements = [];
            const baseURI = document.baseURI;

            function traverse(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                        return;
                    }

                    if (/^h[1-6]$/.test(tagName)) {
                        extractedElements.push({
                            type: 'header',
                            level: tagName,
                            text: node.textContent.trim(),
                        });
                    }

                    if (tagName === 'a') {
                        const href = node.getAttribute('href');
                        let absoluteHref = href;
                        try {
                            absoluteHref = new URL(href, baseURI).href;
                        } catch (e) {
                            absoluteHref = href;
                        }
                        extractedElements.push({
                            type: 'link',
                            href: absoluteHref,
                            text: node.textContent.trim(),
                        });
                    }

                    if (tagName === 'img') {
                        const src = node.getAttribute('src');
                        let absoluteSrc = src;
                        try {
                            absoluteSrc = new URL(src, baseURI).href;
                        } catch (e) {
                            absoluteSrc = src;
                        }
                    }
                }

                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent.trim();
                    if (text) {
                        extractedElements.push({
                            type: 'text',
                            content: text,
                        });
                    }
                }

                node.childNodes.forEach(child => traverse(child));
            }

            traverse(document.body);

            return extractedElements;
        });

        await browser.close();

        return { elements };
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        return { error: error.message };
    }
}

app.post('/api/register', async (req, res) => {
    const { email, username, password } = req.body;
    console.log("c")

    if (!email || !username || !password) {
        console.log("d")
        return res.status(400).json({ message: 'Preencha todos os campos!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("e")

    try {
        console.log("b")
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Preencha todos os campos!' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        res.status(500).json({ message: error.message, error: error.message });
    }
});

app.post('/api/messages', authenticate, async (req, res) => {
    const { content, role } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Conteúdo da mensagem não pode estar vazio' });
    }

    try {
        const message = await prisma.message.create({
            data: {
                content,
                role,
                userId: req.userId,
            },
        });
        res.status(201).json({ message: 'Mensagem salva com sucesso', message });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar mensagem', error: error.message });
    }
});

app.get('/api/messages', authenticate, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recuperar mensagens', error: error.message });
    }
});

app.delete('/api/messages', authenticate, async (req, res) => {
    try {
        await prisma.message.deleteMany({ where: { userId: req.userId } });
        res.status(200).json({ message: 'Conversa reiniciada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reiniciar conversa', error: error.message });
    }
});