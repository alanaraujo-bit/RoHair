# Backlog

> **Entregável 1.10 da Fase 1.** Fecha a fase.
>
> Cada item é rastreável até a **fase** que o entrega, o **JTBD** que o justifica e
> a **tela** que o mostra. Item sem JTBD não entra — é funcionalidade procurando
> problema.
>
> **JTBD:** [11-PERSONAS.md](11-PERSONAS.md) · **Telas:**
> [12-WIREFRAMES.md](12-WIREFRAMES.md) · **Invariantes:**
> [08-MODELO-DE-DOMINIO.md](08-MODELO-DE-DOMINIO.md)

---

## Como está priorizado

Não por fase, e não por esforço. Por **distância até a dor central**:

> 🗣️ *"Fim do dia estou com dinheiro mas fim do mês não tenho mais devido comprar
> algo que está faltando."*

| Prioridade | Critério |
| ---------- | -------- |
| **P0** | Sem isso o produto não existe, ou alguém se machuca |
| **P1** | Ataca a dor central diretamente |
| **P2** | Torna o P1 utilizável no dia a dia real |
| **P3** | Valor claro, mas o produto funciona sem |

A ordem das **fases** não muda — elas são sequenciais por dependência técnica. A
prioridade diz o que **não pode ser cortado** se uma fase estourar o escopo.

---

## P0 · Sem isso não há produto

