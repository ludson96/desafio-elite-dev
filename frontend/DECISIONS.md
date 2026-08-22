# 🏛️ Front-End Architecture & Technical Decisions (DECISIONS.md)

Este documento detalha a arquitetura, padrões e decisões técnicas adotadas no desenvolvimento do **Front-End** da plataforma **Elite Ingressos** (Desafio Técnico Verzel / Elite Dev).

---

## 1. Stack Tecnológica e Racional de Escolha

### 1.1 Next.js 15+ com App Router
- **Decisão**: Utilização do Next.js com App Router em vez de React SPA tradicional (Vite).
- **Racional**:
  - **Otimização de Carregamento & SEO**: Renderização rápida das páginas públicas (Vitrine e Ingressos Compartilhados);
  - **Roteamento Baseado em Arquivos**: Organização modular e intuitiva das rotas (`/events/[id]`, `/tickets/share/[shareToken]`, `/organizer/events`, `/gatekeeper/validate`);
  - **Compatibilidade com Next Image**: Componente `<Image />` oficial configurado com `remotePatterns` para suporte otimizado às imagens do TMDb, Ticketmaster e Unsplash sem riscos de crash de domínio.

### 1.2 Zustand para Gerenciamento de Estado Global
- **Decisão**: Adoção do **Zustand** com middleware `persist` em vez de Redux Toolkit ou Context API puro.
- **Racional**:
  - **Boilerplate Mínimo**: Sem necessidade de *reducers*, *actions* complexas ou *providers* encadeados na árvore de componentes;
  - **Persistência Transparente**: O token JWT e os dados do usuário logado são mantidos no `localStorage` sob a chave `'elite-ingressos-auth-storage'`;
  - **Segurança na Hidratação (SSR/Client)**: Implementado o estado `isHydrated` com o callback `onRehydrateStorage` para eliminar divergências de hidratação (*hydration mismatch*) no Next.js.

### 1.3 TailwindCSS v4 com Design System Base
- **Decisão**: Uso do TailwindCSS com tema escuro nativo (*Dark Theme* moderno), *glassmorphism* e micro-animações.
- **Racional**:
  - **Estética Premium**: Criação de componentes limpos (`Badge`, `Button`, `Input`, `Modal`) com tokens de cores semânticas consistentes;
  - **Utilitário `cn` (`clsx` + `tailwind-merge`)**: Garante combinação segura de classes condicionais e substituição de classes de layout sem conflitos de especificidade.

---

## 2. Camadas Arquiteturais e Separação de Módulos

O frontend foi concebido e implementado em **4 camadas bem definidas**:

```text
┌─────────────────────────────────────────────────────────────┐
│  Camada 4: Módulos de Telas & Páginas (src/app/*)          │
│  - Vitrine, Checkout, Meus Ingressos, Painel, Portaria     │
├─────────────────────────────────────────────────────────────┤
│  Camada 3: Design System & Layout (src/components/*)        │
│  - UI: Button, Input, Modal, Badge                          │
│  - Layout: Navbar, Footer                                   │
├─────────────────────────────────────────────────────────────┤
│  Camada 2: Estado Global & API (src/stores & src/services)  │
│  - authStore.ts (Zustand)                                   │
│  - api.ts (apiFetch, authApi, eventsApi, ticketsApi...)     │
│  - formatters.ts (formatCurrency, formatDateTime, Badges)   │
├─────────────────────────────────────────────────────────────┤
│  Camada 1: Configuração Base & Tipos (src/types & env)      │
│  - Tipagens TypeScript completas espelhando o Prisma Schema │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Principais Decisões por Fluxo Funcional

### 3.1 Camada de Comunicação com a API (`src/services/api.ts`)
- Wrapper central `apiFetch<T>` que obtém o token JWT diretamente do `useAuthStore.getState().token` quando a flag `requiresAuth: true` está presente;
- Tratamento padronizado de exceções: formata mensagens amigáveis retornadas pelo backend (`data?.message || data?.error`).

### 3.2 Simulação de Pagamento & Concorrência no Checkout (`/events/[id]`)
- O modal de checkout permite simular explicitamente os dois cenários:
  - **`APPROVED`**: Dispara a transação atômica no PostgreSQL com decremento seguro de estoque e emissão de tickets com assinatura HMAC;
  - **`REFUSED`**: Simula recusa da operadora bancária, informando o cliente sem decrementar o estoque e sem emitir ingressos;
- Captura de erro HTTP 409 caso o evento esgote simultaneamente.

### 3.3 Experiência do Avaliador (Atalhos de Login Rápido)
- Na tela de login (`/login`), foram incluídos botões de **preenchimento com 1 clique** para os perfis pré-cadastrados no seed do banco (`Cliente`, `Organizador`, `Portaria`), acelerando os testes sem fricção.

### 3.4 Compartilhamento Público de Ingressos (`/tickets/share/[shareToken]`)
- Rota pública dinâmica que permite a qualquer portador do link visualizar o ingresso com design de ticket digital e QR Code autenticado;
- Mantém privacidade (não expõe dados sensíveis do comprador) e valida a autenticidade criptográfica.

### 3.5 Assistente de Catálogo Inteligente (`/organizer/events/new`)
- Integração direta com os endpoints do backend (`/api/catalog/search`) para importar dados do **The Movie Database (TMDb)** e **Ticketmaster**, preenchendo automaticamente pôster, sinopse e categoria no formulário de criação de eventos.

### 3.6 Leitor de Portaria com Câmera e Digitação Manual (`/gatekeeper/validate`)
- Utilização da biblioteca `html5-qrcode` para ler códigos diretamente da câmera do dispositivo;
- Fallback para digitação manual do código legível (`TKT-...`);
- Exibição imediata dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.

---

## 4. Garantia de Qualidade e Compilação
- **TypeScript**: 100% tipado com `strict: true` e zero uso de `any`;
- **Next.js Build**: Compilação executada com sucesso sem nenhum aviso de linter ou erro de compilação.
