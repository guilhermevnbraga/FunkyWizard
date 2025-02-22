document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const apiUrl = 'https://funky-wizard.vercel.app';

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = registerForm.querySelector('input[placeholder="Email"]').value;
        const username = registerForm.querySelector('input[placeholder="Usuário"]').value;
        const password = registerForm.querySelector('input[placeholder="Senha"]').value;
        const confirmPassword = registerForm.querySelector('input[placeholder="Repetir senha"]').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar conta');
            }

            const data = await response.json();
            console.log(data.message)
            alert(data.message);
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });
});