# 🧠 Decisões de Arquitetura e Engenharia - Backend

> Este documento registra os fundamentos técnicos, padrões arquiteturais e decisões de engenharia adotados no desenvolvimento da API do **Elite Ingressos** (Desafio Técnico Elite Dev da Verzel).

Iniciei o projeto realizando uma etapa de planejamento colaborativo em conjunto com ferramentas de Inteligência Artificial (ChatGPT, Google Gemini e Antigravity IDE). Nessa fase inicial, foram levantados todos os requisitos técnicos, analisadas as possibilidades de implementação e avaliados modelos de referência. A partir desse levantamento, estruturei a aplicação de forma modular, conforme detalhado nas seções seguintes. A *stack* foi composta predominantemente por tecnologias com as quais já possuo sólida familiaridade, com exceção do Prisma ORM e do Vitest. Considerando que o Sequelize e o Jest têm se tornado cada vez mais defasados e lentos em comparação às ferramentas modernas para Node.js e TypeScript, este projeto representou uma excelente oportunidade para me aprofundar e consolidar o uso prático de ambas as tecnologias.

A utilização da IA atuou como uma extensão de produtividade (*Pair Programming* assistido por IA) para acelerar entregas dentro do prazo proposto. A maior parte do desenvolvimento foi conduzida de forma prática (*hands-on*). A IA teve maior protagonismo na geração e assinatura criptográfica dos QR Codes, área com a qual ainda não possuía experiência prévia, funcionando como consulta técnica direta e contextualizada. Todo o código gerado passou por análise criteriosa, validação de tipos e testes antes de ser integrado, evitando qualquer aceitação passiva.

## 1. Arquitetura em Camadas (*Clean Architecture* Adaptada)

Optei por uma arquitetura em camadas bem delimitadas com responsabilidade única:

```
[ HTTP Request ]
       │
       ▼
[ Routes & Middlewares ]  (Express Router + JWT + RBAC + Validação Zod)
       │
       ▼
[ Controllers ]           (Extrai DTOs, chama Services, devolve Status HTTP)
       │
       ▼
[ Services ]              (Regras de Negócio, Transações ACID, HMAC, Overbooking)
       │
       ▼
[ Repositories ]          (Abstração e isolamento das queries do Prisma ORM)
       │
       ▼
[ PostgreSQL Database ]   (Modelagem Relacional com Enums Nativos)
```

### Por que essa divisão?
1. **Testabilidade Real**: Permite testar Services isoladamente através de injeção de dependência dos Repositories (sem depender de conexões com o banco de dados);
2. **Desacoplamento**: Se o ORM ou banco de dados mudar no futuro, apenas a camada de `repositories/` precisa ser ajustada;
3. **Legibilidade e Manutenção**: Controllers permanecem enxutos, focados apenas na interface HTTP.

## 2. Racional das Tecnologias Escolhidas

### Express 5
- **Por quê?** A versão 5 do Express traz suporte nativo a rotas assíncronas (tratando promises rejeitadas sem travar o event-loop) e robustez consagrada no ecossistema Node.js.

### Prisma ORM 7 + Driver Adapter (`@prisma/adapter-pg`)
- **Por quê?** O Prisma 7 é a versão mais moderna do ORM, utilizando driver adapters nativos para conexões PostgreSQL via pool de alta performance. Garante schemas declarativos, migrações versionadas automatizadas e geração estática de tipos.
- **Por que não Sequelize?** O Sequelize possui tipagem TypeScript deficiente, sintaxe verbosa para queries e migrations manuais propensas a erro.

### Zod (v4)
- **Por quê?** Validação declarativa no nível de schemas com inferência automática de tipos (`z.infer<typeof schema>`). Eliminamos código duplicado entre tipagens TypeScript e validações em runtime.

### Helmet & CORS
- **Por quê?** `helmet` adiciona cabeçalhos HTTP padrão de segurança (*OWASP*), prevenindo ataques de Clickjacking, MIME sniffing e escondendo o cabeçalho `X-Powered-By: Express`.

## 3. Decisões de Modelagem de Banco de Dados

### Formato Pista (Disponibilidade por Capacidade)
- **Decisão**: Os eventos foram modelados utilizando controle de estoque numérico (`capacity` e `availableTickets`), garantindo suporte fluido a grandes quantidades de ingressos por compra.
- **Por quê?** Atende de forma objetiva ao requisito do desafio, priorizando a garantia de concorrência atômica antes de adicionar complexidade de matriz de assentos.

### Enums Centralizados
Foram criados enums nativos no PostgreSQL via Prisma para evitar estados inconsistentes:
- `UserRole`: `ORGANIZER`, `CLIENT`, `GATEKEEPER`
- `EventType`: `SHOW`, `MOVIE`
- `EventStatus`: `DRAFT`, `PUBLISHED`, `CANCELED`, `FINISHED`
- `ReservationStatus`: `PENDING`, `CONFIRMED`, `CANCELED`, `REFUSED`
- `PaymentStatus`: `PENDING`, `APPROVED`, `REFUSED`
- `TicketStatus`: `ACTIVE`, `USED`, `CANCELED`

## 4. Módulos Implementados e Decisões de Negócio

### 🔐 Módulo 1: Autenticação & Usuários (`/api/auth`)
- **Papéis Distintos (RBAC)**: Autenticação JWT com middleware `ensureRole(['ORGANIZER'])`, `ensureRole(['CLIENT'])` e `ensureRole(['GATEKEEPER'])`.
- **Senhas**: Hasheadas com `bcryptjs` (salt rounds = 10).
- **Endpoints**:
  - `POST /api/auth/register`: Cadastro de usuários com validação de unicidade de e-mail.
  - `POST /api/auth/login`: Autenticação e geração de token JWT com validade de 7 dias.
  - `GET /api/auth/me`: Retorno do perfil logado a partir do token.

