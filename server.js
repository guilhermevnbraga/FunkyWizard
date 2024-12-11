const { GoogleGenerativeAI } = require("@google/generative-ai");

const express = require('express');
const path = require('path');
const axios = require("axios");

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

const functions = {
    search: ({query}) => {
        return searchGoogle(query)
    }
};
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Você é o Funky Wizard, um assistente criado para buscar documentação de códigos.\n\
    No momento, você é apenas capaz de buscar por palavras chave e trazer os 5 primeiros links de sua pequisa, mas futuramente será capaz de navegar a internet!\n\
    Seu papel é pesquisar pelos links usando palavras chaves coerentes e selecionar dos resultados apenas os resultados que julgar relevantes e os links menos relevantes da função podem ser ignorados",
    tools: {
        functionDeclarations: [searchFunctionDeclaration]
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
        const responseText = await response.text();
        console.log(responseText);

        // Obtém as chamadas de função, se houver
        const functionCalls = response.functionCalls();

        // Verifica se functionCalls é um array e contém pelo menos uma chamada
        if (Array.isArray(functionCalls) && functionCalls.length > 0) {
            const call = functionCalls[0]; // Considera a primeira chamada

            // Verifica se a função chamada está definida
            if (functions.hasOwnProperty(call.name)) {
                // Executa a função chamada com os argumentos fornecidos
                const apiResponse = await functions[call.name](call.args);

                // Envia a resposta da função de volta ao modelo Gemini
                const result2 = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: apiResponse
                    }
                }]);

                // Envia a resposta final para o cliente
                const text = await result2.response.text()
                console.log(text)
                res.json({ resposta: text});
            } else {
                // Caso a função chamada não esteja definida
                console.error(`Função "${call.name}" não está definida.`);
                res.status(500).json({ erro: `Função "${call.name}" não encontrada.` });
            }
        } else {
            // Caso não haja chamadas de função, retorna a resposta normal do modelo
            res.json({ resposta: responseText });
        }
    } catch (error) {
        // Tratamento de erros gerais
        console.error("Erro na rota /api/conversa:", error);
        res.status(500).json({ erro: "Ocorreu um erro no processamento da sua solicitação." });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
