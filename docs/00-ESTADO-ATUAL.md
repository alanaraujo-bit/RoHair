# Estado Atual do Projeto

> **Este é o arquivo mais importante do repositório.** Leia inteiro antes de
> qualquer ação. Ele existe para que uma janela de contexto nova saiba
> exatamente onde continuar, sem precisar de nenhum histórico de conversa.

---

## ⚡ Leia isto primeiro

**O ritmo de trabalho mudou em 2026-08-01 (DEC-014).**

> **Não apresente fase. Não peça aprovação. Construa a tela, suba para produção,
> teste lá, e avise o que subiu.**

O dono interrompeu o ciclo anterior porque três fases inteiras se passaram antes
de existir uma tela navegável. Ele estava certo. O roadmap virou **mapa**, não
portão.

**E nada roda na máquina dele** (DEC-015). Nem Docker, nem banco local, nem
servidor. Ele revisa em produção, pelo iPhone.

---

## Snapshot

| Campo                     | Valor                                                          |
| ------------------------- | -------------------------------------------------------------- |
| **Última atualização**    | 2026-08-02                                                     |
| **O que está no ar**      | **https://rohair.aionixdev.com/painel** ← painel **com login** |
| Catálogo do design system | https://rohair.aionixdev.com/design                            |
| Banco                     | Railway · Postgres 18 · migrado e populado                     |
| CI                        | ✅ Verde — qualidade, banco, build, E2E                        |
| **Dívida crítica**        | ✅ **Nenhuma.** O painel deixou de estar aberto em 2026-08-02  |
| Trabalho em andamento     | Estoque e financeiro, para os alertas terem para onde levar    |

> ⚠️ **O endereço mudou de mãos.** `rohair.vercel.app` **não é nosso** e devolve
> 404 — a documentação anterior estava errada. O apelido de produção é
> `rohair.aionixdev.com` (e `rohair-aionixdev.vercel.app`).

---

## 1. O que JÁ FUNCIONA em produção

Sete telas navegáveis, lendo o Postgres real. **Não é mock.**

| Rota                                | O que faz                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `/entrar`                           | Login da equipe: e-mail ou usuário + senha, Argon2id, bloqueio progressivo       |
| `/painel`                           | "Sobrou hoje" em destaque, agenda do dia, alertas de estoque e de cliente sumida |
| `/painel/agenda`                    | Grade por hora das 9h às 20h, com "vaga" nos espaços livres                      |
| `/painel/clientes`                  | Lista ordenada por **quem precisa de ação**, não alfabética                      |
| `/painel/clientes/[id]`             | Ficha: alerta de química no topo, estatísticas, histórico                        |
| `/painel/atendimento/[id]`          | **O atendimento** — escolha de serviço, anamnese, cronômetro, produtos, resumo   |
| `/painel/atendimento/[id]/checkout` | Fechamento com **o lucro na hora**, forma de pagamento e cortesia                |
| `/design`                           | Catálogo dos 19 primitivos do design system, nos dois temas                      |

### O atendimento, do início ao fim

Uma rota só, quatro momentos, porque a pergunta dela ao abrir o celular é sempre
"onde eu estou nesta cliente?". O mesmo link leva ao lugar certo, inclusive
depois de fechar o app no meio.

1. **Escolher o serviço.** Se nada for químico, já começa a trabalhar — um toque
   a menos, porque não havia decisão nenhuma para tomar ali.
2. **Anamnese**, se houver química: as cinco perguntas dela, pré-preenchidas
   pelo último atendimento, terminando no teste de mecha. Aprovar já inicia o
   cronômetro. **Reprovar é desfecho de sucesso** — o produto do teste vira
   custo registrado e nada é cobrado.
3. **Em andamento**: cronômetro que vive no banco (fechar o app não perde nada),
   produtos pré-marcados pelo que o serviço costuma usar, cada mudança salvando
   sozinha.
4. **Checkout**: total, forma de pagamento, cortesia e **o lucro na hora** — o
   antídoto direto para a frase da Rosiele.

Finalizar é **uma transação só** (INV-09): status, pagamento, baixa de estoque e
lançamento no caixa entram juntos ou não entram.

### Dados de demonstração já no banco

