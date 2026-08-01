# Roadmap — Do início ao fim

> 17 fases. Cada uma tem objetivo, entregáveis e **Definição de Pronto (DoD)**.
> Uma fase só é marcada ✅ quando **todos** os itens do DoD estão verdadeiros.
> Nenhuma fase começa sem aprovação explícita do dono do produto.

**Status geral:** ver [00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md).

| #   | Fase                                   | Público | Status |
| --- | -------------------------------------- | ------- | ------ |
| 0   | Fundação de Infraestrutura             | —       | ✅     |
| 1   | Descoberta & Documentação de Produto   | —       | ✅     |
| 2   | Design System "Áurea"                  | —       | ✅     |
| 3   | Modelagem de Dados & Camada de Domínio | —       | 🟡     |
| 4   | Identidade, Autenticação & Permissões  | ambos   | ⬜     |
| 5   | App Shell & PWA                        | ambos   | ⬜     |
| 6   | Clientes                               | painel  | ⬜     |
| 7   | Serviços & Estoque                     | painel  | ⬜     |
| 8   | Agenda Inteligente                     | painel  | ⬜     |
| 9   | Atendimento                            | painel  | ⬜     |
| 10  | Financeiro                             | painel  | ⬜     |
| 11  | Dashboard, Estatísticas & Insights     | painel  | ⬜     |
| 12  | **Portal da Cliente**                  | portal  | ⬜     |
| 13  | Offline-first & Sincronização          | ambos   | ⬜     |
| 14  | Notificações                           | ambos   | ⬜     |
| 15  | Hardening                              | —       | ⬜     |
| 16  | Comercialização                        | —       | ⬜     |

---

## Fase 0

### Fundação de Infraestrutura

**Objetivo.** Ter um esqueleto de projeto em que qualquer commit vira um deploy
verificado, sem que nada precise rodar na máquina do dono. Nada de UI aqui.

**Entregáveis**

- Projeto Next.js (App Router) com TypeScript `strict` + `noUncheckedIndexedAccess`
- Tailwind v4 configurado com `@theme` (tokens virão na Fase 2)
- ESLint 9 flat config + Prettier + `eslint-plugin-boundaries` (regra de camadas)
- Estrutura de pastas `src/app`, `src/features`, `src/shared`, `src/core`
- Validação de variáveis de ambiente com Zod — a aplicação não sobe com env inválida
- GitHub Actions: `typecheck` · `lint` · `test` · `build` em todo PR
- Railway: PostgreSQL e Redis provisionados (staging e produção)
- Vercel conectado ao repositório, auto-deploy da `main`, preview por PR
- Conta Cloudflare R2 criada e bucket configurado (ou fallback, ver DEC-010)
- Vitest e Playwright instalados e rodando em CI (com um teste de fumaça cada)
- `ADR-0001` registrando as decisões de fundação

**DoD**

