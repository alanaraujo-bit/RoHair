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

**Decisão:** um único repositório e um único design system, com dois *app shells*
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

## Decisões pendentes

### D-03 · Domínio próprio
**Status:** ⏳ Sem domínio no momento · **Bloqueia:** Fase 5 (parcial), Fase 14

Ainda não há domínio. Seguimos no subdomínio da Vercel até a Fase 5, quando o PWA
instalável e o portal público da cliente tornam um domínio próprio desejável.

Sugestões a avaliar: `rohair.app` · `rohair.com.br` · `rosielehair.com.br`

### D-05 · Poder de agendamento da cliente no portal
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 12

A cliente pode **agendar direto** na agenda, ou apenas **solicitar um horário**
que a Rosiele aprova?

**Recomendação: solicitar.** Agendamento direto entrega o controle da agenda a
terceiros — risco de encaixe ruim, deslocamento inviável e conflito com o ritmo
real de trabalho dela. Solicitação preserva o controle e ainda assim tira a
conversa do WhatsApp. Agendamento direto pode ser habilitado depois, por
configuração, quando houver horários realmente livres e bem definidos.

### D-06 · Escopo do Portal da Cliente
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 12

Proposta de escopo em [03-ROADMAP.md](03-ROADMAP.md#fase-12) — a confirmar.
