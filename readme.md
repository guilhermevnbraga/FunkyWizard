# FunkyWizard

<div>
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/guilhermevnbraga/FunkyWizard">
    <img alt="Último commit" src="https://img.shields.io/github/last-commit/guilhermevnbraga/FunkyWizard">
    <img alt="Tamanho do repositório" src="https://img.shields.io/github/repo-size/guilhermevnbraga/FunkyWizard">
    <img alt="Github contributors" src="https://img.shields.io/github/contributors/guilhermevnbraga/FunkyWizard">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/guilhermevnbraga/FunkyWizard">
    <img alt="License" src="https://img.shields.io/github/license/guilhermevnbraga/FunkyWizard">
</div>

## Sobre

FunkyWizard é uma aplicação desenvolvida para facilitar a vida dos programadores ao fornecer respostas rápidas e inteligentes para dúvidas técnicas, erros e consultas de documentação. Através da integração da IA **Gemini** e da **API de Pesquisa do Google**, a aplicação combina pesquisa avançada com respostas personalizadas, otimizando o processo de aprendizado e solução de problemas.

## Colaboradores

<div style="overflow: auto;">
  <div style="text-decoration: none; color: inherit; float: left; width: 150px; text-align: center; margin: 10px;">
    <p><strong>Front-End</strong></p>
      <a href="https://github.com/guilhermevnbraga">
        <img src="https://avatars.githubusercontent.com/u/89932943?v=4" width="100" />
      </a>
    <p><strong>Guilherme Braga</strong></p>
  </div>
  <div style="text-decoration: none; color: inherit; float: left; width: 150px; text-align: center; margin: 10px;">
    <p><strong>Back-End</strong></p>
      <a href="https://github.com/Gust4voSSM">
        <img src="https://avatars.githubusercontent.com/u/110403830?v=4" width="100" />
      </a>
    <p><strong>Gustavo</strong></p>
  </div>
  <div style="text-decoration: none; color: inherit; float: left; width: 150px; text-align: center; margin: 10px;">
    <p><strong>Back-End</strong></p>
      <a href="https://github.com/danilobarrote">
        <img src="https://avatars.githubusercontent.com/u/175836607?v=4" width="100" />
      </a>
    <p><strong>Danilo Barronte</strong></p>
  </div>
  <div style="text-decoration: none; color: inherit; float: left; width: 150px; text-align: center; margin: 10px;">
    <p><strong>Designer</strong></p>
      <a href="https://github.com/Guilhermejose749">
        <img src="https://avatars.githubusercontent.com/u/175838250?v=4" width="100" />
      </a>
    <p><strong>Guilherme José</strong></p>
  </div>
</div>

## Tecnologias Utilizadas

-   **Node.js** com **Express** para o backend
-   **HTML**, **CSS** e **JavaScript** para o frontend
-   **Google Generative AI (Gemini)** para respostas baseadas em IA
-   **API de Pesquisa Personalizada do Google** para resultados otimizados
-   **Puppeteer** para análise de conteúdo e scraping web
-   **Axios** e **JSDOM** para manipulação de dados e integração de APIs
-   **dotenv** para gerenciamento de variáveis de ambiente

---

## Estrutura do Projeto

-   **`server.js`**: Contém a lógica principal da aplicação, incluindo integração com IA, scraping e endpoints REST.
-   **`public/`**: Diretório com arquivos estáticos, como `index.html`, `script.js` e `style.css`.
-   **`.env`**: Armazena chaves sensíveis, como credenciais da API do Google e Gemini.
-   **`vercel.json`**: Configuração para deploy da aplicação na Vercel.

---

## Funcionalidades

### Busca Inteligente na Web

-   Retorna os 5 melhores resultados de busca com título, descrição e link.
-   Integração com a API de Pesquisa do Google para respostas rápidas e precisas.

### Respostas Baseadas em IA

-   Responde perguntas técnicas utilizando a **Gemini AI**, com foco em explicar conceitos complexos de forma simples.

### Extração de Dados Relevantes

-   Coleta informações de páginas HTML, incluindo cabeçalhos, links e imagens, usando **Puppeteer** e **JSDOM**.

### Interface Amigável

-   Um frontend simples para facilitar a interação com o backend, com interface intuitiva.

## Deploy

A aplicação está hospedada na vercel: [FunkyWizard](https://funky-wizard.vercel.app/)

## Como Executar o Projeto Localmente

### Pré-requisitos

-   **Node.js** instalado em sua máquina
-   Chaves para:
    -   **API de Pesquisa do Google**
    -   **IA Gemini**

### Passos para Configuração

1. Clone o repositório:

    ```bash
    git clone https://github.com/guilhermevnbraga/FunkyWizard.git
    ```

2. Acesse o diretório do projeto:

```bash
  cd FunkyWizard
```

3. Instale as dependências:

```bash
  npm install
```

4. Crie na pasta raiz e configure o arquivo **.env**:

```bash
GEMINI_API_KEY=sua_chave_da_gemini
GOOGLE_API_KEY=sua_chave_do_google
GOOGLE_SEARCH_ENGINE_ID=seu_id_de_busca
```

5. Inicie o Servidor:

```bash
npm start
```

6.  Acesse no seu navegador:

```bash
http://localhost:3000
```
