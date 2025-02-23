document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const apiUrl = 'http://localhost:3000';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('input[placeholder="Email"]').value;
        const password = loginForm.querySelector('input[placeholder="Senha"]').value;

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao fazer login');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Armazenar o token no armazenamento local
            alert(data.message);
            window.location.href = './chat/chat.html';
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });
});