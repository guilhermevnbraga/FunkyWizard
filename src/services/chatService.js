const { JSDOM } = require("jsdom");
const puppeteer = require('puppeteer');
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");
const { createSseStream } = require("@azure/core-sse");
const axios = require("axios");
const { searchGoogle, fetchPage } = require('../utils/tools');

const client = new ModelClient(
    process.env.AZURE_ENDPOINT_URI,
    new AzureKeyCredential(process.env.AZURE_API_KEY)
);

const sendMessage = async (messages, res, userId) => {
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
};

const processBuffer = async ({ buffer, responses }) => {
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
};

const tools = {
    "search": searchGoogle,
    "get": (urls) => fetchPage(urls[0]).then(result => JSON.stringify(result))
};

module.exports = {
    sendMessage,
};