Organização **Rosiele Hair**, com 6 clientes (Carla, Juliana, Márcia, Ana
Beatriz, Paula, Denise), catálogo de 4 serviços, 4 produtos, agenda de hoje com
2 horários, e histórico que dispara os dois alertas.

Regerar a qualquer momento com `npm run db:seed` — a semente é **idempotente**.

### Conta da equipe

Existe uma conta OWNER (`rosiele`) na organização Rosiele Hair. A senha do
primeiro acesso foi entregue ao dono em arquivo fora do repositório, **nunca
pelo chat**. Criar outra conta ou trocar a senha:

```
echo "a-senha" | npm run db:owner -- <usuario> <email> "<Nome>"
```

Rodar de novo para o mesmo usuário **troca a senha e derruba as sessões
abertas** — é também a recuperação de senha da OWNER, que não tem a quem pedir.

---

## 2. O que NÃO existe ainda

| Falta                 | Impacto                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contas pelo painel    | A OWNER ainda não cria conta de assistente pela interface; só pelo script. Papéis existem no banco, mas nenhuma tela lê `role` ainda                              |
| Identidade da cliente | `ClientAccount`, primeiro acesso por CPF, autocadastro e a rota de escape da [D-08](04-DECISOES.md#d-08) — a segunda metade da Fase 4, que vai junto com o portal |
| Botões sem ação       | "Agendar" e "WhatsApp" na ficha ainda não fazem nada. "Iniciar atendimento" **funciona**                                                                          |
| Fotos do atendimento  | O antes e depois é a próxima coisa que falta na tela de atendimento; depende do upload para o R2                                                                  |
| Retorno e cuidado     | O checkout ainda não sugere o retorno nem registra a orientação de casa — as duas coisas dependem, respectivamente, de "novo horário" e do portal                 |
| Estoque e financeiro  | Rotas `/painel/estoque` e `/painel/dinheiro` não existem — e o alerta da tela Hoje **já aponta para a primeira**, dando 404                                       |
| Portal da cliente     | Nada construído                                                                                                                                                   |
| PWA                   | Sem manifest, sem service worker, sem fluxo de instalação                                                                                                         |

---

## 3. Próximo passo imediato

**Construir, nesta ordem — sem apresentar nada, sem pedir aprovação:**

1. **Estoque** (`/painel/estoque`). É o próximo por dois motivos: o alerta da
   tela Hoje já leva para lá e dá 404, e o atendimento já está dando baixa —
   existe saldo real no banco sem nenhuma tela que o mostre.
2. **Financeiro** (`/painel/dinheiro`), incluindo **receber fiado**, que hoje
   não tem como acontecer (DEC-018).
3. **Fotos de antes e depois** no atendimento, com upload para o R2 — lembrar de
   **rotacionar o token** antes de entrar foto real de cliente.
4. **Portal da cliente** — e com ele a segunda metade da autenticação
   (`ClientAccount`, primeiro acesso por CPF, D-07 e D-08). As duas coisas são a
   mesma entrega: identidade de cliente sem portal não tem onde ser usada.

~~Login e sessão~~ · ~~Tela de atendimento~~ — **feitos em 2026-08-02.**

O desenho de cada tela está em [12-WIREFRAMES.md](12-WIREFRAMES.md); a
prioridade, em [13-BACKLOG.md](13-BACKLOG.md).

---

## 4. Onde as coisas estão no código

```
src/
  proxy.ts                ← porta do painel (era "middleware", renomeado
                            porque o Next 16.2 depreciou a convenção)
  app/
    entrar/                 tela de login + Server Action
    painel/                 ← AS TELAS QUE ESTÃO NO AR
      atendimento/[id]/       o atendimento e o checkout
      layout.tsx              casca com navegação inferior
      page.tsx                Hoje
      agenda/page.tsx
      clientes/page.tsx
      clientes/[id]/page.tsx  ficha
    design/                 catálogo do design system
  core/
    kernel/                 Result · Money · Cpf · Duration · TimeRange ·
                            Quantity · PhoneNumber — o único módulo que o
                            domínio pode importar. Não importa nada.
    auth/                   nome do cookie e vida da sessão — em `core` porque
                            proxy, infraestrutura e caso de uso precisam
                            concordar sobre o mesmo número
    crypto/cpf-crypto.ts    HMAC + AES-GCM do CPF
    crypto/session-token.ts token opaco + SHA-256 que vai para o banco
    db/client.ts            único lugar que instancia o Prisma
    db/generated/           cliente gerado (gitignored, feito no postinstall)
    env/env.ts              validação de ambiente com Zod
  features/
    attendance/             agregado + casos de uso + a view que a tela consome
                            (nenhum número é calculado na página)
    auth/                   senha, identificador, bloqueio progressivo,
                            caso de uso de login, Argon2id, sessão
    clients/                porta do repositório + adapter Prisma
    painel/                 leituras das telas que estão no ar
  shared/ui/
    primitives/             19 primitivos do Áurea
    icons/                  14 ícones autorais do domínio da beleza
    styles/                 tokens.css · base.css · color.ts + teste de contraste
    theme/                  alternador Porcelana/Veludo
prisma/
  schema.prisma             22 modelos
  migrations/               inclui SETE BLOCOS DE SQL ESCRITOS À MÃO
  seed.ts · seed-catalog.ts semente idempotente + catálogo do domínio
```

**Cuidado com a migration:** os sete blocos no fim do `migration.sql` — EXCLUDE
gist, índices parciais, CHECKs — **não são regenerados** por
`prisma migrate diff`. Recriar a migration do zero exige reanexá-los.

---

## 5. Comandos

| Comando                                        | O que faz                                              |
| ---------------------------------------------- | ------------------------------------------------------ |
| `npm run verify`                               | Tipos + lint + testes. **Rodar sempre antes de subir** |
| `npm run build`                                | Build de produção                                      |
| `npm run db:seed`                              | Repopula o banco (idempotente)                         |
| `npm run db:deploy`                            | Aplica migrations                                      |
| `npm run db:owner`                             | Cria a primeira OWNER ou troca a senha dela            |
| `git push`                                     | Commit direto na `main` → CI → deploy automático       |
| `npx vercel logs https://rohair.aionixdev.com` | Erro de runtime em produção                            |
| `npx vercel ls rohair`                         | Estado dos deploys                                     |

`DATABASE_URL` e demais segredos vivem em `.env.local`, nunca versionado.

---

## 6. Decisões que não se rediscutem

Justificativas completas em [04-DECISOES.md](04-DECISOES.md) e [adr/](adr/).

**Produto**

- **O número grande do painel é "sobrou", nunca "entrou"** — faturamento é a
  ilusão que ela já tem, e o app não pode ser mais uma fonte dela
- Alerta de química no topo da ficha, acima de qualquer métrica — é segurança
- Reprovar no teste de mecha é desfecho de sucesso, não erro
- Lista de clientes ordenada por ação, nunca alfabética
- 🗣️ Vocabulário dela: **"vaga"**, **"nutrição"**, **frasco**
- Fusão de fichas é sugerida, nunca automática (D-07)
- O sistema chega sabendo o domínio; ela seleciona (DEC-013)
- Dois públicos, dois app shells, um só código (DEC-007)

**Técnico**

- Commit direto na `main`, sem PR (DEC-012)
- Shared kernel em `core/kernel`; o domínio só importa ele (ADR-0003)
- `app` é a raiz de composição — única camada que enxerga `infrastructure`
- Overlay com `<dialog>` nativo, não Radix (ADR-0002)
- Par `action`/`on-action`: nunca `text-white` sobre cor de marca
- Dinheiro em centavos · datas UTC · dia do atendimento = finalização (INV-18)
- Prisma só em `infrastructure/` e `core/db`, imposto por lint

---

## 7. Armadilhas conhecidas

| Armadilha                                                                                    | O que fazer                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy da Vercel travado em "Deploying outputs"                                              | Já aconteceu e bloqueou a fila por 15min. `npx vercel remove <url> --yes` e o próximo anda                                                                                                                          |
| `DATABASE_URL` da Vercel estava quebrado (host `base`)                                       | Corrigido em 2026-08-01. Se aparecer P1001, conferir a variável antes de suspeitar do código                                                                                                                        |
| `vercel env pull` não traz valor de variável Encrypted                                       | Use `vercel env ls` só para conferir existência                                                                                                                                                                     |
| `npm audit`: 2 vulnerabilidades altas em `next` via `sharp`                                  | Pré-existente, não introduzida por nós. Tratar na Fase 15                                                                                                                                                           |
| Aviso do `eslint-plugin-boundaries` sobre "legacy selector syntax" e sobre padrão de arquivo | Ruído conhecido, não é erro. O segundo vem do `src/proxy.ts`, que é um arquivo solto e precisa ser classificado como `app`                                                                                          |
| `rohair.vercel.app` devolve 404                                                              | **Não é nosso.** O endereço certo é `rohair.aionixdev.com`. A documentação de 2026-08-01 estava errada                                                                                                              |
| Login some depois de trocar a senha da OWNER                                                 | É o desenho: `db:owner` apaga as sessões abertas. Entrar de novo resolve                                                                                                                                            |
| `too many clients already` vindo do Postgres                                                 | O singleton do Prisma vale **em produção também**. Guardá-lo só fora de produção abre um pool por invocação na Vercel. Corrigido em 2026-08-02 — se voltar, olhar `core/db/client.ts` antes de suspeitar do Railway |
| `<Link>` com `<Button>` dentro                                                               | HTML inválido, e o link fica **sem nome acessível**. Use `buttonClasses()` no próprio `Link`                                                                                                                        |
| Constraint do banco recusando o que a tela deixou passar                                     | São sete blocos de SQL à mão. `payment_valor_positivo` já derrubou o checkout de um serviço de preço zero. Erro `23514` é bug da aplicação, não do banco                                                            |
| Repositório **público** no GitHub                                                            | Decisão aberta do dono. Não há segredo versionado                                                                                                                                                                   |
| Rotacionar o token do R2                                                                     | Antes de entrar foto real de cliente. TTL vence em 2027-07-31                                                                                                                                                       |

---

## 8. Mapa dos documentos

| Documento                                                  | Para quê                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| [01-VISAO-PRODUTO.md](01-VISAO-PRODUTO.md)                 | Posicionamento, princípios, anti-objetivos               |
| [02-ARQUITETURA.md](02-ARQUITETURA.md)                     | Stack, camadas, tenancy, PWA                             |
| [03-ROADMAP.md](03-ROADMAP.md)                             | **Mapa** do que falta construir                          |
| [04-DECISOES.md](04-DECISOES.md)                           | DEC-001 a DEC-015 e pendências                           |
| [05-PROTOCOLO-DE-TRABALHO.md](05-PROTOCOLO-DE-TRABALHO.md) | Como trabalhamos (reescrito)                             |
| [06-GLOSSARIO.md](06-GLOSSARIO.md)                         | Vocabulário da beleza e do produto                       |
| [07-FLUXOS.md](07-FLUXOS.md)                               | Identidade das duas pontas — **base da próxima entrega** |
| [08-MODELO-DE-DOMINIO.md](08-MODELO-DE-DOMINIO.md)         | Agregados e as 20 invariantes                            |
| [09-CONFIGURACAO.md](09-CONFIGURACAO.md)                   | Catálogo semente e o que o sistema aprende               |
| [10-CENARIOS.md](10-CENARIOS.md)                           | Os cinco cenários e os cinco buracos que acharam         |
| [11-PERSONAS.md](11-PERSONAS.md)                           | Personas e Jobs to be Done                               |
| [12-WIREFRAMES.md](12-WIREFRAMES.md)                       | **As 16 telas — o desenho do que construir**             |
| [13-BACKLOG.md](13-BACKLOG.md)                             | 42 itens priorizados                                     |
| [descoberta/](descoberta/)                                 | A conversa com a Rosiele e o que saiu dela               |
| [adr/](adr/)                                               | ADR-0001 fundação · 0002 Áurea · 0003 domínio            |

---

## 9. A frase que orienta o produto inteiro

> 🗣️ **"Fim do dia estou com dinheiro mas fim do mês não tenho mais devido
> comprar algo que está faltando."** — Rosiele

Ela enxerga **caixa**, não lucro. E compra produto sempre **depois** da falta.
Os dois problemas são o mesmo: o custo do produto não está ligado ao atendimento
que o consumiu.

**Critério de sucesso do produto:** no fim do mês, ela não é mais surpreendida.

É por isso que o painel mostra "sobrou" e não "entrou", que o lucro aparece no
checkout de cada atendimento, e que o alerta de estoque fala em atendimentos
restantes em vez de quantidade.

---

## 10. Log de sessões

Ordem cronológica inversa — mais recente no topo.

### 2026-08-02 (2) — O atendimento inteiro no ar, e quatro bugs que só produção mostra

- **O coração do produto está de pé**: escolher serviço → anamnese → cronômetro
  → checkout, com o lucro na hora. Percorrido em produção, no navegador, nos
  dois desfechos — o normal e o do teste de mecha reprovado.
- **Reprovar no teste funciona como desenhado**: sem vermelho de erro, o produto
  do teste vira custo registrado e nada é cobrado da cliente.
- **Finalizar é uma transação só** (INV-09) — status, pagamento, baixa de
  estoque e caixa.
- **DEC-018:** "sobrou" passou a contar **dinheiro recebido**, não preço
  combinado. Fiado tem preço e não tem dinheiro.
- **Quatro defeitos, todos achados no ar e nenhum em teste local:**
  1. **`too many clients already`.** O singleton do Prisma só valia fora de
     produção — um cuidado com hot reload que, em serverless, abre um pool por
     invocação. O banco recusou conexão no meio de um atendimento. É o bug mais
     sério do dia.
  2. **Checkout de serviço com preço zero derrubava a página.** A constraint
     `payment_valor_positivo` recusa pagamento de R$ 0 — e está certa. Junto,
     finalizar deixou de virar tela branca quando algo inesperado falha: ela
     acabou de trabalhar três horas, erro do sistema não pode custar isso.
  3. **`<Link>` com `<Button>` dentro.** HTML inválido; o link fica **sem nome
     acessível**. Descoberto porque o teste não achou o botão "Finalizar" que
     estava na tela. Nasceu `buttonClasses()`.
  4. **O cronômetro contava o intervalo aberto duas vezes** — 14:47 num
     atendimento de 8 minutos. Achado comparando a tela com o checkout.
- **Dois achados de arquitetura, os dois por ferramenta e não por revisão:** o
  teste dos casos de uso pegou uma leitura logo após escrita, e o lint de
  camadas pegou a página calculando preço menos custo por conta própria.

### 2026-08-02 (1) — O painel deixou de estar aberto na internet

- **A dívida crítica foi paga.** `/entrar` no ar, e as quatro rotas do painel
  respondem 307 para `/entrar` sem sessão. Testado em produção, no navegador,
  com senha certa, senha errada e conta inexistente.
- **Argon2id** por `@node-rs/argon2` — binding nativo com binário pronto, que é
  o que não quebra na Vercel. Parâmetros explícitos (19 MiB, t=2, p=1), porque
  padrão de biblioteca pode cair numa atualização menor e ninguém veria.
- **Sessão por token opaco** (DEC-017): o cookie leva 256 bits aleatórios, o
  banco guarda só o SHA-256. Cookie `__Host-`, `httpOnly`, `Secure`,
  `SameSite=Lax` — conferido no navegador, em produção.
- **`organizacaoAtual()` morreu.** Era a função que pegava a primeira
  organização do banco. Agora todo `organizationId` vem da sessão, inclusive na
  ficha — trocar o id na URL não alcança cliente de outra organização.
- **O guarda ficou em cada página, não só na casca.** Layout e página renderizam
  em paralelo no App Router: um guarda só no layout deixaria a consulta da
  página acontecer com o redirecionamento a caminho. Não é detalhe de estilo, é
  o que separa "protegido" de "parece protegido".
- **Bloqueio progressivo provado em produção**, e não só em teste: seis erros
  seguidos devolveram 27s → 57s → 2min → 4min, e a senha **certa** durante o
  bloqueio também foi barrada. Vive no Postgres, não no Redis (**DEC-016**).
- **Duas coisas que só apareceram por ir ao ar:**
  - `rohair.vercel.app`, registrado ontem como o endereço de produção, **não é
    nosso** e devolve 404. O apelido real é `rohair.aionixdev.com`.
  - Errar a senha **apagava o campo do usuário** — o React 19 limpa o formulário
    quando a Server Action termina. Descoberto olhando a captura de tela, não o
    código; corrigido devolvendo o identificador no estado da ação.
- **`middleware.ts` virou `proxy.ts`**: o Next 16.2 depreciou a convenção antiga
  e avisava a cada build. Construir em cima de API depreciada é dívida com data
  marcada.
- **Fase 4 pela metade**, de propósito: a identidade da **cliente** só faz
  sentido junto com o portal, e vai com ele.

### 2026-08-01 — O dono parou o processo. O aplicativo foi ao ar.

- **Interrupção:** _"Tá enrolando muito, não tô vendo telas. (…) Lance tudo em
  produção e teste em produção mesmo."_ Ele estava certo — três fases sem uma
  tela. Virou **DEC-014**, e este documento e o `CLAUDE.md` foram reescritos.
- **Repreensão justa:** eu tinha tentado subir um contêiner Docker na máquina
  dele. Virou **DEC-015** — nada roda lá, nem `npm run dev`.
- **Migrations aplicadas em produção** e semente idempotente rodada no Railway.
- **Quatro telas no ar**, lendo o banco real: Hoje, Agenda, Clientes e Ficha.
- **Dois problemas que só apareceram por colocar no ar:**
  - O `DATABASE_URL` da Vercel apontava para um host chamado literalmente
    `base` — placeholder colado errado na Fase 0. O painel dava 500 com P1001.
  - Um deploy travou 15 minutos em "Deploying outputs" e bloqueou a fila.
- **O lint de fronteiras pegou dois erros reais**: `application` importando
  utilitário de `shared`, e `app` sem permissão para ver `infrastructure` — mas
  `app` é a raiz de composição e precisa escolher o adapter concreto.
- Roadmap passou a refletir a realidade: Fases 5, 6 e 8 parcialmente no ar,
  **Fase 4 marcada como vermelha** porque o painel está sem login.

Ordem cronológica inversa — mais recente no topo.

### 2026-07-31 (14) — Fase 3 executada · domínio de pé

- **Shared kernel criado (ADR-0003).** A regra de camadas dizia `domain → nada`,
  literalmente nada — nem `core`. Correto quanto a framework e banco, mas
  tornava impossível ter um `Money` compartilhado, e dinheiro duplicado é
  dinheiro que diverge. Nasce `core/kernel`, que o domínio pode importar e que
  não importa nada.
- **O `Cpf` ficou puro de propósito:** valida, normaliza e mascara, sem HMAC nem
  criptografia, porque as duas precisam de chave. O que precisa de chave foi
  para `core/crypto`, fora do kernel — senão o domínio deixaria de ser testável
  sem ambiente.
- **Sete features cortadas por agregado**, não por tela. O atrito previsível —
  finalizar atendimento toca três features numa transação só — resolve com use
  case orquestrador, não com evento: evento assíncrono não dá transação única.
- **Sete blocos de SQL escritos à mão**, incluindo o `EXCLUDE USING gist`. Achei
  um erro de sintaxe ao revisar: expressão em `EXCLUDE` precisa de parênteses
  próprios, e `COALESCE(...) WITH =` teria falhado na primeira aplicação.
- **Postgres 18 efêmero no CI**, com o job aplicando a migration duas vezes para
  provar idempotência — um deploy que reexecuta não pode derrubar produção.
- **116 testes em 245ms**, cobertura de 92,7%.
- **A migration passou no CI na primeira execução**, inclusive na reaplicação e
  na suíte de constraints. Não foi possível testá-la localmente (Docker sem
  daemon), então o CI é a única rede de segurança para o SQL manual.

### 2026-07-31 (13) — Fase 2 aprovada e fechada · Fase 3 apresentada

- Dono aprovou o catálogo do Áurea. **Fase 2 concluída**, todos os itens do DoD.
- Fase 3 apresentada, aguardando o "pode ir".
- A decisão que a Fase 3 precisa tomar antes de qualquer schema é o **fatiamento
  em features** — as fronteiras que o `eslint-plugin-boundaries` vai impor. Errar
  o corte é caro: mover código entre features depois significa mover use case,
  repositório e teste juntos.

### 2026-07-31 (12) — Fase 2 executada · Áurea de pé

- **19 primitivos, 14 ícones autorais, zero dependências novas.** A lista saiu
  dos wireframes: entraram sete que ninguém tinha previsto (MoneyFigure, Timer,
  SafetyAlert, DecisionGate, PhotoCompare, SeedPicker) e saíram três que nenhuma
  tela usa (Tabs, ContextMenu, Avatar isolado).
- **O teste de contraste reprovou a paleta da Fase 0 em quatro pares.** O pior:
  branco sobre o rosa do Veludo dava **2.17:1** — todo botão primário do tema
  escuro teria texto ilegível. Nasceu o par `action`/`on-action`.
- **Duas trocas de escopo, registradas em ADR-0002:** catálogo em rota do app no
  lugar do Storybook (que mantém build e CSS próprios e poderia passar enquanto o
  app quebra), e `<dialog>` nativo no lugar de Radix. A primeira **contraria o
  que foi aprovado** e está comunicada.
- **O lint pegou dois erros reais meus** no catálogo: `Date.now()` em render
  (impuro e quebraria hidratação) e `setState` dentro de efeito. Resolvido com
  `useSyncExternalStore`, a mesma ferramenta que a store de tema já usava.
- **O E2E pegou três**: eu tinha afirmado que o fundo do modal ficaria invisível
  (ele fica visível, só inerte), o clique no `input` de uma chave `sr-only` não
  funciona (o alvo real é o rótulo), e o botão de ferramentas do Next entrava na
  varredura de alvo de toque.
- `npm run verify` verde: typecheck, lint, 37 testes. Build gera `/design`.

### 2026-07-31 (11) — Fase 1 aprovada e fechada · Fase 2 apresentada

- Dono aprovou a Fase 1. **Todos os itens do DoD cumpridos**; fase fechada.
- Fase 2 apresentada, aguardando o "pode ir".
- Ao preparar a apresentação, revisitei o que a Fase 0 deixou: a base do design
  system está mais adiantada do que o roadmap sugeria. Cor, tipografia, raio,
  sombra e movimento **já existem**, com os dois temas desenhados separadamente.
  A Fase 2 completa em vez de começar — registrado na seção 5.
- **Proposta de mudança de escopo da Fase 2:** a lista de primitivos do roadmap era
  genérica, escrita antes de existirem telas. Agora existem 16 wireframes, e a
  lista deve ser **derivada deles** — o que revela primitivos que faltavam
  (comparador de fotos, cronômetro, portão de decisão, número financeiro) e outros
  que ninguém vai usar.

### 2026-07-31 (10) — Fase 1 entregue por inteiro

- **1.6 · Cinco cenários** ([10-CENARIOS.md](10-CENARIOS.md)). Cada um escolhido
  para **atacar** uma parte do modelo, não para confirmá-la. Acharam **cinco
  buracos**, todos corrigidos; o modelo subiu para **v1** com as invariantes
  INV-18, INV-19 e INV-20 novas e INV-16 e INV-17 reescritas.
- **1.7 · Personas** ([11-PERSONAS.md](11-PERSONAS.md)) escritas do domínio. A
  Rosiele é a primeira instância da persona, não a definição dela.
- **1.8 · Dezesseis wireframes** ([12-WIREFRAMES.md](12-WIREFRAMES.md)) —
  onboarding, 11 telas do painel, 4 do portal. Regra dos 3 toques verificada nas
  seis ações do dia a dia; a única em risco era "dar baixa em produto", resolvida
  tirando-a das mãos dela.
- **1.9 · Escopo fechado** das Fases 4 e 6 a 12 no roadmap, cada uma com link para
  a tela correspondente.
- **1.10 · Backlog** ([13-BACKLOG.md](13-BACKLOG.md)) — 42 itens em P0 a P3,
  priorizados por **distância até a dor central**, não por esforço nem por fase.
  Quatro itens sem JTBD, de propósito: são invariantes de segurança.
- **Falta só o aceite do dono** para fechar a fase e apresentar a Fase 2.

### 2026-07-31 (9) — Descoberta vira configuração · Fase 1B destravada

- **DEC-013, por correção do dono.** Eu tinha escrito uma segunda rodada de
  perguntas pedindo preço, duração, custo e horário. Ele cortou: _"é um sistema,
  ela vai se adaptando… na hora de cadastrar ela vai selecionando o que precisa"_.
- Estava certo. Aquilo não era descoberta, era **campo de cadastro** — e um método
  que exige entrevistar cada profissional não escala para a Fase 16.
- Curioso: eu estava aplicando o princípio _"o app trabalha, a usuária confirma"_
  em toda tela **menos** na primeira.
- **[09-CONFIGURACAO.md](09-CONFIGURACAO.md) escrito** — três níveis: o que vem
  pronto (catálogo semente do domínio da beleza), o que ela configura (com padrão
  sugerido) e o que o sistema aprende medindo o uso.
- **Decidi o que não é configurável** em vez de perguntar: atendimento simultâneo
  permitido no modelo, serviço sempre em lista, pagamento parcial e cortesia como
  estados de primeira classe, `Membership` desde a Fase 3. Padrão: modelo
  permissivo, interface simples. O que é barato agora e caro depois entra já.
- **D-05 resolvida** — virou chave de configuração, com padrão "solicitar".
  M-01 a M-12 todas resolvidas, nenhuma dependendo de entrevista.
- Roteiro da rodada 2 **apagado**; seu conteúdo virou o onboarding em cinco passos.
- **A fase destravou.** Bloqueio ativo: nenhum.

### 2026-07-31 (8) — Fluxo de git simplificado

- **DEC-012:** acabou o PR e a branch por fase. O agente commita direto na `main`,
  o CI roda no push e a Vercel publica. O dono revisa o produto pelo iPhone, não o
  diff no GitHub.
- Nada de verificação se perde: o CI já dispara em `push: branches: [main]`.
- O item de DoD da Fase 0 sobre preview deployment foi **removido** — sem PR não
  há preview. Com isso a Fase 0 fecha com todos os itens vigentes cumpridos.
- Branch `fase-01-descoberta` mesclada e apagada.

### 2026-07-31 (7) — Primeira rodada de respostas · modelo corrigido

- Rodada 1 respondida **por escrito, uma linha por bloco**, respondendo aos títulos
  em vez das perguntas. Diagnóstico completo em
  [leitura-01.md](descoberta/leitura-01.md).
- **Bug no meu instrumento:** o bloco "A outra ponta" colidiu com "ponta" do
  domínio do cabelo. Escrevi um glossário sobre colisão de vocabulário e caí nela
  no título de um bloco.
- **Ela entregou a tese do produto de graça:** _"Fim do dia estou com dinheiro mas
  fim do mês não tenho mais devido comprar algo que está faltando."_ Caixa em vez
  de lucro, e compra reativa de produto. Consequência: o número de destaque do
  painel não pode ser faturamento.
- **Achado principal — `HairAssessment`.** Ela descreveu a mesma anamnese duas
  vezes, espontaneamente. Eu tinha modelado como texto livre; é formulário
  estruturado que decide se o serviço pode acontecer. Virou entidade.
- **Estado novo — `ENCERRADO_SEM_SERVICO`.** O teste de mecha pode reprovar, e o
  modelo não previa isso. É a resposta real ao "atendimento que deu errado" que ela
  respondeu com "nunca deu" — para ela é procedimento normal de segurança.
- M-08 resolvida; M-09 estava no eixo errado (curvatura, não comprimento); M-11 e
  M-12 nasceram. Glossário corrigido: **nutrição**, não hidratação; **"vaga"**, não
  horário; corte de pontas é rotina.
- [D-06](04-DECISOES.md#d-06--escopo-do-portal-da-cliente) parcialmente resolvida:
  o "Meu cuidado" do portal já existe hoje, falado na porta.
- **Rodada 2 escrita** — 24 perguntas curtas e numéricas, desenhada para o formato
  que ela de fato usa. Fase 1B continua bloqueada: nenhum número, nenhum dos cinco
  atendimentos reais.

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
