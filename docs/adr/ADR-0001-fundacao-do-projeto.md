# ADR-0001 · Fundação técnica do projeto

- **Status:** Aceito
- **Data:** 2026-07-31
- **Fase:** 0
- **Decisores:** dono do produto, agente

## Contexto

O RoHair será construído em 17 fases, ao longo de semanas, com duas frentes de
produto (painel profissional e portal da cliente) e a intenção declarada de virar
um SaaS comercial. Nesse horizonte, o custo de uma fundação frouxa não aparece na
primeira semana — aparece na décima, quando já é caro consertar.

A Fase 0 precisa responder a uma pergunta: **o que precisa estar de pé para que
todas as fases seguintes sejam verificáveis sem ninguém precisar lembrar de nada?**

## Decisão

Adotar uma fundação em que as regras do projeto são **impostas por ferramenta**,
nunca por disciplina.

### Stack base

Next.js 16.2 (App Router) · React 19.2 · TypeScript 5 · Tailwind 4 · Zod 4 ·
Vitest 4 · Playwright 1.62 · ESLint 9 (flat config) · Prettier 3.

### Rigor de tipos além do `strict`

Habilitados: `noUncheckedIndexedAccess`, `noImplicitOverride`,
`noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`,
`verbatimModuleSyntax`.

Deixado de fora **deliberadamente**: `exactOptionalPropertyTypes`, que entra em
conflito constante com props opcionais de React e de terceiros. O ruído gerado
supera o bug evitado neste projeto.

### Fronteiras entre camadas verificadas por lint

`eslint-plugin-boundaries` com política explícita: o domínio não importa nada
além de si mesmo, uma feature não importa outra feature, `shared` e `core` nunca
importam features, e Prisma só existe em `infrastructure/`.

A configuração foi **validada contra quatro cenários reais** antes de ser aceita:
import proibido de domínio para `shared` (falha), import legítimo dentro da mesma
feature (passa), import entre features distintas (falha), e projeto inteiro
(limpo). Essa verificação não foi cerimônia: as duas primeiras tentativas de
configuração pareciam corretas e **não acusavam nada** — uma regra que existe mas
nunca dispara é pior do que não ter regra, porque produz confiança falsa.

### Ambiente validado no boot

`src/core/env/env.ts` valida as variáveis com Zod e derruba a aplicação se algo
estiver inválido. Schemas de servidor e de cliente separados, com guarda em tempo
de execução contra acesso ao ambiente do servidor pelo navegador.

O protocolo das URLs é verificado por expressão regular explícita, e não por
`z.url()`: o parser de URL aceita `localhost:5432` como válido, lendo `localhost`
como esquema. Uma string de conexão sem protocolo passaria na validação e só
falharia ao conectar. **O teste que expôs isso foi escrito antes da correção.**

### Duas suítes de teste separadas

`domain` roda em Node puro, sem DOM e sem banco — é a suíte que precisa terminar
em menos de dois segundos, porque roda dezenas de vezes por hora. `ui` roda em
jsdom e é naturalmente mais lenta. Misturá-las puniria a primeira pela lentidão
da segunda.

### Design tokens antes de qualquer componente

Cor em OKLCH com dois temas de identidade própria (Porcelana e Veludo), expostos
ao Tailwind por `@theme inline` para permitir troca de tema sem recompilação.

## Alternativas consideradas

### `create-next-app` sem alterações

- **A favor:** zero esforço.
- **Contra:** `strict` sem as flags complementares, sem fronteiras entre camadas,
  sem validação de ambiente, sem separação de suítes.
- **Motivo da recusa:** cada um desses itens custa minutos agora e dias depois.

### Biome no lugar de ESLint + Prettier

- **A favor:** significativamente mais rápido, ferramenta única.
- **Contra:** o ecossistema de regras do Next e o `eslint-plugin-boundaries` não
  têm equivalente.
- **Motivo da recusa:** a regra de camadas é estrutural para este projeto, e é
  justamente o que não existe no Biome.

### Monorepo (Turborepo) com pacotes separados

- **A favor:** separação física entre design system, domínio e aplicações.
- **Contra:** sobrecarga de configuração e de build desproporcional para um
  produto com um único aplicativo implantável.
- **Motivo da recusa:** as fronteiras que o monorepo daria já estão garantidas
  pelo lint, sem o custo. Reavaliar na Fase 16, se houver um segundo executável.

## Consequências

**Positivas**

- Import indevido entre camadas quebra o CI, não a revisão de código
- Configuração inválida derrota o boot, não a produção
- Regra de negócio testável em milissegundos, sem banco
- Troca de tema sem recompilar, com contraste garantido por cálculo

**Negativas / custos aceitos**

- `noUnusedLocals` e `verbatimModuleSyntax` geram fricção durante a escrita
- A política de fronteiras precisará de manutenção a cada nova camada
- `eslint-plugin-boundaries` v7 tem documentação de migração imprecisa; a sintaxe
  em uso foi determinada empiricamente e está comentada no arquivo de configuração

**Reversibilidade**
Alta para todas as escolhas de ferramenta. Baixa para a estrutura de camadas —
mas ela é o ponto do projeto, não um detalhe.

## Impacto

- **Fases afetadas:** todas
- **Arquivos:** `tsconfig.json`, `eslint.config.mjs`, `vitest.config.mts`,
  `playwright.config.ts`, `src/core/env/env.ts`, `src/shared/ui/styles/*`,
  `.github/workflows/ci.yml`
- **Documentos:** [../02-ARQUITETURA.md](../02-ARQUITETURA.md),
  [../04-DECISOES.md](../04-DECISOES.md) (DEC-004)
