# ADR-0002 · Construção do design system Áurea

- **Status:** Aceito
- **Data:** 2026-07-31
- **Fase:** 2
- **Decisores:** dono do produto, agente

## Contexto

A Fase 0 deixou pronta a base do Áurea: cor em OKLCH com dois temas desenhados
separadamente, Fraunces e Inter carregadas, escala de raio, sombras por tema e
curvas de mola. Faltava o volume — primitivos, ícones e a forma de revisá-los.

Três forças em jogo:

1. **O roadmap trazia uma lista genérica de primitivos** (Button, Input, Tabs,
   ContextMenu…), escrita na Fase 0, antes de existir qualquer tela. Depois da
   Fase 1 existem 16 wireframes que dizem exatamente o que é preciso.
2. **A arquitetura previa shadcn/Radix** como base acessível. Desde que essa
   escolha foi feita, o `<dialog>` nativo passou a resolver overlay melhor do
   que qualquer biblioteca.
3. **O dono revisa pelo iPhone**, e só roda `npm run dev` na máquina dele.

## Decisão

### 1. Os primitivos saem dos wireframes, não de uma lista genérica

A lista da Fase 0 foi substituída pela derivada das telas. Isso **acrescentou**
sete primitivos que ninguém tinha previsto — `MoneyFigure`, `Timer`,
`SafetyAlert`, `DecisionGate`, `PhotoCompare`, `SeedPicker`, `MergeCompare` — e
**removeu** três que nenhuma tela usa: `Tabs`, `ContextMenu` e `Avatar` isolado.

Regra permanente: **primitivo entra quando uma tela pede**. Componente "para o
caso de precisar" é dívida visual.

### 2. Overlay sobre `<dialog>` nativo, não sobre Radix

O elemento nativo entrega armadilha de foco, `Esc`, inerte no resto da página,
camada superior e `::backdrop` — tudo que uma biblioteca de overlay existe para
resolver. Disponível no Safari desde a 15.4, bem antes do piso do público.

Radix continua sendo a escolha certa onde o HTML não resolve. Overlay deixou de
ser esse caso.

O contrato é verificado por E2E com a pseudo-classe `:modal`, que só casa com um
diálogo aberto por `showModal()`.

### 3. Par `action` / `on-action` em vez de branco fixo

O teste de contraste provou que **branco sobre o rosa do tema Veludo dá 2.17:1**
— reprovado. A cor de ação e a cor do texto sobre ela viraram um par de tokens:
no Porcelana o par é rosa escuro + branco (5.04:1); no Veludo, rosa claro +
tinta escura (8.83:1).

Nenhum componente escreve `text-white` sobre cor de marca.

### 4. Catálogo como rota do aplicativo, não Storybook

`/design` renderiza todos os primitivos com **o pipeline de produção**: mesmas
fontes, mesmo CSS, mesmo alternador de tema, mesmo deploy.

### 5. Ícones autorais

Biblioteca própria do domínio da beleza, grade de 24, traço 1.5, só contorno,
`currentColor`. Especificidade é a vantagem competitiva declarada do produto, e
ela começa no vocabulário visual.

## Alternativas consideradas

### Alternativa A — Storybook publicado em projeto próprio na Vercel

- **A favor:** isolamento real por componente, controles de argumento,
  documentação gerada, padrão de mercado para design system.
- **Contra:** configuração de build, pipeline de CSS e carregamento de fonte
  próprios; segundo projeto na Vercel; segundo job de CI; centenas de MB em
  `node_modules`.
- **Motivo da recusa:** com Tailwind v4 e `next/font`, a configuração paralela
  pode divergir da real — e um catálogo que passa enquanto o aplicativo quebra é
  pior que nenhum catálogo, porque destrói a confiança em tudo que ele mostra.
  **Esta alternativa havia sido aprovada pelo dono e foi trocada durante a
  execução; a troca está registrada aqui e foi comunicada.**

### Alternativa B — Radix para os overlays

- **A favor:** já previsto na arquitetura; comportamento uniforme entre
  navegadores antigos.
- **Contra:** dependência para reimplementar em JavaScript o que a plataforma
  faz nativamente, com risco de divergir do comportamento nativo.
- **Motivo da recusa:** o piso de suporte do produto é iOS 15.4+, onde o
  `<dialog>` é completo.

### Alternativa C — escurecer o rosa do Veludo para caber texto branco

- **A favor:** um token a menos.
- **Contra:** mataria a identidade do tema escuro, cuja premissa registrada é
  que ele **não** é a inversão do claro.
- **Motivo da recusa:** o par `on-action` custa dois tokens e preserva os dois
  temas como identidades próprias.

## Consequências

**Positivas**

- **Zero dependências novas** em toda a Fase 2
- Contraste deixa de ser opinião: o teste lê o `tokens.css` real e recalcula, e
  quem mudar um token quebra o CI
- O catálogo não pode divergir do aplicativo, porque é o aplicativo
- A biblioteca não tem componente morto

**Negativas / custos aceitos**

- Sem controles de argumento nem documentação gerada — explorar estados exige
  editar o catálogo
- Sem isolamento: um erro em um primitivo derruba a página inteira do catálogo
- `/design` fica público em produção, apenas com `noindex`. Aceito enquanto não
  há dado real; deve ser protegido ou removido antes da Fase 16

**Reversibilidade**

Alta. Storybook pode ser adicionado depois sem desfazer nada — os primitivos são
componentes React comuns. Trocar `<dialog>` por Radix é substituir um arquivo.

## Impacto

- **Fases afetadas:** 2 (execução), 5 (o app shell herda os overlays), 6 a 12
  (consomem os primitivos), 16 (proteger ou remover `/design`)
- **Arquivos e módulos afetados:** `shared/ui/primitives/`, `shared/ui/icons/`,
  `shared/ui/styles/`, `app/design/`, `e2e/aurea.spec.ts`
- **Documentos a atualizar:** `02-ARQUITETURA.md` (shadcn/Radix e overlays),
  `03-ROADMAP.md` (escopo e DoD da Fase 2), `00-ESTADO-ATUAL.md`
