# ADR-0003 · Shared kernel, fatiamento em features e garantias no banco

- **Status:** Aceito
- **Data:** 2026-07-31
- **Fase:** 3
- **Decisores:** dono do produto, agente

## Contexto

A Fase 1 entregou o modelo v1 com **20 invariantes numeradas** e cinco cenários
que as exercitam. A Fase 3 precisa transformar isso em schema e código
testável — e, ao começar, quatro problemas apareceram de uma vez.

**1. A regra de camadas proibia o que o domínio mais precisa.** O
`eslint-plugin-boundaries` estava configurado com `domain → nada`. Literalmente
nada: nem `core`. Isso é correto quanto a framework e banco, mas torna
impossível ter um `Money` compartilhado — cada feature teria o seu, e dinheiro
duplicado é dinheiro que diverge.

**2. O corte em features vira lei.** O lint impede uma feature de importar
outra, então o fatiamento escolhido agora é caro de mudar depois: mover código
significa mover use case, repositório e teste juntos.

**3. Três coisas do modelo o Prisma não expressa** — a constraint de exclusão
por intervalo, o índice único parcial e o `uuidv7()` nativo.

**4. Existe um só Postgres, e ele é produção.** Rodar migration de CI contra o
Railway é `push --force` em produção: funciona até o dia em que não funciona.

## Decisão

### 1. Shared kernel em `core/kernel`

Nova camada, com regra própria: **o domínio pode importar o kernel, e o kernel
não importa nada** — nem `core`.

Contém `Result`, `Money`, `Cpf`, `Duration`, `TimeRange`, `Quantity` e
`PhoneNumber`. São conceitos do negócio inteiro, não de uma feature.

O kernel ser folha é o que preserva a promessa da camada: domínio testável em
milissegundos, sem banco e sem framework. Se ele pudesse importar `core`,
alguém colocaria acesso a banco dentro de um value object dentro de um mês.

**O `Cpf` é puro de propósito.** Valida, normaliza e mascara; não faz HMAC nem
criptografia, porque as duas precisam de chave secreta. O que precisa de chave
vive em `core/crypto`, fora do kernel.

### 2. Sete features, cortadas por agregado

`identity` · `clients` · `catalog` · `inventory` · `scheduling` · `attendance` ·
`finance`.

`Organization`, `AuditLog` e `Notification` ficam em `core`: são infraestrutura
de todas, não domínio de nenhuma.

O atrito previsível — finalizar um atendimento toca `attendance`, `inventory` e
`finance` numa transação só (INV-09) — resolve com **use case orquestrador
explícito**, não com evento. Evento assíncrono não dá transação única, e
transação única é DoD da Fase 9.

### 3. SQL escrito à mão para o que o Prisma não expressa

Sete blocos acrescentados manualmente ao fim da migration, sob um cabeçalho que
avisa que não são regenerados:

| #   | O quê                                    | Protege                  |
| --- | ---------------------------------------- | ------------------------ |
| 1   | `CREATE EXTENSION btree_gist`            | pré-requisito do próximo |
| 2   | `EXCLUDE USING gist` com `tstzrange [)`  | INV-01                   |
| 3   | Índice único parcial de `cpf_hash`       | INV-03, D-07             |
| 4   | Índice único parcial de intervalo aberto | INV-07                   |
| 5   | `CHECK` de fim depois do início          | sanidade                 |
| 6   | `CHECK` de item filho sem preço          | INV-19                   |
| 7   | `CHECK` de valores não negativos         | sanidade                 |

O intervalo é **semiaberto `[)`**, a mesma semântica de `overlaps()` no kernel.
As duas precisam concordar, ou a tela diria uma coisa e o banco outra.

### 4. Postgres efêmero no CI

Job próprio com `postgres:18-alpine` como service container. Aplica as
migrations em banco vazio, **aplica de novo** para provar idempotência, e roda
uma suíte `db` que verifica as constraints — inclusive uma corrida real de dois
agendamentos simultâneos.

A versão 18 não é detalhe: `uuidv7()` é nativo dela. Um Postgres 16 passaria em
quase tudo e quebraria na criação das tabelas.

### 5. Suíte de teste separada por custo

`domain` (Node puro, < 2s) · `ui` (jsdom) · `db` (rede, só no CI). A suíte `db`
se **pula sozinha** sem `DATABASE_URL`: na máquina do dono só roda `npm run
dev`, e quebrar `npm test` local não ajudaria ninguém.

## Alternativas consideradas

### A — duplicar os value objects em cada feature

- **A favor:** mantém `domain → nada`, sem exceção nenhuma.
- **Contra:** `Money` em sete versões. A primeira divergência de arredondamento
  quebra o fechamento do mês e ninguém descobre de onde veio.
- **Recusa:** a regra existe para proteger o domínio de framework e de banco,
  não de si mesmo. Um kernel folha respeita o espírito e evita a duplicação.

### B — segundo banco no Railway como staging

- **A favor:** mais fiel à produção, inclusive extensões e versão exata.
- **Contra:** mais um serviço para manter e pagar, e o CI passaria a depender de
  rede externa para rodar.
- **Recusa:** contêiner efêmero custa zero e dá isolamento perfeito entre
  execuções. Fidelidade a mais só importaria se usássemos recurso proprietário
  do Railway, e não usamos.

### C — aceitar que a sobreposição de horários seja garantida só na aplicação

- **A favor:** um bloco de SQL manual a menos.
- **Contra:** duas requisições simultâneas leem "livre" antes de qualquer
  escrita, e as duas gravam.
- **Recusa:** é o DoD da Fase 8. Validação na aplicação é UX; garantia é do
  banco.

## Consequências

**Positivas**

- Domínio testado sem banco: **116 testes em 245ms**
- Cobertura do domínio em **92,7%** de statements e 96,9% de linhas
- Migration exercitada em banco limpo a cada commit, e o Railway só é tocado no
  deploy
- Prisma isolado: o lint impede o import fora de `infrastructure/` e de `core/db`

**Negativas / custos aceitos**

- **Três dependências novas** — `prisma`, `@prisma/client` + `@prisma/adapter-pg`
  e `pg`. A Fase 2 fechou em zero; aqui não havia caminho honesto sem ORM
- O SQL manual **não é regenerado** por `prisma migrate diff`. Se alguém
  recriar a migration do zero, precisa reanexar os sete blocos. O cabeçalho no
  arquivo avisa, mas é disciplina, não ferramenta
- O CI ficou mais lento: um job a mais, com contêiner
- A migration **não foi verificada localmente** — o Docker desta máquina não
  tem daemon rodando. A primeira verificação real acontece no CI

**Reversibilidade**

Média. O kernel e o fatiamento são baratos de ajustar enquanto não há features
construídas em cima. O SQL manual é fácil de mudar antes de existir dado real;
depois de produção, cada alteração vira migration própria.

## Impacto

- **Fases afetadas:** 4 a 12 (todas consomem kernel e repositórios), 13 (a
  camada de comandos serializáveis nasce daqui)
- **Arquivos e módulos afetados:** `core/kernel/`, `core/crypto/`, `core/db/`,
  `features/*/`, `prisma/`, `eslint.config.mjs`, `.github/workflows/ci.yml`
- **Documentos a atualizar:** `02-ARQUITETURA.md` (camadas e kernel),
  `03-ROADMAP.md`, `00-ESTADO-ATUAL.md`
