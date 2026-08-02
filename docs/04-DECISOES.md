# Registro de Decisões

> Decisão registrada aqui **não se rediscute** sem motivo novo. Se um motivo novo
> aparecer, cria-se uma nova entrada revogando a anterior — nunca se apaga o
> histórico.
>
> Decisões estruturais grandes ganham um ADR completo em [adr/](adr/).

---

## Decisões tomadas

### DEC-001 · Serwist no lugar de `next-pwa`

**Data:** 2026-07-31 · **Status:** ✅ Aceita

`next-pwa` está sem manutenção ativa. Serwist é o sucessor moderno do Workbox no
ecossistema Next, com suporte a App Router, precaching e estratégias tipadas.
Aplicação direta da regra "nunca usar bibliotecas abandonadas".

---

### DEC-002 · RSC + Server Actions como padrão; TanStack Query nas ilhas

**Data:** 2026-07-31 · **Status:** ✅ Aceita

Buscar todos os dados via TanStack Query no cliente descarta a principal vantagem
do App Router e aumenta o JavaScript enviado — crítico num app usado em 4G.

**Padrão adotado:** leitura no servidor (RSC, streaming, cache tagueado); mutação
por Server Action validada com Zod; TanStack Query **apenas** onde há atualização
otimista, polling ou fila offline — agenda ao vivo, cronômetro, atendimento.

---

### DEC-003 · Multi-tenancy por `organizationId` desde o dia 1

**Data:** 2026-07-31 · **Status:** ✅ Aceita

Banco único, schema único, isolamento por `organizationId`, com Prisma Client
Extension + Row Level Security.

Alternativa descartada: banco por tenant — custo e complexidade operacional
incompatíveis com o preço-alvo. Introduzir tenancy depois seria uma migração de
identidade e de todo o modelo de dados; fazer no dia 1 custa pouco.

---

### DEC-004 · Arquitetura feature-first com camadas e regra de dependência por lint

**Data:** 2026-07-31 · **Status:** ✅ Aceita

`domain / application / infrastructure / presentation` por feature, com
`eslint-plugin-boundaries` impedindo import indevido.

Regra imposta por ferramenta e não por disciplina é a única que sobrevive ao
tempo — e é o que torna o domínio testável sem banco.

---

### DEC-005 · Documentação viva como fonte de verdade entre sessões

**Data:** 2026-07-31 · **Status:** ✅ Aceita

`CLAUDE.md` + `docs/` versionados no repositório, com
[00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md) atualizado ao fim de toda unidade de
trabalho.

**Motivo:** o contexto de conversa é volátil. Se a janela quebrar, o projeto não
pode perder o fio. A documentação no repositório é o único estado durável, e é
lida automaticamente por qualquer sessão nova.

---

### DEC-006 · Roadmap por fases com aprovação obrigatória

**Data:** 2026-07-31 · **Status:** ✅ Aceita

Ver [03-ROADMAP.md](03-ROADMAP.md). Nenhuma fase começa sem aprovação explícita;
nenhuma é pulada; nenhuma é entregue em conjunto com outra para "adiantar".

---

### DEC-007 · O RoHair tem dois públicos e dois aplicativos em um só código

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Substitui parte de DEC-006**
**Origem:** definição do dono sobre o fluxo de acesso das clientes

O produto deixou de ter apenas o painel profissional. São **dois produtos que
conversam**:

- **Painel Profissional** — a Rosiele gerencia agenda, atendimentos, estoque e
  financeiro
- **Portal da Cliente** — a cliente acessa o próprio histórico, fotos de antes e
  depois e agendamentos

**Decisão:** um único repositório e um único design system, com dois _app shells_
distintos separados por route group (`(painel)` e `(portal)`), cada um com
navegação, manifest de PWA e experiência próprios. Roteamento pós-login definido
pelo tipo de conta.

**Alternativa descartada:** dois projetos separados. Duplicaria design system,
modelo de dados e infraestrutura — e as duas pontas precisam compartilhar
exatamente a mesma ficha de cliente.

**Impacto no roadmap:** nova **Fase 12 — Portal da Cliente**; fases seguintes
renumeradas.

---

### DEC-008 · Autenticação — dois domínios de identidade separados

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Revoga D-01 (Better Auth/passkey)**
**Origem:** definição do dono

