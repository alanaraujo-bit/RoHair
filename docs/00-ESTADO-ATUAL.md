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
| **Fases concluídas** | Planejamento (roadmap aprovado) · Definição de identidade e acesso |
| **Bloqueios** | Nenhum para a Fase 0. Pendências D-03, D-05 e D-06 afetam fases posteriores |
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
    ├── 02-ARQUITETURA.md            Stack, identidade, camadas, tenancy, dados
    ├── 03-ROADMAP.md                As 17 fases, com entregáveis e DoD
    ├── 04-DECISOES.md               Decisões tomadas (DEC-001..011) e pendentes
    ├── 05-PROTOCOLO-DE-TRABALHO.md  Como dono e agente trabalham juntos
    └── adr/
        ├── README.md                Índice de ADRs
        └── TEMPLATE.md
```

**Nenhum código de aplicação foi escrito.** Não existe `package.json`, não existe
`src/`, não existe banco de dados provisionado.

## 2. O produto em uma frase

RoHair são **dois aplicativos que conversam**: o **Painel** da Rosiele (agenda,
atendimento, estoque, financeiro) e o **Portal da Cliente** (histórico, antes e
depois, agendamento). O ponto de encontro é o **CPF**.

## 3. O que já está decidido e não se rediscute

Resumo — justificativas completas em [04-DECISOES.md](04-DECISOES.md).

**Produto**
- Dois públicos, dois app shells, **um só código** (DEC-007)
- Marca: **RoHair = Rosiele + Hair**; monograma "Ro" é o núcleo da identidade (DEC-011)

**Identidade e acesso** (DEC-008)
- `User` (equipe) e `ClientAccount` (cliente) em **tabelas separadas** — cliente
  virar administradora é impossível por construção
- `Client` (ficha) existe sem conta; a conta **se acopla** ao histórico depois
- Equipe: sem autocadastro. Primeira OWNER por script; as demais criadas no painel
- Cliente, primeiro acesso: **CPF + data de nascimento** → cria usuário e senha
- Cliente sem ficha: **autocadastro**, e aparece marcada como nova no painel
- Recuperação de senha pela mesma porta (CPF + nascimento) — sem e-mail, sem SMS
- Sessão própria em cookie `httpOnly` + Argon2id. Sem passkey, sem provedor externo
- CPF guardado com HMAC para busca e AES-GCM para exibição (DEC-009)

**Técnico**
- Stack: Next.js (App Router) · TypeScript strict · Tailwind v4 (OKLCH) ·
  Prisma · PostgreSQL (Railway) · Motion · Zod + React Hook Form
- Service Worker: **Serwist** (DEC-001)
- **RSC + Server Actions** como padrão; TanStack Query só nas ilhas (DEC-002)
- Multi-tenancy por `organizationId` desde o dia 1 (DEC-003)
- Arquitetura feature-first em camadas, imposta por lint (DEC-004)
- Fotos: **Cloudflare R2** + compressão no dispositivo (DEC-010)
- Dinheiro em centavos · IDs UUIDv7 · datas UTC · soft delete · audit log
- Conflito de agenda impedido por `EXCLUDE USING gist` no Postgres
- Design system autoral **"Áurea"**, dois temas com identidade própria
- Deploy: Vercel (auto-deploy da `main`) · Railway (Postgres, Redis)

## 4. Próximo passo imediato

> **Apresentar a Fase 0 em detalhe para aprovação**, e então executá-la.

Ordem de execução da Fase 0 (detalhes em [03-ROADMAP.md](03-ROADMAP.md#fase-0)):

1. Inicializar o projeto Next.js com TypeScript strict e Tailwind v4
2. Configurar ESLint 9 (flat config) + Prettier + `eslint-plugin-boundaries`
3. Estrutura de pastas conforme [02-ARQUITETURA.md](02-ARQUITETURA.md)
4. GitHub Actions: typecheck · lint · testes · build em todo PR
5. Provisionar PostgreSQL e Redis no Railway (staging + produção)
6. Conectar Vercel ao repositório, com preview deployment por PR
7. Criar conta e bucket no Cloudflare R2 — **confirmar se exige cartão**; se
   exigir e o dono não quiser, cair para Supabase Storage (DEC-010)
8. Configurar variáveis de ambiente e validação de env com Zod
9. Escrever ADR-0001 (registro das decisões de fundação)

## 5. Decisões pendentes

| # | Decisão | Recomendação | Bloqueia |
|---|---|---|---|
| D-03 | Domínio próprio | Sem domínio hoje; seguir no subdomínio da Vercel | Fase 5 (parcial), Fase 14 |
| D-05 | Cliente agenda direto ou solicita? | **Solicita** — preserva o controle da agenda da Rosiele | Fase 12 |
| D-06 | Escopo do Portal da Cliente | Proposta na Fase 12 do roadmap | Fase 12 |

Nenhuma delas bloqueia a Fase 0.

## 6. Log de sessões

Ordem cronológica inversa — mais recente no topo. Uma entrada por unidade de
trabalho concluída.

### 2026-07-31 (2) — Definição de identidade, acesso e mídia
- **Mudança estrutural de produto:** o RoHair passou a ter **dois públicos**. Além
  do painel profissional, existe agora o **Portal da Cliente** (DEC-007).
- Modelo de identidade definido pelo dono e detalhado em DEC-008: `User` e
  `ClientAccount` em tabelas separadas; ficha existe sem conta; primeiro acesso da
  cliente por CPF + data de nascimento; autocadastro quando não há ficha.
- D-01 revogada: **sem Better Auth e sem passkey**. Sessão própria com Argon2id.
  Lucia descartada por estar descontinuada.
- Riscos de segurança do fluxo por CPF reconhecidos e registrados com mitigações
  (limite de tentativas, notificação com revogação, criptografia do CPF).
- D-02 substituída pela DEC-010: **Cloudflare R2** (10 GB grátis, egresso zero) com
  compressão no dispositivo — exigência do dono de solução gratuita.
- D-04 resolvida pela DEC-011: **RoHair = Rosiele + Hair**.
- Roadmap ampliado de 16 para 17 fases; **Fase 12 — Portal da Cliente** criada;
  fases 12–15 antigas renumeradas para 13–16.
- Novas pendências abertas: D-05 (poder de agendamento da cliente) e D-06 (escopo
  do portal).

### 2026-07-31 (1) — Planejamento e fundação documental
- Apresentado o plano completo de produto, arquitetura e desenvolvimento.
- Roadmap aprovado pelo dono.
- Divergências propostas e aceitas: Serwist no lugar de `next-pwa`; RSC +
  Server Actions no lugar de TanStack Query como padrão.
- Criado o sistema de documentação viva (`CLAUDE.md` + `docs/`) para que o
  contexto sobreviva à troca de janelas de conversa.
- Repositório definido: https://github.com/alanaraujo-bit/RoHair
- **Nenhum código de aplicação escrito** — conforme a regra de não iniciar fase
  sem aprovação.
