const axios = require("axios");
const puppeteer = require('puppeteer');

const searchGoogle = async (args) => {
    const query = args.join(" ");
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
        return JSON.stringify(object);
    } catch (error) {
        console.error("Erro ao fazer pesquisa no Google:", error.message);
        throw new Error("Erro ao buscar resultados no Google.");
    }
};

const fetchPage = async (url) => {
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
};

module.exports = {
    searchGoogle,
    fetchPage,
};
