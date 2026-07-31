# Roteiro de conversa com a Rosiele

> **Entregável 1.1 da Fase 1.** Este documento é para o **Alan** usar, não para a
> Rosiele ler. Ela não deve ver o roteiro — ver as perguntas antecipadamente faz
> qualquer pessoa preparar a resposta "certa" em vez de contar o que acontece.
>
> As respostas vão para [respostas-rosiele.md](respostas-rosiele.md), do jeito
> que saírem. Não organize, não resuma, não corrija o português. O jeito como ela
> nomeia as coisas **é dado de projeto** — vira nome de tela, de botão e de tabela.

---

## Antes de começar — leia isto

### O que esta conversa é

É a única etapa do projeto inteiro em que a informação não pode vir de mim. Eu
consigo deduzir arquitetura, desenhar tela e escrever código. Eu **não** consigo
saber que ela anota o preço no verso de um cartão de visita, ou que ela nunca
cobra da tia da vizinha, ou que a progressiva na verdade são três atendimentos
diferentes que ela chama pelo mesmo nome.

Se eu inventar essas coisas, o erro só vai aparecer na Fase 9 — quando ela estiver
com as mãos na cabeça de uma cliente e o app pedir algo que não faz sentido no dia
dela. Corrigir ali custa o retrabalho de cinco fases.

### Duração e formato

**45 a 60 minutos.** Se passar disso, pare e marque uma segunda conversa — cansaço
produz resposta genérica, que é pior que resposta nenhuma.

Peça para **gravar o áudio**. Explique o motivo de verdade: "é para eu não te
interromper anotando". Se ela não quiser, tudo bem — aí anote em tópicos curtos e
transcreva logo depois, enquanto está fresco.

Não precisa ser numa mesa. Se der para conversar enquanto ela arruma as coisas do
salão, melhor ainda — o ambiente puxa memória que a mesa não puxa.

### As cinco regras da conversa

**1. Pergunte pela última vez, nunca pelo hábito.**
"Como você costuma agendar?" produz o processo idealizado. "Me conta a última
cliente que marcou horário — como foi?" produz o que realmente acontece.

**2. Nunca ofereça solução.**
Não diga "e se o app te avisasse quando o produto estivesse acabando?". Ela vai
concordar por educação, e você vai anotar uma funcionalidade que ninguém pediu.
Pergunte o problema. A solução é o meu trabalho.

**3. Persiga a gambiarra.**
Quando ela disser "aí eu anoto num papelzinho", "aí eu decoro", "aí eu mando
mensagem pra mim mesma" — **pare tudo e escave**. Toda gambiarra é um buraco que
o produto vai preencher. Pergunte: onde fica esse papel? já perdeu algum? o que
acontece quando perde?

**4. Silêncio é ferramenta.**
Depois que ela responder, espere três segundos antes de falar. A segunda coisa que
a pessoa diz costuma ser mais verdadeira que a primeira.

**5. Não venda o app.**
Se ela perguntar "isso vai ter no aplicativo?", responda "provavelmente, mas me
conta mais sobre como é hoje". No minuto em que ela entra em modo "cliente
empolgada", ela para de descrever o presente e começa a imaginar o futuro — e o
futuro eu sei imaginar sozinho.

### O que fazer se ela travar

Duas saídas que quase sempre funcionam:

- **"Me descreve a última vez."** Sai do abstrato e vai para a memória.
- **"E aí o que aconteceu?"** Depois de qualquer resposta curta.

---

## Bloco 0 · Aquecimento

Serve para ela relaxar e para eu entender a escala real do negócio.

1. Há quanto tempo você trabalha com cabelo?
2. Como é o seu espaço hoje? Você atende em casa, alugado, na casa da cliente?
3. Quantas clientes você atende numa semana normal? E numa semana cheia?
4. Você trabalha sozinha? Tem alguém que ajuda, mesmo que de vez em quando?
5. Quais dias e horários você atende? Tem dia que você não atende de jeito nenhum?

> **Por que eu preciso disso:** o volume define se a agenda é uma lista ou um
> calendário. "Alguém que ajuda de vez em quando" define se `Membership` e o papel
> `ASSISTANT` são reais agora ou só na Fase 16.