Autenticação simples por **usuário e senha**, sem passkey e sem provedor externo.
Better Auth com Face ID foi descartado por decisão do dono — o modelo real do
negócio pede outra coisa.

#### Duas tabelas, dois mundos

`User` (equipe) e `ClientAccount` (clientes) são **entidades separadas**, nunca
linhas da mesma tabela com um campo `role`.

**Justificativa:** misturar públicos com níveis de privilégio diferentes na mesma
tabela é a origem clássica de escalonamento de privilégio — um bug de atribuição
de campo transforma cliente em administradora. Separando, isso deixa de ser
improvável e passa a ser arquiteturalmente impossível.

#### A ficha existe sem a conta

`Client` é o **registro de negócio** (a ficha). `ClientAccount` é a **credencial**.
Relação 1:1 opcional.

Uma cliente cadastrada pela Rosiele que nunca abrir o app funciona normalmente —
tem ficha, histórico, fotos. Se um dia baixar o app, a conta se **acopla** à ficha
existente, trazendo todo o histórico junto. É isso que faz as duas pontas
conversarem.

#### Fluxos

**Equipe (`User`)** — não existe autocadastro.

1. A primeira conta (OWNER) é criada por script de bootstrap, uma única vez
2. A OWNER cria as demais contas da equipe pelo painel
3. Papéis: `OWNER` · `PROFESSIONAL` · `ASSISTANT`
4. Login: e-mail ou usuário + senha

**Cliente (`ClientAccount`)** — primeiro acesso por CPF + data de nascimento.

1. Cliente informa **CPF + data de nascimento**
2. O sistema busca a ficha pelo CPF dentro da organização:
   - **Ficha existe e a data confere** → define usuário e senha → conta ativada e
     vinculada ao histórico já existente
   - **Ficha existe e a data não confere** → mensagem genérica, com limite de
     tentativas
   - **Ficha não existe** → oferece **autocadastro** (nome, CPF, nascimento,
     telefone) e cria usuário e senha. A ficha nasce com origem
     `SELF_REGISTERED` e aparece marcada como novo cadastro no painel
3. Acessos seguintes: **usuário + senha**
4. **Recuperação de senha:** a mesma tela de primeiro acesso. CPF + nascimento
   confere → define nova senha. Sem e-mail, sem SMS, custo zero

**Consequência desejada:** quando a Rosiele for lançar um atendimento e digitar o
CPF de alguém que se autocadastrou, a ficha já aparece preenchida. As duas pontas
se encontram pelo CPF.

#### Segurança — riscos aceitos e mitigações

**Risco reconhecido:** CPF e data de nascimento não são segredos no Brasil. Quem
tiver os dois consegue ativar a conta de uma cliente e ver histórico e fotos.

**Aceito** porque o modelo de negócio real (uma profissional, clientes conhecidas
pessoalmente) torna o ataque implausível, e porque qualquer verificação mais forte
custaria dinheiro (SMS) ou fricção que o dono não quer.

**Mitigações implementadas:**

- Limite de tentativas por CPF e por IP, com bloqueio progressivo
- **Notificação à profissional a cada ativação ou autocadastro**, com ação de
  revogar acesso em um toque
- Fotos podem ser marcadas como visíveis apenas para a profissional
- Senha com Argon2id, mínimo de 8 caracteres, verificação contra listas de senhas
  vazadas
- Sessões da cliente com escopo restrito: leem apenas os próprios dados
- Todo acesso à ficha por conta de cliente é registrado em `AuditLog`

**Vazamento de existência (aceito):** para o autocadastro funcionar, a tela
precisa informar que um CPF não tem cadastro — o que revela se alguém é cliente da
Rosiele. Impossível eliminar sem matar o autocadastro. Impacto considerado
desprezível; registrado por transparência.

---

### DEC-009 · CPF criptografado, com hash separado para busca

**Data:** 2026-07-31 · **Status:** ✅ Aceita

O CPF é a chave natural da cliente e será guardado assim:

- `cpfHash` — HMAC-SHA256 com chave do servidor. É o que recebe o índice único
  `(organizationId, cpfHash)` e o que é usado nas buscas
- `cpfEncrypted` — AES-256-GCM, para exibir no painel quando necessário
- Validado pelos dígitos verificadores antes de gravar; normalizado para 11 dígitos

