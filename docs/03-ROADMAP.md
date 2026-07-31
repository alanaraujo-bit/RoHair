# Roadmap — Do início ao fim

> 17 fases. Cada uma tem objetivo, entregáveis e **Definição de Pronto (DoD)**.
> Uma fase só é marcada ✅ quando **todos** os itens do DoD estão verdadeiros.
> Nenhuma fase começa sem aprovação explícita do dono do produto.

**Status geral:** ver [00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md).

| #   | Fase                                   | Público | Status |
| --- | -------------------------------------- | ------- | ------ |
| 0   | Fundação de Infraestrutura             | —       | 🟡     |
| 1   | Descoberta & Documentação de Produto   | —       | ⬜     |
| 2   | Design System "Áurea"                  | —       | ⬜     |
| 3   | Modelagem de Dados & Camada de Domínio | —       | ⬜     |
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

- [ ] Um PR falha o CI se houver erro de tipo, lint ou teste
- [ ] Push na `main` gera deploy automático na Vercel
- [ ] Um PR gera preview deployment acessível pelo celular
- [ ] `npm run dev` sobe na máquina do dono sem erro
- [ ] `docs/00-ESTADO-ATUAL.md` atualizado

---

## Fase 1

### Descoberta & Documentação de Produto

**Objetivo.** Saber exatamente o que será construído e por quê, antes de desenhar
qualquer pixel. Esta fase é feita **junto com a usuária real** (Rosiele).

**Entregáveis**

- Personas: a profissional (usuária primária) e a cliente (usuária do portal)
- Jobs to be Done de cada uma, por momento do dia
- Mapa do dia real: da abertura da agenda ao fechamento do caixa
- Mapa de fluxos completo, das duas pontas, incluindo os pontos de encontro
  (autocadastro → aparece no painel; atendimento → aparece no portal)
- Wireframes de baixa fidelidade de todas as telas principais
- Glossário do domínio da beleza (escova, hidratação, progressiva, retoque…)
- Modelo de domínio: entidades, relações, invariantes de negócio
- Backlog completo, priorizado, rastreável até as fases

**DoD**

- [ ] Cada fase de 6 a 14 tem escopo fechado e escrito
- [ ] Nenhuma tela do roadmap está sem wireframe
- [ ] O modelo de domínio foi validado contra 5 cenários reais de atendimento
- [ ] Documentos revisados e aprovados pelo dono

---

## Fase 2

### Design System "Áurea"

**Objetivo.** Construir a linguagem visual autoral do RoHair. Não é tema sobre
shadcn — é sistema próprio, com shadcn servindo apenas de base acessível para
alguns primitivos.

**Entregáveis**

- Identidade da marca: **"Ro" de Rosiele** (ver DEC-011) — monograma, ícone do
  app, splash, tom de voz na primeira pessoa
- Design tokens em OKLCH: cor, tipografia, espaçamento, raio, sombra, movimento
- **Tema Light "Porcelana"** e **Tema Dark "Veludo"**, cada um desenhado do zero
- Escala tipográfica fluida; display serifada para números, sans para UI
- Primitivos: Button, Input, Select, Sheet, Dialog, Drawer, Toast, Card, Badge,
  Avatar, Skeleton, EmptyState, Tabs, SegmentedControl, Switch, DatePicker,
  TimePicker, Money, Chip, ContextMenu, SwipeAction, FAB, CpfInput, PasswordField
- Biblioteca de ícones autorais do domínio da beleza
- Sistema de movimento: springs padronizados, `prefers-reduced-motion`
- Storybook com todos os estados de cada primitivo
- Teste automatizado de contraste nos dois temas

**DoD**

- [ ] Nenhum componente usa cor hard-coded — só tokens
- [ ] Todo primitivo passa em contraste AA nos dois temas
- [ ] Todo primitivo é navegável e operável por teclado
- [ ] Storybook publicado e acessível pelo celular do dono

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

