# Estado Atual do Projeto

> **Este é o arquivo mais importante do repositório.**
> É a fonte única de verdade sobre onde o projeto está. Deve ser atualizado ao
> final de toda unidade de trabalho, sem exceção.

---

## Snapshot

| Campo | Valor |
|---|---|
| **Última atualização** | 2026-07-31 |
| **Fase atual** | Fase 0 — Fundação de Infraestrutura |
| **Status da fase** | 🟡 Aguardando aprovação para iniciar |
| **Fases concluídas** | Fase de Planejamento (roadmap aprovado) |
| **Bloqueios** | 4 decisões pendentes (ver seção 4) |
| **Aplicação roda?** | ❌ Não — nenhum código de aplicação escrito ainda |

**Legenda de status:** ⬜ não iniciada · 🟡 aguardando aprovação · 🔵 em andamento · ✅ concluída · 🔴 bloqueada

---

## 1. O que existe hoje no repositório

```
RoHair/
├── CLAUDE.md                        Instruções permanentes do agente
├── README.md                        Apresentação do projeto
├── .gitignore
└── docs/
    ├── 00-ESTADO-ATUAL.md           ← este arquivo
    ├── 01-VISAO-PRODUTO.md          Posicionamento, princípios, personas
    ├── 02-ARQUITETURA.md            Stack, camadas, tenancy, modelo de dados
    ├── 03-ROADMAP.md                As 16 fases, com entregáveis e DoD
    ├── 04-DECISOES.md               Decisões tomadas e pendentes
    ├── 05-PROTOCOLO-DE-TRABALHO.md  Como dono e agente trabalham juntos
    └── adr/
        ├── README.md                Índice de ADRs
        └── TEMPLATE.md
```

**Nenhum código de aplicação foi escrito.** Não existe `package.json`, não existe
`src/`, não existe banco de dados provisionado.

## 2. O que já está decidido e não se rediscute

Resumo — detalhes e justificativas em [04-DECISOES.md](04-DECISOES.md).

- Stack: Next.js (App Router) · TypeScript strict · Tailwind v4 (OKLCH) ·
  Prisma · PostgreSQL (Railway) · Motion · Zod + React Hook Form
- Service Worker: **Serwist** (não `next-pwa`, que está sem manutenção)
- Estado de servidor: **RSC + Server Actions** como padrão; TanStack Query só nas
  ilhas interativas (agenda ao vivo, cronômetro, fila offline)
- Multi-tenancy por `organizationId` desde o dia 1, com Prisma Client Extension
  + Row Level Security
- Arquitetura feature-first com camadas `domain / application / infrastructure /
  presentation`, regra de dependência imposta por lint
- Dinheiro em centavos · IDs UUIDv7 · datas UTC · soft delete · audit log
- Conflito de agenda impedido por constraint `EXCLUDE USING gist` no Postgres
- Design system autoral **"Áurea"**, dois temas com identidade própria
- Deploy: Vercel (auto-deploy da `main`) · Railway (Postgres, Redis, workers)

## 3. Próximo passo imediato

> **Iniciar a Fase 0 — Fundação de Infraestrutura**, assim que as decisões
> pendentes da seção 4 forem respondidas.

Ordem de execução da Fase 0 (detalhes em [03-ROADMAP.md](03-ROADMAP.md#fase-0)):

1. Inicializar o projeto Next.js com TypeScript strict e Tailwind v4
2. Configurar ESLint 9 (flat config) + Prettier + `eslint-plugin-boundaries`
3. Estrutura de pastas conforme [02-ARQUITETURA.md](02-ARQUITETURA.md)
4. GitHub Actions: typecheck · lint · testes · build em todo PR
5. Provisionar PostgreSQL e Redis no Railway (staging + produção)
6. Conectar Vercel ao repositório, com preview deployment por PR
7. Configurar variáveis de ambiente e validação de env com Zod
8. Escrever ADR-0001 (registro das decisões de fundação)

## 4. Decisões pendentes — bloqueiam o início da Fase 0

| # | Decisão | Recomendação do agente | Status |
|---|---|---|---|
| D-01 | Biblioteca de autenticação | **Better Auth** (passkey/Face ID + OTP por e-mail), no lugar de Auth.js v5 | ⏳ Aguardando |
| D-02 | Armazenamento de fotos | **Vercel Blob** agora, atrás de uma interface `StorageService` para migrar a Cloudflare R2 depois | ⏳ Aguardando |
| D-03 | Domínio próprio | Necessário para PWA instalável e e-mail transacional. Até lá, subdomínio da Vercel | ⏳ Aguardando |
| D-04 | Origem do nome "RoHair" | Necessário para logotipo e tom de voz na Fase 2 (Design System) | ⏳ Aguardando |

Nenhuma dessas trava a escrita da documentação, mas D-01 e D-02 travam código da
Fase 0. D-03 e D-04 só travam a partir da Fase 2.

## 5. Log de sessões

Ordem cronológica inversa — mais recente no topo. Uma entrada por unidade de
trabalho concluída.

### 2026-07-31 — Planejamento e fundação documental
- Apresentado o plano completo de produto, arquitetura e desenvolvimento.
- Roadmap de 16 fases **aprovado pelo dono**.
- Divergências propostas e aceitas: Serwist no lugar de `next-pwa`; RSC +
  Server Actions no lugar de TanStack Query como padrão; Better Auth proposto
  no lugar de Auth.js (pendente de confirmação, D-01).
- Criado o sistema de documentação viva (`CLAUDE.md` + `docs/`) para que o
  contexto sobreviva à troca de janelas de conversa.
- Repositório definido: https://github.com/alanaraujo-bit/RoHair
- **Nenhum código de aplicação escrito** — conforme a regra de não iniciar fase
  sem aprovação.
