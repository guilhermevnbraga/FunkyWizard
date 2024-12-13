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
    
    const reader = resposta.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    let respostaCompleta = '';
    let isStreaming = false;
    
    let readCount = 0;
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      readCount++;
      
      const chunk = decoder.decode(value, { stream: true });
      respostaCompleta += chunk;
    
      // Agora, só consideramos streaming se tivermos mais de 1 chunk.
      if (readCount > 1) {
        isStreaming = true;
      }
    
      if (isStreaming) {
        // Atualiza a mensagem de streaming aqui
        atualizarOuAdicionarMensagemStream(respostaCompleta, 'gemini');
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
    
    // Se após o loop, readCount for 1, significa que só veio um chunk.
    // Então não é streaming, podemos tentar fazer parse do JSON.
    if (!isStreaming) {
      try {
        const dados = JSON.parse(respostaCompleta);
        const respostaGemini = dados.resposta || 'Desculpe, não entendi.';
        adicionarMensagem(respostaGemini, 'gemini');
      } catch (e) {
        // Se não for JSON válido, mostra texto cru
        adicionarMensagem(respostaCompleta, 'gemini');
      }
    }

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

// Função para atualizar a mensagem streaming. 
// Caso já exista uma mensagem 'gemini' que esteja sendo usada para streaming, atualize seu conteúdo.
// Caso contrário, cria uma nova mensagem.
function atualizarOuAdicionarMensagemStream(texto, tipo) {
  const mensagens = chatBox.getElementsByClassName('mensagem');
  let ultimaMensagemGemini = null;
  for (let i = mensagens.length - 1; i >= 0; i--) {
    if (mensagens[i].classList.contains('gemini')) {
      ultimaMensagemGemini = mensagens[i];
      break;
    }
  }

  if (ultimaMensagemGemini) {
    ultimaMensagemGemini.textContent = texto;
  } else {
    adicionarMensagem(texto, tipo);
  }
}
