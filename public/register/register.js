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
            console.log(JSON.stringify({ email, username, password }))
            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });

            console.log("a")

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData)
            }

            const data = await response.json();
            console.log(data.message)
            alert(data.message);
            window.location.href = '../index.html';
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    });
});