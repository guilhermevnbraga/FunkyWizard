// const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const path = require('path');
const { JSDOM } = require("jsdom");
const puppeteer = require('puppeteer');
// const { Stream } = require('stream');
// const { REPL_MODE_STRICT } = require('repl');
const app = express();
const PORT = process.env.PORT || 3000;
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");
const { createSseStream } = require("@azure/core-sse");
const axios = require("axios");
require('dotenv').config();

const client = new ModelClient(
    process.env.AZURE_ENDPOINT_URI,
    new AzureKeyCredential(process.env.AZURE_API_KEY)
);

async function sendMessage(messages, res) {
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
            
            // Envia cada chunk imediatamente para o cliente
            res.write(chunk);
            
            const context = await processBuffer({ buffer, responses });
            buffer = context.buffer;
            responses = context.responses;
        }
    }

    // Processa resposta final
    answer = answer.slice(answer.lastIndexOf("</think>") + "</think>".length);
    messages.push({ role: "assistant", content: answer });

    // Processa respostas das ferramentas
    if (responses.length > 0) {
        messages.push({ role: "user", content: responses.join("\n") });
        await sendMessage(messages, res); // Continua o streaming recursivamente
    }
}

tools = {
    "search": searchGoogle,
    "get": (urls) => fetchPage(urls[0]).then(result => JSON.stringify(result))
}

// tools["get"](["https://github.com/cosmograph-org/py_cosmograph"])
//     .then(result => console.log(result))
//     .catch(error => console.error(error));


// <tool>search python 4</tool>
// ["search", "python", "4"]
// tool = "search"
// args = ["python, "4"]
// tools["search"](args) = searchGoogle(["python", "4"])

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let messages = [
    { role: "system", content: "You are FunkyWizard, an assistent assigned to the task of providing technical information and code snippets based on reliable and updated documentation. You are able to call functions after thinking, by using the tags <tool> and </tool>, with the function and its paremeters lying between the tags. The sintax is function name folowed by the parameters separeted by space (no parenthesis). function calls should be answered alone, without any additional text. Currently, you have the following functions: - `search keyword1 keyword2 ... keywordn` : searchs google using the specified keywords, returns top 5 links. - `get url` : gets the parsed content of a page corresponding to `url`, should be used after getting the urls from system after calling `search`. Instructions: - If you get a question, dont think much. use search; - If you get links from search, use get; - keep using get until you are satisfyed" }
]

app.post('/api/conversa', async (req, res) => {
    const { mensagem } = req.body;
    
    // Configura headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        messages.push({role: "user", content: mensagem});
        await sendMessage(messages, res); // Passa o objeto response
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
    // Procura por todas as ocorrências e acumula as promessas
    while ((match = regex.exec(buffer)) !== null) {
      const toolContent = match[1].split(" ");
      const tool = toolContent[0];
      const args = toolContent.slice(1);
      if (tools[tool]) {
        pendingCalls.push(tools[tool](args));
      }
    }
    
    // Aguarda todas as chamadas das ferramentas terminarem
    if (pendingCalls.length > 0) {
      const results = await Promise.all(pendingCalls);
      responses.push(...results);
    }
    
    // Remove do buffer as partes já processadas
    const lastToolCloseIndex = buffer.lastIndexOf("</tool>");
    if (lastToolCloseIndex !== -1) {
      buffer = buffer.slice(lastToolCloseIndex + "</tool>".length);
    }
    
    return { buffer, responses };
  }


async function searchGoogle(args) {
    query = args.join(" ");
    console.log("\n chamand search para "+query+"\n");
    const apiKey = process.env.SEARCH_API_KEY;
    const cx = process.env.SEARCH_ENGINE_ID;
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url);
        const results = response.data.items || [];
        
        // Retornar os 5 primeiros resultados
        const lista = results.slice(0, 5).map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));
        // Converter a lista em um dicionário
        const object =  Object.fromEntries(
            lista.map((item, index) => [`result_${index + 1}`, item])
        );
        return JSON.stringify(object)
        
    } catch (error) {
        console.error("Erro ao fazer pesquisa no Google:", error.message);
        throw new Error("Erro ao buscar resultados no Google.");
    }
}


async function fetchPage(url) {
    console.log("get "+url+"\n")
    let browser;
    try {
        // Inicia o navegador em modo headless
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Define um tempo máximo para aguardar o carregamento completo da página
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Extrai os elementos desejados na ordem de aparecimento
        const elements = await page.evaluate(() => {
            const extractedElements = [];
            const baseURI = document.baseURI; // Obtém o URL base da página
            
            /**
             * Função para percorrer recursivamente os nós DOM e extrair os elementos desejados.
            *
            * @param {Node} node - O nó DOM atual.
            */
           function traverse(node) {
               // Ignora scripts, estilos e noscript
               if (node.nodeType === Node.ELEMENT_NODE) {
                   const tagName = node.tagName.toLowerCase();
                   if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                       return;
                    }
                    
                    // Headers (h1 - h6)
                    if (/^h[1-6]$/.test(tagName)) {
                        extractedElements.push({
                            type: 'header',
                            level: tagName,
                            text: node.textContent.trim(),
                        });
                    }
                    
                    // Links (<a>)
                    if (tagName === 'a') {
                        const href = node.getAttribute('href');
                        let absoluteHref = href;
                        try {
                            absoluteHref = new URL(href, baseURI).href;
                        } catch (e) {
                            // Se a URL for inválida, mantém o valor original
                            absoluteHref = href;
                        }
                        extractedElements.push({
                            type: 'link',
                            href: absoluteHref,
                            text: node.textContent.trim(),
                        });
                    }
                    
                    // Imagens (<img>)
                    if (tagName === 'img') {
                        const src = node.getAttribute('src');
                        let absoluteSrc = src;
                        try {
                            absoluteSrc = new URL(src, baseURI).href;
                        } catch (e) {
                            // Se a URL for inválida, mantém o valor original
                            absoluteSrc = src;
                        }
                        // extractedElements.push({
                        //     type: 'image',
                        //     src: absoluteSrc,
                        //     alt: node.getAttribute('alt') || '',
                        // });
                    }
                }
                
                // Nós de texto
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent.trim();
                    if (text) { // Ignora textos vazios ou apenas com espaços
                        extractedElements.push({
                            type: 'text',
                            content: text,
                        });
                    }
                }
                
                // Percorre os filhos do nó atual
                node.childNodes.forEach(child => traverse(child));
            }
            
            // Inicia a travessia a partir do corpo da página
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
