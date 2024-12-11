const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
const mensagemInput = document.getElementById('mensagem');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensagem = mensagemInput.value.trim();
  if (!mensagem) return;

  adicionarMensagem(mensagem, 'usuario');
  mensagemInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const resposta = await fetch('/api/conversa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mensagem }),
    });

    if (!resposta.ok) {
      throw new Error('Erro na resposta da API');
    }

    const dados = await resposta.json();
    const respostaGemini = dados.resposta || 'Desculpe, não entendi.';

    adicionarMensagem(respostaGemini, 'gemini');
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    console.error(error);
    adicionarMensagem('Ocorreu um erro ao se comunicar com o servidor.', 'gemini');
  }
});

function adicionarMensagem(texto, tipo) {
  const mensagemDiv = document.createElement('div');
  mensagemDiv.classList.add('mensagem', tipo);
  mensagemDiv.textContent = texto;
  chatBox.appendChild(mensagemDiv);
}
