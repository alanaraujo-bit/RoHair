# Estado Atual do Projeto

> **Este é o arquivo mais importante do repositório.**
> É a fonte única de verdade sobre onde o projeto está. Deve ser atualizado ao
> final de toda unidade de trabalho, sem exceção.

---

## Snapshot

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Última atualização** | 2026-07-31                                                   |
| **Fase atual**         | Fase 1 — Descoberta & Documentação de Produto                |
| **Status da fase**     | 🔵 **Fase 1A concluída** · Fase 1B bloqueada                 |
| **Fases concluídas**   | Planejamento · Identidade e acesso · Fase 0 · **Fase 1A**    |
| **Bloqueio ativo**     | 🔴 **A conversa com a Rosiele.** Nada avança sem as respostas |
| **Local**              | http://localhost:3000 (`npm run dev`)                        |
| **Produção**           | https://rohair.vercel.app                                    |
| **CI**                 | ✅ Verde — qualidade, build e E2E                            |

**Legenda de status:** ⬜ não iniciada · 🟡 aguardando aprovação · 🔵 em andamento · ✅ concluída · 🔴 bloqueada

---

## 1. Infraestrutura provisionada

| Serviço           | Estado                                                          |
| ----------------- | --------------------------------------------------------------- |
| **GitHub**        | `alanaraujo-bit/RoHair` — ⚠️ **público** (ver seção 5)          |
| **Vercel**        | Projeto `rohair` no escopo `aionixdev`, ligado ao repositório   |
| **Railway**       | Projeto `RoHair` · id `9f922271-3454-48fd-8e00-3ee27c5a2975`    |
| **PostgreSQL 18** | Online · proxy TCP público ativo · `uuidv7()` nativo disponível |
| **Redis**         | Online · proxy TCP público ativo                                |
| **Cloudflare R2** | Bucket `rohair-media` · token escopado · acesso verificado      |

Variáveis já configuradas na Vercel (produção e preview): `APP_ENV`,
`NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `REDIS_URL`, `CPF_HASH_SECRET`,
`CPF_ENCRYPTION_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

Localmente, tudo vive em `.env.local` — ignorado pelo git, nunca versionado.

## 2. O que existe hoje no repositório

```
RoHair/
├── CLAUDE.md · README.md · .gitignore · .gitattributes · .env.example
├── package.json                  Next 16.2 · React 19.2 · Tailwind 4 · Zod 4
├── tsconfig.json                 strict + 6 flags adicionais de rigor
├── eslint.config.mjs             Camadas, Prisma restrito, zero any
├── .prettierrc.json · .prettierignore
├── vitest.config.mts             Duas suítes: domain (node) e ui (jsdom)
├── playwright.config.ts          iPhone (WebKit) primeiro, Android, desktop
├── .github/workflows/ci.yml      Qualidade · build · E2E
├── e2e/fundacao.spec.ts          3 testes de fumaça
├── docs/                         (índice no README)
│   ├── 00 a 05                   estado · visão · arquitetura · roadmap ·
│   │                             decisões · protocolo
│   ├── 06-GLOSSARIO.md           Fase 1A · vocabulário do domínio
│   ├── 07-FLUXOS.md              Fase 1A · as duas pontas
│   ├── 08-MODELO-DE-DOMINIO.md   Fase 1A · agregados e invariantes (v0)
│   ├── descoberta/               roteiro e respostas da Rosiele
│   └── adr/ADR-0001-fundacao-do-projeto.md
└── src/
    ├── app/                      layout · page (painel da Fase 0) · globals.css
    ├── core/env/env.ts           Validação de ambiente com Zod (+ testes)
    └── shared/
        ├── ui/brand/monogram.tsx
        ├── ui/styles/            tokens.css (Áurea) · base.css (anti-navegador)
        ├── ui/theme/             store externa · hook · alternador
        └── utils/cn.ts           (+ testes)
```

`src/features/` ainda não existe — nasce na Fase 3, com a primeira feature real.

## 3. O produto em uma frase

RoHair são **dois aplicativos que conversam**: o **Painel** da Rosiele (agenda,
atendimento, estoque, financeiro) e o **Portal da Cliente** (histórico, antes e
depois, agendamento). O ponto de encontro é o **CPF**.

## 4. O que já está decidido e não se rediscute

Justificativas completas em [04-DECISOES.md](04-DECISOES.md) e [adr/](adr/).

**Produto**

