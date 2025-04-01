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

FunkyWizard é uma aplicação desenvolvida para facilitar a vida dos programadores ao fornecer respostas rápidas e inteligentes para dúvidas técnicas, erros e consultas de documentação. Através da integração da IA **Deep-seek**, com **API da Azure** e da **API de Pesquisa do Google**, a aplicação combina pesquisa avançada com respostas personalizadas, otimizando o processo de aprendizado e solução de problemas.

## Colaboradores

| Front-End | Back-End | Back-End | Designer |
|:---------:|:--------:|:--------:|:--------:|
| [![Guilherme Braga](https://avatars.githubusercontent.com/u/89932943?v=4)](https://github.com/guilhermevnbraga) | [![Gustavo](https://avatars.githubusercontent.com/u/110403830?v=4)](https://github.com/Gust4voSSM) | [![Danilo Barrote](https://avatars.githubusercontent.com/u/175836607?v=4)](https://github.com/danilobarrote) | [![Guilherme José](https://avatars.githubusercontent.com/u/175838250?v=4)](https://github.com/Guilhermejose749) |
|    **Guilherme Braga**    |    **Gustavo Santiago**    |    **Danilo Barrote**    |    **Guilherme José**    |

## Especificação inicial + evolução dos ciclos e do backlog

O projeto consiste em um assistente de IA (chatbot), que responde perguntas e fornece informações aos usuários sobre como usar certas funcionalidades de uma ferramenta qualquer, em especial as menos conhecidas e de difícil acesso. Para isso, o chatbot se comunica com nossa aplicação por meio de comandos de texto. Por meio da busca de palavras chaves, é realizada uma pesquisa, a qual retorna os resultados da busca (navegando por links) com resposta contextualizadas.

O backlog inicial na sprint 1 continha, em ordem de maior prioridade para menor prioridade:
- Chatbot
- Capacidade de pesquisa
- Busca em profundidade (capacidade de entrar em links)
- Citação de fontes usadas
- Exibição de imagens encontradas na pesquisa
- Capacidade de executar código interativamente
- Múltiplos chats
- Capacidade de planejamento
- Suporte a markdown
- Suporte a exibição de código
- Assistente reconhece imagens
- Log de navegação

Ao longo do projeto, notamos que nem todas essas funcionalidades seriam realmente necessárias, ou não seriam possíveis implementá-las.
Com o andamento das sprints, fomos implementando cada uma aos poucos de acordo com o grau de importância visto no momento, com a seguinte evolução do backlog/ciclos de sprints:

Sprint 2: 
Implementação do MVP funcional, com a busca por palavras chaves, integração da API...
- Chatbot + Capacidade de pesquisa + Busca em profundidade/inteligente + citação de fontes usadas
  
Sprint 3:
Versão funcional do projeto e análise de dívida técnica, com o planejamento para o pagamento.
- Banco de dados + Autenticação e autorização + Suporte a markdown + Chain of thought
  
Sprint 4:
Aperfeiçoamento do projeto.
- Refatoração e organização do código -> ErrorHandler + MVC

Sprint final: 
Finalização do projeto com testes.
- Múltiplos chats + testes do código.


Logo, o backlog final foi composto de:
- Chatbot
- Capacidade de pesquisa
- Busca em profundidade (capacidade de entrar em links)
- Citação de fontes usadas
- Múltiplos chats
- Capacidade de planejamento (Chain of thought)
- Suporte a markdown
- Banco de dados + Autenticação e autorização (Bcrypt)


## Tecnologias Utilizadas

-   **Node.js** com **Express** para o backend
-   **HTML**, **CSS** e **JavaScript** para o frontend
-   **Deep-seek-R1 AI** para respostas baseadas em IA
-   **API de Pesquisa Personalizada do Google** para resultados otimizados
-   **Puppeteer** para análise de conteúdo e scraping web
-   **Axios** e **JSDOM** para manipulação de dados e integração de APIs
-   **dotenv** para gerenciamento de variáveis de ambiente
-   **Prisma** para implementação do Banco de dados

## Dívida técnica

A dívida técnica foi identificada pela sprint 3, realizando o pagamento nas sprints posteriores, em que notamos:
- Desorganização e má estruturação do código -> o pagamento foi feito pela refatoração e melhora em sua legibilidade.
- Não conseguia reiniciar a conversa na interface do usuário -> pagamento com mudança na lógica do servidor + implementações no front-end.
- Poluição do código fonte devido às instruções grandes -> pagamento movendo-as para outro arquivo, a fim de facilitar sua edição e "limpar" o código.

## Estratégia e implementação dos testes

Tentamos usar o padrão AAA (Arrange, Act e Assert), porém não nos prendemos tanto a isso.
Exemplo de teste realizado:

![](https://media.discordapp.net/attachments/1306592437216743495/1356450870631596153/image.png?ex=67ec9cd1&is=67eb4b51&hm=b8a6aa70a468687c04b1d5f9a5a37a1d8276219190a02276d9c304b4fbcac1aa&=&format=webp&quality=lossless)
![](https://media.discordapp.net/attachments/1306592437216743495/1356450992509419571/image.png?ex=67ec9cee&is=67eb4b6e&hm=09a53e0bbf74ce16393ba2c00db92990a3b7f7ab56e0b0e53dd2edfbb25738a8&=&format=webp&quality=lossless&width=823&height=440)



## Pontos fortes e pontos de melhoria do projeto



## Estrutura do Projeto

-   **`server.js`**: Contém a lógica principal da aplicação, incluindo integração com IA, scraping e endpoints REST.
-   **`public/`**: Diretório com arquivos estáticos, como `index.html`, `script.js` e `style.css`.
-   **`.env`**: Armazena chaves sensíveis, como credenciais da API do Google e Gemini.
-   **`vercel.json`**: Configuração para deploy da aplicação na Vercel.

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

A aplicação está hospedada na vercel: [FunkyWizard](https://funkywizard.onrender.com/)

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
https://funkywizard.onrender.com
```
