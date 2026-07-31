# Estado Atual do Projeto

> **Este é o arquivo mais importante do repositório.**
> É a fonte única de verdade sobre onde o projeto está. Deve ser atualizado ao
> final de toda unidade de trabalho, sem exceção.

---

## Snapshot

| Campo                  | Valor                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| **Última atualização** | 2026-07-31                                                       |
| **Fase atual**         | Fase 0 — Fundação de Infraestrutura                              |
| **Status da fase**     | 🔵 Código concluído · aguardando ações de infraestrutura do dono |
| **Fases concluídas**   | Planejamento · Definição de identidade e acesso                  |
| **Bloqueios**          | Vercel, Railway e Cloudflare R2 dependem de autorização do dono  |
| **Aplicação roda?**    | ✅ Sim — `npm run dev` em http://localhost:3000                  |

**Legenda de status:** ⬜ não iniciada · 🟡 aguardando aprovação · 🔵 em andamento · ✅ concluída · 🔴 bloqueada

---

## 1. O que existe hoje no repositório

```
RoHair/
├── CLAUDE.md                     Instruções permanentes do agente
├── README.md · .gitignore · .env.example
├── package.json                  Next 16.2 · React 19.2 · Tailwind 4 · Zod 4
├── tsconfig.json                 strict + 6 flags adicionais de rigor
├── eslint.config.mjs             Camadas, Prisma restrito, zero any
├── .prettierrc.json · .prettierignore
├── vitest.config.mts             Duas suítes: domain (node) e ui (jsdom)
├── playwright.config.ts          iPhone primeiro, depois Android e desktop
├── next.config.ts
├── .github/workflows/ci.yml      Qualidade · build · E2E
├── e2e/
│   └── fundacao.spec.ts          3 testes de fumaça
├── docs/                         (ver índice no README)
│   └── adr/ADR-0001-fundacao-do-projeto.md
└── src/
    ├── app/
    │   ├── layout.tsx            Fontes, metadata, viewport, script de tema
    │   ├── page.tsx              Painel temporário da Fase 0
    │   └── globals.css
    ├── core/
    │   └── env/env.ts            Validação de ambiente com Zod (+ testes)
    └── shared/
        ├── ui/
        │   ├── brand/monogram.tsx
        │   ├── styles/tokens.css Áurea — cor, tipografia, forma, movimento
        │   ├── styles/base.css   Camada anti-navegador
        │   └── theme/            Store externa + hook + alternador
        └── utils/cn.ts           (+ testes)
```

`src/features/` ainda não existe — nasce na Fase 3, com a primeira feature real.

## 2. O produto em uma frase

RoHair são **dois aplicativos que conversam**: o **Painel** da Rosiele (agenda,
atendimento, estoque, financeiro) e o **Portal da Cliente** (histórico, antes e
depois, agendamento). O ponto de encontro é o **CPF**.

## 3. O que já está decidido e não se rediscute

Resumo — justificativas completas em [04-DECISOES.md](04-DECISOES.md) e
[adr/](adr/).

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

- Stack: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4
  (OKLCH) · Zod 4 · Vitest 4 · Playwright · Prisma + PostgreSQL (Railway)
- Service Worker: **Serwist** (DEC-001)
- **RSC + Server Actions** como padrão; TanStack Query só nas ilhas (DEC-002)
- Multi-tenancy por `organizationId` desde o dia 1 (DEC-003)
- Arquitetura feature-first em camadas, imposta por lint (DEC-004, ADR-0001)
- Fotos: **Cloudflare R2** + compressão no dispositivo (DEC-010)
- Dinheiro em centavos · IDs UUIDv7 · datas UTC · soft delete · audit log
- Conflito de agenda impedido por `EXCLUDE USING gist` no Postgres
- Design system autoral **"Áurea"**, dois temas com identidade própria
- Deploy: Vercel (auto-deploy da `main`) · Railway (Postgres, Redis)

## 4. Próximo passo imediato

> **Fechar a Fase 0 com as três conexões de infraestrutura**, que exigem ação do
> dono, e então apresentar a Fase 1 para aprovação.

**Ações pendentes do dono:**

1. **Vercel** — importar `alanaraujo-bit/RoHair` em vercel.com/new. Framework
   detectado automaticamente; nenhuma variável obrigatória neste momento
2. **Railway** — criar projeto, adicionar PostgreSQL e Redis, copiar
   `DATABASE_URL` e `REDIS_URL`
