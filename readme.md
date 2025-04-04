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

FunkyWizard é uma aplicação desenvolvida para facilitar a vida dos programadores ao fornecer respostas rápidas e inteligentes para dúvidas técnicas, erros e consultas de documentação. Através da integração da IA **Deep-seek** e com a **API da Azure**, a aplicação combina pesquisa avançada com respostas personalizadas, otimizando o processo de aprendizado e solução de problemas.

## Colaboradores

|                                                    Front-End                                                    |                                              Back-End                                              |                                                   Back-End                                                   |                                                    Back-End                                                     |
| :-------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------: |
| [![Guilherme Braga](https://avatars.githubusercontent.com/u/89932943?v=4)](https://github.com/guilhermevnbraga) | [![Gustavo](https://avatars.githubusercontent.com/u/110403830?v=4)](https://github.com/Gust4voSSM) | [![Danilo Barrote](https://avatars.githubusercontent.com/u/175836607?v=4)](https://github.com/danilobarrote) | [![Guilherme José](https://avatars.githubusercontent.com/u/175838250?v=4)](https://github.com/Guilhermejose749) |
|                                               **Guilherme Braga**                                               |                                        **Gustavo Santiago**                                        |                                              **Danilo Barrote**                                              |                                               **Thiago Luiz**                                                |

## Especificação inicial + evolução dos ciclos e do backlog

O projeto consiste em um assistente de IA (chatbot), que responde perguntas e fornece informações aos usuários sobre como usar certas funcionalidades de uma ferramenta qualquer, em especial as menos conhecidas e de difícil acesso. Para isso, o chatbot se comunica com nossa aplicação por meio de comandos de texto. Por meio da busca de palavras chaves, é realizada uma pesquisa, a qual retorna os resultados da busca (navegando por links) com resposta contextualizadas.

O backlog inicial na sprint 1 continha, em ordem de maior prioridade para menor prioridade:

-   Chatbot
-   Capacidade de pesquisa
-   Busca em profundidade (capacidade de entrar em links)
-   Citação de fontes usadas
-   Exibição de imagens encontradas na pesquisa
-   Capacidade de executar código interativamente
-   Múltiplos chats
-   Capacidade de planejamento
-   Suporte a markdown
-   Suporte a exibição de código
-   Assistente reconhece imagens
-   Log de navegação

Ao longo do projeto, notamos que nem todas essas funcionalidades seriam realmente necessárias, ou não seriam possíveis implementá-las.
Com o andamento das sprints, fomos implementando cada uma aos poucos de acordo com o grau de importância visto no momento, com a seguinte evolução do backlog/ciclos de sprints:

Sprint 2:
Implementação do MVP funcional, com a busca por palavras chaves, integração da API...

-   Chatbot + Capacidade de pesquisa + Busca em profundidade/inteligente + citação de fontes usadas

Sprint 3:
Versão funcional do projeto e análise de dívida técnica, com o planejamento para o pagamento.

-   Banco de dados + Autenticação e autorização + Suporte a markdown + Chain of thought

Sprint 4:
Aperfeiçoamento do projeto.

-   Refatoração e organização do código -> ErrorHandler + MVC

Sprint final:
Finalização do projeto com testes.

-   Múltiplos chats + testes do código.

Logo, o backlog final foi composto de:

-   Chatbot
-   Capacidade de pesquisa
-   Busca em profundidade (capacidade de entrar em links)
-   Citação de fontes usadas
-   Múltiplos chats
-   Capacidade de planejamento (Chain of thought)
-   Suporte a markdown
-   Banco de dados + Autenticação e autorização (Bcrypt)

## Tecnologias Utilizadas

-   **Node.js** com **Express** para o backend
-   **HTML**, **CSS** e **JavaScript** para o frontend
-   **Deep-seek-R1 AI** para respostas baseadas em IA
-   **API de pesquisa google** para pesquisas
-   **Puppeteer** para análise de conteúdo e scraping web
-   **Axios** para manipulação de dados e integração de APIs
-   **dotenv** para gerenciamento de variáveis de ambiente
-   **Prisma e PostgreSQL** para implementação do Banco de dados
-   **Vitest** para testes automáticos de unidade e integração

## Dívida técnica

A dívida técnica foi identificada pela sprint 3, realizando o pagamento nas sprints posteriores, em que notamos:

-   Desorganização e má estruturação do código -> o pagamento foi feito pela refatoração e melhora em sua legibilidade.
-   Não conseguia reiniciar a conversa na interface do usuário -> pagamento com mudança na lógica do servidor + implementações no front-end.
-   Poluição do código fonte devido às instruções grandes -> pagamento movendo-as para outro arquivo, a fim de facilitar sua edição e "limpar" o código.
-   O Modelo de linguagem antigo não era poderoso o suficiente para usar todas as funcionalidades disponíveis de maneira eficiente e responsiva -> pagamento trocando o modelo Gemini pelo DeepSeek-R1 

## Estratégia e Implementação dos Testes

A aplicação utiliza **Vitest** para testes de unidade e integração, com cobertura abrangente para serviços, middlewares, controladores e rotas.

### Estrutura de Testes

-   **Testes de Unidade**: Localizados em `tests/unit`, verificam funcionalidades isoladas como:
    -   `authService`: Geração de tokens JWT e validação de credenciais.
    -   `errorHandler`: Tratamento de erros específicos e genéricos.
-   **Testes de Integração**: Localizados em `tests/integration`, validam a interação entre rotas e middlewares:
    -   `authRoutes`: Registro, login e validação de erros.
    -   `chatRoutes`: Criação e recuperação de mensagens.

### Configuração

-   Banco de dados de testes configurado no `.env.test`.
-   Arquivo `setupTests.js` para resetar o banco antes de cada execução.

### Como Executar

1. Instale as dependências:

    ```bash
    npm install
    ```
2. Execute os testes:

  ```bash
  npm test
  ```

## Pontos fortes e pontos de melhoria do projeto

Pontos fortes:

-   Modelo gratuito com reasoning
-   Implementação versátil e customizável, podendo ser modificado
-   Suportes de chamada de função, permitindo flexibilidade para o futuro com outras ferramentas externas

Pontos de melhoria:

-   Realização de mais testes de integração automatizados
-   Validação do usuário
-   Aprimoramento do design da experiência do usuário (interface do usuário) (ex: seleção de cores)
-   Organização e comunicação da equipe durante o projeto, ausência do líder prejudicou.


## Estrutura do Projeto

-   **`app.js`**: Contém a lógica principal da aplicação, incluindo integração com IA, scraping e endpoints REST.
-   **`public/`**: Diretório com arquivos estáticos, como `index.html`, `script.js` e `style.css`.
-   **`src/routes/`**: Contém os arquivos de rotas para organizar os endpoints da aplicação.
-   **`src/controllers/`**: Diretório com os controladores que gerenciam a lógica de negócios.
-   **`src/models/`**: Contém os modelos de dados utilizados pela aplicação, integrados com o Prisma.
-   **`src/middlewares/`**: Diretório com middlewares personalizados, como autenticação e tratamento de erros.
-   **`src/utils/`**: Contém funções utilitárias reutilizáveis em diferentes partes do projeto.
-   **`tests/`**: Diretório com os testes automatizados, organizados por unidade e integração.
-   **`.env`**: Armazena chaves sensíveis, como credenciais da API do Google e Gemini.

## Funcionalidades

### Busca Inteligente na Web

-   Retorna os 5 melhores resultados de busca com título, descrição e link.
-   Integração com a API de Pesquisa do Google para respostas rápidas e precisas.

### Respostas Baseadas em IA

-   Responde perguntas técnicas utilizando a **Deep-seek-R1**, com foco em explicar conceitos complexos de forma simples.

### Extração de Dados Relevantes

-   Coleta informações de páginas HTML, incluindo cabeçalhos, links e imagens, usando **Puppeteer** e **JSDOM**.

### Interface Amigável

-   Um frontend simples para facilitar a interação com o backend, com interface intuitiva.

### Cadastro com Autenticação JWT

-   Sistema de cadastro e login de usuários com autenticação baseada em **JSON Web Tokens (JWT)**.
-   Proteção de rotas sensíveis, garantindo acesso apenas a usuários autenticados.
-   Implementação de middleware para validação de tokens e controle de sessão.
-   Suporte a criptografia de senhas utilizando **Bcrypt** para maior segurança.

## Deploy

A aplicação está hospedada no render: [FunkyWizard](https://funkywizard.onrender.com/)

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
AZURE_ENDPOINT_URI=seu_azure_endpoint_uri
AZURE_API_KEY=seu_azure_api_key
GEMINI_API_KEY=seu_gemini_api_key
SEARCH_API_KEY=seu_search_api_key
SEARCH_ENGINE_ID=seu_google_search_engine_api_key
SECRET_KEY=sua_secret_key
DATABASE_URL=url_do_seu_banco_de_dados_postgres
```

5. Inicie o Servidor:

```bash
npm run dev
```

6.  Acesse no seu navegador:

```bash
http://localhost3000
```
