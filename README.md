# 🎟️ Elite Ingressos — Plataforma de Eventos e Ingressos Digitais

> **Projeto Desenvolvido para o Desafio Técnico Elite Dev**  
> Solução *Full-Stack* completa para compra, gestão, emissão e validação segura de ingressos para **Shows** e **Cinema**, com prevenção rigorosa de *overbooking*, assinatura criptográfica anti-fraude em QR Codes e integração com catálogos externos em tempo real.

---

## 🌐 Deploy em Produção (Live Demo)

A aplicação está disponível e pronta para uso online:

- 🔗 **Acesse a Aplicação**: **[https://desafio-elite-dev-theta.vercel.app/](https://desafio-elite-dev-theta.vercel.app/)**

> ⚠️ **Aviso sobre a Primeira Requisição (Cold Start)**:  
> O **Front-End** está hospedado na **Vercel** e a **API do Back-End** está hospedada na plataforma gratuita do **Render.com**.  
> Por conta do modo de hibernação (*sleep mode*) do plano gratuito do Render, a **primeira requisição ao backend pode levar aproximadamente 50 segundos** para acordar a instância. Após essa inicialização inicial, todas as requisições subsequentes responderão instantaneamente!

---

## 🌟 Destaques do Projeto

- 🛡️ **Zero Overbooking**: Transações atômicas no PostgreSQL (`$transaction` + decremento condicional) garantindo que nenhum ingresso seja vendido acima da capacidade;
- 🔐 **Anti-Fraude Criptográfico**: QR Codes assinados com **HMAC-SHA256** e validação com tempo constante (`crypto.timingSafeEqual`) contra ataques de adulteração;
- 🌐 **Catálogo Inteligente**: Assistente integrado ao **TMDb (The Movie Database)** e **Ticketmaster Discovery API** para auto-preenchimento de filmes e shows, com *fallback* automático tolerante a falhas;
- 🚪 **Portaria em Tempo Real**: Validador óptico por **câmera ao vivo** e digitação manual com retorno claro dos 4 status da especificação (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID`);
- 🔗 **Link de Compartilhamento**: Permite que o comprador envie ingressos individuais para amigos via link público tokenizado (UUID), sem expor os outros ingressos da conta;
- 🎨 **Design Sóbrio e Moderno (*Anti-AI Slop*)**: Interface escura construída com TailwindCSS v4 e componentes sólidos (sem vidros coloridos fluorescentes artificiais).

---

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
| **Testes** | Vitest, React Testing Library, Supertest (100% dos testes passando no backend e frontend) |

---

## 🚀 Como Executar o Projeto Localmente

Você pode rodar todo o ecossistema (Banco + Backend + Frontend) com apenas **um único comando** a partir da raiz do repositório:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v20 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose

### 2. Instalação e Configuração
Execute o script de setup na raiz para instalar as dependências de todos os pacotes e gerar os arquivos `.env`:
```bash
# Na raiz do projeto:
npm run setup
```

*(Ou instale manualmente em cada pasta: `cd backend && npm install && cp .env.example .env && cd ../frontend && npm install`)*.

### 3. Subir o Banco e Popular com o Seed Oficial
```bash
npm run db:up
npm run db:seed
```

### 4. Iniciar a Aplicação Completa
```bash
npm run dev
```

Pronto! Os serviços locais estarão disponíveis em:
- 🌐 **Front-End**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Back-End API**: [http://localhost:3001](http://localhost:3001)
- 💓 **Healthcheck**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 👥 Contas Semeadas para Avaliação (Seed)

Tanto em ambiente local quanto no deploy em produção, a tela de login conta com botões de **acesso rápido com 1 clique**:

| Papel | Nome | E-mail | Senha | Funcionalidades Principais |
| :--- | :--- | :--- | :--- | :--- |
| **👤 Cliente** | Ana Cliente | `cliente1@eliteingressos.com` | `123456` | Comprar ingressos, ver QR Codes, compartilhar via link e histórico de compras |
| **👤 Cliente 2** | Bruno Cliente | `cliente2@eliteingressos.com` | `123456` | Testar concorrência de compra simultânea para o mesmo evento |
| **👑 Organizador** | Carlos Organizador | `organizador@eliteingressos.com` | `123456` | Painel de métricas, criar eventos manuais ou via assistente TMDb/Ticketmaster |
| **🚪 Portaria** | Roberto Portaria | `portaria@eliteingressos.com` | `123456` | Validação de ingressos por leitura de câmera ou digitação de código |

---

## 🧪 Executando os Testes Automatizados

O projeto possui suítes completas de testes unitários e de integração:

```bash
# Executar todos os testes (Backend + Frontend)
npm test

# Testes apenas do Backend
npm run test:backend

# Testes apenas do Frontend
npm run test:frontend
```

---

## 📖 Documentação Detalhada por Módulo

Para entender a fundo as decisões técnicas e padrões adotados em cada parte da aplicação, consulte os documentos dedicados:

- 📘 [Backend README & Endpoints](file:///d:/Code/desafios-tecnicos/desafio-elite-dev/backend/README.md)
- 🧠 [Backend Arquitetura & Decisões (DECISIONS.md)](file:///d:/Code/desafios-tecnicos/desafio-elite-dev/backend/DECISIONS.md)
- 📙 [Frontend README & Guia](file:///d:/Code/desafios-tecnicos/desafio-elite-dev/frontend/README.md)
- 🧠 [Frontend Arquitetura & Decisões (DECISIONS.md)](file:///d:/Code/desafios-tecnicos/desafio-elite-dev/frontend/DECISIONS.md)
