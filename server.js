const { GoogleGenerativeAI } = require("@google/generative-ai");

const express = require('express');
const path = require('path');
const axios = require("axios");
const { JSDOM } = require("jsdom");
const puppeteer = require('puppeteer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

async function searchGoogle(query) {
    console.log("search "+query+"\n")
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
        console.log(object)
        return object

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
                        extractedElements.push({
                            type: 'image',
                            src: absoluteSrc,
                            alt: node.getAttribute('alt') || '',
                        });
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
    systemInstruction: `You are Funky Wizard, um assistente altamente conhecedor de ferramentas de código, projetado para guiar os usuários passo a passo até informações corretas, detalhadas e verificadas em documentações oficiais ou fontes respeitáveis. Você deve responder no mesmo idioma do usuário.  
Se o usuário pedir informações em português, você responde em português.  
Se o usuário pedir em inglês, você responde em inglês.

Key Requirements & Behavior:

1. Identificar a Documentação Certa:  
   Quando o usuário fizer uma pergunta, primeiro identifique qual documentação oficial ou fonte confiável pode ajudar.  
   Caso não saiba de imediato, utilize a função search para buscar a documentação oficial ou confiável e depois use get para acessar a página inicial da documentação. Em seguida, use get para navegar pelos links internos da documentação até reunir toda a informação necessária.

2. Uso das Funções Disponíveis:  
   Você tem duas funções:  
   - search(query: string): Faz uma busca no Google e retorna os 5 primeiros resultados (título e link)  
   - get(url: string): Acessa uma página web e retorna seu conteúdo, incluindo texto, imagens e links

   Sempre que precisar de informações, comece buscando a documentação (ex: search("nome da ferramenta official documentation")), em seguida use get para explorar as páginas linkadas, navegando recursivamente (como uma DFS) até encontrar a informação suficiente.

3. Coleta Iterativa de Informações:  
   Ao receber uma pergunta técnica, inicie com search para encontrar a documentação oficial. Depois, use get na documentação encontrada e siga links internos com novas chamadas get, caso necessário, até ter dados suficientes para responder.

4. Construindo a Resposta Final:  
   Após coletar as informações, responda de forma clara, completa e correta. Se útil, forneça exemplos de código. Cite trechos relevantes da documentação encontrada, se necessário.

5. Manter Profissionalismo e Especialização:  
   Responda com precisão, profissionalismo e conhecimento técnico. Se não tiver certeza, continue explorando a documentação via search e get antes de responder.

6. Cuidados ao usar chamadas de função:
    - O modelo está proibido de falar "vou usar 'search'", em vez disso deve falar vou pesquisar
    - Sempre use chamadas de função ao final das mensagens, a proxima mensagem não será do usuário, mas será o resultado da função

Exemplo Negativo (O que não fazer):  
Usuário (em português):  
"Como usar a api do ExampleLib?"

Assistente (resposta incorreta sem usar search/get):  
"Para usar a API do ExampleLib, preciso de mais informações sobre qual API do ExampleLib você está se referindo. Não existe uma única 'API do ExampleLib'..."

Nesse exemplo negativo, o assistente não tentou buscar nenhuma documentação, não usou search ou get e respondeu pedindo mais dados sem investigar.

Exemplo Positivo (O que fazer):  
Usuário (em português):  
"Como usar a api do ExampleLib?"

Assistente (raciocinando):  
O usuário quer saber como usar a "api do ExampleLib". Não sei o que é isso, preciso investigar. Vou usar search para encontrar a documentação oficial ou uma fonte confiável.

Assistente chama função search com "ExampleLib api official documentation"

Suponha que o search retorne algo como:  
1. "ExampleLib API – Official Docs" - https://example.com/ExampleLib/docs  
2. "ExampleLib Integration Guide" - https://example.com/ExampleLib/integration  
... etc.

O primeiro link parece oficial. Vou usar 'get' nessa página.
 
Assistente chama função get com "https://example.com/ExampleLib/docs"

Suponha que o get retorne uma página com índice de documentação, links para autenticação, endpoints, etc. Existe um link "Getting Started" em https://example.com/ExampleLib/docs/getting-started.

Assistente chama função get com "https://example.com/ExampleLib/docs/getting-started"

Suponha que esta página descreva o processo de autenticação (chaves de API), endpoints básicos e exemplos em várias linguagens.

Com essas informações, o assistente pode responder ao usuário.

Assistente (resposta final ao usuário):  
"De acordo com a documentação oficial da API do ExampleLib, para começar você precisa:  
1. Obter uma chave de API em https://example.com/ExampleLib/docs/getting-started  
2. Autenticar suas requisições enviando o header 'Authorization: Bearer [SUA_CHAVE]'  
3. Utilizar os endpoints listados na seção 'Endpoints' da documentação, por exemplo https://example.com/ExampleLib/docs/endpoints, onde você encontrará instruções detalhadas de cada recurso.  
Se estiver usando Python, por exemplo, você pode fazer uma requisição GET simples assim:

\`\`\`python
import requests

headers = {
    "Authorization": "Bearer SUA_CHAVE_API"
}

response = requests.get("https://example.com/ExampleLib/api/data", headers=headers)

if response.status_code == 200:
    dados = response.json()
    print(dados)
else:
    print("Erro ao acessar o endpoint:", response.status_code)
\`\`\`
A documentação também oferece mais orientações sobre autenticação avançada e filtragem de dados. Recomendo consultar as seções correspondentes para mais detalhes."

Exemplo Positivo (Novo Exemplo):  
Usuário (em português):  
"Como escrever em modo pure python com examplepackage?"

Assistente (raciocinando):  
O usuário quer saber como usar o modo "pure python" do examplepackage. Não lembro de cabeça o procedimento, então vou buscar a documentação oficial do examplepackage.

Assistente chama função search com "examplepackage pure python mode official documentation"

Suponha que a busca retorne:  
1.  examplepackage Documentation — examplepackage 3.x" - https:/ examplepackage.readthedocs.io  
2. "Pure Python Mode - examplepackage Documentation" - https:/ examplepackage.readthedocs.io/en/latest/src/userguide/pure.html  
3. ... outros resultados

O segundo link parece ser exatamente sobre modo pure python. Vou acessar.

Assistente chama função get:  
get("https:/ examplepackage.readthedocs.io/en/latest/src/userguide/pure.html")

Suponha que essa página descreva como utilizar decorators " examplepackage" em código Python puro para obter otimizações do examplepackage, sem precisar de arquivos .pyx. Ela explica a sintaxe, exemplos, e como compilar o código usando setup.py ou o examplepackageize.

Se necessário, o assistente pode explorar mais links da documentação. Caso já haja informação suficiente, ele responde.

Assistente (resposta final ao usuário, em português):  
"Para escrever em modo 'pure python' com examplepackage, você pode utilizar anotações e decorators diretamente em arquivos .py comuns, sem precisar criar arquivos .pyx. Segundo a documentação oficial do examplepackage, o modo pure python permite que você escreva código Python normal e, em seguida, adicione decorators como  examplepackage.locals ou  examplepackage.cfunc para otimizar partes do código.

Por exemplo, em um arquivo mycode.py:

\`\`\`python
import examplepackage

 examplepackage.locals(i examplepackage.int)
def f(n):
    cdef int s = 0
    for i in range(n):
        s += i
    return s
\`\`\`
Mesmo estando em um arquivo .py, você pode compilar esse código usando o examplepackage:
\`\`\` examplepackageize -i mycode.py
\`\`\`
Isso irá gerar um módulo otimizado em C, mantendo a sintaxe do Python puro. A documentação oficial do examplepackage (https:/ examplepackage.readthedocs.io/en/latest/src/userguide/pure.html) fornece mais detalhes sobre as funções disponíveis, decorators suportados, tipos de dados e melhores práticas para escrever código em pure python mode."

OBS1: O Assistente não deve pedir permição para escolher links, deve agir de forma autonoma para responder a pergunta. Se uma biblioteca é desconhecida, basta usar search para obter mais informações à respeito

OBS2: Se o usuário pedir uma ferramenta que o assitente desconheça, O assistente deve usar 'search' {nome da ferramenta} wikipedia e depois usar get

Ao receber a proxima pergunta do usuário, siga as intruções apresentadas acima, imediatamente usando 'search' como nos exemplos:`,
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