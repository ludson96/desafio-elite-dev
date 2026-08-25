# 📋 Artefato de Planejamento de Engenharia: Fluxo de Cancelamento & Estorno ao Estoque

> **Contexto de Uso**: Exemplo prático de planejamento técnico prévio (*Plan-First Approach*) adotado durante o desenvolvimento do desafio. Antes de alterar o código do sistema, o plano foi estruturado para validação de regras de negócio, integridade referencial e impactos em ambas as camadas da aplicação.

## 🎯 1. Regras de Negócio & Segurança

1. **Autorização & Propriedade**: Somente o usuário que realizou a reserva (`clientId === req.user.id`) pode cancelá-la;
2. **Status Válido**: Apenas reservas com status `CONFIRMED` e cujos ingressos ainda estejam `ACTIVE` (não utilizados) podem ser canceladas;
3. **Bloqueio Anti-Fraude na Portaria**: Se qualquer ingresso da reserva já tiver sido validado (`status === 'USED'`), o cancelamento é bloqueado com erro amigável (`400 Bad Request`);
4. **Transação Atômica ACID**:
   - Atualiza `Reservation.status = 'CANCELED'`;
   - Atualiza todos os `Ticket.status = 'CANCELED'`;
   - Devolve a quantidade de ingressos ao evento via `Event.availableTickets: { increment: quantity }`;
5. **Comportamento na Portaria**: Se alguém tentar validar um ingresso cancelado na portaria, o sistema retorna `"Este ingresso foi cancelado."`.

## 📁 2. Sequência de Execução Passo a Passo

### 🔹 Passo 1 (Back-End: Repositório)
- **Arquivo**: `backend/src/repositories/reservation.repository.ts`
- **Ação**: Implementar `cancelReservationWithStockRefund(reservationId, eventId, quantity)` com transação atômica do Prisma `$transaction`.

### 🔹 Passo 2 (Back-End: Serviço)
- **Arquivo**: `backend/src/services/reservation.service.ts`
- **Ação**: Implementar `cancelReservation(reservationId, clientId)` contendo as validações de autorização, integridade e verificação de ingressos utilizados.

### 🔹 Passo 3 (Back-End: Controlador & Rotas)
- **Arquivos**:
  - `backend/src/controllers/reservation.controller.ts` (adicionar handler `cancel` com tratamento de exceções);
  - `backend/src/routes/reservation.routes.ts` (registrar rota `PATCH /api/reservations/:id/cancel` protegida para perfil `CLIENT`).

### 🔹 Passo 4 (Back-End: Testes Automatizados)
- **Arquivo**: `backend/tests/reservation.service.test.ts`
- **Ação**: Criar testes unitários para:
  - Cancelamento bem-sucedido com estorno de capacidade;
  - Bloqueio de cancelamento para ingressos já utilizados na portaria;
  - Bloqueio de acesso a compras de outros clientes.

### 🔹 Passo 5 (Front-End: Cliente HTTP Tipado)
- **Arquivo**: `frontend/src/services/api.ts`
- **Ação**: Implementar método `reservationsApi.cancel(id)` com injeção automática de token JWT.

### 🔹 Passo 6 (Front-End: Interface de Minhas Compras & UX Sóbria)
- **Arquivo**: `frontend/src/app/my-reservations/page.tsx`
- **Ação**: Adicionar botão *"Cancelar Reserva"*, modal de confirmação objetivo e banner de feedback minimalista e acessível (*Anti-AI Slop*), garantindo tipagem segura com `instanceof Error`.

### 🔹 Passo 6.1 (Front-End: Tratamento Visual de Ingressos Cancelados)
- **Arquivos**:
  - `frontend/src/app/my-tickets/page.tsx`
  - `frontend/src/app/tickets/share/[shareToken]/page.tsx`
- **Ação**: Renderizar ingressos cancelados em **preto e branco (`grayscale`) e com opacidade reduzida**, código riscado e bloqueio total da exibição do QR Code, reforçando visualmente a invalidação do ticket.

### 🔹 Passo 7 (Sincronização da Documentação)
- **Arquivos**: `backend/README.md`, `backend/DECISIONS.md`, `frontend/README.md`, `frontend/DECISIONS.md` e `README.md` raiz.
- **Ação**: Atualizar endpoints, decisões de concorrência, roteiro de avaliação e métricas de testes automatizados.

## 🧪 3. Plano de Verificação & Qualidade

1. **Testes Unitários e de Integração**: Execução de `npm test` garantindo 100% de aprovação (23 testes no backend + 17 no frontend);
2. **Build de Produção**: `npm run build` no Next.js validando ausência de erros de TypeScript e avisos de lint;
3. **Teste Manual E2E**: Validação do fluxo completo no navegador: Compra ➔ Cancelamento ➔ Estorno ao estoque ➔ Bloqueio em escala de cinza nos ingressos digitais.