---

## Bloco 1 · Como o horário é marcado

6. Me conta a última cliente que marcou horário com você. Como ela te procurou?
7. Quanto tempo demorou entre ela te chamar e o horário ficar marcado de verdade?
8. Onde esse horário fica anotado agora? _(se ela disser WhatsApp, pergunte: e se
   você precisar saber o que tem na quinta que vem, você faz o quê?)_
9. Já aconteceu de você marcar duas clientes no mesmo horário? Como você descobriu?
10. Já aconteceu de esquecer um horário que estava marcado? O que aconteceu depois?
11. Quando alguém pede um horário que você não tem, o que você faz?
12. Tem cliente que marca sempre no mesmo dia e horário, tipo toda quinzena?
13. Alguma cliente já faltou sem avisar? Com que frequência isso acontece? Você
    cobra alguma coisa?
14. Alguma cliente já desmarcou em cima da hora? O que você fez com o horário vago?

> **Por que eu preciso disso:** a pergunta 12 decide se `Appointment` precisa de
> recorrência já na Fase 8. A 13 e a 14 decidem se "faltou" e "cancelado" são
> estados com consequência financeira ou só rótulos. A 11 decide se lista de
> espera é funcionalidade real ou enfeite.

---

## Bloco 2 · O começo do dia

15. Qual é a primeira coisa que você faz num dia de atendimento?
16. Como você sabe quem vem hoje? Você confere em algum lugar?
17. Você confirma com as clientes antes? Como e quando?
18. Você prepara alguma coisa antes de a cliente chegar? Separa produto, mistura
    algo, deixa alguma coisa pronta?
19. Tem alguma coisa que você gostaria de saber ao acordar e hoje não sabe?

> **Por que eu preciso disso:** a 15 e a 16 desenham a tela inicial do painel. A 19
> é a pergunta mais valiosa deste bloco — deixe ela pensar, não preencha o silêncio.

---

## Bloco 3 · O atendimento — o momento de verdade

Este é o bloco mais importante do roteiro inteiro. O produto foi desenhado a
partir desta cena. Vá devagar aqui.

20. A cliente chegou. Me conta passo a passo o que acontece, do "oi" até ela sair.
21. Quanto tempo leva uma escova? E uma hidratação? E uma progressiva?
22. _(depois que ela responder a 21)_ E na prática, já demorou muito mais que isso?
    Por quê?
23. Acontece de você fazer mais de um serviço na mesma cliente na mesma visita?
    Quais combinam?
24. Enquanto o produto age, você fica parada esperando ou faz outra coisa?
25. Você já atendeu duas clientes ao mesmo tempo? Como funciona?
26. Alguma vez o serviço mudou no meio? A cliente chegou querendo uma coisa e saiu
    com outra?
27. Onde fica o seu celular enquanto você trabalha? Suas mãos estão livres em algum
    momento?
28. Se eu te pedisse para registrar alguma coisa no celular no meio do atendimento,
    quando seria possível? _(esta é literalmente a pergunta que define o produto)_
29. Você tira foto do cabelo? Antes, depois, os dois? Sempre ou só às vezes?
30. Quando você tira, o que você faz com a foto depois?
31. Alguma cliente já pediu para você não postar ou não guardar foto dela?

> **Por que eu preciso disso:** a 24 e a 25 decidem se o cronômetro é um por vez ou
> vários simultâneos — é a diferença entre um modelo de dados simples e um
> complexo, e eu preciso saber **agora**, não na Fase 9. A 26 decide se atendimento
> é imutável ou editável no meio. A 28 é o critério de aceite da regra dos 3
> toques. A 31 é LGPD e vira o controle de visibilidade de foto.

---

## Bloco 4 · Produtos

32. Me conta a última vez que você descobriu que um produto tinha acabado. Quando
    você descobriu?
