# 🧠 Decisões de Arquitetura e Engenharia - Front-End

> Este documento detalha a arquitetura, padrões e decisões técnicas adotadas no desenvolvimento do **Front-End** da plataforma **Elite Ingressos** (Desafio Técnico Elite Dev da Verzel).

A *stack* foi composta predominantemente por tecnologias com as quais já possuo sólida familiaridade, com exceção de bibliotecas pontuais como `clsx`, `html5-qrcode` e o próprio Vitest para testes de componentes. Considerando que o Jest tem se tornado cada vez mais lento e verboso em ecossistemas Next.js/React modernos, este projeto representou uma excelente oportunidade para me aprofundar e consolidar o uso prático do Vitest e de bibliotecas especializadas de interface.

A utilização da IA atuou como uma extensão de produtividade (*Pair Programming* assistido por IA) para acelerar as entregas dentro do prazo proposto. Todo o código gerado passou por análise criteriosa, validação de tipos e testes antes de ser integrado, evitando qualquer aceitação passiva. Dessa forma, foi possível agilizar a construção das funcionalidades em que já possuía domínio prévio e dedicar maior foco ao aprendizado e à implementação de bibliotecas com as quais tinha menos afinidade, como `html5-qrcode` (leitor de QR Code), Zustand e Vitest.

Em relação ao design visual, fiz alguns testes iniciais com o [Google Stitch](https://stitch.withgoogle.com/), mas achei as telas geradas muito padronizadas e com aquela cara artificial típica de IA. Por isso, preferi seguir com uma interface mais sóbria e funcional, utilizando o estilo *Bento Grid / Modular UI* (parecido com o que o Notion e a Linear usam), focando em clareza, usabilidade e uma boa experiência de uso, com espaço para refinar e evoluir o visual conforme a disponibilidade de tempo.

## 1. Stack Tecnológica e Racional de Escolha

### 1.1 Next.js 15+ com App Router
- **Decisão**: Utilização do Next.js com App Router em vez de React SPA tradicional (Vite).
- **Racional**:
  - **Otimização de Carregamento & SEO**: Renderização rápida das páginas públicas (Vitrine e Ingressos Compartilhados);
  - **Roteamento Baseado em Arquivos**: Organização modular e intuitiva das rotas (`/events/[id]`, `/tickets/share/[shareToken]`, `/organizer/events`, `/gatekeeper/validate`);
  - **Compatibilidade com Next Image**: Componente `<Image />` oficial configurado com `remotePatterns` para suporte otimizado às imagens do TMDb, Ticketmaster e Unsplash sem riscos de travamento de domínio.

### 1.2 Zustand para Gerenciamento de Estado Global
- **Decisão**: Adoção do **Zustand** com middleware `persist` em vez de Redux Toolkit ou Context API puro.
- **Racional**:
  - **Boilerplate Mínimo**: Sem necessidade de *reducers*, *actions* complexas ou *providers* encadeados na árvore de componentes;
  - **Persistência Transparente**: O token JWT e os dados do usuário logado são mantidos no `localStorage` sob a chave `'elite-ingressos-auth-storage'`;
  - **Segurança na Hidratação (SSR/Client)**: Implementado o estado `isHydrated` com o callback `onRehydrateStorage` para eliminar divergências de hidratação (*hydration mismatch*) no Next.js.

### 1.3 TailwindCSS v4 com Design System Sólido (*Anti-AI Slop*)
- **Decisão**: Design system escuro minimalista, com componentes neutros e sólidos em substituição a vidros coloridos fluorescentes (*glassmorphism exagerado*).
- **Racional**:
  - **Estética Sóbria e Profissional**: Badges sólidas com pontos indicadores coloridos (*dots* de status), alertas em fundo escuro (`bg-zinc-950 border-rose-900/60`) e botões com `cursor: pointer` nativo;
  - **Utilitário `cn` (`clsx` + `tailwind-merge`)**: Garante combinação segura de classes condicionais e substituição de classes de layout sem conflitos de especificidade.

## 2. Camadas Arquiteturais e Separação de Módulos

O frontend foi concebido e implementado em **4 camadas bem definidas**:

```
┌─────────────────────────────────────────────────────────────┐
│  Camada 4: Módulos de Telas & Páginas (src/app/*)           │
│  - Vitrine, Checkout, Meus Ingressos, Painel, Portaria      │
├─────────────────────────────────────────────────────────────┤
│  Camada 3: Design System & Layout (src/components/*)         │
│  - UI: Button, Input, Modal, Badge com dot                  │
│  - Layout: Navbar, Footer                                   │
├─────────────────────────────────────────────────────────────┤
│  Camada 2: Estado Global & API (src/stores & src/services)   │
│  - authStore.ts (Zustand com persistência segura)           │
│  - api.ts (apiFetch, authApi, eventsApi, ticketsApi...)      │
│  - formatters.ts (formatCurrency, formatDateTime, Badges)    │
├─────────────────────────────────────────────────────────────┤
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

### 3.3 Experiência do Avaliador (Atalhos de Login Rápido)
- Na tela de login (`/login`), foram incluídos botões de **preenchimento com 1 clique** para os perfis pré-cadastrados no seed do banco (`Cliente`, `Organizador`, `Portaria`), acelerando os testes da banca avaliadora.

### 3.4 Compartilhamento Público de Ingressos (`/tickets/share/[shareToken]`)
- Rota pública dinâmica que permite a qualquer portador do link visualizar o ingresso com design de ticket digital e QR Code autenticado;
- Mantém privacidade (não expõe dados sensíveis do comprador) e valida a autenticidade criptográfica.

### 3.5 Assistente de Catálogo Inteligente (`/organizer/events/new`)
- Integração direta com os endpoints do backend (`/api/catalog/search`) para importar dados do **The Movie Database (TMDb)** e **Ticketmaster**, preenchendo automaticamente pôster, sinopse e categoria no formulário de criação de eventos.

### 3.6 Leitor de Portaria com Câmera e Digitação Manual (`/gatekeeper/validate`)
- Utilização da biblioteca `html5-qrcode` para ler códigos diretamente da câmera do dispositivo;
- Fallback para digitação manual do código legível (`TKT-...`);
- Exibição imediata dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.

## 4. Testes Automatizados e Qualidade
- **Testes Unitários & Componentes**: Implementados com Vitest e React Testing Library cobrindo `authStore`, formatadores semânticos e componentes de UI (`Badge`, `Button`, `Input`);
- **TypeScript**: 100% tipado com `strict: true` e zero erros de compilação no build do Next.js.