- Dois públicos, dois app shells, **um só código** (DEC-007)
- Marca: **RoHair = Rosiele + Hair**; monograma "Ro" é o núcleo da identidade (DEC-011)

**Identidade e acesso** (DEC-008)

- `User` (equipe) e `ClientAccount` (cliente) em **tabelas separadas**
- `Client` (ficha) existe sem conta; a conta **se acopla** ao histórico depois
- Equipe: sem autocadastro. Primeira OWNER por script; as demais criadas no painel
- Cliente, primeiro acesso: **CPF + data de nascimento** → cria usuário e senha
- Cliente sem ficha: **autocadastro**, e aparece marcada como nova no painel
- Recuperação de senha pela mesma porta — sem e-mail, sem SMS
- Sessão própria em cookie `httpOnly` + Argon2id
- CPF com HMAC para busca e AES-GCM para exibição (DEC-009)

**Técnico**

- Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 (OKLCH)
- Serwist para service worker (DEC-001)
- **RSC + Server Actions** como padrão; TanStack Query só nas ilhas (DEC-002)
- Multi-tenancy por `organizationId` desde o dia 1 (DEC-003)
- Camadas feature-first impostas por lint (DEC-004, ADR-0001)
- Fotos: **Cloudflare R2** + compressão no dispositivo (DEC-010)
- Dinheiro em centavos · datas UTC · soft delete · audit log
- **IDs:** `uuidv7()` nativo do Postgres 18 — não precisa gerar na aplicação
- Conflito de agenda impedido por `EXCLUDE USING gist`
- Design system autoral **"Áurea"**, dois temas com identidade própria

## 5. Próximo passo imediato

> ### 🔴 O projeto está parado esperando **uma conversa de 45 minutos**.
>
> **Alan precisa conversar com a Rosiele** usando o
> [roteiro pronto](descoberta/roteiro-rosiele.md), e colar as respostas em
> [respostas-rosiele.md](descoberta/respostas-rosiele.md).
>
> Nada mais avança até isso acontecer — e isso é de propósito. Ver abaixo.

### Por que nada avança sem essa conversa

A Fase 1B (personas, mapa do dia, wireframes, modelo v1, escopo das Fases 6 a 14)
depende inteiramente do dia real de trabalho dela. A Fase 2 também não pode
começar: o design system precisa saber que telas vai servir.