33. O que você fez?
34. Como você sabe hoje quanto tem de cada produto?
35. Onde você compra? Com que frequência? É sempre no mesmo lugar?
36. Quanto de produto vai numa escova? E numa progressiva? Você consegue estimar?
37. _(se ela hesitar na 36)_ Um frasco de X dura quantos atendimentos, mais ou menos?
38. Tem produto que vence? Já perdeu produto por vencimento?
39. Tem produto que você usa só numa cliente específica, tipo uma que é alérgica?

> **Por que eu preciso disso:** a 36 e a 37 são a mesma pergunta por dois caminhos.
> Ela provavelmente não sabe em mililitros, mas sabe "esse frasco dá umas 8
> escovas" — e isso é suficiente para calcular custo por atendimento. A 39 decide
> se preferência de produto entra na ficha da cliente já na Fase 6.

---

## Bloco 5 · Dinheiro

Pode ser o bloco mais desconfortável. Deixe claro que não tem resposta errada e
que ninguém além de vocês dois vai ver isso.

40. Como você define o preço de um serviço?
41. Faz quanto tempo que você não muda esses preços?
42. Você cobra diferente dependendo do cabelo? Comprimento, volume, se é muito
    grosso?
43. Você dá desconto? Em que situação?
44. Tem cliente que você não cobra ou cobra menos? _(sem julgamento — isso é normal
    e o app precisa saber lidar)_
45. Como as clientes pagam? Pix, dinheiro, cartão? Qual é o mais comum?
46. Alguém já ficou devendo? Como você controla isso?
47. Você sabe quanto sobra de lucro numa escova, depois de descontar o produto?
48. Você anota o que entra? Onde?
49. E o que sai — produto, aluguel, luz, transporte — você anota?
50. Você sabe quanto ganhou no mês passado? Como você chegou nesse número?

> **Por que eu preciso disso:** a 42 é o que justifica `ServiceVariant` existir. A
> 44 e a 46 decidem se pagamento parcial e cortesia são estados de primeira classe
> — se forem esquecidos, o relatório financeiro nunca vai bater, e "todo valor
> exibido é rastreável" é DoD da Fase 10. A 47 é a dor central do produto: se ela
> hesitar, essa hesitação é o argumento de venda.

---

## Bloco 6 · A cliente ao longo do tempo

51. Uma cliente que você não vê há seis meses volta hoje. Do que você lembra dela?
52. Onde está o resto — o que você não lembra?
53. O que você gostaria de lembrar de cada cliente e hoje não consegue?
54. Como você sabe que uma cliente sumiu? Você percebe?
55. Quando percebe, você faz alguma coisa?
56. Tem cliente que você considera especial? Como você trata diferente?
57. Você lembra de aniversário de cliente? Faz alguma coisa?
58. Já perdeu cliente e descobriu depois o motivo?

> **Por que eu preciso disso:** a 51 e a 52 juntas desenham a ficha da cliente — o
> que ela lembra sozinha não precisa estar em destaque; o que ela esquece é o que
> tem que estar no topo. A 54 e a 55 são o motor de insights da Fase 11.

---

## Bloco 7 · O fim do dia e o fim do mês

59. Terminou o último atendimento. O que você faz antes de encerrar?
60. Você faz algum fechamento, conta dinheiro, confere alguma coisa?
61. No fim do mês, você faz alguma conta? Qual?
62. Tem alguma coisa que você sempre adia e nunca faz?

---

## Bloco 8 · Irritação e orgulho

Duas perguntas que valem mais que metade do roteiro. Não corra.

63. O que mais te irrita no dia a dia do trabalho? Não precisa ser sobre organização
    — pode ser qualquer coisa.
64. _(insista)_ E o que mais? Tem alguma coisa pequena que te irrita toda vez?
65. Se você pudesse nunca mais fazer uma parte do seu trabalho, qual seria?
66. E o contrário: qual parte você mais gosta?
67. O que você mostraria com orgulho para uma cliente nova? O que faria você
    parecer profissional?
68. Tem alguma coisa que hoje te deixa com vergonha na frente da cliente?

> **Por que eu preciso disso:** a 67 e a 68 são o critério de qualidade visual do
> produto inteiro — a pergunta de controle do projeto é "ela abriria isso na frente
> de uma cliente com orgulho?". A 68 diz exatamente o que evitar.

