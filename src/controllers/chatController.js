const { sendMessage } = require('../services/chatService');

const startConversation = async (req, res) => {
    const { mensagem } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
        {
            role: "system",
            content: "You are FunkyWizard, an assistent assigned to the task of providing technical information and code snippets based on reliable and updated documentation. You are able to call functions after thinking, by using the tags <tool> and </tool>, with the function and its paremeters lying between the tags. The sintax is function name folowed by the parameters separeted by space (no parenthesis). function calls should be answered alone, without any additional text. Currently, you have the following functions: - `search keyword1 keyword2 ... keywordn` : searchs google using the specified keywords, returns top 5 links. - `get url` : gets the parsed content of a page corresponding to `url`, should be used after getting the urls from system after calling `search`. Instructions: - If you get a question, dont think much. use search; - If you get links from search, use get; - keep using get until you are satisfyed"
        }
    ];

    try {
        messages.push({ role: "user", content: mensagem });
        await sendMessage(messages, res, req.userId);
    } catch (error) {
        console.error("Erro:", error);
        res.write(`data: [ERROR] ${error.message}\n\n`);
    } finally {
        res.end();
    }
};

module.exports = {
    startConversation,
};
