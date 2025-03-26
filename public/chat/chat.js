document.addEventListener('DOMContentLoaded', async () => {
    const inputField = document.querySelector('#input input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat');
    const newChatButton2 = document.getElementById('opened-new-chat');
    const chatContainer = document.getElementById('chat');
    const chatsContainer = document.getElementById('chats');
    const noMessageArticle = document.getElementById('no-message');
    const closedSidebar = document.getElementById('closed-sidebar');
    const openedSidebar = document.getElementById('opened-sidebar');
    const openSidebarButton = document.getElementById('open-sidebar');
    const closeSidebarButton = document.getElementById('close-sidebar');

    const token = localStorage.getItem('token');
    const apiUrl = 'https://funkywizard.onrender.com';

    let currentChatId = 0;

    openSidebarButton.addEventListener('click', () => {
        closedSidebar.style.display = 'none';
        openedSidebar.style.display = 'flex';
    });

    closeSidebarButton.addEventListener('click', () => {
        openedSidebar.style.display = 'none';
        closedSidebar.style.display = 'flex';
    });

    function createThinkElement(content) {
        const thinkContainer = document.createElement('div');
        thinkContainer.classList.add('think-container');

        const thinkContent = document.createElement('p');
        thinkContent.innerHTML = content;

        thinkContainer.appendChild(thinkContent);

        return thinkContainer;
    }

    function addMessageToChat(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const thinkContainer = document.createElement('div');

        if (role === 'assistant') {
            const thinkTags = tempDiv.querySelectorAll('think');
            thinkContainer.classList.add('think-container');

            thinkTags.forEach(thinkTag => {
                const thinkContent = document.createElement('p');
                thinkContent.innerHTML = thinkTag.innerHTML;
                thinkContainer.appendChild(thinkContent);
            });
        }

        tempDiv.innerHTML = tempDiv.innerHTML.replace(/<think>.*?<\/think>/g, '');

        chatContainer.appendChild(thinkContainer);
        const formattedContent = formatMessageContent(tempDiv.innerHTML);
        messageElement.innerHTML = formattedContent;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageElement;
    }

    function formatMessageContent(content) {
        return marked.parse(content);
    }

    async function loadUserChats() {
        try {
            const response = await fetch(`${apiUrl}/api/chats`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            data.forEach(addChatToSidebar);
        } catch (error) {
            console.error(error);
        }
    }

    function addChatToSidebar(chat) {
        const chatElement = document.createElement('button');
        chatElement.classList.add('chat-item');
        chatElement.textContent = chat.title;
        chatElement.id = `chat-button-${chat.id}`;

        chatElement.addEventListener('click', () => {
            currentChatId = chat.id;

            const activeChat = document.querySelector('.chat-item-active');
            if (activeChat) {
                activeChat.classList.remove('chat-item-active');
            }

            chatElement.classList.add('chat-item-active');

            loadChatMessages(chat.id);
        });

        chatsContainer.appendChild(chatElement);
    }

    async function loadChatMessages(chatId) {
        try {
            const response = await fetch(`${apiUrl}/api/chats/${chatId}/messages`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const messages = await response.json();
            if (!response.ok) throw new Error(messages.error);

            chatContainer.innerHTML = '';
            noMessageArticle.style.display = messages.length > 0 ? 'none' : 'block';
            messages.forEach(message => {
                addMessageToChat(message.role, message.content);
            });
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    async function createNewChat() {
        currentChatId = 0;
        chatContainer.innerHTML = '';
        noMessageArticle.style.display = 'block';
    }

    async function sendMessage() {
        const content = inputField.value.trim();
        if (currentChatId === 0) {
            try {
                const title = content.length > 30 ? content.substring(0, 30) + '...' : content;

                const response = await fetch(`${apiUrl}/api/chats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title }),
                });

                if (!response.ok) throw new Error('Erro ao criar chat');

                const chat = await response.json();
                currentChatId = chat.chat.id;
                addChatToSidebar(title);
            } catch (error) {
                console.error('Erro ao criar novo chat:', error);
            }
        }

        if (!content || !currentChatId) return;

        noMessageArticle.style.display = 'none';
        addMessageToChat('user', content);
        inputField.value = '';

        try {
            const response = await fetch(`${apiUrl}/api/chat/conversa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mensagem: content }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';
            const assistantMessageElement = addMessageToChat('assistant', 'Pensando...');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += decoder.decode(value);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result;

                const thinkTag = tempDiv.querySelectorAll('think');
                const thinkElement = createThinkElement(thinkTag[0].innerHTML);
                tempDiv.innerHTML = tempDiv.innerHTML.replace(thinkTag[0].outerHTML, thinkElement.outerHTML);

                const formattedContent = formatMessageContent(tempDiv.innerHTML);

                assistantMessageElement.innerHTML = formattedContent;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            await fetch(`${apiUrl}/api/chats/${currentChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content, role: 'user' }),
            });

            await fetch(`${apiUrl}/api/chats/${currentChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: result, role: 'assistant' }),
            });

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    }

    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    newChatButton.addEventListener('click', createNewChat);
    newChatButton2.addEventListener('click', createNewChat);

    await loadUserChats();
});
