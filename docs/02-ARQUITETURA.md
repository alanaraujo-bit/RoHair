# Arquitetura

> Toda escolha aqui tem justificativa. Alterações estruturais exigem um ADR em
> [adr/](adr/).

## 1. Stack

| Camada             | Tecnologia                                           | Justificativa                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework          | **Next.js — App Router**                             | RSC reduz JavaScript no cliente, essencial num app que roda em 4G; streaming melhora a percepção de velocidade; Server Actions eliminam a camada de API para mutações internas |
| Linguagem          | **TypeScript `strict`** + `noUncheckedIndexedAccess` | Zero `any`. Tipagem é documentação executável                                                                                                                                  |
| UI                 | **React 19**                                         | Actions, `useOptimistic` e `useFormStatus` são a base do feedback instantâneo                                                                                                  |
| Estilo             | **Tailwind v4** com `@theme`                         | Tokens nativos em CSS; sem runtime de CSS-in-JS                                                                                                                                |
| Cor                | **OKLCH**                                            | Uniformidade perceptual permite gerar escalas e **garantir contraste por cálculo**, não por tentativa                                                                          |
| Componentes        | **Primitivos próprios, zero dependência**            | Áurea é autoral (ADR-0002). Sobreposição usa o `<dialog>` nativo, que já dá foco preso, `Esc` e inerte; Radix só entra onde a plataforma não resolver                          |
| Movimento          | **Motion (Framer Motion)**                           | Springs de verdade; a sensação nativa vem da física, não de `ease-in-out`                                                                                                      |
| Formulários        | **React Hook Form + Zod**                            | Um único schema Zod valida cliente, Server Action e tipo TypeScript                                                                                                            |
| ORM                | **Prisma**                                           | Migrations versionadas, tipos gerados, Client Extensions viabilizam o multi-tenancy automático                                                                                 |
| Banco              | **PostgreSQL (Railway)**                             | Constraints de exclusão por intervalo, transações reais, JSONB, full-text                                                                                                      |
| Cache/Filas        | **Redis (Railway)**                                  | Rate limit, locks distribuídos, filas                                                                                                                                          |
| Service Worker     | **Serwist**                                          | Sucessor mantido do Workbox no ecossistema Next. `next-pwa` está abandonado                                                                                                    |
| Auth               | **Sessão própria** (cookie httpOnly + Argon2id)      | Dois domínios de identidade separados e um fluxo de ativação por CPF que nenhuma biblioteca cobre. Ver seção 3                                                                 |
| Armazenamento      | **Cloudflare R2**                                    | 10 GB grátis e egresso zero. Atrás da porta `StorageService`                                                                                                                   |
| Estado de servidor | **RSC + Server Actions**, TanStack Query nas ilhas   | Buscar tudo no cliente desperdiça o App Router. Query entra onde há otimismo, polling ou fila offline                                                                          |
| Testes             | **Vitest** + Testing Library + **Playwright**        | Domínio testado sem banco, em segundos. E2E nos fluxos críticos                                                                                                                |
| Erros              | **Sentry**                                           | Rastreio com source maps, por release                                                                                                                                          |
| Deploy             | **Vercel** + **Railway**                             | Edge/serverless para a aplicação; serviços com estado no Railway                                                                                                               |

## 2. Estrutura de pastas

```
src/
  app/                     Rotas, layouts, route handlers. Camada FINA
    (auth)/                Login da equipe e primeiro acesso da cliente
    (painel)/              App shell da profissional  — sessão User
    (portal)/              App shell da cliente       — sessão ClientAccount
    api/                   Webhooks e integrações externas apenas

  features/                Feature-first: cada domínio é uma vertical completa
    <feature>/
      domain/              Entidades, value objects, regras puras
      application/         Use cases, ports, DTOs
      infrastructure/      Repositórios Prisma, adapters
      presentation/        Componentes, hooks, server actions

  shared/
    ui/                    Design System "Áurea" — zero regra de negócio
    hooks/  lib/  utils/  config/

  core/
    result/                Result<T, E>
    auth/  db/  storage/  events/  observability/  errors/
```

