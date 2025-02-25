document.addEventListener('DOMContentLoaded', async () => {
    const inputField = document.querySelector('#input input');
    const sendButton = document.getElementById('send-button');
    const deleteButton = document.getElementById('delete-button');
    const logoutButton = document.getElementById('logout-button');
    const confirmLogoutButton = document.getElementById('confirm-logout-button');
    const chatContainer = document.getElementById('chat');
    const noMessageArticle = document.getElementById('no-message');

    const token = localStorage.getItem('token');
    const apiUrl = 'http://localhost:3000';

    function createThinkElement(content) {
        const thinkContainer = document.createElement('div');
        thinkContainer.classList.add('think-container');

        const thinkContent = document.createElement('p');
        thinkContent.classList.add('think-content');
        thinkContent.innerHTML = content;

        thinkContainer.appendChild(thinkContent);

        return thinkContainer;
    }

    function addMessageToChat(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const thinkElements = tempDiv.querySelectorAll('think');
        thinkElements.forEach(el => {
            const thinkContainer = createThinkElement(el.innerHTML);
            messageElement.appendChild(thinkContainer);
            el.remove();
        });

        messageElement.innerHTML += tempDiv.innerHTML;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageElement;
    }

    function formatMessageContent(content) {
        return marked.parse(content);
    }

    async function loadSavedMessages() {
        try {
            const response = await fetch(`${apiUrl}/api/messages`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao carregar mensagens');

            const messages = await response.json();
            if (messages.length > 0) {
                noMessageArticle.style.display = 'none';
                messages.forEach(message => {
                    const formattedContent = formatMessageContent(message.content);
                    addMessageToChat(message.role, formattedContent);
                });
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    await loadSavedMessages();

    async function sendMessage() {
        const content = inputField.value.trim();
        if (!content) return;

        noMessageArticle.style.display = 'none';
        addMessageToChat('user', formatMessageContent(content));
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
            const assistantMessageElement = addMessageToChat('assistant', '');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += decoder.decode(value);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result;

                const thinkElements = tempDiv.querySelectorAll('think');
                thinkElements.forEach(el => {
                    const thinkContainer = createThinkElement(el.innerHTML);
                    assistantMessageElement.appendChild(thinkContainer);
                    el.remove();
                });

                assistantMessageElement.innerHTML += tempDiv.innerHTML;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            await fetch(`${apiUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, role: 'user' }),
            });

            await fetch(`${apiUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: result, role: 'assistant' }),
            });

        } catch (error) {
            console.error('Erro:', error);
        }
    }

    async function deleteMessages() {
        try {
            const response = await fetch(`${apiUrl}/api/messages`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao excluir mensagens');

            noMessageArticle.style.display = 'block';
            chatContainer.innerHTML = '';
            chatContainer.appendChild(noMessageArticle);
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    function logout() {
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    }

    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    deleteButton.addEventListener('click', deleteMessages);
    logoutButton.addEventListener('click', () => {
        confirmLogoutButton.style.display = confirmLogoutButton.style.display === 'none' ? 'block' : 'none';
    });
    confirmLogoutButton.addEventListener('click', logout);
});
