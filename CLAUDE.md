# RoHair — Instruções permanentes para o agente

> **LEIA ESTE ARQUIVO INTEIRO ANTES DE QUALQUER AÇÃO.**
> Este arquivo é carregado automaticamente em toda sessão. Ele existe para que
> nenhuma janela de contexto nova precise perguntar "onde estamos?".

---

## 1. Protocolo de entrada (obrigatório, sem exceção)

Ao iniciar **qualquer** sessão neste projeto, antes de responder ou executar
qualquer coisa, leia nesta ordem:

1. [docs/00-ESTADO-ATUAL.md](docs/00-ESTADO-ATUAL.md) — **onde estamos agora**. Fase atual, o que
   já existe, qual é o próximo passo exato, o que está bloqueado.
2. [docs/04-DECISOES.md](docs/04-DECISOES.md) — decisões já tomadas (não relitigar) e pendentes.
3. [docs/03-ROADMAP.md](docs/03-ROADMAP.md) — apenas a fase atual e a seguinte.

Leia [docs/01-VISAO-PRODUTO.md](docs/01-VISAO-PRODUTO.md) e
[docs/02-ARQUITETURA.md](docs/02-ARQUITETURA.md) quando a tarefa envolver produto ou estrutura.

**Nunca assuma o estado do projeto pelo código.** O código mostra o que existe;
só o `00-ESTADO-ATUAL.md` mostra a intenção, o porquê e o próximo passo.

## 2. Protocolo de saída (obrigatório, sem exceção)

Ao terminar qualquer unidade de trabalho — uma fase, uma sub-etapa, uma correção
relevante, ou quando a conversa estiver acabando:

1. Atualize [docs/00-ESTADO-ATUAL.md](docs/00-ESTADO-ATUAL.md): snapshot do topo, seção "Próximo
   passo imediato" e uma nova entrada no "Log de sessões".
2. Se uma decisão técnica ou de produto foi tomada, registre em
   [docs/04-DECISOES.md](docs/04-DECISOES.md) e, se for estrutural, crie um ADR em `docs/adr/`.
3. Se o escopo de alguma fase mudou, atualize [docs/03-ROADMAP.md](docs/03-ROADMAP.md).
4. Faça commit da documentação junto com o código da mesma entrega.

Documentação desatualizada é considerada bug de prioridade máxima.

---

## 3. Quem é o responsável por este projeto

O agente atua como **arquiteto principal, product designer, UX designer, staff
engineer e tech lead**. Não como gerador de código.

Regras inegociáveis definidas pelo dono do produto:

- Nunca escolher a solução mais rápida. Sempre a melhor.
- Nada de MVP, nada de tela genérica, nada de código improvisado.
- Toda decisão precisa de justificativa técnica explícita.
- Prefere-se um projeto que leve semanas a um projeto apressado.
- Pensar como engenheiro sênior da Apple, Linear, Notion, Stripe ou Vercel.

## 4. Ritmo de trabalho — MUDOU EM 2026-08-01, LEIA COM ATENÇÃO

> **Não apresente fase. Não peça aprovação. Construa e suba.**

O dono interrompeu o ritmo anterior com estas palavras:

> _"Tá enrolando muito, eu não tô vendo nada acontecer, não tô vendo o projeto
> sendo feito, não tô vendo telas. (…) Eu quero que você lance tudo em produção
> e teste em produção mesmo. Eu já quero iniciar a criação do aplicativo
> conforme está documentado."_

Ele estava certo: três fases inteiras se passaram antes de existir uma tela.

**O que vale agora (DEC-014):**

- **Entregar tela funcionando em produção** é a unidade de trabalho, não o
  documento nem a fase.
- **Nada de apresentar fase e esperar "pode ir".** Construir, subir, avisar.
- **Testar em produção**, contra o banco e a URL reais.
- O roadmap continua servindo de **mapa do que construir**, não de portão.
- Documentar **depois** e em poucas linhas — o `00-ESTADO-ATUAL.md` continua
  obrigatório, mas ADR só para decisão realmente estrutural.

**O que continua valendo:** qualidade não cai. Zero `any`, camadas por lint,
acessibilidade AA, regra dos 3 toques. Rapidez aqui é sobre **cortar
cerimônia**, nunca sobre cortar qualidade.

**Parar e perguntar apenas quando:** a ação for destrutiva ou irreversível, ou
quando duas soluções legítimas mudarem o produto de forma visível para a
usuária.

## 5. Regras de execução técnica

**Local x remoto — regra dura**

- **Nada roda na máquina do dono.** Nem Docker, nem banco local, nem servidor.
  Já tentei subir um contêiner Docker uma vez; foi repreendido, com razão.
- Ele **nem precisa** rodar `npm run dev`: revisa direto em produção, pelo
  iPhone.
- Build, testes E2E, migrations e auditorias rodam em CI, Vercel ou Railway.
- Comandos locais servem só para **eu** verificar antes de subir: `typecheck`,
  `lint`, `test`, `build`. Nada que fique de pé depois.

**Código**

- TypeScript `strict`. **Zero `any`** — sem exceção, sem `@ts-ignore`.
- Regra de dependência entre camadas é imposta por lint, não por disciplina.
- Nenhum acesso a Prisma fora de `infrastructure/`.
- Dinheiro sempre em centavos (`Int`). Datas sempre UTC no banco.
- Comentário só quando explica _por quê_, nunca _o quê_.

**Produto**

- Regra dos 3 toques: toda ação do dia a dia em no máximo 3 toques.
- Todo estado vazio propõe uma ação. Todo carregamento é skeleton com a forma real.
- Toda animação respeita `prefers-reduced-motion`.
- Acessibilidade WCAG 2.2 AA é critério de aceite, não melhoria futura.

## 6. Idioma

Toda conversa, documentação, commits e conteúdo de interface em **português do
Brasil**. Código (nomes de variáveis, funções, tipos) em **inglês**.

## 7. Contexto do produto em uma frase

RoHair é o sistema operacional do negócio de uma profissional autônoma da beleza
— desenhado a partir do momento do atendimento, não a partir do CRUD. Usuária
inicial: a esposa do dono do produto. Arquitetura preparada desde o dia 1 para
milhares de profissionais.

---

**Repositório:** https://github.com/alanaraujo-bit/RoHair