3. **Cloudflare R2** — criar conta e bucket `rohair-media`. Confirmar se exige
   cartão; se exigir e não for desejado, migrar para Supabase Storage (DEC-010)

**Depois disso, ainda na Fase 0:** configurar as variáveis na Vercel, ligar o
preview deployment por PR e marcar o DoD como cumprido.

## 5. Decisões pendentes

| #    | Decisão                            | Recomendação                                            | Bloqueia                  |
| ---- | ---------------------------------- | ------------------------------------------------------- | ------------------------- |
| D-03 | Domínio próprio                    | Sem domínio hoje; seguir no subdomínio da Vercel        | Fase 5 (parcial), Fase 14 |
| D-05 | Cliente agenda direto ou solicita? | **Solicita** — preserva o controle da agenda da Rosiele | Fase 12                   |
| D-06 | Escopo do Portal da Cliente        | Proposta na Fase 12 do roadmap                          | Fase 12                   |

## 6. Comandos

| Comando            | O que faz                                           |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Sobe em http://localhost:3000 (único comando local) |
| `npm run verify`   | Tipos + lint + testes — o que o CI roda             |
| `npm run test`     | Testes unitários                                    |
| `npm run test:e2e` | Playwright (baixa navegadores na primeira vez)      |
| `npm run format`   | Prettier                                            |

## 7. Log de sessões

Ordem cronológica inversa — mais recente no topo.

### 2026-07-31 (3) — Fase 0 executada (código)

- Projeto Next.js 16.2 / React 19.2 / Tailwind 4 criado e reestruturado.
- **TypeScript** com `strict` mais 6 flags adicionais; `exactOptionalPropertyTypes`
  deixada de fora deliberadamente (justificativa no ADR-0001).
- **Fronteiras entre camadas** com `eslint-plugin-boundaries`, validadas contra 4
  cenários reais. As duas primeiras configurações pareciam corretas e **não
  acusavam nada** — o `mode`/`pattern` do plugin casa contra a pasta, não contra o
  caminho completo, e os templates de captura precisam de `captured: {...}`.
- **Validação de ambiente** com Zod. O teste expôs uma falha real: `z.url()` aceita
  `localhost:5432`. Protocolo passou a ser verificado por regex explícita.
- **Design tokens Áurea** em OKLCH, com Porcelana e Veludo desenhados
  separadamente; troca de tema sem recompilação via `@theme inline`.
- Tema implementado com `useSyncExternalStore` em vez de `useEffect` + `setState`
  — o lint do React acusou renderização em cascata, e a store externa é a resposta
  correta, não um contorno.
- **Testes:** 8 unitários em 345ms, 3 de fumaça em Playwright (renderização,
  persistência de tema, alvo de toque de 44px).
- **CI** no GitHub Actions: qualidade, build e E2E.
- **ADR-0001** escrito.
- Aplicação rodando em http://localhost:3000 e acompanhada ao vivo pelo dono.
- **Pendente:** Vercel, Railway e Cloudflare R2 — dependem de ação do dono.

### 2026-07-31 (2) — Definição de identidade, acesso e mídia

- **Mudança estrutural de produto:** o RoHair passou a ter **dois públicos**. Além
  do painel profissional, existe agora o **Portal da Cliente** (DEC-007).
- Modelo de identidade definido pelo dono e detalhado em DEC-008.
- D-01 revogada: **sem Better Auth e sem passkey**. Sessão própria com Argon2id.
  Lucia descartada por estar descontinuada.
- Riscos de segurança do fluxo por CPF reconhecidos e registrados com mitigações.
- D-02 substituída pela DEC-010: **Cloudflare R2** com compressão no dispositivo.
- D-04 resolvida pela DEC-011: **RoHair = Rosiele + Hair**.
- Roadmap ampliado de 16 para 17 fases; **Fase 12 — Portal da Cliente** criada.
- Novas pendências: D-05 e D-06.

### 2026-07-31 (1) — Planejamento e fundação documental

- Plano completo de produto, arquitetura e desenvolvimento apresentado e aprovado.
- Divergências aceitas: Serwist no lugar de `next-pwa`; RSC + Server Actions no
  lugar de TanStack Query como padrão.
- Criado o sistema de documentação viva (`CLAUDE.md` + `docs/`).
- Repositório definido: https://github.com/alanaraujo-bit/RoHair
