# 🤖 Condução Técnica & Engenharia com IA (*AI Pair Programming*)

> **Visão Geral**: Este documento descreve a metodologia de desenvolvimento adotada no projeto, destacando como a Inteligência Artificial foi utilizada como ferramenta de aceleração e co-piloto técnico, mantendo o controle arquitetural, a escrita de código e a tomada de decisões de forma estritamente **humana e hands-on**.

## 🧭 1. Filosofia de Desenvolvimento: *Developer-in-the-Loop*

O projeto foi conduzido com a premissa de que a **IA atua como assistente de produtividade (Pair Programmer)**, enquanto a **engenharia, o design de sistemas, o rigor com tipagem e as decisões de negócio são de responsabilidade do desenvolvedor**.

Mais de **60% a 70% do tempo e do esforço de código** foram dedicados a:
- Arquitetura de dados no PostgreSQL e modelagem de entidades no Prisma;
- Criação dos componentes de interface e regras de estilização sólida no TailwindCSS v4;
- Raciocínio de concorrência e transações ACID para garantia de *Zero Overbooking*;
- Modelagem de segurança de endpoints públicos e testes de contrato contra vazamento de dados sensíveis;
- Revisão crítica linha a linha de cada snippet gerado, eliminando soluções desnecessárias e códigos genéricos (*Anti-AI Slop*).

## 🔄 2. Metodologia: *Plan-First & Step-by-Step Approval*

Para evitar implementações caóticas e garantir manutenibilidade, seguimos um fluxo estruturado de **4 etapas**:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Definição do Problema & Requisitos (Desenvolvedor)       │
│    - Estabelece as regras de negócio, limites e segurança   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Elaboração do Implementation Plan (Pareamento com IA)    │
│    - Mapeamento prévio de arquivos, métodos e testes        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Execução & Revisão Passo a Passo (Hands-on)              │
│    - Um arquivo por vez, com aprovação e ajuste manual      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Verificação Estrita (Testes Automatizados & Build)        │
│    - Suíte Vitest (42 testes) e compilação do Next.js        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 3. Exemplos Práticos de Intervenção Técnica Humana

Durante o desenvolvimento, a intervenção humana direcionou o rumo técnico do projeto em pontos cruciais:

### A. Segurança em Endpoints Públicos (Zero Cryptographic Leakage)
- **Cenário**: A rota de compartilhamento de ingressos (`/api/tickets/share/:shareToken`) precisava permitir a visualização pública sem login;
- **Intervenção do Desenvolvedor**: Definição de um **DTO estrito de apresentação** que omite totalmente `code`, `qrSignature` e `qrCodeUrl`. O material criptográfico de validação e o QR Code funcional permanecem restritos exclusivamente à sessão autenticada do comprador;
- **Testes de Contrato de Segurança**: Criação de testes unitários e de integração no Vitest com asserções explícitas (`expect(res.body.data).not.toHaveProperty('code')`) para garantir que dados sensíveis nunca trafeguem na rota pública.

### B. Rejeição de Complexidade Desnecessária (Simplicidade Arquitetural)
- **Sugestão Comum de IA**: Utilizar mensageria pesada (RabbitMQ, Redis Streams, BullMQ) para fila de ingressos;
- **Decisão do Desenvolvedor**: Rejeitado. O controle de concorrência foi implementado de forma elegante e enxuta via **transações atômicas nativas do PostgreSQL (`$transaction`) com decremento condicional**, eliminando overhead de infraestrutura sem abrir mão de integridade.

### C. Combate ao *AI Slop* (Design Minimalista e Textos Autênticos)
- **Tendência de IA**: Gerar interfaces com gradientes translúcidos genéricos (*glassmorphism* exagerado) e textos robóticos;
- **Decisão do Desenvolvedor**: Refatoração para um **design system sóbrio, cartões escuros sólidos (`zinc-900`/`zinc-950`), bordas nítidas e indicadores semânticos sutis**, além de mensagens diretas e profissionais na interface e na documentação.

### D. Rigor em Testes Automatizados (Mocks Determinísticos)
- **Identificação**: Testes de integração estavam batendo na API real do TMDb, tornando o teste mais lento e dependente de conexão externa;
- **Intervenção do Desenvolvedor**: Exigência de espionagem e mock via `vi.spyOn(externalCatalogService, 'searchCatalog')`, reduzindo o tempo de execução da suíte para milissegundos e garantindo testes offline determinísticos.

### E. Experiência de UX no Cancelamento (Escala de Cinza)
- **Decisão de UI/UX**: Ingressos cancelados não deveriam apenas ser marcados no banco, mas receber um tratamento visual claro no front-end: renderização em **escala de cinza (`grayscale`)**, opacidade reduzida, código riscado e bloqueio total do QR Code, tornando o estado de invalidação imediatamente compreensível.

## 📁 4. Artefato de Planejamento de Referência

O arquivo [`IMPLEMENTATION_PLAN_EXAMPLE.md`](./IMPLEMENTATION_PLAN_EXAMPLE.md) exemplifica como as features foram planejadas e decompostas antes de qualquer modificação no código-fonte, garantindo rastreabilidade e qualidade de entrega.
