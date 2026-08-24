# 🎟️ Plataforma de Eventos e Ingressos - Backend (Desafio Elite Dev)

API RESTful robusta desenvolvida em **Node.js**, **Express**, **TypeScript** e **Prisma ORM (v7)** com **PostgreSQL**, seguindo princípios de arquitetura em camadas (*Clean Architecture* adaptada: Routes ➔ Controllers ➔ Services ➔ Repositories) com proteção contra fraudes, overbooking e suporte a catálogo inteligente externo.

---

## 🚀 Tecnologias e Bibliotecas Utilizadas

- **Runtime & Linguagem**: Node.js 22+, TypeScript (ESM)
- **Framework Web**: Express 5
- **Banco de Dados & ORM**: PostgreSQL, Prisma ORM 7 com `@prisma/adapter-pg`
- **Validação de Dados**: Zod (v4)
- **Segurança**:
  - `jsonwebtoken` para autenticação com Bearer Token JWT;
  - `bcryptjs` para hash seguro de senhas (salt rounds = 10);
  - `crypto` (HMAC-SHA256) para assinatura criptográfica anti-fraude nos QR Codes;
  - `helmet` para cabeçalhos HTTP seguros (OWASP);
  - `cors` para controle de origens cruzadas;
  - Transações atômicas no Prisma (`$transaction` + decremento atômico) para eliminação de *overbooking*.
- **Geração de QR Code**: `qrcode` (emissão de Base64 Data URLs).
- **APIs Externas**: Integração em tempo real com **TMDb (The Movie Database)** e **Ticketmaster Discovery API**, com *fallback* automático demonstrativo de alta fidelidade.

---

## 📁 Estrutura do Projeto

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

---

## 🛠️ Como Configurar e Executar

### 1. Pré-requisitos
- **Node.js** (v20+ recomendado)
- **Docker** e **Docker Compose**

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Configurações disponíveis no `.env`:
```env
PORT=3001
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_DB=desafio_elite_dev
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:password123@localhost:5432/desafio_elite_dev?schema=public"

JWT_SECRET="super-secret-desafio-elite-dev-jwt-key"
QR_SECRET="super-secret-hmac-qr-signing-key"

# Opcionais (Se vazias, o catálogo usa fallback interno demonstrativo)
TMDB_API_KEY=""
TICKETMASTER_API_KEY=""
```

### 4. Subir o Banco de Dados (PostgreSQL via Docker)
```bash
docker compose up -d
```

### 5. Executar Migrações e Popular o Banco (Seed)
```bash
npx prisma migrate dev
npm run seed
```

### 6. Iniciar a Aplicação em Modo de Desenvolvimento
```bash
npm run dev
```
A API estará disponível em: `http://localhost:3001` (Healthcheck: `http://localhost:3001/health`).

### 7. Executar os Testes Automatizados
```bash
npm test
```

---

## 👥 Credenciais Semeadas para Teste (Seed)

| Papel | Nome | E-mail | Senha |
| :--- | :--- | :--- | :--- |
| **ORGANIZER** | Carlos Organizador | `organizador@eliteingressos.com` | `123456` |
| **CLIENT** | Ana Cliente | `cliente1@eliteingressos.com` | `123456` |
| **CLIENT** | Bruno Cliente | `cliente2@eliteingressos.com` | `123456` |
| **GATEKEEPER** | Roberto Portaria | `portaria@eliteingressos.com` | `123456` |

---

## 📌 Rotas da API

### 🔐 Autenticação (`/api/auth`)
- `POST /api/auth/register` - Cadastro de usuário (`ORGANIZER`, `CLIENT`, `GATEKEEPER`);
- `POST /api/auth/login` - Autenticação e geração do Bearer Token JWT;
- `GET /api/auth/me` - Consulta dos dados do perfil autenticado.

### 🌐 Catálogo Externo (`/api/catalog`)
- `GET /api/catalog/search?query=coldplay&type=ALL` - Busca de filmes (TMDb) e shows (Ticketmaster) com fallback tolerante a falhas.

### 🎭 Eventos (`/api/events`)
- `GET /api/events` - Listagem pública de eventos publicados (filtros por tipo, busca textual e paginação);
- `GET /api/events/:id` - Detalhes de um evento específico;
- `GET /api/events/organizer/my-events` - Eventos criados pelo organizador logado (`ORGANIZER`);
- `POST /api/events` - Criação de evento (`ORGANIZER`);
- `PUT /api/events/:id` - Edição de evento pelo organizador proprietário (`ORGANIZER`).

### 💳 Reservas & Pagamento Simulado (`/api/reservations`)
- `POST /api/reservations` - Compra com transação atômica e simulação de pagamento (`APPROVED` ou `REFUSED`) (`CLIENT`);
- `GET /api/reservations/my-reservations` - Histórico completo de compras e reservas do cliente (`CLIENT`);
- `GET /api/reservations/:id` - Detalhes de uma reserva específica (`CLIENT`).

### 🎟️ Ingressos, Compartilhamento & Portaria (`/api/tickets`)
- `GET /api/tickets/my-tickets` - Ingressos do cliente com QR Code Base64 (`CLIENT`);
- `GET /api/tickets/share/:shareToken` - Consulta pública de ingresso compartilhado via link;
- `POST /api/tickets/validate` - Validação na portaria via câmera/código (`GATEKEEPER`) retornando:
  - `VALID`: Entrada liberada e ingresso marcado como `USED`;
  - `ALREADY_USED`: Ingresso já utilizado anteriormente com data/hora do uso;
  - `WRONG_EVENT`: Ingresso válido, porém emitido para outro evento;
  - `INVALID`: Código inexistente ou assinatura HMAC violada.
