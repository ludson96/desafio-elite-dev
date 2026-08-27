# 🎟️ Elite Ingressos — Event & Digital Ticketing Platform

🇧🇷 Leia isto em [Português](README.md)

> **Project Developed for the Verzel Elite Dev Technical Challenge**  
> Complete *Full-Stack* solution for purchasing, managing, issuing, canceling, and securely validating tickets for **Concerts** and **Movies**, featuring strict *overbooking* prevention, anti-fraud cryptographic signatures on QR Codes, and real-time external catalog integration.

## 📌 Summary / Quick Navigation

- [🌐 Production Deployment (Live Demo)](#-production-deployment-live-demo)
- [📑 Technical Decisions Documents (DECISIONS.md)](#-technical-decisions-documents-decisionsmd)
- [🤖 Technical Leadership & AI Pair Programming](#-technical-leadership--ai-pair-programming)
- [⚡ Quick Evaluation Walkthrough (How to Test in 3 Minutes)](#-quick-evaluation-walkthrough-how-to-test-in-3-minutes)
- [🌟 Project Highlights](#-project-highlights)
- [🏗️ Architecture & Tech Stack](#️-architecture--tech-stack)
- [👥 Seeded Accounts for Evaluation (Seed)](#-seeded-accounts-for-evaluation-seed)
- [🔐 Environment Variables Configuration](#-environment-variables-configuration)
- [🗄️ Database Modeling & Entity Relationship Diagram (ERD)](#️-database-modeling--entity-relationship-diagram-erd)
- [📦 Back-End Details](#-back-end-details)
  - [Back-End Folder Structure](#back-end-folder-structure)
  - [API Endpoints](#api-endpoints)
- [🎨 Front-End Details](#-front-end-details)
  - [Front-End Folder Structure](#front-end-folder-structure)
  - [Front-End Features](#front-end-features)
- [🚀 How to Run the Project Locally](#-how-to-run-the-project-locally)
- [🧪 Running Automated Tests](#-running-automated-tests)
- [🔮 Future Implementations & Roadmap](#-future-implementations--roadmap)

## 🌐 Production Deployment (Live Demo)

The application is deployed and ready for online use:

- 🔗 **Access the Application**: **[https://desafio-elite-dev-theta.vercel.app/](https://desafio-elite-dev-theta.vercel.app/)**

> ⚠️ **Notice regarding Cold Start (First Request)**:  
> The **Front-End** is hosted on **Vercel** and the **Back-End API** is hosted on **Render.com's** free tier.  
> Due to the sleep mode of Render's free tier, the **first request to the backend may take approximately 50 seconds** to spin up the instance. After this initial wake-up, all subsequent requests will respond instantly!

## 📑 Technical Decisions Documents (DECISIONS.md)

To inspect the comprehensive and deep architectural rationale:
- 📄 [Backend DECISIONS.md](./backend/DECISIONS.md)
- 📄 [Frontend DECISIONS.md](./frontend/DECISIONS.md)

## 🤖 Technical Leadership & AI Pair Programming

For details on how Artificial Intelligence was leveraged as a technical co-pilot, maintaining full architectural control and strictly hands-on development:
- 📄 [AI Pair Programming Process & Critical Rationale](./docs/ai-workflow/AI_PAIR_PROGRAMMING.md)
- 📋 [Actual Implementation Plan Example Used](./docs/ai-workflow/IMPLEMENTATION_PLAN_EXAMPLE.md)

## ⚡ Quick Evaluation Walkthrough (How to Test in 3 Minutes)

To assist the review committee, we suggest the following end-to-end testing flow:

1. **Showcase & Catalog**: Access the home page, use the search bar or filter by *Concerts* / *Movies* to explore available events;
2. **Purchase & Simulated Checkout**: Click an event card and choose the number of tickets. In the checkout modal:
   - Select **Approve Payment** to trigger the atomic PostgreSQL transaction, deduct inventory, and issue tickets with signed QR Codes;
   - Or select **Decline Payment** to simulate a payment gateway refusal (the system redirects to *My Orders* with the declined status without deducting inventory);
3. **Cancellation with Ticket Refund**: Go to **My Orders**, click **Cancel Reservation** on a confirmed order, and confirm in the modal. The order status changes to `CANCELADO`, event capacity is restored to inventory, and digital tickets in *My Tickets* become grayscale and blocked;
4. **Digital Tickets & Secure Sharing**: Go to **My Tickets** to view high-resolution QR Codes in the authenticated area. Click the button to copy the tokenized public link (`/tickets/share/...`), which opens an official informational proof-of-attendance voucher without exposing the QR Code or validation cryptographic material;
5. **Event Creation with Smart Assistant**: Log in with the **Organizer** account, go to **Create New Event**, and search for real titles like *"Coldplay"*, *"Dune"*, or *"Batman"* to test auto-completion powered by TMDb and Ticketmaster;
6. **Gatekeeper Validation**: Log in with the **Gatekeeper** account at `/gatekeeper/validate` and validate any ticket using the device camera or by typing the human-readable code (`TKT-...`), observing the return of all expected statuses (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID`, or canceled).

## 🌟 Project Highlights

- 🛡️ **Zero Overbooking**: Atomic PostgreSQL transactions (`$transaction` + conditional decrement) ensuring no ticket is sold beyond venue capacity;
- 🔄 **Atomic Cancellation & Restock**: Allows the buyer to cancel confirmed orders (provided no ticket has been scanned at the gate), releasing spots back to event inventory and invalidating tickets with a disabled grayscale design;
- 🔐 **Cryptographic Anti-Fraud**: QR Codes signed with **HMAC-SHA256** and validated using constant-time comparison (`crypto.timingSafeEqual`) against timing attacks;
- 🔗 **Secure Sharing (Zero Cryptographic Leakage)**: Tokenized public link (UUID) serving as proof-of-attendance/ownership that exposes only presentation data. Cryptographic secrets (`code`, `qrSignature`, `qrCodeUrl`) remain strictly restricted to the buyer's authenticated session and protected by contract tests;
- 🌐 **Smart Catalog**: Assistant integrated with **TMDb (The Movie Database)** and **Ticketmaster Discovery API** for auto-filling movie and concert details, with fault-tolerant automatic fallback;
- 🚪 **Real-Time Gatekeeper**: Optical validation via **live camera** and manual input with clear feedback for all specification statuses (`VALID`, `ALREADY_USED`, `WRONG_EVENT`, `INVALID`);
- 🎯 **Solid Design System (*Anti-AI Slop*)**: Modern, minimalist interface with no visual bloat, built with TailwindCSS v4, semantic dot-indicator badges, and sharp typography.

## 🏗️ Architecture & Tech Stack

### Back-End
- **Runtime**: Node.js 20+ with TypeScript (native ESM)
- **Web Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma ORM v7
- **Authentication**: JWT (JSON Web Token) with bcrypt
- **Security**: HMAC-SHA256 digital signature for QR Codes
- **Data Validation**: Zod
- **Automated Tests**: Vitest + Supertest (including security contract tests)

### Front-End
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: TailwindCSS v4
- **State Management**: Zustand with local persistence
- **QR Code Reader**: html5-qrcode (live camera and webcam)
- **Icons**: Lucide React
- **Automated Tests**: Vitest + React Testing Library

## 👥 Seeded Accounts for Evaluation (Seed)

| Profile | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **👑 ORGANIZER** | Carlos Organizador | `organizador@eliteingressos.com` | `123456` | Create/edit events, import from TMDb/Ticketmaster, view metrics |
| **👤 CLIENT** | Ana Cliente | `cliente1@eliteingressos.com` | `123456` | Purchase tickets, cancel reservations, view QR Codes, share links |
| **👤 CLIENT** | Bruno Cliente | `cliente2@eliteingressos.com` | `123456` | Test simultaneous purchase concurrency |
| **🚪 GATEKEEPER** | Roberto Portaria | `portaria@eliteingressos.com` | `123456` | Validate tickets via camera and manual code entry |

## 🔐 Environment Variables Configuration

### Back-End (`backend/.env`)
| Variable | Description | Example / Local Default |
| :--- | :--- | :--- |
| `PORT` | Express server port | `3001` |
| `NODE_ENV` | Execution environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) | `postgresql://postgres:password123@localhost:5432/desafio_elite_dev?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super-secret-desafio-elite-dev-jwt-key` |
| `QR_SECRET` | Secret key for HMAC cryptographic signing of QR Codes | `super-secret-hmac-qr-signing-key` |
| `TMDB_API_KEY` | The Movie Database API Key (Optional - includes fallback) | *(Optional)* |
| `TICKETMASTER_API_KEY` | Ticketmaster API Key (Optional - includes fallback) | *(Optional)* |

### Front-End (`frontend/.env.local`)
| Variable | Description | Example / Local Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Back-End API base URL | `http://localhost:3001` |

## 🗄️ Database Modeling & Entity Relationship Diagram (ERD)

The relational database schema designed in PostgreSQL using Prisma ORM:

```mermaid
erDiagram
    USER ||--o{ EVENT : "organizes (1:N)"
    USER ||--o{ RESERVATION : "makes (1:N)"
    EVENT ||--o{ RESERVATION : "has (1:N)"
    EVENT ||--o{ TICKET : "belongs_to (1:N)"
    RESERVATION ||--|| PAYMENT : "generates (1:1)"
    RESERVATION ||--o{ TICKET : "issues (1:N)"

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

### Cardinalities & Integrity Rules:
1. **User (1) ➔ (N) Event**: An `ORGANIZER` user can create and manage multiple events.
2. **User (1) ➔ (N) Reservation**: A `CLIENT` user can make multiple purchases and reservations over time.
3. **Event (1) ➔ (N) Reservation**: An event receives reservations from different buyers up to its capacity limit.
4. **Reservation (1) ➔ (1) Payment**: Each reservation attempt has exactly one associated simulated payment record (`APPROVED` or `REFUSED`).
5. **Reservation (1) ➔ (N) Ticket**: An approved reservation issues $N$ individual tickets corresponding to the purchased quantity.
6. **Event (1) ➔ (N) Ticket**: Each ticket is directly associated with the event it grants access to.

## 📦 Back-End Details

### Back-End Folder Structure
```text
backend/
├── prisma/
│   ├── schema.prisma           # Data models, enums, and indexes
│   └── seed.ts                 # Full seed with 4 profiles, 8 events, and Unsplash covers
├── src/
│   ├── config/                 # Prisma Client, environment variables (Zod)
│   ├── controllers/            # Decoupled REST controllers
│   ├── middlewares/            # JWT Auth, Role Guard (RBAC), Schema Validation, Error Handler
│   ├── repositories/           # Data access and Prisma ACID Atomic Transactions
│   ├── routes/                 # REST routes organized by domain
│   ├── schemas/                # Zod validation schemas (Input and Queries)
│   ├── services/               # Business logic, inventory calculation, and external API integration
│   ├── utils/                  # HMAC-SHA256 signing, AppError, and generators
│   ├── app.ts                  # Express and CORS configuration
│   └── server.ts               # HTTP server bootstrap
├── tests/                      # Automated test suite with Vitest
└── package.json
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration (`ORGANIZER`, `CLIENT`, `GATEKEEPER`);
- `POST /api/auth/login` - Authentication and JWT Bearer Token generation;
- `GET /api/auth/me` - Authenticated profile information retrieval.

#### 🌐 External Catalog (`/api/catalog`)
- `GET /api/catalog/search?query=coldplay&type=ALL` - Search TMDb and Ticketmaster with automatic fallback.

#### 🎭 Events (`/api/events`)
- `GET /api/events` - Public listing of published events (with search, filters, and pagination);
- `GET /api/events/:id` - Details of a specific event;
- `GET /api/events/organizer/my-events` - Events created by the authenticated organizer (`ORGANIZER`);
- `POST /api/events` - Event creation (`ORGANIZER`);
- `PUT /api/events/:id` - Event editing by the owner organizer (`ORGANIZER`).

#### 💳 Reservations, Simulated Payment & Cancellation (`/api/reservations`)
- `POST /api/reservations` - Purchase with atomic transaction and payment simulation (`APPROVED` or `REFUSED`) (`CLIENT`);
- `GET /api/reservations/my-reservations` - Complete order history for the client (`CLIENT`);
- `GET /api/reservations/:id` - Details of a specific reservation (`CLIENT`);
- `PATCH /api/reservations/:id/cancel` - Reservation cancellation with safe ticket refund and inventory restock (`CLIENT`).

#### 🎟️ Tickets, Secure Sharing & Gatekeeper (`/api/tickets`)
- `GET /api/tickets/my-tickets` - Full tickets of the authenticated client with Base64 QR Code (`CLIENT`);
- `GET /api/tickets/share/:shareToken` - Public voucher lookup via link (returns presentation data only without exposing `code`, `qrSignature`, or `qrCodeUrl`);
- `POST /api/tickets/validate` - Gatekeeper validation via camera/code (`GATEKEEPER`).

## 🎨 Front-End Details

### Front-End Folder Structure
```text
frontend/
├── src/
│   ├── app/                                # Next.js Routes and Pages (App Router)
│   │   ├── layout.tsx                      # Root layout (Navbar, Footer, Solid Dark Theme)
│   │   ├── page.tsx                        # Public Showcase with Search and Filters
│   │   ├── login/page.tsx                  # Login with 1-click quick-fill shortcuts
│   │   ├── register/page.tsx               # Registration with role selection
│   │   ├── events/[id]/page.tsx            # Event Details & Simulated Checkout
│   │   ├── my-tickets/page.tsx             # Client Area (Panoramic Cards with QR Code and Grayscale)
│   │   ├── my-reservations/page.tsx        # Order History and Cancellation with Modal
│   │   ├── tickets/share/[shareToken]/     # Official Ticket Voucher / Attendance Confirmation
│   │   ├── organizer/events/page.tsx       # Metrics Dashboard & Organizer Management
│   │   ├── organizer/events/new/page.tsx   # Creation Assistant with TMDb & Ticketmaster
│   │   └── gatekeeper/validate/page.tsx    # Gatekeeper Validator (Live Camera & Manual Entry)
│   ├── components/
│   │   ├── layout/                         # Structural Components (Navbar, Footer)
│   │   └── ui/                             # Solid Design System (Button, Input, Dot Badge, Modal)
│   ├── services/
│   │   └── api.ts                          # Typed HTTP client with automatic Bearer Token injection
│   ├── stores/
│   │   └── authStore.ts                    # Global Authentication State (Zustand with hydration)
│   ├── types/
│   │   └── index.ts                        # Complete TypeScript typings
│   └── utils/
│       ├── cn.ts                           # Tailwind conditional class utility
│       ├── constants.ts                    # Default cover images and fallbacks
│       └── formatters.ts                   # Currency (BRL), date, and badge formatters
├── __tests__/                              # Automated unit and component tests
└── package.json
```

### Front-End Features
1. **Showcase & Smart Search (`/`)**: Dynamic filters by type (`All`, `Concerts`, `Movies`), debounced search, and pagination;
2. **Simulated Checkout with Overbooking Prevention (`/events/[id]`)**: Ticket quantity selection and choice between `Approve Payment` or `Decline Payment`;
3. **Real-Time Cancellation with Restock (`/my-reservations`)**: Cancellation button for confirmed reservations with safe confirmation modal and instant update;
4. **Digital Tickets with QR Code (`/my-tickets`)**: Base64 Data URL QR Codes on authenticated accounts, share link copy button, and grayscale rendering for canceled tickets;
5. **Public Ticket Voucher (`/tickets/share/[shareToken]`)**: Secure public access without login confirming ownership (without exposing QR Code or entry secrets);
6. **Smart Catalog Assistant (`/organizer/events/new`)**: Search on external movie and music APIs for auto-completion;
7. **Gatekeeper Validation (`/gatekeeper/validate`)**: Optical reader via camera (`html5-qrcode`) and manual code typing.

## 🚀 How to Run the Project Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)

### 2. Setting Up and Starting the Back-End

1. Open a terminal and clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/desafio-elite-dev.git
   cd desafio-elite-dev/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the example file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*.

4. Start the database via Docker:
   ```bash
   docker compose up -d
   ```

5. Run migrations and initial seed:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

6. Start the API server:
   ```bash
   npm run dev
   ```
   The API will run at: `http://localhost:3001` (Healthcheck: `http://localhost:3001/health`).

### 3. Setting Up and Starting the Front-End

1. Open a **second terminal** and navigate to the frontend folder:
   ```bash
   cd desafio-elite-dev/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env.local`)*.

4. Start Next.js:
   ```bash
   npm run dev
   ```
   Open the application in your browser: **[http://localhost:3000](http://localhost:3000)**.

## 🧪 Running Automated Tests

The project includes **42 automated tests** covering services, security, repositories, API endpoints, contract tests, and UI components:

- **Run all tests (Monorepo)**:
  ```bash
  npm test
  ```

- **Back-End tests only (25 tests)**:
  ```bash
  cd backend
  npm test
  ```

- **Front-End tests only (17 tests)**:
  ```bash
  cd frontend
  npm test
  ```

## 🔮 Future Implementations & Roadmap

- **Visual Seat Map (Interactive Seat Selector)**: Evolving from the current numerical capacity model to support a numbered seat matrix (e.g., cinema halls and theaters with rows/columns), integrating temporary holds with automatic expiration (optimistic locking via WebSocket/Redis);
- **Continuous Design Refinement & Micro-Interactions**: Expanding the modular design system (*Bento Grid*) with richer transition animations and customizable theme support for event organizers.
