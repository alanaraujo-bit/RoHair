# Protocolo de Trabalho

Como o dono do produto e o agente trabalham juntos neste projeto.

---

## 1. O ciclo de uma fase

```
  ┌─────────────────────────────────────────────────────────┐
  │  1. APRESENTAR   objetivo · arquitetura · decisões       │
  │  2. APROVAR      o dono aprova, ajusta ou recusa         │
  │  3. EXECUTAR     agente executa a fase inteira           │
  │  4. REVISAR      dono valida contra o DoD                │
  │  5. REGISTRAR    docs atualizados + commit               │
  └─────────────────────────────────────────────────────────┘
```

**Passo 1 — Apresentar.** Antes de escrever qualquer linha, o agente apresenta o
que vai fazer, como vai fazer, quais alternativas descartou e por quê.

**Passo 2 — Aprovar.** Nada começa sem "pode ir". Aprovação de uma fase não é
aprovação da seguinte.

**Passo 3 — Executar.** Dentro de uma fase aprovada, o agente executa até o fim
sem pedir permissão a cada passo. Se encontrar algo que muda o escopo, interrompe
e avisa.

**Passo 4 — Revisar.** O dono valida contra a Definição de Pronto da fase, no
preview deployment, pelo próprio iPhone.

**Passo 5 — Registrar.** [00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md) atualizado,
decisões registradas, commit feito. Só então a próxima fase é apresentada.

---

## 2. Continuidade entre sessões

O problema: a janela de conversa é volátil. A solução: **o repositório é a
memória**.

**Toda sessão nova começa lendo, nesta ordem:**
1. `CLAUDE.md` (carregado automaticamente)
2. `docs/00-ESTADO-ATUAL.md`
3. `docs/04-DECISOES.md`
4. A fase atual em `docs/03-ROADMAP.md`

**Toda sessão termina atualizando:**
1. O snapshot e o "Próximo passo imediato" em `00-ESTADO-ATUAL.md`
2. Uma nova entrada no "Log de sessões"
3. `04-DECISOES.md`, se algo foi decidido
4. Commit da documentação junto com o código

Se o dono abrir uma janela nova e o agente não souber onde está, **é falha de
documentação, não de memória.** Documentação desatualizada é bug de prioridade
máxima.

### Como retomar depois de um tempo parado

Basta dizer: **"Leia a documentação e me diga onde estamos."**
O agente deve responder com fase atual, o que existe, próximo passo e bloqueios —
sem precisar de nenhum contexto da conversa anterior.

---

## 3. Regras de execução

**Na máquina do dono roda apenas `npm run dev`**, para acompanhamento visual em
tempo real. Build, testes E2E, migrations e auditorias rodam em CI, Vercel ou
Railway. Nenhuma instalação local sem justificativa e sem pedir.

**Git.** Branch por fase (`fase-03-modelagem`), PR com CI verde, merge na `main`,
deploy automático. Commits em português, no imperativo.

**Qualidade não é negociável por prazo.** Se algo não cabe no tempo, corta-se
escopo — nunca qualidade. Não existe "depois a gente arruma".

---

## 4. Quando o agente deve parar e perguntar

- Quando a decisão é de produto e não de engenharia (o que a usuária prefere)
- Quando duas soluções técnicas são legítimas e a escolha muda o produto
- Quando algo descoberto durante a execução muda o escopo da fase
- Quando uma decisão já registrada em `04-DECISOES.md` precisaria ser revogada

## 5. Quando o agente NÃO deve perguntar

- Detalhe de implementação dentro de uma fase já aprovada
- Escolha entre duas soluções equivalentes — decide e registra
- Confirmação de passo intermediário de trabalho já autorizado

---

## 6. Padrão de qualidade

Toda entrega é avaliada como se fosse ser vendida amanhã para mil profissionais
pagantes. Referência de execução: Apple, Linear, Notion, Stripe, Vercel.

A pergunta de controle, em toda tela: **"a esposa dele abriria isso na frente de
uma cliente com orgulho?"** Se a resposta não for um sim imediato, refaz.
