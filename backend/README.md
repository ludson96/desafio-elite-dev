# 🎫 Plataforma de Eventos e Ingressos - Backend (Desafio Elite Dev)

API RESTful robusta desenvolvida em **Node.js**, **Express**, **TypeScript** e **Prisma ORM (v7)** com **PostgreSQL**, seguindo princípios de arquitetura em camadas (*Clean Architecture* adaptada: Routes ➔ Controllers ➔ Services ➔ Repositories) e proteção contra fraudes e concorrência na compra de ingressos.

---

## 🛠️ Tecnologias e Bibliotecas Utilizadas

- **Runtime & Linguagem**: Node.js, TypeScript (ESM)
- **Framework Web**: Express 5
- **Banco de Dados & ORM**: PostgreSQL, Prisma ORM 7 com `@prisma/adapter-pg`
- **Validação de Dados**: Zod (v4)
- **Segurança**:
  - `jsonwebtoken` para autenticação com Bearer Token JWT;
  - `bcryptjs` para hash seguro de senhas;
  - `crypto` (HMAC-SHA256) para assinatura criptográfica anti-fraude nos QR Codes;
  - `helmet` para cabeçalhos HTTP seguros;
  - `cors` para controle de origens cruzadas;
  - Transações atômicas no Prisma (`$transaction` + decremento atômico) para eliminação de *overbooking*.
- **Geração de QR Code**: `qrcode` (emissão de Base64 Data URLs).
- **APIs Externas**: Integração com **TMDb** e **Ticketmaster** com fallback demonstrativo de alta fidelidade.

---

## 📁 Estrutura do Projeto

```
src/
├── config/             # Configurações de ambiente (env.ts) e banco de dados (prisma.ts)
├── constants/          # Constantes estáticas e dados demonstrativos
├── controllers/        # Manipulação de requisições e respostas HTTP
├── middlewares/        # Autenticação JWT, controle de papéis (RBAC), validação Zod e erro global
├── repositories/       # Isolamento de acesso a dados com Prisma ORM
├── routes/             # Definição e agrupamento dos endpoints da API
├── schemas/            # Schemas de validação de entrada com Zod
├── services/           # Regras de negócio, cálculos, transações e segurança
├── utils/              # AppError customizado, JWT e assinaturas HMAC de QR Code
├── app.ts              # Instância e middlewares do Express
└── server.ts           # Inicialização do servidor HTTP
```

---

## ⚙️ Como Configurar e Executar

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

### 4. Subir o Banco de Dados (PostgreSQL via Docker)
```bash
docker compose up -d
```

### 5. Executar Migrações e Popular o Banco com Seed Obrigatório
```bash
npx prisma migrate dev
npm run seed
```

### 6. Iniciar a Aplicação em Modo de Desenvolvimento
```bash
npm run dev
```
A API estará disponível em: `http://localhost:3001` (Healthcheck: `http://localhost:3001/health`).

---

## 👥 Credenciais Semeadas para Teste (Seed)

| Papel | Nome | E-mail | Senha |
| :--- | :--- | :--- | :--- |
| **ORGANIZER** | Carlos Organizador | `organizador@verzel.com` | `123456` |
| **CLIENT** | Ana Cliente | `cliente1@verzel.com` | `123456` |
| **CLIENT** | Bruno Cliente | `cliente2@verzel.com` | `123456` |
| **GATEKEEPER** | Roberto Portaria | `portaria@verzel.com` | `123456` |

---

## 📌 Rotas da API

### 🔐 Autenticação (`/api/auth`)
- `POST /api/auth/register` - Cadastro de usuário (`ORGANIZER`, `CLIENT`, `GATEKEEPER`);
- `POST /api/auth/login` - Autenticação e obtenção do Bearer Token;
- `GET /api/auth/me` - Consulta do perfil logado.

### 🎬 Catálogo Externo (`/api/catalog`)
- `GET /api/catalog/search?query=coldplay&type=ALL` - Busca de filmes (TMDb) e shows (Ticketmaster).

### 🎪 Eventos (`/api/events`)
- `GET /api/events` - Listagem pública de eventos publicados (filtros e paginação);
- `GET /api/events/:id` - Detalhes de um evento;
- `GET /api/events/organizer/my-events` - Eventos criados pelo organizador logado (`ORGANIZER`);
- `POST /api/events` - Criação de evento (`ORGANIZER`);
- `PUT /api/events/:id` - Edição de evento (`ORGANIZER`).

### 🎟️ Reservas & Pagamento Simulado (`/api/reservations`)
- `POST /api/reservations` - Compra/reserva com transação atômica e simulação de pagamento (`APPROVED` ou `REFUSED`) (`CLIENT`);
- `GET /api/reservations/my-reservations` - Histórico de compras do cliente logado (`CLIENT`);
- `GET /api/reservations/:id` - Detalhes da reserva (`CLIENT`).

### 🚪 Ingressos, Compartilhamento & Portaria (`/api/tickets`)
- `GET /api/tickets/my-tickets` - Ingressos do cliente com QR Code Base64 (`CLIENT`);
- `GET /api/tickets/share/:shareToken` - Consulta pública de ingresso compartilhado por link;
- `POST /api/tickets/validate` - Validação na portaria via câmera/código (`GATEKEEPER`) com retorno claro:
  - `VALID`
  - `ALREADY_USED`
  - `WRONG_EVENT`
  - `INVALID`