**DoD**

- [ ] Domínio testado sem banco, em menos de 2 segundos
- [ ] Nenhum import de Prisma fora de `infrastructure/`
- [ ] Migrations aplicam limpo em banco vazio
- [ ] CPF inválido é rejeitado antes de chegar ao banco
- [ ] Cobertura do domínio acima de 90%

---

## Fase 4

### Identidade, Autenticação & Permissões

**Objetivo.** Dois públicos, dois domínios de identidade, isolamento correto — o
erro mais caro de corrigir depois. Modelo completo em **DEC-008**.

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

- Cadastro: nome, **CPF**, **data de nascimento**, telefone, foto, preferências,
  observações
- Busca por CPF que **encontra ficha autocadastrada** em vez de duplicar
- Prevenção de duplicidade por CPF, com fusão de fichas quando necessário
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

**Entregáveis**

- Catálogo de serviços com variantes (comprimento, espessura), preço e duração
- Produtos: categoria, fornecedor, custo, quantidade, unidade de medida
- Consumo padrão por serviço (base do custo real e da baixa automática)
- Movimentações de estoque com histórico auditável
- Alertas de estoque baixo e de validade
- Cálculo de custo por atendimento e margem por serviço

**DoD**

- [ ] Finalizar um atendimento dá baixa automática correta no estoque
- [ ] Toda movimentação é rastreável até a origem
- [ ] Alerta de estoque baixo dispara na regra configurada

---

## Fase 8

### Agenda Inteligente

**Objetivo.** O centro de gravidade do painel.

**Entregáveis**

- Visões dia, semana e mês, com transição fluida entre elas
- Criação de agendamento com duração sugerida por serviço e por cliente
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

**Entregáveis**

- Iniciar, pausar, retomar e finalizar, com cronômetro persistente
- Cronômetro modelado como intervalos imutáveis — sobrevive a fechar o app
- Registro de produtos utilizados com sugestão baseada no histórico
- Fotos antes/depois direto da câmera
- Observações rápidas por voz ou texto
- Checkout: valor, desconto, forma de pagamento, gorjeta
- Avaliação e agendamento do retorno na mesma tela
- Widget persistente de atendimento em andamento

**DoD**

- [ ] Fechar o app no meio do atendimento não perde um segundo do cronômetro
- [ ] Do "iniciar" ao "finalizar" em no máximo 3 toques
- [ ] Finalizar gera receita, baixa de estoque e histórico numa única transação

---

## Fase 10

### Financeiro

**Objetivo.** Clareza sobre dinheiro, sem exigir conhecimento contábil.

**Entregáveis**

- Entradas automáticas a partir dos atendimentos
- Saídas manuais e recorrentes, com categorias
- Fluxo de caixa por dia, semana e mês
- Lucro real (receita − custo de produto − despesas)
- Metas com acompanhamento visual
- Relatórios exportáveis (PDF/CSV)
- Fechamento de caixa diário

**DoD**

- [ ] Todo valor exibido é rastreável até a transação de origem
- [ ] Nenhum cálculo em ponto flutuante
- [ ] Relatório do mês bate com a soma dos atendimentos, ao centavo

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
- **Motor de insights** com regras versionadas: cliente sumida, produto
  acabando, cliente VIP, aniversário próximo, queda de frequência, horário ocioso
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

**Escopo proposto** _(a confirmar — D-06)_

- **Meu próximo horário**, com confirmação de presença em um toque
- **Minhas visitas** — histórico com serviço, data, duração e valor
- **Meus antes e depois** — a galeria da própria evolução, com comparador de
  arrastar. Este é o coração emocional do portal
- **Solicitar horário** _(a confirmar — D-05)_: pedido que a Rosiele aprova, em
  vez de agendamento direto na agenda
- **Minha ficha** — preferências e observações que ela escolhe compartilhar
- **Meu cuidado** — recomendações da Rosiele e lembrete do retorno ideal
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