**Justificativa:** um vazamento de banco não pode virar vazamento de CPF. O hash
determinístico preserva busca e unicidade; a criptografia preserva a exibição.
Custa cerca de 30 linhas em um value object e elimina o pior cenário de LGPD.

---

### DEC-010 · Armazenamento de fotos — Cloudflare R2 + compressão no cliente

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Substitui D-02 (Vercel Blob)**
**Origem:** exigência do dono de solução gratuita

**Escolha: Cloudflare R2** — 10 GB de armazenamento gratuitos e **custo zero de
egresso**, o único entre os grandes que não cobra saída de dados. Relevante porque
foto é muito mais vista do que enviada.

**O que torna o plano gratuito confortável é a compressão, não o plano.** Toda
foto é redimensionada e convertida para WebP/AVIF **no dispositivo, antes do
upload**: cerca de 150 KB por foto em vez de 4 MB. Isso significa aproximadamente
**60 mil fotos** dentro da cota gratuita — e upload rápido em 4G.

**Ressalva a confirmar na Fase 0:** o R2 normalmente exige cadastro de forma de
pagamento mesmo no plano gratuito.

**Alternativa sem cartão:** Supabase Storage (1 GB grátis) — ainda cerca de 6 mil
fotos com a mesma compressão.

Tudo atrás da porta `StorageService` em `core/storage`. Trocar de provedor é
trocar um adapter, sem tocar em nenhuma feature.

---

### DEC-011 · Identidade da marca — "Ro" de Rosiele

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Resolve D-04**

**RoHair = Rosiele + Hair.** O nome carrega o nome da profissional.

**Consequência para a Fase 2:** a marca não pode ser genérica. O monograma "Ro"
vira o núcleo da identidade — ícone do app, splash screen, marca d'água opcional
nas fotos de antes e depois, elemento de carregamento. O tom de voz é pessoal, na
primeira pessoa da Rosiele, não institucional.

---

### DEC-012 · Commit direto na `main`, sem Pull Request

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Origem:** definição do dono

Sem branch por fase e sem PR. O agente commita e dá push direto na `main`; o CI
roda no push e a Vercel publica em produção.

**Motivo:** o dono não revisa diff no GitHub — ele revisa o produto, pelo iPhone. O
PR adicionava uma etapa que ninguém usava e atrasava o que ele quer ver funcionando.

**O que não se perde:** o CI já dispara em `push: branches: [main]` — tipos, lint,
testes, build e E2E continuam rodando em toda entrega. A rede de segurança é o CI,
não o PR.

**O que se perde, e é aceito:**

- **Preview deployment.** Some por consequência. O item correspondente do DoD da
  Fase 0 sai do roadmap — não é mais um requisito, é uma etapa que a decisão
  eliminou.
- **A `main` vira produção imediata.** Um commit ruim está no ar antes de qualquer
  revisão humana. Hoje o risco é nulo, porque só há documentação; ele passa a ser
  real a partir da Fase 5, quando existir aplicação de verdade.

**Se o risco incomodar depois**, a saída não é voltar ao PR: é habilitar o
_rollback_ de um clique da Vercel como procedimento padrão. Reverter em trinta
segundos resolve o mesmo problema sem reintroduzir a etapa que o dono rejeitou.

---

### DEC-013 · Descoberta vira configuração — o sistema se adapta, não o contrário

**Data:** 2026-07-31 · **Status:** ✅ Aceita · **Origem:** definição do dono
**Corrige o método da Fase 1**

A Fase 1A produziu um roteiro de entrevista, e depois um segundo roteiro pedindo
preço, duração, produtos, horário de trabalho e forma de pagamento.

**Isso estava errado.** Todos esses dados são **campos de cadastro**, não achados de
pesquisa. E o método não escala: se cada profissional precisar de uma entrevista
para o sistema funcionar, o RoHair não é produto — é consultoria. A Fase 16 supõe
que uma profissional nova se cadastra e agenda o primeiro atendimento **sozinha**.

**Decisão:** parar de perguntar o que o sistema deve **perguntar na tela**.

O RoHair chega **sabendo o domínio da beleza**. Traz um catálogo semente de
serviços, produtos, unidades e categorias; a profissional **seleciona e ajusta** o
que é dela. Nunca encara tela vazia, nunca digita do zero o que é inferível.

É o princípio 2 da [visão de produto](01-VISAO-PRODUTO.md) — _"o app trabalha, a
usuária confirma"_ — aplicado ao cadastro, que era o único lugar onde ele não
estava sendo aplicado.