---

## Bloco 9 · A outra ponta — o app da cliente

Aqui é o único ponto do roteiro em que você fala de algo que ainda não existe. É
inevitável: não dá para perguntar sobre um hábito que ninguém tem. Mesmo assim,
**não descreva o portal** — pergunte sobre o comportamento das clientes hoje.

69. As clientes te perguntam coisas por mensagem? O quê, principalmente?
70. Qual pergunta você mais responde repetidamente?
71. Alguma cliente já te pediu foto de um trabalho antigo dela?
72. As clientes te mandam foto de referência, tipo "quero esse cabelo"?
73. Se a cliente pudesse marcar horário sozinha, sem falar com você, isso seria bom
    ou ruim? Por quê? _(pergunta direta de propósito — resolve a decisão D-05)_
74. _(se ela disser "ruim")_ E se ela pudesse **pedir** um horário, e você aprovasse?
75. Tem alguma coisa que você **não** ia querer que a cliente visse no aplicativo
    dela?
76. As suas clientes usam iPhone ou Android, na maioria? Elas instalariam um app?

> **Por que eu preciso disso:** a 70 é o escopo do portal em uma pergunta — o que
> ela mais repete é o que o portal responde sozinho. A 73 e a 74 resolvem D-05. A
> 75 resolve metade de D-06 e define o controle de visibilidade das notas da ficha.

---

## Bloco 10 · Os cinco atendimentos reais

**Este bloco é obrigatório.** O DoD da Fase 1 exige que o modelo de domínio seja
validado contra cinco cenários reais, e "real" aqui significa que aconteceu de
verdade — não um exemplo típico construído na hora.

Peça cinco histórias completas, do agendamento até o pagamento. **Não peça cinco
atendimentos normais** — peça estes cinco, nesta ordem:

| # | Peça assim |
| - | ---------- |
| 1 | "Me conta um atendimento comum, do começo ao fim. O último que você fez." |
| 2 | "Agora um que deu errado. Qualquer tipo de errado." |
| 3 | "Um de cliente que nunca tinha vindo antes." |
| 4 | "Um que mudou no meio — ela chegou querendo uma coisa e saiu com outra." |
| 5 | "O mais complicado que você já fez. Ou o mais caro." |

Para cada um, se ela não contar espontaneamente, puxe:

- Como foi marcado, e quanto tempo antes
- Chegou no horário?
- Que serviço foi feito, exatamente
- Quanto tempo levou de verdade
- Que produtos foram usados
- Quanto custou e como foi pago
- Tirou foto?
- Ficou marcado algum retorno?
- Alguma coisa fugiu do normal?

> **Por que eu preciso disso:** os cinco casos são o banco de testes do modelo de
> domínio. O caso 2 (deu errado) e o caso 4 (mudou no meio) são os que quebram
> modelos ingênuos — praticamente todo sistema de agenda ruim do mercado é ruim
> porque foi desenhado só para o caso 1.

---

## Bloco 11 · Fechamento

77. Tem alguma coisa que eu não perguntei e que você acha importante eu saber?
78. Se esse aplicativo existisse amanhã e fizesse **uma** coisa só perfeitamente,
    qual coisa você escolheria?

---

## Depois da conversa — o que fazer

1. **Transcreva no mesmo dia.** Memória de conversa dura poucas horas.
2. Cole tudo em [respostas-rosiele.md](respostas-rosiele.md), na ordem dos blocos.
   Respostas pela metade, contraditórias ou "não sei" são informação legítima —
   **mantenha**. Um "não sei" na pergunta 47 vale mais que uma estimativa inventada.
3. Anote também o que ela disse **fora** das perguntas, e o que ela demorou para
   responder. Hesitação marca onde está a dor.
4. Se algo não foi perguntado e apareceu sozinho, ótimo — anote no fim, num bloco
   "extras".

Com isso na mão, a **Fase 1B** começa: personas, mapa do dia, modelo de domínio
validado, fluxos, wireframes, escopo fechado das Fases 6 a 14 e backlog.