- [x] Um commit falha o CI se houver erro de tipo, lint ou teste
- [x] Push na `main` gera deploy automático na Vercel
- [x] `npm run dev` sobe na máquina do dono sem erro
- [x] `docs/00-ESTADO-ATUAL.md` atualizado
- ~~Um PR gera preview deployment acessível pelo celular~~ — **removido por
  [DEC-012](04-DECISOES.md#dec-012--commit-direto-na-main-sem-pull-request)**: não
  há mais PR, logo não há preview. A revisão passa a ser em produção

**Fase 0 fechada.** Todos os itens vigentes cumpridos.

---

## Fase 1

### Descoberta & Documentação de Produto

**Objetivo.** Saber exatamente o que será construído e por quê, antes de desenhar
qualquer pixel. Esta fase é feita **junto com a usuária real** (Rosiele).

Sem código. Dividida em duas sub-etapas porque parte do trabalho depende de
informação que só a Rosiele tem.

#### Fase 1A — o que não depende dela · ✅ concluída

- **1.1** [Roteiro de conversa](descoberta/roteiro-rosiele.md) — para o Alan
  conduzir, sem o agente no meio
- **1.2** [Glossário do domínio](06-GLOSSARIO.md) — rascunho, com o que confirmar
- **1.3** [Fluxos das duas pontas](07-FLUXOS.md) — identidade e pontos de encontro
- **1.4** [Modelo de domínio v0](08-MODELO-DE-DOMINIO.md) — agregados, invariantes
  e as dez perguntas que o modelo faz à Rosiele

#### Fase 1B — o produto se configura · ✅ concluída

**Reenquadrada por [DEC-013](04-DECISOES.md#dec-013).** Não haverá segunda rodada de
perguntas. Preço, duração, produto e horário são **campo de cadastro**, não achado
de pesquisa — e um método que exige entrevistar cada profissional não é produto.

- **1.5** [Modelo de configuração](09-CONFIGURACAO.md) — catálogo semente, o que ela
  configura, o que o sistema aprende, e o que **não** é configurável
- **1.6** [Cinco cenários](10-CENARIOS.md) — validaram o modelo e acharam **cinco
  buracos**, todos corrigidos. O modelo subiu para **v1**
- **1.7** [Personas e JTBD](11-PERSONAS.md) — do domínio da beleza, não de uma
  pessoa só
- **1.8** [Wireframes](12-WIREFRAMES.md) — 16 telas: onboarding, 11 do painel e 4 do
  portal
- **1.9** Escopo das Fases 4 e 6 a 12 fechado neste roadmap, com link para a tela
- **1.10** [Backlog](13-BACKLOG.md) — 42 itens em P0 a P3, priorizados por distância
  até a dor central, cada um rastreável até fase, JTBD e tela

**DoD**

- [x] O modelo de domínio declara explicitamente o que não sabe
- [x] Toda pergunta do modelo (M-01 a M-12) tem destino: arquitetura, configuração
      ou aprendizado — nenhuma depende de entrevista
- [x] D-05 resolvida (virou configuração) · D-06 resolvida em escopo
- [x] Cada fase de 6 a 14 tem escopo fechado e escrito
- [x] Nenhuma tela do roadmap está sem wireframe, **incluindo o onboarding**
- [x] O modelo de domínio foi validado contra 5 cenários de atendimento —
      **5 buracos encontrados e corrigidos**
- [x] Uma profissional que não é a Rosiele configura o sistema pelo catálogo
      semente, sem nenhum campo em branco obrigatório
- [x] **Documentos revisados e aprovados pelo dono** — 2026-07-31

**Fase 1 concluída.**

---

## Fase 2

### Design System "Áurea"

**Objetivo.** Construir a linguagem visual autoral do RoHair. Sistema próprio,
com a plataforma servindo de base acessível onde ela já resolve melhor.

> **Escopo revisado durante a execução** — ver
> [ADR-0002](adr/ADR-0002-design-system-aurea.md). A lista de primitivos passou a
> ser **derivada dos 16 wireframes** em vez de genérica, e o catálogo virou rota
> do aplicativo em vez de Storybook.

**Entregáveis**

- Identidade da marca: **"Ro" de Rosiele** (DEC-011) — monograma e tom de voz
- Design tokens em OKLCH: cor, tipografia fluida, raio, sombra, movimento
- **Porcelana** e **Veludo**, cada um desenhado do zero
- Par `action` / `on-action`, garantindo AA de texto sobre a cor de marca nos
  dois temas — descoberto pelo teste, não pelo olho
- **Primitivos derivados dos wireframes:**
  - Base — Button, Field, Input, Textarea, Card, Badge, Chip, Skeleton,
    EmptyState
  - Domínio — MoneyFigure, MoneyText, Timer, SafetyAlert, DecisionGate,
    PhotoCompare, SeedPicker
  - Controle e sobreposição — SegmentedControl, Switch, Sheet
- Biblioteca de **ícones autorais** do domínio da beleza
- Sistema de movimento: molas padronizadas, `prefers-reduced-motion`
- **Catálogo vivo em `/design`**, no pipeline de produção
- **Teste de contraste** que lê o `tokens.css` real e recalcula
- E2E provando modalidade nativa, teclado e alvo de toque

**Fica para quando a tela pedir:** Toast, DatePicker, TimePicker, SwipeAction,
FAB, CpfInput, PasswordField, MergeCompare. Primitivo entra quando uma fase
precisa dele — componente "para o caso de precisar" é dívida visual.

**DoD**

- [x] Nenhum componente usa cor hard-coded — só tokens
- [x] Todo primitivo passa em contraste AA nos dois temas, **verificado no CI**
- [x] Todo primitivo é navegável e operável por teclado
- [x] Catálogo publicado e acessível pelo celular do dono, em `/design`
- [x] `prefers-reduced-motion` respeitado em 100% das animações
- [x] Zero dependências novas
- [x] **Revisado e aprovado pelo dono** — 2026-07-31

**Fase 2 concluída.**

---

## Fase 3

### Modelagem de Dados & Camada de Domínio

**Objetivo.** Traduzir o modelo de domínio da Fase 1 em schema e código de
negócio testável, sem nenhuma dependência de framework.

**Entregáveis**

- Schema Prisma completo com índices, constraints e soft delete
- Separação `User` (equipe) × `Client` (ficha) × `ClientAccount` (credencial)
- Constraint `EXCLUDE USING gist` para impedir sobreposição de agendamentos
- Índice único `(organizationId, cpfHash)` na ficha da cliente
- Migrations versionadas, aplicadas por CI
- Value objects: `Money`, `TimeRange`, `Cpf`, `PhoneNumber`, `Duration`
- `Cpf` com validação de dígitos verificadores, HMAC para busca e AES-GCM para
  exibição (DEC-009)
- Entidades e regras de negócio puras, com testes unitários
- Interfaces de repositório (ports) + implementações Prisma (adapters)
- `Result<T, E>` — erros como valor, exceções só para o inesperado
- Camada de comandos serializáveis (preparação para o offline da Fase 13)
- Seeds realistas para desenvolvimento

> **Executada.** Decisões estruturais em
> [ADR-0003](adr/ADR-0003-dominio-e-persistencia.md): shared kernel em
> `core/kernel`, sete features cortadas por agregado, SQL escrito à mão para o
> que o Prisma não expressa, e Postgres 18 efêmero no CI.

**DoD**

- [x] Domínio testado sem banco — **116 testes em 245ms**
- [x] Nenhum import de Prisma fora de `infrastructure/` — imposto por lint
- [x] Migrations aplicam limpo em banco vazio, **e são idempotentes**
- [x] CPF inválido é rejeitado antes de chegar ao banco
- [x] Cobertura do domínio acima de 90% — **92,7% de statements, 96,9% de linhas**
- [x] Duas requisições simultâneas no mesmo horário: uma falha **no banco**
- [ ] **Revisado e aprovado pelo dono**

---

## Fase 4

### Identidade, Autenticação & Permissões

**Objetivo.** Dois públicos, dois domínios de identidade, isolamento correto — o
erro mais caro de corrigir depois. Modelo completo em **DEC-008**.

> **Escopo fechado na Fase 1.** Tela [13](12-WIREFRAMES.md#13--portal--primeiro-acesso).
> Fluxos completos em [07-FLUXOS.md](07-FLUXOS.md).

**Entregáveis — equipe (`User`)**

- Bootstrap da primeira conta OWNER por script, executado uma única vez
- Criação de contas da equipe pelo painel (sem autocadastro)
- Papéis `OWNER` · `PROFESSIONAL` · `ASSISTANT` com permissões declarativas
- Login por e-mail ou usuário + senha

**Entregáveis — cliente (`ClientAccount`)**

- Tela de primeiro acesso: CPF + data de nascimento
- Ficha encontrada e data confere → criação de usuário e senha, conta **acoplada
  ao histórico existente**
- Ficha não encontrada → fluxo de autocadastro, ficha criada como
  `SELF_REGISTERED` e sinalizada no painel
- Acessos seguintes por usuário + senha
- Recuperação de senha pela mesma porta (CPF + nascimento), sem e-mail e sem SMS
- **Rota de escape por aprovação manual** quando a ficha existe mas a validação não
  conclui — ficha sem data de nascimento, ou data digitada errada
  (ver [D-08](04-DECISOES.md#d-08--rota-de-escape-quando-a-ativação-da-cliente-falha))

**Entregáveis — transversais**

- Argon2id, política de senha e verificação contra listas de senhas vazadas
- Limite de tentativas por CPF e por IP, com bloqueio progressivo (Redis)
- Notificação à profissional a cada ativação ou autocadastro, com revogar acesso
- Prisma Client Extension injetando `organizationId` automaticamente
- Row Level Security no Postgres como segunda barreira
- Contexto de requisição via `AsyncLocalStorage`
- Sessão da cliente com escopo restrito aos próprios dados
- `AuditLog` de todo acesso e de toda ativação de conta

**DoD**

- [ ] Teste automatizado prova que organização A não enxerga dado da organização B
- [ ] Teste automatizado prova que uma sessão de cliente não alcança dado de outra
      cliente nem qualquer rota do painel
- [ ] Cliente cadastrada pela Rosiele ativa a conta e vê o histórico anterior
- [ ] Cliente que se autocadastrou aparece no painel marcada como novo cadastro
- [ ] Força bruta em CPF é bloqueada e registrada
- [ ] Nenhuma rota renderiza dado privado sem sessão válida, nem por um frame

---

## Fase 5

### App Shell & PWA

**Objetivo.** A casca dos dois aplicativos. É aqui que o RoHair deixa de parecer
site.

**Entregáveis**

- Dois app shells por route group: `(painel)` e `(portal)`, cada um com sua
  navegação e sua identidade dentro do mesmo design system
- Roteamento pós-login por tipo de conta
- Layout raiz com safe areas, `100dvh`, sem bounce, sem callout, sem zoom no input
- Bottom sheets com arrasto e rubber-banding, drawers, modais, FAB contextual
- Gestos: swipe em lista, long-press → context menu, pull-to-refresh próprio
- Service Worker (Serwist): precache, estratégias por rota, tela offline
- Manifest, ícones (todos os tamanhos), splash screens iOS
- Fluxo de instalação desenhado, com detecção de iOS
- Alternância de tema com persistência e respeito ao tema do sistema
- Sistema de toast, loading e feedback global

**DoD**

- [ ] Instalado no iPhone, não há qualquer indício visual de navegador
- [ ] Nenhum scroll horizontal, nenhum bounce indesejado, nenhum zoom acidental
- [ ] App abre offline e mostra estado offline elegante
- [ ] Lighthouse PWA 100 nas duas experiências

---

## Fase 6

### Clientes

**Objetivo.** A ficha da cliente como o ativo mais valioso do negócio, e o ponto
de encontro entre as duas pontas do produto.

**Entregáveis**

> **Escopo fechado na Fase 1.** Telas [5, 6 e 7](12-WIREFRAMES.md#5--clientes).

- Cadastro: nome, telefone, foto, preferências, observações. **CPF e data de
  nascimento opcionais** (D-07, D-08), pedidos com insistência mas nunca bloqueando
- 🗣️ **Alerta de química no topo da ficha**, acima de qualquer métrica — vem da
  `HairAssessment` mais recente e é dado de segurança, não histórico
- Lista ordenada por **quem precisa de ação**, nunca alfabética
- 🗣️ Curvatura como lista de nomes: liso, ondulado, cacheado, crespo
- Busca por CPF que **encontra ficha autocadastrada** em vez de duplicar
- **Fusão de fichas assistida** — o painel sugere candidatas por nome e telefone e
  a Rosiele funde com um toque, preservando todo o histórico das duas
  (ver [D-07](04-DECISOES.md#d-07--como-as-duas-pontas-se-encontram-quando-a-ficha-não-tem-cpf))
- Bandeja de novos cadastros vindos do portal, para a Rosiele confirmar
- Indicador de "tem conta no app" e ação de revogar acesso
- Ficha completa: histórico de atendimentos, produtos usados, valor gasto,
  tempo médio, frequência, última visita
- Galeria antes/depois com compressão no dispositivo e comparador
- Controle de visibilidade da foto: cliente vê, ou só a profissional vê
- Notas com carimbo de data e autor
- Ações rápidas: agendar, ligar, WhatsApp, iniciar atendimento
- LGPD: consentimento de foto e de dados, exportação e exclusão

**DoD**

- [ ] Digitar um CPF já autocadastrado traz a ficha existente, nunca uma nova
- [ ] Agendar a partir da ficha em no máximo 3 toques
- [ ] Foto de 4 MB da câmera vira menos de 200 KB antes de subir
- [ ] Upload funciona com rede fraca e mostra progresso real
- [ ] Lista com 1.000 clientes rola a 60fps no iPhone

---

## Fase 7

### Serviços & Estoque

**Objetivo.** Catálogo e insumos — a base para preço, duração e margem reais.

> **Escopo fechado na Fase 1.** Telas [1 e 11](12-WIREFRAMES.md#1--onboarding).
> Modelo de configuração em [09-CONFIGURACAO.md](09-CONFIGURACAO.md).

**Entregáveis**

- **Catálogo semente** do domínio da beleza — serviços, produtos, unidades e
  categorias que vêm prontos, para a profissional **marcar em vez de digitar**
- **Onboarding em cinco passos**, com os passos de preço e horário puláveis. Mora
  aqui porque é quando o catálogo existe
- Serviços com **variantes opcionais**, desligadas por padrão. 🗣️ Eixo padrão:
  **curvatura**
- **Serviços compostos** — etapas com consumo próprio. O preço vive no pai, o custo
  e a baixa nas folhas (INV-19)
- Produtos: categoria, fornecedor, custo, quantidade. 🗣️ Unidade em **frasco e
  aplicação** primeiro, conversão interna
- Movimentações de estoque append-only, com histórico auditável
- **Alerta em dias, não em quantidade** — "acaba em ~10 dias" permite comprar
  planejado; "estoque baixo" só avisa que já é tarde
- Cálculo de custo por atendimento e margem por serviço

**DoD**

- [ ] Finalizar um atendimento dá baixa automática correta no estoque, **inclusive
      em serviço composto** — a baixa é calculada sobre as folhas
- [ ] Toda movimentação é rastreável até a origem
- [ ] Alerta dispara com antecedência em dias, calculada pelo consumo real
- [ ] Uma profissional configura o catálogo inteiro **sem digitar nome de serviço**
- [ ] Da conta criada ao primeiro agendamento em **menos de 3 minutos**

---

## Fase 8

### Agenda Inteligente

**Objetivo.** O centro de gravidade do painel.

> **Escopo fechado na Fase 1.** Telas [3 e 4](12-WIREFRAMES.md#3--agenda).

**Entregáveis**

- Visões dia, semana e mês, com transição fluida entre elas
- 🗣️ **"Vaga"** como o rótulo do espaço livre — a palavra dela
- Criação de agendamento com **duração vinda do histórico daquela cliente**, não do
  catálogo, com a diferença explicada na tela
- Só oferecer horários que **cabem** na duração real prevista
- Detecção de conflito na UI + garantia no banco
- Arrastar para reagendar, swipe para confirmar/cancelar
- Bloqueios, intervalos, horário de funcionamento, folgas
- Confirmação da cliente e lembretes
- Lista de espera e sugestão de encaixe
- Estados: agendado, confirmado, em atendimento, concluído, faltou, cancelado

**DoD**

- [ ] Impossível criar dois agendamentos sobrepostos, mesmo em corrida
- [ ] Navegar entre semanas é instantâneo (dados pré-carregados)
- [ ] Reagendar por arrasto funciona com precisão no toque do iPhone

---

## Fase 9

### Atendimento

**Objetivo.** O momento de verdade. Mãos ocupadas, cliente na cadeira.

> **Escopo fechado na Fase 1.** Telas [8, 9 e 10](12-WIREFRAMES.md#8--atendimento--abertura-e-anamnese).
> A fase mais afetada pela conversa com a Rosiele.

**Entregáveis**

- 🗣️ **Anamnese** abrindo o atendimento, com as cinco perguntas dela,
  **pré-preenchidas pelo histórico** — confirmar em vez de digitar
- 🗣️ **Teste de mecha como portão**, com o desfecho `ENCERRADO_SEM_SERVICO`
  apresentado como trabalho bem feito, e a baixa do produto gasto no teste
- Iniciar, pausar, retomar e finalizar, com cronômetro persistente
- Cronômetro modelado como intervalos imutáveis — sobrevive a fechar o app
- 🗣️ Contagem do **tempo de pausa** com hora de voltar
- Produtos **pré-marcados pelo hábito daquela cliente**; ela desmarca o que não usou
- Fotos antes/depois/referência direto da câmera, com visibilidade por foto
- Observações rápidas por voz ou texto
- Checkout com **o lucro daquele atendimento na tela**, não só o valor
- Formas de pagamento incluindo **fiado e cortesia** como estados próprios
- 🗣️ **Retorno sugerido e cuidado em casa** no checkout — o que ela já fala na porta,
  agora chegando no portal da cliente
- Widget persistente de atendimento em andamento

**DoD**

- [ ] Fechar o app no meio do atendimento não perde um segundo do cronômetro
- [ ] Do "iniciar" ao "finalizar" em no máximo 3 toques
- [ ] Finalizar gera receita, baixa e histórico numa única transação (INV-09)
- [ ] Teste reprovado encerra sem serviço, **dá baixa do produto do teste** e não
      gera item do serviço impedido (INV-17)
- [ ] O lucro do atendimento aparece antes de concluir

---

## Fase 10

### Financeiro

**Objetivo.** Clareza sobre dinheiro, sem exigir conhecimento contábil.

> **Escopo fechado na Fase 1.** Tela [12](12-WIREFRAMES.md#12--dinheiro).
> Esta fase e a 7 são o par que ataca a frase do fim do mês.

**Entregáveis**

- **"Sobrou" como número principal, "entrou" como número pequeno.** Nunca o
  contrário — faturamento é a ilusão que ela já tem
- Entradas automáticas a partir dos atendimentos
- Saídas manuais e recorrentes, com categorias vindas da semente
- Fluxo de caixa por dia, semana e mês, **com o dia definido pela finalização** no
  fuso da organização (INV-18)
- Lucro real (receita − custo de produto − despesas)
- Comparação com o período anterior, em uma frase
- Metas com acompanhamento visual
- Relatórios exportáveis (PDF/CSV)
- Fechamento de caixa diário

**DoD**

- [ ] Todo valor exibido é rastreável até a transação de origem
- [ ] Nenhum cálculo em ponto flutuante
- [ ] Relatório do mês bate com a soma dos atendimentos, ao centavo
- [ ] Atendimento que atravessa a meia-noite cai num dia só, sempre o mesmo

---

## Fase 11

### Dashboard, Estatísticas & Insights

**Objetivo.** Transformar dados em decisão. Esta fase é o "uau" comercial.

**Entregáveis**

- Dashboard com receita, lucro, clientes, agenda do dia e tempo médio
- Gráficos autorais sobre uma camada de primitivos própria
- Comparativos período a período
- Estatísticas: cliente mais frequente, serviço mais rentável, dia mais
  produtivo, horário mais lucrativo, produtos mais e menos usados, ranking
- **Motor de insights** com regras versionadas. As duas primeiras já são
  deriváveis e atacam a dor central: 🗣️ **retorno vencido** (serviço + curvatura) e
  **produto acabando em N dias**. Depois: cliente sumida, VIP, aniversário, queda
  de frequência, horário ocioso
- Insight é acionável: todo card leva a uma ação concreta

**DoD**

- [ ] Dashboard carrega em menos de 1s com 2 anos de dados
- [ ] Todo insight tem ação associada e pode ser dispensado
- [ ] Gráficos legíveis nos dois temas e acessíveis por leitor de tela

---

## Fase 12

### Portal da Cliente

**Objetivo.** A outra ponta do produto. A cliente vê o próprio cuidado com o
cabelo virar história — e a Rosiele ganha um canal que tira a conversa do
WhatsApp.

> **Escopo fechado na Fase 1.** Telas [13 a 16](12-WIREFRAMES.md#13--portal--primeiro-acesso).
> D-05 e D-06 resolvidas — o que variava virou
> [configuração](09-CONFIGURACAO.md#34-políticas-do-portal).

- **Meu próximo horário**, com confirmação de presença em um toque
- **Minhas visitas** — histórico com serviço, data e duração. **Valores desligados
  por padrão**
- **Meus antes e depois** — a galeria da própria evolução, com comparador de
  arrastar. Só as fotos liberadas; a cliente não sabe que existem outras
- **Solicitar horário** — padrão ligado; agendar direto é chave desligada (D-05)
- 🗣️ **Meu cuidado** — as orientações de produto e o tempo do retoque que a
  profissional já dá falando na porta. **Comportamento existente, não inventado**
- **Minha ficha** — preferências e observações que ela escolhe compartilhar
- Aniversário e reconhecimento de fidelidade
- Central de privacidade: consentimento de foto, exportar e excluir dados (LGPD)

**Entregáveis técnicos**

- App shell próprio, navegação própria, manifest de PWA próprio
- Todas as consultas com escopo forçado à cliente autenticada
- Sem qualquer rota compartilhada com o painel

**DoD**

- [ ] Uma cliente entra, vê o próprio antes e depois e sai sem precisar de ajuda
- [ ] Nenhuma consulta do portal consegue alcançar dado de outra cliente
- [ ] O portal instala como app próprio no iPhone
- [ ] Ação da cliente aparece no painel da Rosiele sem recarregar

---

## Fase 13

### Offline-first & Sincronização

**Objetivo.** Funcionar no salão com sinal ruim. A base já foi preparada nas
Fases 3 e 5.

**Entregáveis**

- Persistência local (IndexedDB) do que importa: agenda do dia, clientes, atendimento
- Fila de comandos (outbox) com repetição e backoff
- Resolução de conflito determinística, com registro do que foi resolvido
- Indicador de sincronização honesto (nunca mentir que salvou)
- Testes de cenário: modo avião no meio do atendimento

**DoD**

- [ ] Atendimento completo é feito offline e sincroniza sem perda
- [ ] Nenhum dado é dado como salvo antes da confirmação do servidor
- [ ] Conflito nunca sobrescreve silenciosamente

---

## Fase 14

### Notificações

**Objetivo.** Lembrar sem incomodar — nas duas pontas.

**Entregáveis**

- Web Push com VAPID (iOS ≥16.4, app instalado)
- **Profissional:** lembrete de agendamento, aniversário de cliente, estoque
  baixo, cliente inativa, fechamento do dia, ativação de conta de cliente
- **Cliente:** lembrete do próprio horário, confirmação de solicitação, retorno
  recomendado, aniversário
- Central de preferências granular por tipo e horário, nos dois lados
- Janela de silêncio respeitada

**DoD**

- [ ] Push chega no iPhone instalado, com o app fechado
- [ ] Toda notificação pode ser desligada individualmente
- [ ] Nenhuma notificação fora da janela configurada

---

## Fase 15

### Hardening

**Objetivo.** Deixar pronto para uso real e diário.

**Entregáveis**

- Playwright cobrindo os fluxos críticos ponta a ponta, nos dois públicos
- Auditoria de performance com orçamento verificado no CI
- Auditoria de acessibilidade (axe + teclado + VoiceOver)
- **Revisão de segurança dedicada** ao fluxo de identidade da cliente
- Sentry, logs estruturados e métricas de negócio
- Backup e restauração testados de verdade
- Conformidade LGPD: política, consentimento, exportação, exclusão
- Documentação de operação

**DoD**

- [ ] Fluxos críticos verdes no CI
- [ ] Core Web Vitals dentro do orçamento em 4G
- [ ] Zero violação axe crítica ou séria
- [ ] Restauração de backup executada com sucesso em teste real

---

## Fase 16

### Comercialização

**Objetivo.** Transformar o sistema da Rosiele em produto para milhares.

**Entregáveis**

- Onboarding guiado e importação de clientes
- Planos, limites e billing (Stripe)
- Múltiplos profissionais por organização, com agenda por profissional
- Portal da cliente com identidade por organização
- Painel administrativo interno
- Analytics de produto e telemetria de uso

**DoD**

- [ ] Uma profissional nova se cadastra e agenda o primeiro atendimento sozinha
- [ ] Assinatura, upgrade e cancelamento funcionam ponta a ponta
- [ ] Nenhum limite arquitetural impede 10.000 organizações
