# 🎟️ Elite Ingressos — Front-End (Desafio Técnico Verzel / Elite Dev)

Interface web moderna, responsiva e acessível para a plataforma de venda, emissão e validação de ingressos para shows e eventos de cinema, desenvolvida com **Next.js 15+ (App Router)**, **TypeScript**, **TailwindCSS v4** e gerenciamento de estado global com **Zustand**.

---

## 🚀 Tecnologias & Stack Utilizada

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [TailwindCSS v4](https://tailwindcss.com/) com design escuro moderno (*dark mode* nativo e *glassmorphism*)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) com persistência automática no `localStorage`
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Leitor de QR Code**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) (suporte a câmera de celulares e laptops)
- **Utilitários**: `clsx` + `tailwind-merge` para mesclagem limpa de classes CSS

---

## 📁 Estrutura de Pastas e Módulos

```text
frontend/
├── src/
│   ├── app/                                # Rotas e Páginas do Next.js (App Router)
│   │   ├── layout.tsx                      # Layout raiz (Navbar, Footer, Tema Escuro)
│   │   ├── page.tsx                        # Vitrine Pública / Catálogo de Eventos
│   │   ├── login/page.tsx                  # Login com atalhos de preenchimento rápido
│   │   ├── register/page.tsx               # Cadastro com seleção de perfil (Cliente, Organizador, Portaria)
│   │   ├── events/[id]/page.tsx            # Detalhes do Evento & Checkout Simulado
│   │   ├── my-tickets/page.tsx             # Área do Cliente (QR Codes & Compartilhamento)
│   │   ├── my-reservations/page.tsx        # Histórico de Pedidos & Compras
│   │   ├── tickets/share/[shareToken]/     # Página Pública de Ingresso Compartilhado
│   │   ├── organizer/events/page.tsx       # Painel de Métricas & Gestão do Organizador
│   │   ├── organizer/events/new/page.tsx   # Assistente de Criação com TMDb & Ticketmaster
│   │   └── gatekeeper/validate/page.tsx    # Validador da Portaria (Câmera & Manual)
│   ├── components/
│   │   ├── layout/                         # Componentes Estruturais (Navbar, Footer)
│   │   └── ui/                             # Design System Reutilizável (Button, Input, Badge, Modal)
│   ├── services/
│   │   └── api.ts                          # Cliente HTTP tipado com injeção automática de Bearer Token
│   ├── stores/
│   │   └── authStore.ts                    # Estado Global de Autenticação (Zustand com hidratação segura)
│   ├── types/
│   │   └── index.ts                        # Tipagens TypeScript completas espelhando a API do Backend
│   └── utils/
│       ├── cn.ts                           # Utilitário de classes condicionais Tailwind
│       └── formatters.ts                   # Formatadores de moeda (BRL), datas e badges semânticas
├── .env.local                              # Variáveis de ambiente locais
├── .env.example                            # Exemplo versionado das variáveis
├── next.config.ts                          # Configuração de domínios para Next Image
└── package.json
```

---

## ⚙️ Configuração & Execução

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

### 5. Build de Produção
```bash
npm run build
npm run start
```

---

## 👥 Credenciais de Teste para Avaliação (Seed do Backend)

Para facilitar a avaliação da banca, a tela de login possui botões de **preenchimento automático com 1 clique** para os perfis pré-cadastrados:

| Perfil | E-mail | Senha | Acesso / Permissões |
| :--- | :--- | :--- | :--- |
| **👤 Cliente 1** | `cliente1@verzel.com` | `123456` | Comprar ingressos, ver QR Codes e compartilhar link |
| **👤 Cliente 2** | `cliente2@verzel.com` | `123456` | Testar concorrência de compra simultânea |
| **🎪 Organizador** | `organizador@verzel.com` | `123456` | Criar eventos (com TMDb/Ticketmaster) e painel de métricas |
| **🚪 Portaria** | `portaria@verzel.com` | `123456` | Validar ingressos por câmera ou código manual |

---

## ✨ Principais Funcionalidades Implementadas

1. **Vitrine & Busca Inteligente (`/`)**:
   - Filtros dinâmicos por tipo (`Shows & Festivais`, `Filmes & Cinema`);
   - Barra de busca com debounce e paginação integrada.

2. **Checkout Simulado com Prevenção de Overbooking (`/events/[id]`)**:
   - Escolha entre **`Aprovar Pagamento`** (emite ingressos, debita o estoque atômico e gera HMAC) ou **`Recusar Pagamento`** (simula falha de cartão sem afetar o estoque).

3. **Ingressos Digitais com QR Code (`/my-tickets`)**:
   - QR Code em formato Base64 Data URL;
   - Botão para copiar o link público de compartilhamento.

4. **Página Pública de Compartilhamento (`/tickets/share/[shareToken]`)**:
   - Visual exclusivo com formato de *ticket stub* acessível sem necessidade de login.

5. **Assistente de Catálogo TMDb / Ticketmaster (`/organizer/events/new`)**:
   - Busca em APIs externas para auto-preenchimento de título, sinopse, gênero e imagem de capa.

6. **Área da Portaria (`/gatekeeper/validate`)**:
   - Validação com leitor de câmera ao vivo (`html5-qrcode`) e digitação manual com retorno dos 4 status do backend: `VALID`, `ALREADY_USED`, `WRONG_EVENT` e `INVALID`.