### Regra de dependência (imposta por `eslint-plugin-boundaries`)

```
presentation → application → domain
infrastructure → application → domain
domain → (nada)
features → shared, core
shared, core → (nunca importam features)
```

Uma feature **não pode** importar de outra feature diretamente. Comunicação entre
domínios acontece por eventos ou por use cases explícitos em `application`. Isso
mantém as fatias independentes e testáveis isoladamente.

**Por que domínio sem dependências?** Porque é o que permite testar as regras de
negócio — cálculo de lucro, conflito de horário, consumo de produto — em
milissegundos, sem banco, sem mock de framework.

## 3. Identidade e autenticação

O RoHair tem **dois públicos** (DEC-007) e, portanto, **dois domínios de
identidade completamente separados** (DEC-008).

```
Organization
 ├── User ──────── Membership (OWNER | PROFESSIONAL | ASSISTANT)   ← equipe
 └── Client ─────── ClientAccount (usuário + senha)  [1:1 opcional] ← cliente
        │
        └── a ficha existe sem a conta; a conta se acopla depois
```

**Por que tabelas separadas.** Misturar públicos com privilégios distintos na
mesma tabela, diferenciados por um campo `role`, é a origem clássica de
escalonamento de privilégio. Separando, cliente virar administradora deixa de ser
improvável e passa a ser impossível por construção.

**Por que sessão própria em vez de biblioteca.** O fluxo de ativação por CPF +
data de nascimento, com duas tabelas de identidade e recuperação de senha pela
mesma porta, não é coberto por nenhuma biblioteca do ecossistema — todas
assumem um único tipo de usuário com e-mail. Adotar uma significaria lutar contra
ela em cada passo. Sessão opaca em cookie `httpOnly` + `SameSite=Lax`, tabela de
sessões no Postgres, token gerado por Web Crypto e senha em **Argon2id** é
problema resolvido, auditável e sem risco de dependência abandonada.

> Lucia foi descartada: o projeto foi descontinuado pelo autor e transformado em
> material de referência. Usá-la violaria a regra de não adotar biblioteca sem
> manutenção.

**Tratamento do CPF** (DEC-009): validado pelos dígitos verificadores, normalizado
para 11 dígitos, guardado como `cpfHash` (HMAC-SHA256, índice único por
organização) e `cpfEncrypted` (AES-256-GCM, para exibição). Vazamento de banco não
vira vazamento de CPF.

**Defesas do fluxo de primeiro acesso:** limite de tentativas por CPF e por IP com
bloqueio progressivo em Redis, notificação à profissional a cada ativação com ação
de revogar, e `AuditLog` de todo acesso.

## 4. Multi-tenancy

**Modelo:** banco único, schema único, isolamento por `organizationId`.

Descartado banco por tenant: custo e complexidade operacional incompatíveis com o
preço de um SaaS para autônomas. O modelo escolhido escala para dezenas de
milhares de organizações.

**Duas camadas de defesa:**

1. **Prisma Client Extension** que injeta `organizationId` em todo `where` e
   `create`, lendo o contexto da requisição via `AsyncLocalStorage`. Esquecer o
   filtro deixa de ser possível — a proteção não depende de disciplina.
2. **Row Level Security** no Postgres, como rede de segurança final caso algo
   escape da camada de aplicação.

## 5. Decisões de banco que evitam bugs caros

