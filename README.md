# 🎟️ Elite Ingressos — Plataforma de Eventos e Ingressos Digitais

> **Projeto Desenvolvido para o Desafio Técnico Elite Dev da Verzel**  
> Solução *Full-Stack* completa para compra, gestão, emissão, cancelamento e validação segura de ingressos para **Shows** e **Cinema**, com prevenção rigorosa de *overbooking*, assinatura criptográfica anti-fraude em QR Codes e integração com catálogos externos em tempo real.

## 📌 Sumário / Navegação Rápida

- [🌐 Deploy em Produção (Live Demo)](#-deploy-em-produção-live-demo)
- [📑 Documentos de Decisões Técnicas (DECISIONS.md)](#-documentos-de-decisões-técnicas-decisionsmd)
- [🤖 Condução Técnica & AI Pair Programming](#-condução-técnica--ai-pair-programming)
- [⚡ Roteiro Rápido para Avaliação (Como Testar em 3 Minutos)](#-roteiro-rápido-para-avaliação-como-testar-em-3-minutos)
- [🌟 Destaques do Projeto](#-destaques-do-projeto)
- [🏗️ Arquitetura e Stack Tecnológica](#️-arquitetura-e-stack-tecnológica)
- [👥 Contas Semeadas para Avaliação (Seed)](#-contas-semeadas-para-avaliação-seed)
- [🔐 Configuração das Variáveis de Ambiente](#-configuração-das-variáveis-de-ambiente)
- [🗄️ Modelagem e Relacionamento do Banco de Dados (DER)](#️-modelagem-e-relacionamento-do-banco-de-dados-der)
- [📦 Detalhamento do Back-End](#-detalhamento-do-back-end)
  - [Estrutura de Pastas do Back-End](#estrutura-de-pastas-do-back-end)
  - [Endpoints da API](#endpoints-da-api)
- [🎨 Detalhamento do Front-End](#-detalhamento-do-front-end)
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

## 📑 Documentos de Decisões Técnicas (DECISIONS.md)

Para consultar o racional arquitetural completo e aprofundado:
- 📄 [Backend DECISIONS.md](./backend/DECISIONS.md)
- 📄 [Frontend DECISIONS.md](./frontend/DECISIONS.md)

## 🤖 Condução Técnica & AI Pair Programming

Para detalhes sobre como a Inteligência Artificial foi conduzida como ferramenta de co-pilotagem técnica, mantendo o controle arquitetural e o desenvolvimento estritamente *hands-on*:
- 📄 [Processo de AI Pair Programming & Racional Crítico](./docs/ai-workflow/AI_PAIR_PROGRAMMING.md)
- 📋 [Exemplo Real de Implementation Plan Utilizado](./docs/ai-workflow/IMPLEMENTATION_PLAN_EXAMPLE.md)

## ⚡ Roteiro Rápido para Avaliação (Como Testar em 3 Minutos)

Para facilitar a navegação da banca avaliadora, sugerimos o seguinte fluxo de testes de ponta a ponta:

1. **Vitrine & Catálogo**: Acesse a home, utilize a barra de busca ou filtre por *Shows* / *Filmes* para visualizar os eventos disponíveis;
2. **Compra & Checkout Simulado**: Clique no card de um evento e selecione a quantidade de ingressos. No modal de checkout:
   - Escolha **Aprovar Pagamento** para disparar a transação atômica no PostgreSQL, debitar o estoque e emitir os ingressos com QR Code assinado;
   - Ou escolha **Recusar Pagamento** para simular uma recusa de operadora bancária (o sistema redireciona para *Minhas Compras* com o status recusado sem debitar o estoque);
3. **Cancelamento com Estorno de Vagas**: Acesse **Minhas Compras**, clique em **Cancelar Reserva** em uma compra confirmada e confirme no modal. O status do pedido mudará para `CANCELADO`, a capacidade do evento será devolvida ao estoque e os ingressos digitais em *Meus Ingressos* ficarão em preto e branco (`grayscale`) e bloqueados;
4. **Ingressos Digitais & Compartilhamento**: Acesse **Meus Ingressos** para ver os QR Codes em alta resolução e clique no botão para copiar o link público tokenizado (`/tickets/share/...`), que pode ser aberto em qualquer aba ou navegador sem necessidade de login;
5. **Criação de Eventos com Assistente Inteligente**: Faça login com a conta de **Organizador**, acesse **Criar Novo Evento** e busque por títulos reais como *"Coldplay"*, *"Duna"* ou *"Batman"* para ver o auto-preenchimento com dados do TMDb e Ticketmaster;
6. **Validação na Portaria**: Faça login com a conta de **Portaria** em `/gatekeeper/validate` e valide qualquer ingresso pela câmera do dispositivo ou digitando o código legível (`TKT-...`), observando o retorno dos status previstos (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID` ou cancelado).

---

## 🌟 Destaques do Projeto

- 🛡️ **Zero Overbooking**: Transações atômicas no PostgreSQL (`$transaction` + decremento condicional) garantindo que nenhum ingresso seja vendido acima da capacidade;
- 🔄 **Cancelamento com Estorno Atômico**: Permite que o comprador cancele pedidos confirmados (desde que nenhum ingresso tenha sido usado na portaria), liberando as vagas de volta ao evento e invalidando os ingressos com design desativado em escala de cinza;
- 🔐 **Anti-Fraude Criptográfico**: QR Codes assinados com **HMAC-SHA256** e validação com tempo constante (`crypto.timingSafeEqual`) contra ataques de adulteração;
- 🌐 **Catálogo Inteligente**: Assistente integrado ao **TMDb (The Movie Database)** e **Ticketmaster Discovery API** para auto-preenchimento de filmes e shows, com *fallback* automático tolerante a falhas;
- 🚪 **Portaria em Tempo Real**: Validador óptico por **câmera ao vivo** e digitação manual com retorno claro dos status da especificação (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID`);
- 🔗 **Link de Compartilhamento**: Permite que o comprador envie ingressos individuais para amigos via link público tokenizado (UUID), sem expor os outros ingressos da conta;
- 🎯 **Design System Sólido (*Anti-AI Slop*)**: Interface moderna e minimalista, sem excessos visuais, utilizando TailwindCSS v4, badges semânticas com indicador de ponto e tipografia nítida.

---

## 🏗️ Arquitetura e Stack Tecnológica

### Back-End
- **Runtime**: Node.js 20+ com TypeScript (ESM nativo)
- **Framework Web**: Express.js
- **Banco de Dados**: PostgreSQL 16
- **ORM**: Prisma ORM v7
- **Autenticação**: JWT (JSON Web Token) com bcrypt
- **Segurança**: Assinatura digital HMAC-SHA256 para QR Codes
- **Validação de Dados**: Zod
- **Testes Automatizados**: Vitest + Supertest

### Front-End
- **Framework**: Next.js 15+ (App Router)
- **Linguagem**: TypeScript (Strict Mode)
- **Estilização**: TailwindCSS v4
- **Gerenciamento de Estado**: Zustand com persistência local
- **Leitor de QR Code**: html5-qrcode (câmera ao vivo e webcam)
- **Ícones**: Lucide React
- **Testes Automatizados**: Vitest + React Testing Library

---

## 👥 Contas Semeadas para Avaliação (Seed)

| Perfil | Nome | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- | :--- |
| **👑 ORGANIZER** | Carlos Organizador | `organizador@eliteingressos.com` | `123456` | Criar/editar eventos, importar do TMDb/Ticketmaster e ver métricas |
| **👤 CLIENT** | Ana Cliente | `cliente1@eliteingressos.com` | `123456` | Comprar ingressos, cancelar reservas, ver QR Codes e compartilhar links |
| **👤 CLIENT** | Bruno Cliente | `cliente2@eliteingressos.com` | `123456` | Testar concorrência de compra simultânea |
| **🚪 GATEKEEPER** | Roberto Portaria | `portaria@eliteingressos.com` | `123456` | Validação de ingressos por câmera e código manual |

---

## 🔐 Configuração das Variáveis de Ambiente

### Back-End (`backend/.env`)
| Variável | Descrição | Exemplo / Padrão Local |
| :--- | :--- | :--- |
| `PORT` | Porta de execução do servidor Express | `3001` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `DATABASE_URL` | String de conexão do PostgreSQL (Prisma) | `postgresql://postgres:password123@localhost:5432/desafio_elite_dev?schema=public` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | `super-secret-desafio-elite-dev-jwt-key` |
| `QR_SECRET` | Chave secreta para assinatura criptográfica HMAC dos QR Codes | `super-secret-hmac-qr-signing-key` |
| `TMDB_API_KEY` | Chave de API do The Movie Database (Opcional - possui fallback) | *(Opcional)* |
| `TICKETMASTER_API_KEY` | Chave de API do Ticketmaster (Opcional - possui fallback) | *(Opcional)* |

### Front-End (`frontend/.env.local`)
| Variável | Descrição | Exemplo / Padrão Local |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base da API do Back-End | `http://localhost:3001` |

---

## 🗄️ Modelagem e Relacionamento do Banco de Dados (DER)

A estrutura do banco de dados relacional foi desenhada no PostgreSQL via Prisma ORM:

```mermaid
erDiagram
    USER ||--o{ EVENT : "organiza (1:N)"
    USER ||--o{ RESERVATION : "realiza (1:N)"
    EVENT ||--o{ RESERVATION : "possui (1:N)"
    EVENT ||--o{ TICKET : "pertence_a (1:N)"
    RESERVATION ||--|| PAYMENT : "gera (1:1)"
    RESERVATION ||--o{ TICKET : "emite (1:N)"

    USER {
        string id PK
        string name
        string email UK
        string password
        enum role "ORGANIZER, CLIENT, GATEKEEPER"
        datetime createdAt
        datetime updatedAt
    }

    EVENT {
        string id PK
        string title
        string description
        enum type "SHOW, MOVIE"
        string category
        string imageUrl
        datetime date
        string location
        int capacity
        int availableTickets
        decimal price
        enum status "DRAFT, PUBLISHED, CANCELED"
        string externalEventId
        string externalSource
        string organizerId FK
        datetime createdAt
        datetime updatedAt
    }

    RESERVATION {
        string id PK
        int quantity
        decimal totalAmount
        enum status "PENDING, CONFIRMED, CANCELED, REFUSED"
        string clientId FK
        string eventId FK
        datetime createdAt
        datetime updatedAt
    }

    PAYMENT {
        string id PK
        decimal amount
        enum status "PENDING, APPROVED, REFUSED"
        string reservationId FK,UK
        datetime createdAt
        datetime updatedAt
    }

    TICKET {
        string id PK
        string code UK
        string qrSignature
        string shareToken UK
        enum status "ACTIVE, USED, CANCELED"
        datetime usedAt
        string eventId FK
        string reservationId FK
        datetime createdAt
        datetime updatedAt
    }
```

### Explicação das Cardinalidades e Regras de Integridade:
1. **User (1) ➔ (N) Event**: Um usuário do tipo `ORGANIZER` pode criar e gerenciar múltiplos eventos.
2. **User (1) ➔ (N) Reservation**: Um usuário do tipo `CLIENT` pode realizar diversas compras e reservas ao longo do tempo.
3. **Event (1) ➔ (N) Reservation**: Um evento recebe reservas de diferentes compradores até o limite de sua capacidade.
4. **Reservation (1) ➔ (1) Payment**: Cada tentativa de reserva possui exatamente um registro de pagamento simulado vinculado (`APPROVED` ou `REFUSED`).
5. **Reservation (1) ➔ (N) Ticket**: Uma reserva aprovada emite $N$ ingressos individuais correspondentes à quantidade adquirida.
6. **Event (1) ➔ (N) Ticket**: Cada ingresso está associado diretamente ao evento a que dá acesso.

---

## 📦 Detalhamento do Back-End

### Estrutura de Pastas do Back-End
```text
backend/
├── prisma/
│   ├── schema.prisma           # Modelagem de dados, enums e índices
│   └── seed.ts                 # Seed completo com 4 perfis, 8 eventos e capas Unsplash
├── src/
│   ├── config/                 # Prisma Client, variáveis de ambiente (Zod)
│   ├── controllers/            # Controladores REST desacoplados
│   ├── middlewares/            # Auth JWT, Role Guard (RBAC), Validação de Schema, Error Handler
│   ├── repositories/           # Acesso a dados e Transações Atômicas ACID do Prisma
│   ├── routes/                 # Definição das rotas REST organizadas por domínio
│   ├── schemas/                # Schemas de validação Zod (Entrada e Queries)
│   ├── services/               # Regras de negócio, cálculo de estoque e integração com APIs
│   ├── utils/                  # Assinatura HMAC-SHA256, AppError e geradores
│   ├── app.ts                  # Configuração do Express e CORS
│   └── server.ts               # Inicialização do servidor HTTP
├── tests/                      # Suíte de testes automatizados com Vitest
└── package.json
```

### Endpoints da API

#### 🔐 Autenticação (`/api/auth`)
- `POST /api/auth/register` - Cadastro de usuário (`ORGANIZER`, `CLIENT`, `GATEKEEPER`);
- `POST /api/auth/login` - Autenticação e geração do Bearer Token JWT;
- `GET /api/auth/me` - Consulta dos dados do perfil autenticado.

#### 🌐 Catálogo Externo (`/api/catalog`)
- `GET /api/catalog/search?query=coldplay&type=ALL` - Busca em TMDb e Ticketmaster com fallback automático.

#### 🎭 Eventos (`/api/events`)
- `GET /api/events` - Listagem pública de eventos publicados (com busca, filtros e paginação);
- `GET /api/events/:id` - Detalhes de um evento específico;
- `GET /api/events/organizer/my-events` - Eventos criados pelo organizador autenticado (`ORGANIZER`);
- `POST /api/events` - Criação de evento (`ORGANIZER`);
- `PUT /api/events/:id` - Edição de evento pelo organizador proprietário (`ORGANIZER`).

#### 💳 Reservas, Pagamento Simulado & Cancelamento (`/api/reservations`)
- `POST /api/reservations` - Compra com transação atômica e simulação de pagamento (`APPROVED` ou `REFUSED`) (`CLIENT`);
- `GET /api/reservations/my-reservations` - Histórico completo de pedidos do cliente (`CLIENT`);
- `GET /api/reservations/:id` - Detalhes de uma reserva específica (`CLIENT`);
- `PATCH /api/reservations/:id/cancel` - Cancelamento de reserva com estorno seguro de ingressos e devolução ao estoque (`CLIENT`).

#### 🎟️ Ingressos, Compartilhamento & Portaria (`/api/tickets`)
- `GET /api/tickets/my-tickets` - Ingressos do cliente com QR Code Base64 (`CLIENT`);
- `GET /api/tickets/share/:shareToken` - Consulta pública de ingresso compartilhado via link;
- `POST /api/tickets/validate` - Validação na portaria via câmera/código (`GATEKEEPER`).

---

## 🎨 Detalhamento do Front-End

### Estrutura de Pastas do Front-End
```text
frontend/
├── src/
│   ├── app/                                # Rotas e Páginas do Next.js (App Router)
│   │   ├── layout.tsx                      # Layout raiz (Navbar, Footer, Tema Escuro Sólido)
│   │   ├── page.tsx                        # Vitrine Pública com Busca e Filtros
│   │   ├── login/page.tsx                  # Login com atalhos de preenchimento rápido em 1 clique
│   │   ├── register/page.tsx               # Cadastro com seleção de perfil
│   │   ├── events/[id]/page.tsx            # Detalhes do Evento & Checkout Simulado
│   │   ├── my-tickets/page.tsx             # Área do Cliente (Cards Panorâmicos com QR Code e Grayscale)
│   │   ├── my-reservations/page.tsx        # Histórico de Pedidos e Cancelamento com Modal
│   │   ├── tickets/share/[shareToken]/     # Página Pública de Ingresso Compartilhado
│   │   ├── organizer/events/page.tsx       # Painel de Métricas & Gestão do Organizador
│   │   ├── organizer/events/new/page.tsx   # Assistente de Criação com TMDb & Ticketmaster
│   │   └── gatekeeper/validate/page.tsx    # Validador da Portaria (Câmera ao vivo & Digitação)
│   ├── components/
│   │   ├── layout/                         # Componentes Estruturais (Navbar, Footer)
│   │   └── ui/                             # Design System Sólido (Button, Input, Badge com dot, Modal)
│   ├── services/
│   │   └── api.ts                          # Cliente HTTP tipado com injeção automática de Bearer Token
│   ├── stores/
│   │   └── authStore.ts                    # Estado Global de Autenticação (Zustand com hidratação)
│   ├── types/
│   │   └── index.ts                        # Tipagens TypeScript completas
│   └── utils/
│       ├── cn.ts                           # Utilitário de classes condicionais Tailwind
│       ├── constants.ts                    # Imagens de capa padrão e fallbacks
│       └── formatters.ts                   # Formatadores de moeda (BRL), datas e badges
├── __tests__/                              # Testes automatizados unitários e de componentes
└── package.json
```

### Funcionalidades do Front-End
1. **Vitrine & Busca Inteligente (`/`)**: Filtros dinâmicos por tipo (`Todos`, `Shows`, `Filmes`), busca com debounce e paginação;
2. **Checkout Simulado com Prevenção de Overbooking (`/events/[id]`)**: Seleção de ingressos e escolha entre `Aprovar Pagamento` ou `Recusar Pagamento`;
3. **Cancelamento com Estorno em Tempo Real (`/my-reservations`)**: Botão de cancelamento de reservas confirmadas com modal seguro e atualização instantânea;
4. **Ingressos Digitais com QR Code (`/my-tickets`)**: QR Codes em Base64 Data URL, botão para copiar link de compartilhamento e renderização de ingressos cancelados em preto e branco (`grayscale`);
5. **Página Pública de Compartilhamento (`/tickets/share/[shareToken]`)**: Acesso sem login para apresentação na portaria com proteção criptográfica;
6. **Assistente de Catálogo Inteligente (`/organizer/events/new`)**: Busca em APIs externas de cinema e música para auto-preenchimento;
7. **Validação da Portaria (`/gatekeeper/validate`)**: Leitor óptico via câmera (`html5-qrcode`) e digitação manual.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose
- [Git](https://git-scm.com/)

### 2. Configurando e Iniciando o Back-End

1. Abra um terminal e clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/desafio-elite-dev.git
   cd desafio-elite-dev/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*.

4. Suba o banco de dados via Docker:
   ```bash
   docker compose up -d
   ```

5. Execute as migrações e o seed inicial:
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

1. Abra um **segundo terminal** e acesse a pasta do frontend:
   ```bash
   cd desafio-elite-dev/frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env.local`)*.

4. Inicie o Next.js:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador: **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 Executando os Testes Automatizados

O projeto possui **40 testes automatizados** cobrindo serviços, segurança, repositórios, API e componentes de UI:

- **Executar todos os testes (Monorepo)**:
  ```bash
  npm test
  ```

- **Testes isolados do Back-End (23 testes)**:
  ```bash
  cd backend
  npm test
  ```

- **Testes isolados do Front-End (17 testes)**:
  ```bash
  cd frontend
  npm test
  ```

---

## 🔮 Implementações Futuras & Roadmap

- **Mapa Visual de Assentos (Seat Map Interativo)**: Evolução do modelo atual de capacidade numérica para suporte a matriz de poltronas numeradas (ex.: salas de cinema e teatros com filas/colunas), integrando reserva temporária com expiração automática (*lock* otimista por WebSocket/Redis);
- **Refinamento Contínuo de Design & Microinterações**: Expansão do design system modular (*Bento Grid*) com animações de transição mais ricas e suporte a temas personalizáveis para organizadores.