### 🌐 Módulo 2: Catálogo Externo (`/api/catalog`)
- **Integração Real + Fallback de Alta Fidelidade**:
  - Integração com **TMDb** (filmes) e **Ticketmaster** (shows).
  - Caso as chaves de API não estejam preenchidas no `.env`, a API recorre de forma transparente ao `src/constants/demoCatalog.ts`.
  - **Decisão**: A extração de dados estáticos para `src/constants/` manteve o arquivo de serviço (`externalCatalog.service.ts`) 100% focado em lógica de negócio, sem poluição visual.

### 🎭 Módulo 3: Gestão de Eventos (`/api/events`)
- **Regras de Negócio**:
  - Validação para impedir criação ou edição de eventos com datas no passado.
  - Apenas organizadores autenticados podem criar eventos.
  - Um organizador só pode editar eventos dos quais seja o criador legítimo (`event.organizerId === req.user.id`).
  - Listagem pública com paginação e busca textual flexível (`contains` case-insensitive em título, descrição, local e categoria).

### 💳 Módulo 4: Reservas, Checkout Simulado & Cancelamento Atômico (`/api/reservations`)
- **Pagamento Simulado Realista**: O schema aceita `paymentStatus: 'APPROVED' | 'REFUSED'`, cumprindo o requisito de simular tanto cenários de sucesso quanto de falha de pagamento.
- **Cenário APROVADO**: Executa transação atômica, debita o estoque e emite os ingressos com assinatura digital.
- **Cenário RECUSADO**: Grava a tentativa como recusada, não emite nenhum ingresso e mantém o estoque intacto.
- **Fluxo de Cancelamento (`PATCH /api/reservations/:id/cancel`)**:
  - Permite que o cliente proprietário cancele uma reserva confirmada;
  - Valida se nenhum dos ingressos já foi validado na portaria (`status !== 'USED'`);
  - Executa uma transação atômica no PostgreSQL que marca a reserva e seus ingressos como `CANCELED` e devolve a quantidade exata ao estoque (`availableTickets: { increment: quantity }`).

### 🎟️ Módulo 5: Ingressos, Compartilhamento Seguro & Portaria (`/api/tickets`)
- **Área Autenticada do Cliente (`GET /api/tickets/my-tickets`)**: Retorna os ingressos completos com a imagem do QR Code gerada em Base64 Data URL (`qrCodeUrl`) e código legível para apresentação na portaria.
- **Link Público Seguro (`GET /api/tickets/share/:shareToken`)**: 
  - Permite que o cliente compartilhe um comprovante público de presença/posse via URL com token UUID randômico;
  - **Contrato Estrito de Segurança**: O endpoint expõe apenas dados de apresentação (título do evento, data, local, status e primeiro nome do titular). **Nunca expõe `code`, `qrSignature` nem `qrCodeUrl`**, garantindo que o material criptográfico que autoriza a entrada permaneça exclusivo da conta autenticada do comprador;
  - Protegido por testes de contrato automatizados no Vitest.
- **Validação de Portaria (`POST /api/tickets/validate`)**:
  - Aceita leitura óptica via câmera (JSON do QR) ou digitação manual do código;
  - Validação criptográfica com `crypto.timingSafeEqual` contra ataques de temporização (*timing attacks*);
  - Retornos claros conforme a especificação:
    1. **`VALID`**: Entrada autorizada, ingresso marcado como utilizado;
    2. **`ALREADY_USED`**: Ingresso já validado anteriormente, informando a data/hora exata do uso;
    3. **`WRONG_EVENT`**: Ingresso válido, mas emitido para outro evento diferente do qual a portaria está controlando;
    4. **`INVALID`**: Código inexistente, cancelado ou assinatura adulterada.

## 5. Segurança e Prevenção de Fraudes

### Assinatura Criptográfica HMAC-SHA256
Para garantir que o código do ingresso não possa ser forjado por um usuário mal-intencionado alterando o texto do QR Code:
1. Ao emitir o ingresso, o backend gera um hash HMAC:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{ticketCode} + ":" + \text{eventId}, \text{QR\_SECRET})$$
2. O QR Code armazena o payload `{ code, eventId, sig }`.
3. Na portaria, o backend valida a assinatura utilizando `crypto.timingSafeEqual` para mitigar ataques de temporização (*Timing Attacks*).

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

## 7. O que foi descartado / Evitado

| Item | Motivo do Descarte |
| :--- | :--- |
| **Sistemas de fila pesados (RabbitMQ/Redis/BullMQ)** | Desnecessário para o escopo do desafio. O controle transacional no PostgreSQL resolve concorrência com simplicidade e zero overhead de infraestrutura. |
| **Gateway de pagamento real (Stripe/Pagar.me)** | Implementado apenas cobrança simulada. Usar um gateway real adicionaria complexidade de webhooks sem ganho didático. |
| **Envio de e-mails** | Focamos na experiência moderna via Link de Compartilhamento público e QR Code diretamente na tela. |

## 8. Implementações Futuras

- **Mapa Visual de Assentos (Seat Map Interativo)**: Evolução do modelo atual de capacidade/pista para suporte a matriz de poltronas numeradas (ex.: filas e colunas para salas de cinema e teatros), com reserva temporária (*lock* otimista por WebSocket ou Redis com expiração automática);
- **Melhorias Contínuas de Design e UI/UX**: Refinamento da identidade visual, adição de microinterações mais ricas e expansão do design system modular (*Bento Grid*).
