# 🎟️ Elite Ingressos — Front-End (Desafio Técnico Elite Dev)

Interface web moderna, responsiva, minimalista e acessível para a plataforma de venda, emissão e validação de ingressos para shows e cinema, desenvolvida com **Next.js 15+ (App Router)**, **TypeScript**, **TailwindCSS v4** e gerenciamento de estado global com **Zustand**.

---

## 🚀 Tecnologias & Stack Utilizada

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
- **Estilização**: [TailwindCSS v4](https://tailwindcss.com/) com design system neutro, sóbrio e sem efeitos translúcidos artificiais (*Anti-AI Slop*)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) com persistência e hidratação segura no `localStorage`
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Leitor de QR Code**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) (suporte a câmera de celulares e webcams)
- **Utilitários**: `clsx` + `tailwind-merge` para classes condicionais seguras
- **Testes**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 📁 Estrutura de Pastas e Módulos

```text
frontend/
├── src/
│   ├── app/                                # Rotas e Páginas do Next.js (App Router)
│   │   ├── layout.tsx                      # Layout raiz (Navbar, Footer, Tema Escuro Sólido)
│   │   ├── page.tsx                        # Vitrine Pública / Catálogo de Eventos com Filtros
│   │   ├── login/page.tsx                  # Login com atalhos de preenchimento rápido em 1 clique
│   │   ├── register/page.tsx               # Cadastro com seleção de perfil (Cliente, Organizador, Portaria)
│   │   ├── events/[id]/page.tsx            # Detalhes do Evento & Checkout Simulado com Status
│   │   ├── my-tickets/page.tsx             # Área do Cliente (Cards Panorâmicos com QR Code)
│   │   ├── my-reservations/page.tsx        # Histórico de Pedidos & Compras (Badges Semânticas)
│   │   ├── tickets/share/[shareToken]/     # Página Pública de Ingresso Compartilhado por Link
│   │   ├── organizer/events/page.tsx       # Painel de Métricas & Gestão do Organizador
│   │   ├── organizer/events/new/page.tsx   # Assistente de Criação com TMDb & Ticketmaster
│   │   └── gatekeeper/validate/page.tsx    # Validador da Portaria (Câmera ao vivo & Código Manual)
│   ├── components/
│   │   ├── layout/                         # Componentes Estruturais (Navbar, Footer)
│   │   └── ui/                             # Design System Sólido (Button, Input, Badge com dot, Modal)
│   ├── services/
│   │   └── api.ts                          # Cliente HTTP tipado com injeção automática de Bearer Token
│   ├── stores/
│   │   └── authStore.ts                    # Estado Global de Autenticação (Zustand com hidratação segura)
│   ├── types/
│   │   └── index.ts                        # Tipagens TypeScript completas espelhando a API do Backend
│   └── utils/
│       ├── cn.ts                           # Utilitário de classes condicionais Tailwind
│       ├── constants.ts                    # Imagens de capa oficiais padrão e fallbacks
│       └── formatters.ts                   # Formatadores de moeda (BRL), datas e badges semânticas
├── __tests__/                              # Testes automatizados unitários e de componentes (Vitest)
├── .env.local                              # Variáveis de ambiente locais
├── next.config.ts                          # Configuração de domínios seguros para Next Image
└── package.json
```

---

## 🛠️ Configuração & Execução

### 1. Pré-requisitos
- **Node.js**: Versão 20.x ou superior
- **Backend**: Certifique-se de que o backend da API está rodando na porta `3001` (`http://localhost:3001`).

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie ou verifique o arquivo `.env.local` na raiz de `frontend/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Executando em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em seu navegador: **[http://localhost:3000](http://localhost:3000)**.

### 5. Executando os Testes Automatizados
```bash
npm test
```

### 6. Build de Produção
```bash
npm run build
npm run start
```

---

## 👥 Credenciais de Teste para Avaliação (Seed do Backend)

Para facilitar a avaliação, a tela de login possui botões de **preenchimento automático com 1 clique** para os perfis pré-cadastrados:

| Perfil | E-mail | Senha | Acesso / Permissões |
| :--- | :--- | :--- | :--- |
| **👤 Cliente 1** | `cliente1@eliteingressos.com` | `123456` | Comprar ingressos, ver QR Codes e compartilhar link |
| **👤 Cliente 2** | `cliente2@eliteingressos.com` | `123456` | Testar concorrência de compra simultânea |
| **👑 Organizador** | `organizador@eliteingressos.com` | `123456` | Criar eventos (com TMDb/Ticketmaster) e painel de métricas |
| **🚪 Portaria** | `portaria@eliteingressos.com` | `123456` | Validar ingressos por câmera ou código manual |

---

## ✨ Principais Funcionalidades Implementadas

1. **Vitrine & Busca Inteligente (`/`)**:
   - Filtros dinâmicos por tipo (`Todos`, `Shows & Festivais`, `Filmes & Cinema`);
   - Barra de busca com debounce e paginação integrada;
   - Banners widescreen de alta qualidade para cada categoria de evento.

2. **Checkout Simulado com Prevenção de Overbooking (`/events/[id]`)**:
   - Seleção de quantidade com travas automáticas de estoque disponível;
   - Escolha entre **`Aprovar Pagamento`** (emite ingressos, debita o estoque atômico e redireciona para Meus Ingressos) ou **`Recusar Pagamento`** (simula recusa da operadora e redireciona para Minhas Compras com status recusado).

3. **Ingressos Digitais com QR Code (`/my-tickets`)**:
   - Pôster panorâmico do evento no topo do ingresso;
   - QR Code em formato Base64 Data URL para apresentação imediata na portaria;
   - Botão para copiar o link público de compartilhamento com 1 clique.

4. **Página Pública de Compartilhamento (`/tickets/share/[shareToken]`)**:
   - Visual em formato de *ticket stub* acessível sem necessidade de login;
   - Exibe código único, validação criptográfica e status do ingresso em tempo real.

5. **Assistente de Catálogo TMDb / Ticketmaster (`/organizer/events/new`)**:
   - Busca em APIs externas de cinema e música para auto-preenchimento de título, sinopse, gênero e imagem de capa.

6. **Área da Portaria (`/gatekeeper/validate`)**:
   - Validação com leitor de câmera ao vivo (`html5-qrcode`) e digitação manual com retorno dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.
