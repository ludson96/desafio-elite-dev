# 🧠 Registro de Decisões de Arquitetura e Engenharia (ADR / DECISIONS)

Este documento detalha **todas as decisões técnicas, arquiteturais e de negócio** tomadas durante o desenvolvimento do backend da Plataforma de Eventos e Ingressos do **Desafio Elite Dev (Verzel)**, justificando cada escolha, o que foi descartado e como os requisitos do desafio foram atendidos.

---

## 📑 Sumário Executivo

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Escolha e Justificativa da Stack](#2-escolha-e-justificativa-da-stack)
3. [Decisões de Modelagem de Banco de Dados](#3-decisões-de-modelagem-de-banco-de-dados)
4. [Módulos Implementados e Decisões de Negócio](#4-módulos-implementados-e-decisões-de-negócio)
5. [Segurança e Prevenção de Fraudes](#5-segurança-e-prevenção-de-fraudes)
6. [Resolução de Concorrência e Overbooking](#6-resolução-de-concorrência-e-overbooking)
7. [O que foi descartado / Evitado](#7-o-que-foi-descartado--evitado)
8. [Uso de Ferramentas de IA](#8-uso-de-ferramentas-de-ia)

---

## 1. Visão Geral da Arquitetura

Optamos pelo padrão **Layered Architecture (Arquitetura em Camadas)** com fluxo unidirecional estrito:

$$\text{Routes} \longrightarrow \text{Middlewares} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Repositories} \longrightarrow \text{Prisma / PostgreSQL}$$

### Por que essa estrutura?
- **Desacoplamento real**: A camada de regras de negócio (`services`) não sabe o que é Express (`req`/`res`). Isso permite testar services de forma isolada através de injeção de dependência (`constructor(private repo = defaultRepo)`).
- **Isolamento de Persistência (`repositories`)**: Encapsula qualquer chamada do Prisma ORM. Se o ORM for trocado, apenas o repositório é modificado.
- **Validação Antecipada (`middlewares/validate.middleware.ts`)**: Nenhuma requisição com dados inválidos chega ao Controller ou Service. O Zod rejeita no portão de entrada com HTTP 400.

---

## 2. Escolha e Justificativa da Stack

### Node.js 20+ com TypeScript (ESM Nativo)
- **Por quê?** Tipagem estática fim a fim com TypeScript em modo ESM (`"type": "module"`), permitindo autocomplete completo e segurança em tempo de compilação sem necessidade de transpilação pesada para CJS.

### Express 5
- **Por quê?** A versão 5 do Express traz suporte nativo a rotas assíncronas (tratando promises rejeitadas sem travar o event-loop) e robustez consagrada no ecossistema Node.js.

### Prisma ORM 7 + Driver Adapter (`@prisma/adapter-pg`)
- **Por quê?** O Prisma 7 é a versão mais moderna do ORM, utilizando driver adapters nativos para conexões PostgreSQL via TCP pool de alta performance. Garante schemas declarativos, migrações versionadas automatizadas e geração estática de tipos.
- **Por que não Sequelize?** O Sequelize possui tipagem TypeScript deficiente, sintaxe verbosa para queries e migrations manuais propensas a erro.

### Zod (v4)
- **Por quê?** Validação declarativa no nível de schemas com inferência automática de tipos (`z.infer<typeof schema>`). Eliminamos código duplicado entre tipagens TypeScript e validações em runtime.

### Helmet & CORS
- **Por quê?** `helmet` adiciona cabeçalhos HTTP padrão de segurança (*OWASP*), prevenindo ataques de Clickjacking, MIME sniffing e escondendo o cabeçalho `X-Powered-By: Express`.

---

## 3. Decisões de Modelagem de Banco de Dados

### Formato Pista (Disponibilidade por Capacidade)
- **Decisão**: Modelamos os eventos utilizando controle de estoque numérico (`capacity` e `availableTickets`), garantindo suporte fluido a grandes quantidades de ingressos por compra.
- **Por quê?** Atende de forma objetiva ao requisito do desafio, priorizando a garantia de concorrência atômica antes de adicionar complexidade de matriz de assentos.

### Enums Centralizados
Criamos enums nativos no PostgreSQL via Prisma para evitar estados inconsistentes:
- `UserRole`: `ORGANIZER`, `CLIENT`, `GATEKEEPER`
- `EventType`: `SHOW`, `MOVIE`
- `EventStatus`: `DRAFT`, `PUBLISHED`, `CANCELED`, `FINISHED`
- `ReservationStatus`: `PENDING`, `CONFIRMED`, `CANCELED`, `REFUSED`
- `PaymentStatus`: `PENDING`, `APPROVED`, `REFUSED`
- `TicketStatus`: `ACTIVE`, `USED`, `CANCELED`

---

## 4. Módulos Implementados e Decisões de Negócio

### 🔐 Módulo 1: Autenticação & Usuários (`/api/auth`)
- **Papéis Distintos (RBAC)**: Autenticação JWT com middleware `ensureRole(['ORGANIZER'])`, `ensureRole(['CLIENT'])` e `ensureRole(['GATEKEEPER'])`.
- **Senhas**: Hasheadas com `bcryptjs` (salt rounds = 10).
- **Endpoints**:
  - `POST /api/auth/register`: Cadastro de usuários com validação de unicidade de e-mail.
  - `POST /api/auth/login`: Autenticação e geração de token JWT de 7 dias.
  - `GET /api/auth/me`: Retorno do perfil logado a partir do token.

### 🎬 Módulo 2: Catálogo Externo (`/api/catalog`)
- **Integração Real + Fallback de Alta Fidelidade**:
  - Integração com **TMDb** (filmes) e **Ticketmaster** (shows).
  - Caso as chaves de API não estejam preenchidas no `.env`, a API recorre de forma transparente ao `src/constants/demoCatalog.ts`.
  - **Decisão**: A extração de dados estáticos para `src/constants/` manteve o arquivo de serviço (`externalCatalog.service.ts`) 100% focado em lógica de negócio, sem poluição visual.

### 🎪 Módulo 3: Gestão de Eventos (`/api/events`)
- **Regras de Negócio**:
  - Validação para impedir criação ou edição de eventos com datas no passado.
  - Apenas organizadores autenticados podem criar eventos.
  - Um organizador só pode editar eventos dos quais seja o criador legítimo (`event.organizerId === req.user.id`).
  - Listagem pública com paginação e busca textual flexível (`contains` case-insensitive em título, descrição, local e categoria).

### 🎟️ Módulo 4: Reservas & Checkout Simulado (`/api/reservations`)
- **Pagamento Simulado Realista**: O schema aceita `paymentStatus: 'APPROVED' | 'REFUSED'`, cumprindo o requisito de simular tanto cenários de sucesso quanto de falha de pagamento.
- **Cenário APROVADO**: Executa transação atômica, debita o estoque e emite os ingressos com assinatura digital.
- **Cenário RECUSADO**: Grava a tentativa como recusada, não emite nenhum ingresso e mantém o estoque intacto.

### 🚪 Módulo 5: Ingressos, Compartilhamento & Validação de Portaria (`/api/tickets`)
- **Área do Cliente (`GET /api/tickets/my-tickets`)**: Retorna os ingressos com a imagem do QR Code gerada em Base64 Data URL (`qrCodeUrl`) para renderização direta sem requisições adicionais.
- **Link Público (`GET /api/tickets/share/:shareToken`)**: Permite que o cliente compartilhe um ingresso específico via URL com token UUID randômico, sem expor os outros ingressos de sua conta.
- **Validação de Portaria (`POST /api/tickets/validate`)**:
  - Aceita leitura óptica via câmera (JSON do QR) ou digitação manual do código.
  - Retornos claros conforme o PDF:
    1. **`VALID`**: Entrada autorizada, ingresso marcado como utilizado;
    2. **`ALREADY_USED`**: Ingresso já validado anteriormente, informando a data/hora exata do uso;
    3. **`WRONG_EVENT`**: Ingresso válido, mas emitido para outro evento diferente do qual a portaria está controlando;
    4. **`INVALID`**: Código inexistente ou assinatura adulterada.

---

## 5. Segurança e Prevenção de Fraudes

### Assinatura Criptográfica HMAC-SHA256
Para garantir que o código do ingresso não possa ser forjado por um usuário mal-intencionado alterando o texto do QR Code:
1. Ao emitir o ingresso, o backend gera um hash HMAC:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{ticketCode} + ":" + \text{eventId}, \text{QR\_SECRET})$$
2. O QR Code armazena o payload `{ code, eventId, sig }`.
3. Na portaria, o backend valida a assinatura utilizando `crypto.timingSafeEqual` para mitigar ataques de temporização (*Timing Attacks*).

---

## 6. Resolução de Concorrência e Overbooking

Um dos maiores desafios em sistemas de ingressos é garantir que o mesmo ingresso/vaga não seja vendido duas vezes se múltiplos usuários finalizarem o pagamento no mesmo instante.

### Solução Adotada:
1. **Transação Atômica ACID** com `prisma.$transaction`.
2. **Atualização Condicional Atômica**:
   ```typescript
   await tx.event.updateMany({
     where: {
       id: eventId,
       availableTickets: { gte: quantity } // Condição atômica no banco de dados
     },
     data: {
       availableTickets: { decrement: quantity }
     }
   });
   ```
3. Se `count === 0`, a transação é abortada e uma exceção `409 Conflict` ("Ingressos esgotados") é retornada imediatamente.
4. Na portaria, a transição para `USED` utiliza o mesmo princípio (`updateMany where: { id, status: 'ACTIVE' }`), impedindo que duas catracas liberem o mesmo ingresso simultaneamente.

---

## 7. O que foi descartado / Evitado

| Item | Motivo do Descarte |
| :--- | :--- |
| **Sistemas de fila pesados (RabbitMQ/Redis/BullMQ)** | Desnecessário para o escopo do desafio. O controle transacional no PostgreSQL resolve concorrência com simplicidade e zero overhead de infraestrutura. |
| **Gateway de pagamento real (Stripe/Pagar.me)** | O desafio solicitou explicitamente cobrança simulada. Usar um gateway real adicionaria complexidade de webhooks sem ganho didático. |
| **Envio de e-mails / PDF anexo** | Dispensado explicitamente na página 4 do enunciado ("Não precisa fazer: envio de ingresso por e-mail"). Focamos na experiência via Link de Compartilhamento e QR Code na tela. |

---

## 8. Uso de Ferramentas de IA

Em total conformidade com a seção *"Uso de IA"* da página 5 do PDF do desafio:
- **Ferramentas utilizadas**: Pair Programming assistido por IA (Antigravity IDE / Google Gemini).
- **Como foi conduzido**: O desenvolvimento seguiu um fluxo estritamente guiado passo a passo (*Top-Down: Route ➔ Controller ➔ Service ➔ Repository ➔ Database*), com validação manual de cada arquivo, separação de interfaces e constantes, e refatorações conscientes para garantir que a arquitetura representasse decisões de engenharia sólidas e autênticas.
