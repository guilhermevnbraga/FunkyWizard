const { GoogleGenerativeAI } = require("@google/generative-ai");

const express = require('express');
const path = require('path');
const axios = require("axios");
const { JSDOM } = require("jsdom");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

async function searchGoogle(query) {
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
        return Object.fromEntries(
        lista.map((item, index) => [`result_${index + 1}`, item])
        );

    } catch (error) {
        console.error("Erro ao fazer pesquisa no Google:", error.message);
        throw new Error("Erro ao buscar resultados no Google.");
    }
}

async function fetchPage(url) {
    try {

        const response = await axios.get(url)
        const html = response.data
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Array to hold the extracted elements
        const extractedElements = [];

        /**
         * Recursively traverse the DOM and extract desired elements.
         *
         * @param {Node} node - The current DOM node.
         */
        function traverse(node) {
            // Ignore script and style tags
            if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                if (tagName === 'script' || tagName === 'style') {
                    return;
                }

                // Check for headers (h1 - h6)
                if (/^h[1-6]$/.test(tagName)) {
                    extractedElements.push({
                        type: 'header',
                        level: tagName,
                        text: node.textContent.trim(),
                    });
                }

                // Check for links
                if (tagName === 'a') {
                    extractedElements.push({
                        type: 'link',
                        href: node.getAttribute('href'),
                        text: node.textContent.trim(),
                    });
                }

                // Check for images
                if (tagName === 'img') {
                    extractedElements.push({
                        type: 'image',
                        src: node.getAttribute('src'),
                        alt: node.getAttribute('alt') || '',
                    });
                }
            }

            // Check for text nodes
            if (node.nodeType === dom.window.Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) { // Ignore empty or whitespace-only text
                    extractedElements.push({
                        type: 'text',
                        content: text,
                    });
                }
            }

            // Recursively traverse child nodes
            node.childNodes.forEach(child => traverse(child));
        }

        // Start traversing from the body
        traverse(document.body);
        console.log(extractedElements)
        return { elements: extractedElements };
    } catch (error) {
        return { error: error.message };
    }
}

    
const searchFunctionDeclaration = {
    name: "search",
    parameters: {
        type: "OBJECT",
        description: "Searches on google for the specified keywords",
        properties: {
            query: {
                type: "STRING",
                description: "The keywords used, separeted by spaces. Search operators such as '\"' and '-' are available"
            }
        },
        required: ["query"]
    }
};
const getFunctionDeclaration = {
    name: "get",
    parameters: {
        type: "OBJECT",
        description: "Has access to internet. Requests a webpage and returns it",
        properties: {
            url: {
                type: "STRING",
                description: "The url of the page being requested"
            }
        },
        required: ["url"]
    }
};

const functions = {
    search: ({query}) => {
        return searchGoogle(query)
    },
    get: ({url}) => {
        return fetchPage(url)
    }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Você é o Funky Wizard, um assistente com acesso à internet criado para buscar documentação de códigos." +
    "Você é capaz de fazer buscas profundas em sites usando as funções search e get\n" +
    "### Instruções:\n" +
    "    - Sempre que desconhecer alguma ferramenta ou termo, Funky Wizard não vai responder que desconhece. Em vez disso, ira usar as funções search e get para descobrir do que se trata"+
    "    - Funky Wizard nunca dever dizer ao usuário que não possui acesso à internet ou funcionalidade de realizar pesquisas\n" +
    "    - Sempre quando o usuario pedir uma informação ou tiver alguma duvida à respeito de uma ferramenta, Funky Wizard é obrigado a seguir esses passos:\n" +
    "        1. Use search para buscar documentação a respeito da mesma\n" +
    "        2. Use get para acessar o conteudo da pagina do link mais promissor. Não responda sem usar get\n" +
    "        3. Recursivamente, use get nos links relevantes encontrados dentro das paginas ate achar o conteudo (não use get mais de 5 vezes, por questões de API rates)\n\n"+
    "### Exemplo:\n"+
    "Usuário: 'Me explique como usar o Cosmograph'\n"+
    "Assistente: *chama a função search para 'Cosmograph documentation'\n"+
    "Search: *retorna 5 links, um deles cosmograph.org/docs\n"+
    "Assitente: *chama a função get para 'cosomograph.org/docs'\n"+
    "Get: retorna o json da pagina com um link 'Getting started' com href 'cosmograph.org/example'\n"+
    "Assistente: *chama a função get para 'cosmograph.org/example'\n"+
    "Get: *retorna o json de 'Getting started com as informações necessárias para um iniciante'\n"+
    "Assistente: *Responde o usuário a partir das informações adquiridas",
    tools: {
        functionDeclarations: [searchFunctionDeclaration, getFunctionDeclaration]
    }
});
    
const chat = model.startChat();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
    
app.post('/api/conversa', async (req, res) => {
    const { mensagem } = req.body;
    
    try {
        // Envia a mensagem para o modelo Gemini
        const result = await chat.sendMessage(mensagem);
        const response = await result.response;
        let responseText = await response.text();
        console.log(responseText);
        
        // Obtém as chamadas de função, se houver
        let functionCalls = response.functionCalls();
        
        //res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        //res.setHeader('Transfer-Encoding', 'chunked');
        //res.setHeader('Cache-Control', 'no-cache');

        // Verifica se functionCalls é um array e contém pelo menos uma chamada
        while (Array.isArray(functionCalls) && functionCalls.length > 0) {

            const call = functionCalls[0]; // Considera a primeira chamada
            
            // Verifica se a função chamada está definida
            if (functions.hasOwnProperty(call.name)) {
                // Executa a função chamada com os argumentos fornecidos
                const apiResponse = await functions[call.name](call.args);
                console.log("Usando a função "+call.name)
                
                
                // Envia a resposta da função de volta ao modelo Gemini
                const result = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: apiResponse
                    }
                }]);

                const response = await result.response;
                responseText = await response.text();
                console.log(responseText);
                functionCalls = response.functionCalls();
                
            } else {
                // Caso a função chamada não esteja definida
                console.error(`Função "${call.name}" não está definida.`);
                res.status(500).json({ erro: `Função "${call.name}" não encontrada.` });
            }
        }
        // Caso não haja chamadas de função, retorna a resposta normal do modelo
        res.json({ resposta: responseText });
    } catch (error) {
        // Tratamento de erros gerais
        console.error("Erro na rota /api/conversa:", error);
        res.status(500).json({ erro: "Ocorreu um erro no processamento da sua solicitação." });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
