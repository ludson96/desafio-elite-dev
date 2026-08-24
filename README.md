# 🎟️ Elite Ingressos — Plataforma de Eventos e Ingressos Digitais

> **Projeto Desenvolvido para o Desafio Técnico Elite Dev da Verzel**  
> Solução *Full-Stack* completa para compra, gestão, emissão e validação segura de ingressos para **Shows** e **Cinema**, com prevenção rigorosa de *overbooking*, assinatura criptográfica anti-fraude em QR Codes e integração com catálogos externos em tempo real.

## 📑 Sumário / Navegação Rápida

- [🌐 Deploy em Produção (Live Demo)](#-deploy-em-produção-live-demo)
- [🧠 Documentos de Decisões Técnicas (DECISIONS.md)](#-documentos-de-decisões-técnicas-decisionsmd)
- [🎯 Roteiro Rápido para Avaliação (Como Testar em 3 Minutos)](#-roteiro-rápido-para-avaliação-como-testar-em-3-minutos)
- [🌟 Destaques do Projeto](#-destaques-do-projeto)
- [🏗️ Arquitetura e Stack Tecnológica](#️-arquitetura-e-stack-tecnológica)
- [👥 Contas Semeadas para Avaliação (Seed)](#-contas-semeadas-para-avaliação-seed)
- [⚙️ Configuração das Variáveis de Ambiente](#️-configuração-das-variáveis-de-ambiente)
- [🗄️ Modelagem e Relacionamento do Banco de Dados (DER)](#️-modelagem-e-relacionamento-do-banco-de-dados-der)
- [🔌 Detalhamento do Back-End](#-detalhamento-do-back-end)
  - [Estrutura de Pastas do Back-End](#estrutura-de-pastas-do-back-end)
  - [Endpoints da API](#endpoints-da-api)
- [💻 Detalhamento do Front-End](#-detalhamento-do-front-end)
  - [Estrutura de Pastas do Front-End](#estrutura-de-pastas-do-front-end)
  - [Funcionalidades do Front-End](#funcionalidades-do-front-end)
- [🚀 Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
- [🧪 Executando os Testes Automatizados](#-executando-os-testes-automatizados)
- [🔮 Implementações Futuras & Roadmap](#-implementações-futuras--roadmap)

## 🌐 Deploy em Produção (Live Demo)

A aplicação está disponível e pronta para uso online:

- 🔗 **Acesse a Aplicação**: **[https://desafio-elite-dev-theta.vercel.app/](https://desafio-elite-dev-theta.vercel.app/)**

> ⚠️ **Aviso sobre a Primeira Requisição (Cold Start)**:  
> O **Front-End** está hospedado na **Vercel** e a **API do Back-End** está hospedada na plataforma gratuita do **Render.com**.  
> Por conta do modo de hibernação (*sleep mode*) do plano gratuito do Render, a **primeira requisição ao backend pode levar aproximadamente 50 segundos** para acordar a instância. Após essa inicialização inicial, todas as requisições subsequentes responderão instantaneamente!

## 🧠 Documentos de Decisões Técnicas (DECISIONS.md)

Para consultar o racional arquitetural completo e aprofundado:
- 📘 [Backend DECISIONS.md](./backend/DECISIONS.md)
- 📙 [Frontend DECISIONS.md](./frontend/DECISIONS.md)

## 🎯 Roteiro Rápido para Avaliação (Como Testar em 3 Minutos)

Para facilitar a navegação da banca avaliadora, sugerimos o seguinte fluxo de testes de ponta a ponta:

1. **Vitrine & Catálogo**: Acesse a home, utilize a barra de busca ou filtre por *Shows* / *Filmes* para visualizar os eventos disponíveis;
2. **Compra & Checkout Simulado**: Clique no card de um evento e selecione a quantidade de ingressos. No modal de checkout:
   - Escolha **Aprovar Pagamento** para disparar a transação atômica no PostgreSQL, debitar o estoque e emitir os ingressos com QR Code assinado;
   - Ou escolha **Recusar Pagamento** para simular uma recusa de operadora bancária (o sistema redireciona para *Minhas Compras* com o status recusado sem debitar o estoque);
3. **Ingressos Digitais & Compartilhamento**: Acesse **Meus Ingressos** para ver os QR Codes em alta resolução e clique no botão para copiar o link público tokenizado (`/tickets/share/...`), que pode ser aberto em qualquer aba ou navegador sem necessidade de login;
4. **Criação de Eventos com Assistente Inteligente**: Faça login com a conta de **Organizador**, acesse **Criar Novo Evento** e busque por títulos reais como *"Coldplay"*, *"Duna"* ou *"Batman"* para ver o auto-preenchimento com dados do TMDb e Ticketmaster;
5. **Validação na Portaria**: Faça login com a conta de **Portaria** em `/gatekeeper/validate` e valide qualquer ingresso pela câmera do dispositivo ou digitando o código legível (`TKT-...`), observando o retorno dos 4 status previstos (`VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`).

## 🌟 Destaques do Projeto

- 🛡️ **Zero Overbooking**: Transações atômicas no PostgreSQL (`$transaction` + decremento condicional) garantindo que nenhum ingresso seja vendido acima da capacidade;
- 🔐 **Anti-Fraude Criptográfico**: QR Codes assinados com **HMAC-SHA256** e validação com tempo constante (`crypto.timingSafeEqual`) contra ataques de adulteração;
- 🌐 **Catálogo Inteligente**: Assistente integrado ao **TMDb (The Movie Database)** e **Ticketmaster Discovery API** para auto-preenchimento de filmes e shows, com *fallback* automático tolerante a falhas;
- 🚪 **Portaria em Tempo Real**: Validador óptico por **câmera ao vivo** e digitação manual com retorno claro dos 4 status da especificação (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID`);
- 🔗 **Link de Compartilhamento**: Permite que o comprador envie ingressos individuais para amigos via link público tokenizado (UUID), sem expor os outros ingressos da conta;
- 🎨 **Design Sóbrio e Moderno**: Interface escura construída com TailwindCSS v4 e componentes sólidos.

## 🏗️ Arquitetura e Stack Tecnológica

```
desafio-elite-dev/
├── backend/          # API RESTful (Node.js 22, Express 5, TypeScript, Prisma ORM 7, PostgreSQL) -> Render.com
└── frontend/         # Web App (Next.js 15+ App Router, React 19, TypeScript, TailwindCSS v4, Zustand) -> Vercel
```

| Camada | Tecnologias Principais |
| :--- | :--- |
| **Front-End** | **Next.js 15+ (App Router)**, React 19, TypeScript, TailwindCSS v4, Zustand (Persist), Lucide Icons, html5-qrcode |
| **Back-End** | **Node.js 22**, Express 5, TypeScript, **Prisma ORM 7** (`@prisma/adapter-pg`), PostgreSQL, Zod v4, JWT, Bcrypt |
| **Hospedagem** | **Vercel** (Front-End) & **Render.com** (Back-End + PostgreSQL) |
| **Segurança** | HMAC-SHA256, Helmet, CORS, RBAC (Organizador, Cliente, Portaria), Timing-Safe Comparison |
| **Testes** | Vitest, React Testing Library, Supertest (37 testes automatizados passando) |

## 👥 Contas Semeadas para Avaliação (Seed)

Tanto em ambiente local quanto no deploy em produção, a tela de login conta com botões de **acesso rápido com 1 clique**:

| Papel | Nome | E-mail | Senha | Funcionalidades Principais |
| :--- | :--- | :--- | :--- | :--- |
| **👤 Cliente** | Ana Cliente | `cliente1@eliteingressos.com` | `123456` | Comprar ingressos, ver QR Codes, compartilhar via link e histórico de compras |
| **👤 Cliente 2** | Bruno Cliente | `cliente2@eliteingressos.com` | `123456` | Testar concorrência de compra simultânea para o mesmo evento |
| **👑 Organizador** | Carlos Organizador | `organizador@eliteingressos.com` | `123456` | Painel de métricas, criar eventos manuais ou via assistente TMDb/Ticketmaster |
| **🚪 Portaria** | Roberto Portaria | `portaria@eliteingressos.com` | `123456` | Validação de ingressos por leitura de câmera ou digitação de código |

## ⚙️ Configuração das Variáveis de Ambiente

### Back-End (`backend/.env`)

| Variável | Obrigatória? | Descrição | Valor Padrão Local |
| :--- | :---: | :--- | :--- |
| `PORT` | Sim | Porta em que o servidor Express irá rodar | `3001` |
| `NODE_ENV` | Sim | Ambiente de execução | `development` |
| `DATABASE_URL` | Sim | String de conexão com o PostgreSQL | `postgresql://postgres:password123@localhost:5432/desafio_elite_dev?schema=public` |
| `JWT_SECRET` | Sim | Chave secreta para assinatura e verificação dos tokens JWT | `super-secret-desafio-elite-dev-jwt-key` |
| `QR_SECRET` | Sim | Chave secreta HMAC para assinatura digital anti-fraude dos QR Codes | `super-secret-hmac-qr-signing-key` |
| `TMDB_API_KEY` | Não | Chave da API do The Movie Database (possui catálogo de fallback) | `""` |
| `TICKETMASTER_API_KEY` | Não | Chave da API do Ticketmaster Discovery (possui catálogo de fallback) | `""` |

### Front-End (`frontend/.env.local`)

| Variável | Obrigatória? | Descrição | Valor Padrão Local |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API do Back-End consumida pelo cliente | `http://localhost:3001` |

## 🗄️ Modelagem e Relacionamento do Banco de Dados (DER)

A base de dados relacional foi modelada no PostgreSQL através do Prisma ORM para garantir integridade referencial estrita, histórico de pagamentos e rastreabilidade total de cada ingresso emitido.

```mermaid
erDiagram
    USER ||--o{ EVENT : "organiza (1:N)"
    USER ||--o{ RESERVATION : "realiza (1:N)"
    EVENT ||--o{ RESERVATION : "contem (1:N)"
    EVENT ||--o{ TICKET : "pertence a (1:N)"
    RESERVATION ||--|| PAYMENT : "gera (1:1)"
    RESERVATION ||--o{ TICKET : "emite (1:N)"

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role "ORGANIZER | CLIENT | GATEKEEPER"
        datetime createdAt
    }

    EVENT {
        string id PK
        string title
        enum type "SHOW | MOVIE"
        datetime date
        string location
        int capacity
        int availableTickets
        decimal price
        enum status "DRAFT | PUBLISHED | CANCELED | FINISHED"
        string organizerId FK
    }

    RESERVATION {
        string id PK
        int quantity
        decimal totalAmount
        enum status "PENDING | CONFIRMED | CANCELED | REFUSED"
        string clientId FK
        string eventId FK
        datetime createdAt
    }

    PAYMENT {
        string id PK
        enum status "PENDING | APPROVED | REFUSED"
        decimal amount
        string reservationId FK,UK
        datetime createdAt
    }

    TICKET {
        string id PK
        string code UK
        string shareToken UK
        string qrSignature "HMAC-SHA256"
        enum status "ACTIVE | USED | CANCELED"
        string eventId FK
        string reservationId FK
        datetime usedAt
    }
```

### Explicação dos Relacionamentos:
1. **`User ➔ Event` (1:N)**: Um usuário com o papel `ORGANIZER` pode criar e gerenciar múltiplos eventos.
2. **`User ➔ Reservation` (1:N)**: Um usuário com o papel `CLIENT` pode realizar múltiplos pedidos de compras/reservas.
3. **`Event ➔ Reservation` (1:N)**: Um evento recebe pedidos de compra de diferentes clientes. O campo atômico `availableTickets` é decrementado a cada reserva confirmada.
4. **`Reservation ➔ Payment` (1:1)**: Cada reserva possui exatamente um registro de pagamento simulado vinculado com seu status (`APPROVED` ou `REFUSED`).
5. **`Reservation ➔ Ticket` (1:N)**: Quando o pagamento é aprovado, a reserva gera $N$ ingressos individuais correspondentes à quantidade comprada (`quantity`).
6. **`Event ➔ Ticket` (1:N)**: Cada ingresso está diretamente associado ao evento correspondente, permitindo que a portaria valide instantaneamente se o ingresso pertence ao evento correto (`WRONG_EVENT`).

# 🔌 Detalhamento do Back-End

API RESTful robusta desenvolvida em **Node.js**, **Express 5**, **TypeScript** e **Prisma ORM (v7)** com **PostgreSQL**, estruturada em camadas (*Clean Architecture* adaptada: Routes ➔ Controllers ➔ Services ➔ Repositories).

### Estrutura de Pastas do Back-End

```
backend/
├── prisma/
│   ├── schema.prisma         # Modelagem do banco (Event, User, Reservation, Payment, Ticket)
│   └── seed.ts               # Seed com 8 eventos completos e 4 contas de teste
├── src/
│   ├── config/               # Variáveis de ambiente validadas (env.ts) e Prisma Client (prisma.ts)
│   ├── constants/            # Catálogo demonstrativo de fallback (demoCatalog.ts)
│   ├── controllers/          # Manipulação de requisições e respostas HTTP
│   ├── middlewares/          # Autenticação JWT, controle de papéis (RBAC), validação Zod e erro global
│   ├── repositories/         # Isolamento de acesso a dados com Prisma ORM
│   ├── routes/               # Definição e agrupamento dos endpoints da API
│   ├── schemas/              # Schemas de validação de entrada com Zod
│   ├── services/             # Regras de negócio, transações, concorrência e segurança
│   ├── utils/                # AppError customizado, JWT e assinaturas HMAC de QR Code
│   ├── app.ts                # Instância e middlewares do Express
│   └── server.ts             # Inicialização do servidor HTTP
└── tests/                    # Testes automatizados unitários e de integração (Vitest)
```

### Endpoints da API

#### 🔐 Autenticação (`/api/auth`)
- `POST /api/auth/register` - Cadastro de usuário (`ORGANIZER`, `CLIENT`, `GATEKEEPER`);
- `POST /api/auth/login` - Autenticação e geração do Bearer Token JWT;
- `GET /api/auth/me` - Consulta dos dados do perfil autenticado.

#### 🌐 Catálogo Externo (`/api/catalog`)
- `GET /api/catalog/search?query=coldplay&type=ALL` - Busca de filmes (TMDb) e shows (Ticketmaster) com fallback tolerante a falhas.

#### 🎭 Eventos (`/api/events`)
- `GET /api/events` - Listagem pública de eventos publicados (filtros por tipo, busca textual e paginação);
- `GET /api/events/:id` - Detalhes de um evento específico;
- `GET /api/events/organizer/my-events` - Eventos criados pelo organizador logado (`ORGANIZER`);
- `POST /api/events` - Criação de evento (`ORGANIZER`);
- `PUT /api/events/:id` - Edição de evento pelo organizador proprietário (`ORGANIZER`).

#### 💳 Reservas & Pagamento Simulado (`/api/reservations`)
- `POST /api/reservations` - Compra com transação atômica e simulação de pagamento (`APPROVED` ou `REFUSED`) (`CLIENT`);
- `GET /api/reservations/my-reservations` - Histórico completo de compras e reservas do cliente (`CLIENT`);
- `GET /api/reservations/:id` - Detalhes de uma reserva específica (`CLIENT`).

#### 🎟️ Ingressos, Compartilhamento & Portaria (`/api/tickets`)
- `GET /api/tickets/my-tickets` - Ingressos do cliente com QR Code Base64 (`CLIENT`);
- `GET /api/tickets/share/:shareToken` - Consulta pública de ingresso compartilhado via link;
- `POST /api/tickets/validate` - Validação na portaria via câmera/código (`GATEKEEPER`) retornando:
  - `VALID`: Entrada liberada e ingresso marcado como `USED`;
  - `ALREADY_USED`: Ingresso já utilizado anteriormente com data/hora do uso;
  - `WRONG_EVENT`: Ingresso válido, porém emitido para outro evento;
  - `INVALID`: Código inexistente ou assinatura HMAC violada.

# 💻 Detalhamento do Front-End

Interface web moderna, minimalista e responsiva desenvolvida com **Next.js 15+ (App Router)**, **TypeScript**, **TailwindCSS v4** e gerenciamento de estado global com **Zustand**.

### Estrutura de Pastas do Front-End

```text
frontend/
├── src/
│   ├── app/                                # Rotas e Páginas do Next.js (App Router)
│   │   ├── layout.tsx                      # Layout raiz (Navbar, Footer, Tema Escuro Sólido)
│   │   ├── page.tsx                        # Vitrine Pública / Catálogo de Eventos com Filtros
│   │   ├── login/page.tsx                  # Login com atalhos de preenchimento rápido em 1 clique
│   │   ├── register/page.tsx               # Cadastro com seleção de perfil (Cliente, Organizador, Portaria)
│   │   ├── events/[id]/page.tsx            # Detalhes do Evento & Checkout Simulado com Status
│   │   ├── my-tickets/page.tsx             # Área do Cliente (Cards Panorâmicos com QR Code)
│   │   ├── my-reservations/page.tsx        # Histórico de Pedidos & Compras (Badges Semânticas)
│   │   ├── tickets/share/[shareToken]/     # Página Pública de Ingresso Compartilhado por Link
│   │   ├── organizer/events/page.tsx       # Painel de Métricas & Gestão do Organizador
│   │   ├── organizer/events/new/page.tsx   # Assistente de Criação com TMDb & Ticketmaster
│   │   └── gatekeeper/validate/page.tsx    # Validador da Portaria (Câmera ao vivo & Código Manual)
│   ├── components/
│   │   ├── layout/                         # Componentes Estruturais (Navbar, Footer)
│   │   └── ui/                             # Design System Sólido (Button, Input, Badge com dot, Modal)
│   ├── services/
│   │   └── api.ts                          # Cliente HTTP tipado com injeção automática de Bearer Token
│   ├── stores/
│   │   └── authStore.ts                    # Estado Global de Autenticação (Zustand com hidratação segura)
│   ├── types/
│   │   └── index.ts                        # Tipagens TypeScript completas espelhando a API do Backend
│   └── utils/
│       ├── cn.ts                           # Utilitário de classes condicionais Tailwind
│       ├── constants.ts                    # Imagens de capa oficiais padrão e fallbacks
│       └── formatters.ts                   # Formatadores de moeda (BRL), datas e badges semânticas
├── __tests__/                              # Testes automatizados unitários e de componentes (Vitest)
├── .env.local                              # Variáveis de ambiente locais
├── next.config.ts                          # Configuração de domínios seguros para Next Image
└── package.json
```

### Funcionalidades do Front-End

1. **Vitrine & Busca Inteligente (`/`)**:
   - Filtros dinâmicos por tipo (`Todos`, `Shows & Festivais`, `Filmes & Cinema`);
   - Barra de busca com debounce e paginação integrada;
   - Banners widescreen de alta qualidade para cada categoria de evento.

2. **Checkout Simulado com Prevenção de Overbooking (`/events/[id]`)**:
   - Seleção de quantidade com travas automáticas de estoque disponível;
   - Escolha entre **`Aprovar Pagamento`** (emite ingressos, debita o estoque atômico e redireciona para Meus Ingressos) ou **`Recusar Pagamento`** (simula recusa da operadora e redireciona para Minhas Compras com status recusado).

3. **Ingressos Digitais com QR Code (`/my-tickets`)**:
   - Pôster panorâmico do evento no topo do ingresso;
   - QR Code em formato Base64 Data URL para apresentação imediata na portaria;
   - Botão para copiar o link público de compartilhamento com 1 clique.

4. **Página Pública de Compartilhamento (`/tickets/share/[shareToken]`)**:
   - Visual em formato de *ticket stub* acessível sem necessidade de login;
   - Exibe código único, validação criptográfica e status do ingresso em tempo real.

5. **Assistente de Catálogo TMDb / Ticketmaster (`/organizer/events/new`)**:
   - Busca em APIs externas de cinema e música para auto-preenchimento de título, sinopse, gênero e imagem de capa.

6. **Área da Portaria (`/gatekeeper/validate`)**:
   - Validação com leitor de câmera ao vivo (`html5-qrcode`) e digitação manual com retorno dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.

## 🚀 Como Executar o Projeto Localmente

Siga o passo a passo abaixo para rodar o banco de dados, o backend e o frontend em sua máquina:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v20 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose

### 2. Configurando e Iniciando o Back-End

1. Abra um terminal e navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências do backend:
   ```bash
   npm install
   ```

3. Configure o arquivo de variáveis de ambiente:
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*.  
   *As configurações padrões já vêm prontas para conectar com o container Docker local.*

4. Suba o container do banco de dados (PostgreSQL):
   ```bash
   docker compose up -d
   ```

5. Execute as migrações do Prisma e popule o banco com os dados iniciais (Seed):
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

6. Inicie o servidor da API:
   ```bash
   npm run dev
   ```
   A API estará rodando em: `http://localhost:3001` (Healthcheck: `http://localhost:3001/health`).

### 3. Configurando e Iniciando o Front-End

1. Abra um **segundo terminal** e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências do frontend:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente locais:
   Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env.local`)*.  
   *O arquivo já aponta por padrão para a API local: `NEXT_PUBLIC_API_URL="http://localhost:3001"`*.

4. Inicie o servidor de desenvolvimento do Next.js:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador: **[http://localhost:3000](http://localhost:3000)**.

## 🧪 Executando os Testes Automatizados

O projeto possui suítes completas de testes unitários e de integração:

- **Testes do Backend**:
  ```bash
  cd backend
  npm test
  ```

- **Testes do Frontend**:
  ```bash
  cd frontend
  npm test
  ```

## 🔮 Implementações Futuras & Roadmap

- **Mapa Visual de Assentos (Seat Map Interativo)**: Evolução do modelo atual de capacidade numérica para suporte a matriz de poltronas numeradas (ex.: salas de cinema e teatros com filas/colunas), integrando reserva temporária com expiração automática (*lock* otimista por WebSocket/Redis);
- **Refinamento Contínuo de Design & Microinterações**: Expansão do design system modular (*Bento Grid*) com animações de transição mais ricas e suporte a temas personalizáveis para organizadores;
- **Fluxo de Cancelamento & Reembolso com Devolução ao Estoque**: Endpoint e interface dedicados para cancelamento de reservas pelo cliente com estorno de saldo e liberação atômica automática das vagas no estoque.