**Três níveis**, detalhados em [09-CONFIGURACAO.md](09-CONFIGURACAO.md):

1. **Vem pronto** — conhecimento do domínio, igual para todas
2. **Ela configura** — preço, duração, horário, políticas. Com padrão sugerido
3. **O sistema aprende** — duração real, consumo real, intervalo de retorno real,
   medidos pelo uso. Ela nunca precisa acertar na primeira tentativa

**Consequência mais importante:** várias pendências deixam de ser decisão e viram
**configuração** — inclusive [D-05](#d-05--poder-de-agendamento-da-cliente-no-portal),
que vira uma chave que cada profissional liga ou desliga.

**O que a descoberta ainda serve:** decidir o que é **arquitetura** e não pode ser
configurado depois, e alimentar o catálogo semente com vocabulário real. A primeira
rodada de respostas cumpriu isso muito bem — gerou `HairAssessment`, o estado
`ENCERRADO_SEM_SERVICO` e o vocabulário do glossário. **Não haverá rodada 2.**

**Alternativa descartada:** continuar entrevistando até fechar o escopo. Produziria
um sistema perfeito para a Rosiele e inútil para a segunda cliente.

---

### DEC-014 · Entregar tela em produção, não apresentar fase

**Data:** 2026-08-01 · **Status:** ✅ Aceita · **Origem:** interrupção do dono
**Substitui o ritmo de trabalho da DEC-006**

O dono parou o trabalho no meio da Fase 3 com estas palavras:

> _"Tá enrolando muito, eu não tô vendo nada acontecer, não tô vendo o projeto
> sendo feito, não tô vendo telas. (…) Eu quero que você lance tudo em produção
> e teste em produção mesmo."_

**Ele estava certo.** Três fases inteiras — descoberta, design system e domínio —
foram entregues antes de existir uma única tela navegável. Cada uma tinha
justificativa própria e todas produziram coisa útil; somadas, produziram um
projeto que o dono não conseguia ver.

**Decisão:** a unidade de trabalho passa a ser **tela funcionando em produção**.

| Saiu                                | Entrou                                    |
| ----------------------------------- | ----------------------------------------- |
| Apresentar fase e esperar "pode ir" | Construir, subir, avisar                  |
| Fase como portão                    | Roadmap como mapa                         |
| Revisar no fim da fase              | Revisar a tela no ar, pelo iPhone         |
| ADR para cada decisão               | ADR só para decisão estrutural de verdade |

**O que NÃO muda:** zero `any`, camadas por lint, contraste AA verificado, regra
dos 3 toques, `00-ESTADO-ATUAL.md` sempre atualizado. Cortar cerimônia não é
cortar qualidade — e a regra "nunca a solução mais rápida, sempre a melhor"
continua inegociável.

**Custo aceito:** construir fora da ordem do roadmap. O painel foi ao ar **sem
autenticação**, o que normalmente viria antes. Está registrado como dívida no
`00-ESTADO-ATUAL.md` e é a próxima coisa a ser feita.

---

### DEC-015 · Nada roda na máquina do dono

**Data:** 2026-08-01 · **Status:** ✅ Aceita · **Origem:** repreensão do dono

A regra existia desde o começo, mas de forma frouxa — "apenas `npm run dev`".
Foi endurecida depois de eu tentar subir um contêiner Docker local para testar
uma migration.

**Nada de Docker, banco local ou servidor na máquina dele.** Ele não precisa nem
do `npm run dev`: revisa em produção, pelo iPhone. Comandos locais existem só
para o agente verificar antes de subir, e não deixam nada de pé.

---

### DEC-016 · Bloqueio de tentativas no Postgres, não no Redis

**Data:** 2026-08-02 · **Status:** ✅ Aceita
**Ajusta um entregável da Fase 4 no [roadmap](03-ROADMAP.md#fase-4)**

O roadmap dizia "limite de tentativas por CPF e por IP, com bloqueio progressivo
(Redis)". A implementação usa uma tabela `login_attempt` no Postgres.

**Motivo:** bloqueio que evapora quando o cache reinicia não é bloqueio. Um
Redis vazio faz a contagem voltar a zero — exatamente o que um atacante quer, e
exatamente o que acontece num plano gratuito que despeja chaves sob pressão de
memória. O estado de "esta conta está sob ataque" precisa ser durável.

**O custo é irrisório:** algumas linhas por login, com índice em
`(bucket, createdAt)`. Não é caminho quente — só existe escrita quando alguém
digita uma senha.

**Segundo motivo, igualmente importante:** uma dependência a menos no caminho do
login. Se o Redis estivesse no meio, uma queda dele obrigaria a escolher entre
deixar passar sem contar (inseguro) e barrar todo mundo (indisponível). Sem essa
escolha, não há esse dia ruim.

O Redis continua provisionado e volta a fazer sentido quando houver algo de alta
frequência — cache de leitura, fila offline. Contagem de login não é isso.

---

### DEC-017 · A sessão da equipe é token opaco no banco, não JWT

**Data:** 2026-08-02 · **Status:** ✅ Aceita · **Detalha [DEC-008](#dec-008)**

O cookie carrega 256 bits aleatórios; o banco guarda o **SHA-256** disso. Nada
de identidade, papel ou organização viaja no cookie.

**Por que não JWT:** o produto exige "revogar acesso em um toque" (DEC-008). Um
JWT válido continua válido até expirar, a menos que exista uma lista de
revogação — que é uma consulta ao banco, ou seja, exatamente o custo que o JWT
prometia evitar. Sem o benefício, sobra só o risco: um segredo de assinatura
vazado vira acesso a tudo, sem deixar rastro.

**Consequências que valem a pena registrar:**

- Guardar o hash, e não o token, faz um vazamento da tabela `session` não virar
  acesso. Argon2 seria desperdício aqui: 256 bits aleatórios não se adivinham.
- Trinta dias de validade, renovados a cada uso. Ela abre o app entre um
  atendimento e outro, às vezes de luva; pedir senha toda semana faria o produto
  ser fechado, não protegido. A segurança vem de poder revogar, não de expirar
  cedo.
- O `proxy.ts` do Next **não valida sessão** — ele só redireciona quem não tem
  cookie e rola a validade do cookie. Quem valida é o servidor, em cada página.

---

### DEC-018 · "Sobrou" conta dinheiro recebido, não preço combinado

**Data:** 2026-08-02 · **Status:** ✅ Aceita

O número grande do painel passa a somar **pagamentos com `paidAt` preenchido**,
e não os itens do atendimento. O custo do produto continua contando sempre — ele
saiu do estoque de qualquer jeito.

**Motivo:** o produto inteiro existe por causa de uma frase — 🗣️ _"fim do dia
estou com dinheiro mas fim do mês não tenho mais"_. Ela enxerga **caixa**. Um
atendimento fiado tem preço mas não tem dinheiro; contá-lo em "sobrou" seria
dizer que sobrou o que não entrou — a mesma ilusão do faturamento, entrando por
outra porta.

**Consequências:**

- Fiado grava `Payment` com `paidAt` nulo e **não** lança `Transaction`. Quando a
  Fase 10 construir "receber fiado", é ela que cria o lançamento.
- Cortesia não tem pagamento nem receita, e o custo do produto aparece — o
  checkout mostra em quanto sai o agrado, que é uma informação que ela merece
  ter antes de fazer o próximo.
- Atendimento de preço zero não gera pagamento: o banco recusa
  (`payment_valor_positivo`), e com razão — pagamento de zero não é pagamento.

**O que fica pendente para a Fase 10:** a distinção entre caixa e competência.
Hoje o painel é caixa puro, que é o que ela entende. Um relatório de competência
pode existir depois, **separado e nomeado**, nunca misturado no mesmo número.

---

## Decisões pendentes

### D-03 · Domínio próprio

**Status:** ⏳ Sem domínio no momento · **Bloqueia:** Fase 5 (parcial), Fase 14

Ainda não há domínio. Seguimos no subdomínio da Vercel até a Fase 5, quando o PWA
instalável e o portal público da cliente tornam um domínio próprio desejável.

Sugestões a avaliar: `rohair.app` · `rohair.com.br` · `rosielehair.com.br`

### D-05 · Poder de agendamento da cliente no portal

**Status:** ✅ **Resolvida por [DEC-013](#dec-013) — virou configuração**
**Padrão:** solicitar ligado, agendar direto desligado

Deixou de ser decisão de projeto: cada profissional liga ou desliga
([09-CONFIGURACAO.md § 3.4](09-CONFIGURACAO.md#34-políticas-do-portal)). O
raciocínio abaixo continua valendo, mas como escolha do **padrão**, não como
imposição a todas.

A cliente pode **agendar direto** na agenda, ou apenas **solicitar um horário**
que a Rosiele aprova?

**Recomendação: solicitar.** Agendamento direto entrega o controle da agenda a
terceiros — risco de encaixe ruim, deslocamento inviável e conflito com o ritmo
real de trabalho dela. Solicitação preserva o controle e ainda assim tira a
conversa do WhatsApp. Agendamento direto pode ser habilitado depois, por
configuração, quando houver horários realmente livres e bem definidos.

### D-06 · Escopo do Portal da Cliente

**Status:** 🟡 Parcialmente resolvida pela primeira rodada · **Bloqueia:** Fase 12

Proposta completa em [03-ROADMAP.md](03-ROADMAP.md#fase-12).

**Confirmado pela Rosiele** — _"Finalizo, deixo as orientações dos produtos que
deve utilizar e o tempo do retoque e vou pra minha residência."_

O item **"Meu cuidado"** deixa de ser hipótese: ela **já faz isso hoje**, falado, na
porta, no fim do atendimento. Falado, some antes de a cliente chegar em casa. O
portal não inventa comportamento — digitaliza um que existe, que é a categoria de
funcionalidade com maior chance de ser usada.

O **"tempo do retoque"** também é confirmado, e é calculável: três meses para
progressiva, _"ou antes dependendo da curvatura"_.

**O que restava vira chave de configuração** ([DEC-013](#dec-013)): o que a cliente
vê do histórico, se vê valores, e a visibilidade padrão das fotos são políticas por
organização, com padrão conservador. Ver
[09-CONFIGURACAO.md § 3.4](09-CONFIGURACAO.md#34-políticas-do-portal).

### D-07 · Como as duas pontas se encontram quando a ficha não tem CPF

**Status:** ⏳ Aguardando · **Bloqueia:** Fases 3, 4 e 6
**Origem:** ACHADO-01 da Fase 1A — ver [07-FLUXOS.md](07-FLUXOS.md#6-três-buracos-encontrados-ao-escrever-este-documento)

A DEC-008 supõe que a ficha da cliente tem CPF. Na prática, a Rosiele não pede CPF
de ninguém hoje. Se a ficha existente não tiver CPF, a cliente que se autocadastrar
vira uma **ficha duplicada** — e o momento mais valioso do produto, o histórico de
dois anos aparecendo de uma vez, nunca acontece.

**Recomendação: fusão assistida + CPF opcional pedido com insistência.** O
autocadastro sempre cria ficha nova; o painel sugere candidatas por nome e telefone
e a Rosiele funde com um toque.

**Por quê:** casar automaticamente por telefone expõe o histórico de uma pessoa
para outra quando o número tiver sido reaproveitado — risco inaceitável para um
produto que guarda foto de cliente. A Rosiele conhece as clientes pelo nome; ela é
o melhor desambiguador disponível, e é grátis.

**Consequências se aceita:** fusão de fichas vira funcionalidade de primeira classe
da Fase 6; `Client` ganha `mergedIntoId`; o índice único de CPF passa a ser
**parcial** (`WHERE cpf_hash IS NOT NULL`), o que muda o schema da Fase 3.

### D-08 · Rota de escape quando a ativação da cliente falha

**Status:** ⏳ Aguardando · **Bloqueia:** Fase 4
**Origem:** ACHADO-02 e ACHADO-03 da Fase 1A

A ativação exige CPF **e** data de nascimento conferindo. Dois casos deixam a
cliente presa para sempre, sem explicação:

- A ficha existe mas **não tem** data de nascimento — não há contra o que comparar
- A data foi **digitada errada** pela Rosiele — a cliente digita a correta, o
  sistema nega e ainda a bloqueia progressivamente

**Recomendação: aprovação manual como rota de escape.** Quando a ficha é encontrada
mas a validação não conclui, em vez de negar, o fluxo pede liberação à Rosiele —
"pedimos para a Rosiele liberar seu acesso" — com notificação de um toque no
painel. Um beco sem saída vira uma espera de minutos.

**Exige também** notificar a profissional das tentativas **falhas**, não só das
bem-sucedidas. A notificação **não pode** conter a data de nascimento tentada: isso
transformaria o painel em um oráculo para descobrir dado de terceiros.