| # | Item | Fase | JTBD | Tela |
| - | ---- | ---- | ---- | ---- |
| B-01 | Isolamento por organização, com RLS como segunda barreira | 4 | — | — |
| B-02 | Sessão da cliente que não alcança dado de outra cliente | 4 | — | — |
| B-03 | 🗣️ Anamnese com histórico de química | 9 | "não me deixe aplicar química em cabelo que não aguenta" | [8](12-WIREFRAMES.md#8--atendimento--abertura-e-anamnese) |
| B-04 | 🗣️ Teste de mecha como portão, com `ENCERRADO_SEM_SERVICO` | 9 | idem | [8](12-WIREFRAMES.md#8--atendimento--abertura-e-anamnese) |
| B-05 | Alerta de química no topo da ficha | 6 | "me lembre quem é essa pessoa" | [6](12-WIREFRAMES.md#6--ficha-da-cliente) |
| B-06 | Conflito de agenda impossível no banco (INV-01) | 8 | — | [3](12-WIREFRAMES.md#3--agenda) |
| B-07 | Cronômetro que sobrevive a fechar o app | 9 | "registre sem me atrapalhar" | [9](12-WIREFRAMES.md#9--atendimento--em-andamento) |
| B-08 | Finalizar numa transação só: receita + baixa + histórico | 9 | — | [10](12-WIREFRAMES.md#10--atendimento--checkout) |
| B-09 | Visibilidade de foto explícita, padrão privado | 6 | — | [9](12-WIREFRAMES.md#9--atendimento--em-andamento) |

B-03 a B-05 são P0 por **segurança física**, não por valor de produto. Sobrepor
química incompatível parte o cabelo da cliente.

---

## P1 · Ataca a dor central

| # | Item | Fase | JTBD | Tela |
| - | ---- | ---- | ---- | ---- |
| B-10 | Consumo de produto ligado ao atendimento | 7 | "me diga se estou ganhando" | [9](12-WIREFRAMES.md#9--atendimento--em-andamento) |
| B-11 | **Lucro do atendimento no checkout** | 9 | idem | [10](12-WIREFRAMES.md#10--atendimento--checkout) |
| B-12 | **"Sobrou" como número principal** do painel e do financeiro | 10, 11 | "me diga o que sobrou, não o que entrou" | [2](12-WIREFRAMES.md#2--hoje), [12](12-WIREFRAMES.md#12--dinheiro) |
| B-13 | **Alerta de estoque em dias**, pelo consumo real | 7 | "não me deixe faltar produto" | [11](12-WIREFRAMES.md#11--estoque) |
| B-14 | Baixa automática correta em serviço composto (INV-19) | 7 | idem | — |
| B-15 | Custo por atendimento e margem por serviço | 7, 10 | "me diga se estou ganhando" | [11](12-WIREFRAMES.md#11--estoque) |
| B-16 | Dia do faturamento definido pela finalização (INV-18) | 10 | "não me surpreenda no fim do mês" | [12](12-WIREFRAMES.md#12--dinheiro) |
| B-17 | 🗣️ Insight de **retorno vencido** por serviço + curvatura | 11 | "não me deixe perder cliente" | [2](12-WIREFRAMES.md#2--hoje), [5](12-WIREFRAMES.md#5--clientes) |
| B-18 | Insight de **produto acabando** | 11 | "não me deixe faltar produto" | [2](12-WIREFRAMES.md#2--hoje) |

**B-10 a B-16 são o produto.** Se tudo o mais for cortado e só isso existir, a frase
do fim do mês deixa de ser verdade — que é o critério de sucesso declarado.

---

## P2 · Torna o P1 utilizável de verdade

| # | Item | Fase | JTBD | Tela |
| - | ---- | ---- | ---- | ---- |
| B-19 | **Catálogo semente** — marcar em vez de digitar | 7 | — | [1](12-WIREFRAMES.md#1--onboarding) |
| B-20 | Onboarding em 5 passos, com dois puláveis | 7 | — | [1](12-WIREFRAMES.md#1--onboarding) |
| B-21 | Produtos pré-marcados pelo hábito daquela cliente | 9 | "registre sem me atrapalhar" | [9](12-WIREFRAMES.md#9--atendimento--em-andamento) |
| B-22 | Anamnese pré-preenchida pelo histórico | 9 | idem | [8](12-WIREFRAMES.md#8--atendimento--abertura-e-anamnese) |
| B-23 | Duração vinda do histórico **daquela cliente** | 8, 11 | "me diga o que eu tenho hoje" | [4](12-WIREFRAMES.md#4--novo-horário) |
| B-24 | Só oferecer horário que cabe na duração real | 8 | idem | [4](12-WIREFRAMES.md#4--novo-horário) |
| B-25 | Lista de clientes ordenada por quem precisa de ação | 6 | "não me deixe perder cliente" | [5](12-WIREFRAMES.md#5--clientes) |
| B-26 | **Fusão assistida** de fichas, com bandeja (D-07) | 6 | — | [7](12-WIREFRAMES.md#7--bandeja-e-fusão-de-fichas) |
| B-27 | Rota de escape na ativação da cliente (D-08) | 4 | — | [13](12-WIREFRAMES.md#13--portal--primeiro-acesso) |
| B-28 | Compressão de foto no dispositivo, < 200 KB | 6 | — | [9](12-WIREFRAMES.md#9--atendimento--em-andamento) |
| B-29 | Widget persistente de atendimento aberto | 5, 9 | "registre sem me atrapalhar" | [2](12-WIREFRAMES.md#2--hoje) |
| B-30 | Fiado e cortesia como estados próprios | 9, 10 | — | [10](12-WIREFRAMES.md#10--atendimento--checkout) |
| B-31 | 🗣️ Vocabulário: "vaga", "nutrição", frasco | 7, 8 | — | [3](12-WIREFRAMES.md#3--agenda) |

**B-19 a B-24 são o que impede o abandono.** Um app que exige digitar tudo do zero
morre na primeira semana, por melhor que seja o P1.

---

## P3 · Valor claro, mas o produto vive sem

| # | Item | Fase | JTBD | Tela |
| - | ---- | ---- | ---- | ---- |
| B-32 | 🗣️ **Meu cuidado** no portal | 12 | cliente: "o que uso em casa?" | [16](12-WIREFRAMES.md#16--portal--meu-cuidado) |
| B-33 | Galeria de evolução com comparador | 12 | cliente: "me mostre minha evolução" | [15](12-WIREFRAMES.md#15--portal--meus-antes-e-depois) |
| B-34 | Solicitar horário, com aprovação | 12 | cliente: "quero marcar" | [16](12-WIREFRAMES.md#16--portal--meu-cuidado) |
| B-35 | Confirmação de presença em um toque | 12 | cliente: "quando é meu horário?" | [14](12-WIREFRAMES.md#14--portal--início) |
| B-36 | Arrastar para reagendar | 8 | — | [3](12-WIREFRAMES.md#3--agenda) |
| B-37 | Lista de espera e sugestão de encaixe | 8 | — | — |
| B-38 | Offline-first com fila de comandos | 13 | — | — |
| B-39 | Web Push nas duas pontas | 14 | — | — |
| B-40 | Metas e relatórios exportáveis | 10 | — | [12](12-WIREFRAMES.md#12--dinheiro) |
| B-41 | Recorrência de agendamento | 8 | — | — |
| B-42 | Interface de equipe (`Membership`) | 16 | — | — |

**B-32 a B-35 são P3 com uma ressalva:** são P3 para a **profissional** e P0 para a
**cliente**. O portal inteiro é P3 no primeiro ano de uso e vira o principal
argumento de venda no segundo — é o que quase nenhum concorrente entrega.

---

## O que ficou de fora, e por quê

| Não entra | Por quê |
| --------- | ------- |
| Feed, curtida, gamificação | Anti-objetivo declarado |
| Nota fiscal, folha, contabilidade | Anti-objetivo: clareza de caixa, não conformidade fiscal |
| Comanda | Vocabulário de salão grande; ela não usou |
| Curvatura em notação `3B` | 🗣️ Ela usa nomes |
| Entidade "plano de tratamento" | Serviço composto + retorno cobrem o cronograma capilar |
| Casamento automático por telefone | Expõe histórico de terceiros (D-07) |
| Equipamento como insumo | Não é consumido; fora do escopo da Fase 7 |

---

## Rastreabilidade

Todo item aponta para fase, JTBD e tela. **Quatro itens não têm JTBD** — B-01, B-02,
B-06, B-08 — e é proposital: são invariantes de segurança e integridade. Ninguém
contrata um app "para ter Row Level Security", mas sem isso nada mais importa.

Fora esses quatro, **item sem JTBD é candidato a corte**. É a régua para quando uma
fase estourar o escopo.