| Decisão                                    | Justificativa                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UUIDv7** gerado pelo Postgres 18         | `uuidv7()` é nativo na versão provisionada no Railway — não é preciso gerar na aplicação. Ordenável por tempo → localidade de índice de um inteiro sequencial, sem expor volume de negócio |
| **Dinheiro em centavos (`Int`)**           | Ponto flutuante em dinheiro é bug garantido. Formatação só através do value object `Money`                                                                                                 |
| **Datas em UTC**, timezone na organização  | Mata a classe de bugs "o faturamento do dia mudou depois da meia-noite"                                                                                                                    |
| **`EXCLUDE USING gist` sobre `tstzrange`** | Duas requisições simultâneas não conseguem, fisicamente, criar horários sobrepostos. Validação na aplicação é UX; garantia é do banco                                                      |
| **Snapshot de preço no atendimento**       | Reajustar o preço de um serviço não pode reescrever o histórico financeiro                                                                                                                 |
| **Soft delete + audit log**                | Cliente apagada por engano é recuperável; histórico financeiro é imutável                                                                                                                  |
| **Cronômetro como intervalos**             | Pausar/retomar vira lista imutável de `start`/`end`. Fechar o app no meio não perde nada, e o tempo é auditável                                                                            |

## 6. Entidades principais

`Organization` · `User` · `Membership` · `Session` · `Client` · `ClientAccount` ·
`ClientNote` · `ClientPhoto` · `Service` · `ServiceVariant` · `Appointment` ·
`AppointmentRequest` · `Attendance` · `AttendanceItem` · `ProductUsage` ·
`Product` · `StockMovement` · `Supplier` · `Payment` · `Transaction` ·
`FinancialCategory` · `Goal` · `Insight` · `AuditLog` · `Notification` · `Consent`

Modelagem detalhada na Fase 3.

## 7. Armazenamento de mídia

**Cloudflare R2** (DEC-010): 10 GB gratuitos e **egresso zero** — relevante porque
foto de antes e depois é muito mais vista do que enviada.

O que viabiliza o plano gratuito é a **compressão no dispositivo**: redimensionar
para no máximo 1600px no maior lado e converter para WebP/AVIF **antes do upload**.
Uma foto de 4 MB da câmera vira cerca de 150 KB — aproximadamente 60 mil fotos
dentro da cota gratuita, e upload rápido em 4G.

Upload direto do cliente para o R2 por URL assinada, sem passar pelo servidor.
Tudo atrás da porta `StorageService` em `core/storage` — trocar de provedor é
trocar um adapter.

## 8. PWA e sensação nativa

- `display: standalone`, `viewport-fit=cover`, `env(safe-area-inset-*)`, `100dvh`
- Callout, seleção de texto e overscroll bloqueados na casca — **preservados**
  dentro de campos de texto e conteúdo lido
- **Zoom no foco de input eliminado pela via correta:** `font-size: 16px` nos
  inputs, e **não** `maximum-scale=1`, que quebra o zoom por acessibilidade
- Transições de página com View Transitions API, com fallback em Motion
- **Web Push funciona no iPhone (16.4+) apenas com o app instalado** na tela de
  início — daí o fluxo de instalação desenhado da Fase 5
- **Feedback tátil:** o Safari no iOS não expõe `navigator.vibrate`. O
  `HapticsService` usa vibração no Android/Chrome e, no iOS, entrega equivalente
  visual/sonoro calibrado. Prometer háptico universal no iPhone seria falso

## 9. Performance — orçamento verificado no CI

| Métrica                       | Alvo         |
| ----------------------------- | ------------ |
| LCP em 4G                     | < 1.8s       |
| INP                           | < 200ms      |
| CLS                           | < 0.05       |
| JS da rota inicial            | < 130KB gzip |
| Dashboard com 2 anos de dados | < 1s         |

## 10. Acessibilidade

WCAG 2.2 **AA** como critério de aceite, não melhoria futura: contraste validado
por cálculo nos dois temas, alvos de toque ≥ 44px, foco visível, navegação
completa por teclado, `prefers-reduced-motion` em 100% das animações, rótulos
para leitor de tela, axe rodando no CI.

## 11. Ambientes

```
local (npm run dev)  →  preview (por PR)  →  staging  →  production
```

Build, testes E2E, migrations e auditorias rodam em CI/Vercel/Railway.
A máquina do dono roda **apenas** `npm run dev`.
