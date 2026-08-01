# Protocolo de Trabalho

Como o dono do produto e o agente trabalham juntos neste projeto.

---

## 1. O ciclo de trabalho — reescrito em 2026-08-01 (DEC-014)

```
  ┌─────────────────────────────────────────────────────────┐
  │  1. CONSTRUIR    tela funcionando, ponta a ponta         │
  │  2. SUBIR        commit direto na main → produção        │
  │  3. VERIFICAR    testar na URL real, com dado real       │
  │  4. AVISAR       dizer o que subiu e o que ainda falta   │
  │  5. REGISTRAR    00-ESTADO-ATUAL.md atualizado           │
  └─────────────────────────────────────────────────────────┘
```

**O que saiu:** apresentar fase e esperar "pode ir". O dono interrompeu o ciclo
anterior porque três fases se passaram sem uma tela existir.

**A unidade de trabalho é tela funcionando em produção**, não documento nem
fase. O roadmap virou mapa do que construir, não portão.

**Rapidez é sobre cortar cerimônia, não qualidade.** Zero `any`, camadas por
lint, AA, regra dos 3 toques — tudo continua.

**Passo 3 — Verificar.** O agente testa na URL de produção antes de avisar. O
dono confere depois, pelo iPhone.

**Passo 5 — Registrar.** [00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md) atualizado e
commitado junto com o código. Curto: o que subiu, o que falta, o que quebrou.

---

## 2. Continuidade entre sessões

O problema: a janela de conversa é volátil. A solução: **o repositório é a
memória**.

**Toda sessão nova começa lendo, nesta ordem:**

1. `CLAUDE.md` (carregado automaticamente)
2. `docs/00-ESTADO-ATUAL.md`
3. `docs/04-DECISOES.md`
4. `docs/03-ROADMAP.md` — como mapa do que falta construir, não como portão

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

**Nada roda na máquina do dono.** Nem Docker, nem banco local, nem servidor —
ele revisa direto em produção, pelo iPhone. Comandos locais existem só para o
agente verificar antes de subir. Build, E2E, migrations e auditorias em CI,
Vercel ou Railway.

**Git — commit direto na `main`.** Sem branch por fase, **sem Pull Request**
(DEC-012). O agente commita e dá push na `main`; o CI roda no push e a Vercel
publica em produção automaticamente. Commits em português, no imperativo.

O dono não quer intermediário entre o trabalho pronto e o que ele vê. Revisar
diff no GitHub não é o jeito dele de revisar — ele revisa no produto, pelo
iPhone. O PR só adicionava uma etapa que ninguém usava.

**Qualidade não é negociável por prazo.** Se algo não cabe no tempo, corta-se
escopo — nunca qualidade. Não existe "depois a gente arruma".

---

## 4. Quando o agente deve parar e perguntar

Curto de propósito. Perguntar demais foi o problema.

- A ação é destrutiva ou irreversível (apagar dado real, trocar credencial)
- Duas soluções legítimas mudam o produto de forma **visível para a usuária**
- Uma decisão registrada em `04-DECISOES.md` precisaria ser revogada

## 5. Quando o agente NÃO deve perguntar

- **Antes de começar a construir uma tela.** Constrói e sobe
- Detalhe de implementação, escolha entre soluções equivalentes
- Confirmação de passo intermediário
- Permissão para subir para produção — é o padrão, não a exceção

---

## 6. Padrão de qualidade

Toda entrega é avaliada como se fosse ser vendida amanhã para mil profissionais
pagantes. Referência de execução: Apple, Linear, Notion, Stripe, Vercel.

A pergunta de controle, em toda tela: **"a esposa dele abriria isso na frente de
uma cliente com orgulho?"** Se a resposta não for um sim imediato, refaz.
