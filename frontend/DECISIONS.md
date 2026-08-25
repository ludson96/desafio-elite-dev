# 🎯 Registro de Decisões de Engenharia — Front-End

Este documento registra as decisões arquiteturais, padrões de código, bibliotecas e soluções de interface adotadas no front-end do projeto **Elite Ingressos**.

## 1. Visão Geral da Arquitetura de UI/UX

Buscamos construir uma interface **minimalista, sóbria, rápida e acessível**, priorizando uma experiência de usuário (UX) clara e sem ruídos visuais desnecessários.

### Pilares de Design:
- **Design System Sólido**: Adotamos cartões escuros sólidos (`zinc-900`/`zinc-950`), bordas nítidas (`zinc-800`), tipografia limpa e *badges* semânticas com indicador de ponto (*dot*);
- **Arquitetura Modular em Camadas**: Separação estrita entre Páginas do App Router (`src/app`), Componentes Base (`src/components/ui`), Camada de API (`src/services/api.ts`), Estado Global (`src/stores`) e Utilitários (`src/utils`).

## 2. Diagrama de Camadas da Aplicação

```text
┌─────────────────────────────────────────────────────────────┐
│  Camada 4: Páginas do App Router (src/app)                  │
│  - Vitrine, Checkout, Meus Ingressos, Portaria, Gestão      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Consome
┌──────────────────────────────▼──────────────────────────────┐
│  Camada 3: Componentes de UI Modulares (src/components)     │
│  - Button, Input, Badge com dot, Modal, Navbar, Footer      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Consome
┌──────────────────────────────▼──────────────────────────────┐
│  Camada 2: Estado Global & API (src/stores & src/services)   │
│  - authStore.ts (Zustand com persistência segura)           │
│  - api.ts (apiFetch, authApi, eventsApi, ticketsApi...)      │
│  - formatters.ts (formatCurrency, formatDateTime, Badges)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Tipado por
┌──────────────────────────────▼──────────────────────────────┐
│  Camada 1: Configuração Base & Tipos (src/types & env)       │
│  - Tipagens TypeScript completas espelhando o Prisma Schema  │
└─────────────────────────────────────────────────────────────┘
```

## 3. Principais Decisões por Fluxo Funcional

### 3.1 Camada de Comunicação com a API (`src/services/api.ts`)
- Wrapper central `apiFetch<T>` que obtém o token JWT diretamente do `useAuthStore.getState().token` quando a flag `requiresAuth: true` está presente;
- Tratamento padronizado de exceções: formata mensagens amigáveis retornadas pelo backend (`data?.message || data?.error`).

### 3.2 Simulação de Pagamento & Concorrência no Checkout (`/events/[id]`)
- O modal de checkout permite simular explicitamente os dois cenários:
  - **`APPROVED`**: Dispara a transação atômica no PostgreSQL com decremento seguro de estoque e emissão de tickets com assinatura HMAC, redirecionando para **Meus Ingressos**;
  - **`REFUSED`**: Simula recusa da operadora bancária sem debitar estoque, redirecionando diretamente para **Minhas Compras & Reservas** com status `RECUSADO`;
- Captura de erro HTTP 409 caso o evento esgote simultaneamente.

### 3.3 Fluxo de Cancelamento & Estorno ao Estoque (`/my-reservations`)
- Em *Minhas Compras*, o usuário pode cancelar reservas confirmadas através de um modal seguro de confirmação;
- A UI atualiza o estado local imediatamente para `CANCELADO`, informando que os ingressos foram estornados;
- Em *Meus Ingressos* (`/my-tickets`) e na página pública de compartilhamento (`/tickets/share/[shareToken]`), os ingressos cancelados passam a ser renderizados **em preto e branco (`grayscale`) e com opacidade reduzida**, código riscado e bloqueio total da exibição do QR Code, reforçando visualmente a invalidação.

### 3.4 Experiência do Avaliador (Atalhos de Login Rápido)
- Na tela de login (`/login`), foram incluídos botões de **preenchimento com 1 clique** para os perfis pré-cadastrados no seed do banco (`Cliente`, `Organizador`, `Portaria`), acelerando os testes da banca avaliadora.

### 3.5 Compartilhamento Público de Ingressos (`/tickets/share/[shareToken]`)
- Rota pública dinâmica que permite a qualquer portador do link visualizar o ingresso com design de ticket digital e QR Code autenticado;
- Mantém privacidade (não expõe dados sensíveis do comprador) e valida a autenticidade criptográfica.

### 3.6 Assistente de Catálogo Inteligente (`/organizer/events/new`)
- Integração direta com os endpoints do backend (`/api/catalog/search`) para importar dados do **The Movie Database (TMDb)** e **Ticketmaster**, preenchendo automaticamente pôster, sinopse e categoria no formulário de criação de eventos.

### 3.7 Leitor de Portaria com Câmera e Digitação Manual (`/gatekeeper/validate`)
- Utilização da biblioteca `html5-qrcode` para ler códigos diretamente da câmera do dispositivo;
- Fallback para digitação manual do código legível (`TKT-...`);
- Exibição imediata dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.

## 4. Testes Automatizados e Qualidade
- **Testes Unitários & Componentes**: Implementados com Vitest e React Testing Library cobrindo `authStore`, formatadores semânticos e componentes de UI (`Badge`, `Button`, `Input`);
- **TypeScript**: 100% tipado com `strict: true` e zero erros de compilação no build do Next.js.