O que **pode** ser adiantado sem ela, se a conversa demorar: a identidade da marca,
que já está decidida na [DEC-011](04-DECISOES.md#dec-011) e não depende de
descoberta. É a única saída lateral disponível.

### O que a Fase 1A produziu

| Documento | O que é |
| --------- | ------- |
| [descoberta/roteiro-rosiele.md](descoberta/roteiro-rosiele.md) | 78 perguntas em 11 blocos + 5 atendimentos reais. Escrito para o Alan conduzir sozinho |
| [descoberta/respostas-rosiele.md](descoberta/respostas-rosiele.md) | Template vazio, aguardando |
| [06-GLOSSARIO.md](06-GLOSSARIO.md) | Vocabulário da beleza e do produto, com 10 termos marcados a confirmar |
| [07-FLUXOS.md](07-FLUXOS.md) | Identidade das duas pontas e pontos de encontro. **Expôs três buracos** |
| [08-MODELO-DE-DOMINIO.md](08-MODELO-DE-DOMINIO.md) | Agregados, 15 invariantes e 10 perguntas que o modelo faz a ela |

### O achado mais importante da Fase 1A

Percorrer os fluxos com rigor mostrou que **o ponto de encontro entre as duas
pontas do produto não funciona como estava desenhado.** A DEC-008 supõe que a ficha
da cliente tem CPF; a Rosiele não pede CPF de ninguém hoje. Sem isso, a cliente que
se autocadastra vira ficha duplicada, e o momento mais valioso do produto — dois
anos de histórico aparecendo de uma vez — nunca acontece.

Virou [D-07](04-DECISOES.md#d-07--como-as-duas-pontas-se-encontram-quando-a-ficha-não-tem-cpf),
com recomendação de fusão assistida. Dois achados menores viraram
[D-08](04-DECISOES.md#d-08--rota-de-escape-quando-a-ativação-da-cliente-falha).

Encontrar isso agora custou algumas horas de documento. Encontrar na Fase 4 teria
custado a reescrita do modelo de identidade.

### Como retomar em uma sessão nova

1. Ler este arquivo, depois [04-DECISOES.md](04-DECISOES.md) e a Fase 1 em
   [03-ROADMAP.md](03-ROADMAP.md)
2. Verificar se [respostas-rosiele.md](descoberta/respostas-rosiele.md) foi
   preenchido
   - **Se sim** → executar a Fase 1B (não precisa de nova aprovação; a Fase 1
     inteira já foi aprovada em 2026-07-31)
   - **Se não** → o bloqueio continua. Não começar a Fase 2
3. `npm run dev` se precisar de ambiente visual (o servidor não sobrevive à troca
   de sessão)

### Manutenção agendada

| Quando          | O quê                                                               |
| --------------- | ------------------------------------------------------------------- |
| Antes da Fase 6 | **Rotacionar o token do R2.** As chaves foram trocadas por mensagem |
|                 | em 2026-07-31 e estão no histórico da conversa. Enquanto o bucket   |
|                 | está vazio o risco é nulo; quando entrarem fotos de clientes, deixa |
|                 | de ser. Trocar é criar um token novo com o mesmo escopo, atualizar  |
|                 | `.env.local` e a Vercel, e apagar o antigo.                         |
| Até 2027-07-31  | **Vencimento do token do R2** (TTL de 1 ano). Vencido sem troca, o  |
|                 | upload de fotos para de funcionar em produção.                      |

### Decisão aberta

**Visibilidade do repositório** — está **público**. Para um produto que será
vendido, o padrão é privado. Não há segredo versionado, então não é urgente.
Alterar em _Settings → General → Danger Zone_.

## 6. Decisões pendentes

| #    | Decisão                            | Recomendação                                            | Bloqueia                  |
| ---- | ---------------------------------- | ------------------------------------------------------- | ------------------------- |
| D-03 | Domínio próprio                    | Sem domínio hoje; seguir em `rohair.vercel.app`         | Fase 5 (parcial), Fase 14 |
| D-05 | Cliente agenda direto ou solicita? | **Solicita** — preserva o controle da agenda da Rosiele | Fase 12                   |
| D-06 | Escopo do Portal da Cliente        | Proposta na Fase 12 do roadmap                          | Fase 12                   |
| D-07 | Encontro das pontas sem CPF na ficha | **Fusão assistida** pela Rosiele, CPF opcional        | Fases 3, 4 e 6            |
| D-08 | Escape quando a ativação falha     | **Aprovação manual** em vez de negar                    | Fase 4                    |

D-05 a D-08 são resolvidas pela conversa com a Rosiele — as perguntas
correspondentes já estão no [roteiro](descoberta/roteiro-rosiele.md).

## 7. Comandos

| Comando            | O que faz                                           |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Sobe em http://localhost:3000 (único comando local) |
| `npm run verify`   | Tipos + lint + testes — o mesmo que o CI roda       |
| `npm run test:e2e` | Playwright (baixa navegadores na primeira vez)      |
| `npm run format`   | Prettier                                            |
| `railway status`   | Estado dos serviços no Railway                      |
| `vercel ls rohair` | Deploys da Vercel                                   |

## 8. Log de sessões

Ordem cronológica inversa — mais recente no topo.

### 2026-07-31 (6) — Fase 1 aprovada · Fase 1A executada

- Fase 1 apresentada e aprovada. Dividida em **1A** (não depende da Rosiele) e
  **1B** (depende das respostas dela).
- **1A entregue por completo:** roteiro de conversa, glossário do domínio, fluxos
  das duas pontas e modelo de domínio v0. Detalhes na seção 5.
- **Escrever os fluxos com rigor expôs três buracos no modelo de identidade.** O
  mais grave: o ponto de encontro entre painel e portal depende de um CPF na ficha
  que, na prática, não vai existir — a Rosiele não pede CPF de ninguém hoje.
  Viraram **D-07** e **D-08**, com recomendação registrada.
- **Método adotado para o modelo v0:** afirmar em vez de generalizar. Um modelo
  vago sobrevive a qualquer entrevista porque não diz nada; este declara 10
  hipóteses testáveis (M-01 a M-10) que a conversa confirma ou derruba.
- Decisões de formato: o Alan conduz a conversa sem o agente no meio; wireframes
  em Markdown versionado, porque baixa fidelidade bonita demais desvia a conversa
  para estética antes da hora.
- **Dois bugs de documentação corrigidos:** a tabela do roadmap ainda marcava a
  Fase 0 como pendente, e a arquitetura dizia que o UUIDv7 era gerado na aplicação,
  contradizendo o `uuidv7()` nativo do Postgres 18 registrado aqui.
- **DoD da Fase 0 revisado com honestidade:** o item "um PR gera preview acessível
  pelo celular" **nunca foi exercitado** — as variáveis existem, mas todo o
  trabalho foi direto na `main`. Fica marcado como não verificado; o PR desta fase
  é o primeiro a testá-lo de verdade.

### 2026-07-31 (5) — Cloudflare R2 verificado · Fase 0 fechada

- Token de API do R2 criado com permissão **Object Read & Write**, escopado ao
  bucket `rohair-media`, TTL de 1 ano, sem filtro de IP.
- **Acesso verificado por script próprio** (SigV4 com `node:crypto`, sem
  instalar dependência): gravar, ler, conferir integridade byte a byte, apagar.
- O primeiro teste de escopo deu 404 ao tentar um bucket inexistente — o que
  prova nada, porque 404 é "não existe", não "negado". Refeito com `ListBuckets`,
  que retornou **403**: o token realmente não enxerga outros buckets.
- Credenciais do R2 configuradas na Vercel (produção e preview).
- As chaves do R2 foram enviadas por mensagem e estão no histórico da conversa.
  Registrada manutenção: **rotacionar antes da Fase 6**, quando entrarem fotos
  reais de clientes.
- **Fase 0 concluída.** Resta apenas a decisão sobre o repositório ser público.

### 2026-07-31 (4) — Fase 0 concluída · infraestrutura no ar

- **Railway:** projeto criado, PostgreSQL 18 e Redis provisionados, proxies TCP
  públicos habilitados, conectividade testada.
- **Incidente tratado:** as senhas do primeiro par de bancos foram impressas na
  saída de um comando e ficaram registradas na conversa. Como os bancos estavam
  vazios, o projeto inteiro foi **destruído e recriado** com credenciais novas.
  A partir daí, todo segredo passou a ser lido direto para `.env.local`, sem
  passar por saída visível.
- **Vercel:** projeto `rohair` ligado ao repositório, primeiro deploy de produção
  publicado em https://rohair.vercel.app, variáveis configuradas em produção e
  preview.
- **CI:** primeira execução falhou no job E2E. Causa: o projeto `iphone` do
  Playwright usa **WebKit**, e o workflow instalava apenas Chromium — a
  plataforma principal do produto estava fora da suíte que deveria protegê-la.
  Corrigido; CI 100% verde.
- `.gitignore` ajustado após a Vercel anexar regras que anulavam a exceção do
  `.env.example`.
- Descoberto que o repositório está **público** — registrado como decisão
  pendente do dono.
- Cloudflare R2: bucket `rohair-media` criado pelo dono; token de API pendente.

### 2026-07-31 (3) — Fase 0 executada (código)

- Next.js 16.2 / React 19.2 / Tailwind 4; TypeScript com `strict` + 6 flags.
- **Fronteiras entre camadas** validadas contra 4 cenários reais. As duas
  primeiras configurações pareciam corretas e **não acusavam nada** — o padrão do
  plugin casa contra a pasta, não contra o caminho, e os templates de captura
  precisam de `captured: {...}`.
- **Validação de ambiente** com Zod. O teste expôs falha real: `z.url()` aceita
  `localhost:5432`. Protocolo passou a ser verificado por regex explícita.
- **Design tokens Áurea** em OKLCH; Porcelana e Veludo desenhados separadamente.
- Tema com `useSyncExternalStore` em vez de `useEffect` + `setState`.
- 8 testes unitários em 345ms · 3 de fumaça no Playwright · ADR-0001 escrito.

### 2026-07-31 (2) — Identidade, acesso e mídia

- **Mudança estrutural:** o RoHair passou a ter **dois públicos** (DEC-007).
- Modelo de identidade definido pelo dono e detalhado em DEC-008.
- D-01 revogada: sem Better Auth e sem passkey. Lucia descartada (descontinuada).
- D-02 substituída pela DEC-010: Cloudflare R2 com compressão no dispositivo.
- D-04 resolvida pela DEC-011: RoHair = Rosiele + Hair.
- Roadmap ampliado para 17 fases; **Fase 12 — Portal da Cliente** criada.

### 2026-07-31 (1) — Planejamento e fundação documental

- Plano completo apresentado e aprovado.
- Serwist no lugar de `next-pwa`; RSC + Server Actions como padrão.
- Sistema de documentação viva criado (`CLAUDE.md` + `docs/`).
