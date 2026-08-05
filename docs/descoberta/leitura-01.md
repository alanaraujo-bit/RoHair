# Leitura da primeira rodada

> O que as respostas da Roziele confirmam, revelam, corrigem e ainda deixam em
> aberto. Respostas cruas em [respostas-roziele.md](respostas-roziele.md).

---

## 1. Como esta rodada aconteceu

As respostas vieram **por escrito, uma linha por bloco**, e cada uma responde ao
**título** do bloco — não às perguntas. Ela viu os cabeçalhos do roteiro, e o
roteiro pedia explicitamente que ela não visse nada.

Isso não é falha dela, e em parte é falha minha:

- **Bug do instrumento.** O bloco 9 se chamava "A outra ponta", querendo dizer a
  outra ponta do produto. "Ponta" é palavra do domínio do cabelo. Ela respondeu
  sobre pontas ressecadas, com toda a razão. Escrevi um glossário inteiro sobre
  colisão de vocabulário e caí nela no título de um bloco.
- **Formato escrito mata o acompanhamento.** As perguntas do roteiro funcionavam em
  cadeia — "e aí o que aconteceu?", o silêncio de três segundos, a insistência no
  "e o que mais?". Nada disso existe num texto respondido de uma vez.

Dois sintomas clássicos disso aparecem: **"Não me irrito"** e **"kkkkkkkkk nunca
deu"** errado. Ninguém que trabalha com química em cabelo alheio há anos nunca teve
um susto, e ninguém não se irrita com nada. São respostas de quem está sendo
gentil por escrito — dissolvem em conversa falada, com uma pergunta concreta.

**Mesmo assim, esta rodada valeu.** Ela entregou o argumento central do produto de
graça, e revelou uma entidade inteira que eu não tinha modelado.

---

## 2. A frase que vale a fase inteira

> **"Fim do dia estou com dinheiro mas fim do mês não tenho mais devido comprar
> algo que está faltando."**

Ela disse isso sozinha, respondendo sobre o fim do dia. Não foi induzida, não foi
perguntada sobre lucro, e não sabe que essa frase é a tese do produto.

Três coisas estão dentro dela:

1. **Ela não enxerga lucro, enxerga caixa.** O dinheiro do dia parece ganho. Só no
   fim do mês, quando some, é que o custo aparece — e aparece como surpresa. É
   exatamente a dor descrita na visão de produto, confirmada com palavras dela.
2. **A compra de produto é reativa.** "Comprar algo **que está faltando**" — no
   presente, algo que já acabou. Ela descobre a falta depois de ela existir, e
   compra apagando incêndio, provavelmente pagando mais caro e fora de hora.
3. **Os dois problemas são o mesmo problema.** O custo do produto não está ligado
   ao atendimento que o consumiu. Enquanto não estiver, o lucro é invisível e a
   compra é sempre emergência.

**Consequência de prioridade.** O número de destaque do painel **não pode ser
faturamento** — faturamento é justamente a ilusão que ela já tem, e o app não pode
ser mais uma fonte dela. O RoHair não tem que informar o que ela ganhou; tem que
informar **o que sobrou**.

Isso reforça as Fases 7 e 10 como o par que sustenta o produto, e dá o critério de
sucesso mais concreto que temos até agora: _no fim do mês, ela não é mais
surpreendida._

---

## 3. O que foi revelado e não estava no modelo

### 3.1 A anamnese capilar — entidade nova ⚠️ achado principal

Ela descreveu **a mesma sequência duas vezes**, em blocos diferentes, sem que
nenhuma pergunta pedisse isso. Repetição espontânea é o sinal mais forte que uma
entrevista produz.

| O que ela pergunta a toda cliente               |
| ----------------------------------------------- |
| Já fez algum alisamento?                        |
| Qual produto utilizou?                          |
| Qual a última vez que alisou / quanto tempo faz |
| Está quebrando?                                 |
| Está caindo?                                    |

Mais o **teste de mecha**, que ela cita como a primeira coisa que faz: _"pra ver se
o cabelo suporta o produto"_.

Eu tinha modelado isso como `ClientNote` — texto livre, com um tipo `SAFETY`
hipotético. **Está errado.** Isso não é anotação: é um **formulário estruturado,
repetido, idêntico, que decide se o serviço pode acontecer.** Texto livre não
responde "quantas clientes chegaram com o cabelo caindo", não dispara alerta e não
se compara entre visitas.

Vira entidade própria: `HairAssessment`.

**Detalhe que muda a modelagem:** a anamnese é **por visita**, não por ficha. "Qual
a última vez que alisou" tem resposta diferente a cada retorno. Mas a ficha precisa
mostrar o estado atual. Então ela pertence ao `Attendance`, e a `Client` exibe a
mais recente — nunca uma cópia mutável, que dessincroniza.

### 3.2 O atendimento tem um portão que pode reprovar ⚠️

_"Teste de mecha pra ver se o cabelo suporta o produto."_

Um teste que existe para verificar é um teste que **pode falhar**. Quando falha, a
progressiva não acontece — mas a cliente veio, o horário foi ocupado e algum
trabalho foi feito.

Meu modelo de `Attendance` não tem esse estado. Ele vai de iniciado a finalizado,
supondo que o serviço planejado é o serviço executado. Falta:

```
Attendance → avaliação → reprovado no teste → encerrado sem o serviço
```

Não é caso raro de biblioteca: é o **caso 2 do roteiro** — "um que deu errado" —
que ela respondeu com "nunca deu". Ela não reconhece isso como dar errado, porque
para ela é procedimento normal de segurança. É o modelo que precisa reconhecer.

Duas perguntas em aberto que só ela responde: com que frequência reprova, e se
cobra alguma coisa quando reprova.

### 3.3 O portal já existe, na voz dela

_"Deixo as orientações dos produtos que deve utilizar e o tempo do retoque."_

O item **"Meu cuidado"** do Portal da Cliente estava marcado como escopo proposto, a
confirmar. Não é proposta: **ela já faz isso hoje**, falado, na porta, no fim do
atendimento — e falado se perde antes da cliente chegar em casa.

Isso deixa de ser hipótese e vira digitalização de um comportamento existente, que
é a categoria de funcionalidade com maior chance de ser usada. Resolve boa parte de
[D-06](../04-DECISOES.md#d-06--escopo-do-portal-da-cliente).

### 3.4 O retorno é calculável, não adivinhado

_"Progressiva damos uma pausa de três meses ou antes dependendo da curvatura pra
fazer de novo, e sempre fica nesse loop pois cabelo alisado é assim mesmo."_

- Intervalo base: **3 meses**
- Modulado pela **curvatura** — quanto mais cacheado, mais cedo
- E ela reconhece o ciclo como estrutural: _"sempre fica nesse loop"_

O insight "hora de voltar" e o "tempo do retoque" do portal deixam de ser
estimativa estatística e viram **regra de negócio explícita**, derivada de serviço +
curvatura. Isso é muito mais confiável, e é implementável na Fase 11 sem histórico
acumulado.

---

## 4. O que foi confirmado

| Hipótese                                                 | Veredito                                                                                                                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M-08** · precisa saber a química anterior?             | ✅ **Sim, e é portão de segurança.** A resposta mais forte da rodada                                                                                                                                           |
| **G-05** · incompatibilidade química importa?            | ✅ Confirmado — é a razão de existir da anamnese                                                                                                                                                               |
| **G-09** · ela faz corte?                                | ✅ Sim. _"As pontas sempre cortamos na maioria das vezes"_ — corte de pontas é rotina, não serviço à parte                                                                                                     |
| **M-09 / G-10** · preço e dificuldade variam por cabelo? | ✅ Varia, mas ⚠️ **por curvatura, não por comprimento.** Minha hipótese estava no eixo errado: o caso mais difícil que ela citou foi _"progressiva em cabelo cacheado"_, e a curvatura também define o retorno |
| Tempo de pausa é a janela de mãos livres                 | ⚠️ Plausível, não confirmado — ela não respondeu o bloco 3                                                                                                                                                     |

---

## 5. O que foi corrigido

**Vocabulário — ela diz "nutrição", não "hidratação".** Toda a documentação lista o
escopo como "escova, hidratação, progressiva". As palavras dela são **progressiva,
nutrição, escova**. Corrigido no glossário. Se ela faz hidratação com esse nome,
não muda nada: os três estão na semente do catálogo, e ela marca o que faz.

**Produtos nomeados:** _Let Me Be_ para progressiva, _Wella_ para nutrição. Primeiros
dados reais de catálogo.

**Nutrição parece ser etapa da escova, não serviço isolado.** _"Wella para nutrição
pra escovar"_ — o "pra" liga as duas: a nutrição existe para viabilizar a escova.
Sinaliza que **M-01 tende a "vários itens por atendimento"**, mas a frase é curta
demais para decidir — e não precisa ser decidida: serviço composto suporta as duas montagens.

**Ela provavelmente não atende em casa.** _"Vou pra minha residência"_ no fim do
dia. A persona na visão de produto diz "atende em casa ou em espaço alugado" —
o "vou pra" sugere que o trabalho é em outro lugar. ⚠️ Não vou reescrever a persona
com base em uma preposição. Fica como observação, não como pendência.

**Ela fala no plural — "damos", "cortamos".** Pode ser modo de falar, pode ser que
alguém trabalhe com ela. A pergunta 4 do roteiro, que resolveria isso, ficou sem
resposta. Importa porque decide se `Membership` e o papel `ASSISTANT` viram tela
agora ou só na Fase 16.

---

## 6. O que continua desconhecido

Esta é a parte que trava a fase. **Não veio um único número.**

| Faltando                                      | Bloqueia                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Preço de qualquer serviço                     | Fases 7 e 10; toda a modelagem de `Money` na prática                                                                                                                                                         |
| Duração real de qualquer serviço              | Fase 8 — a agenda não tem como sugerir duração                                                                                                                                                               |
| Quantas clientes por semana                   | Se a agenda é lista ou calendário; se a lista precisa virtualizar                                                                                                                                            |
| Dias e horários de trabalho                   | Fase 8 — horário de funcionamento, bloqueios, folgas                                                                                                                                                         |
| Como recebe (Pix, dinheiro, cartão)           | Fase 10 — checkout                                                                                                                                                                                           |
| Custo dos produtos e quanto rende cada frasco | Fase 7 — **é o que fecha a frase da seção 2**                                                                                                                                                                |
| Onde a agenda vive hoje                       | Fase 8 e migração inicial de dados                                                                                                                                                                           |
| Se tem CPF e nascimento das clientes          | [D-07](../04-DECISOES.md#d-07--como-as-duas-pontas-se-encontram-quando-a-ficha-não-tem-cpf) e [D-08](../04-DECISOES.md#d-08--rota-de-escape-quando-a-ativação-da-cliente-falha) — os dois achados da Fase 1A |
| Se a cliente pode agendar sozinha             | [D-05](../04-DECISOES.md#d-05--poder-de-agendamento-da-cliente-no-portal)                                                                                                                                    |
| **Cinco atendimentos reais**                  | **DoD da Fase 1** — nenhum dos cinco veio utilizável                                                                                                                                                         |

Sobre o último: o caso 2 virou "nunca deu errado", o caso 3 virou "bastante
clientes novas" e o caso 4 foi respondido sobre o crescimento do negócio, não sobre
uma visita. São respostas ao título, não à pergunta. Sem cinco histórias concretas,
o modelo de domínio não tem contra o que ser validado, e o DoD não fecha.

---

## 7. O que muda agora

**Aplicado nesta entrega:**

- `HairAssessment` entra no [modelo de domínio](../08-MODELO-DE-DOMINIO.md) como
  entidade de primeira classe, com o portão de segurança e a reprovação no teste
- Glossário corrigido: nutrição, corte de pontas, teste de mecha, retoque, curvatura
  como eixo de variação, Let Me Be e Wella
- M-08 resolvida; M-09 resolvida no eixo errado e reescrita
- "Meu cuidado" deixa de ser proposta e vira escopo confirmado do portal

**Não aplicado, e não vou forçar:** personas, mapa do dia, wireframes e escopo das
Fases 6 a 14 continuam bloqueados. Escrevê-los agora seria inventar — que é
exatamente o que esta fase existe para impedir.

---

## 8. Epílogo — não houve rodada 2

Eu tinha escrito uma segunda rodada, pedindo preço, duração, custo de produto,
horário de trabalho e forma de pagamento. **O dono cortou, com razão.**

Nada disso é descoberta: é **campo de cadastro**. E o método não escalava — se cada
profissional precisasse de uma entrevista, o RoHair seria consultoria, não produto.

A seção 6 deste documento lista o que "faltava". Releia com outros olhos: quase
tudo ali é uma tela. Preço e duração são o passo 3 do onboarding; produtos e custo
são a tela de estoque; horário é a configuração da agenda.

O que a conversa entregou de verdade — `HairAssessment`, o portão do teste de mecha,
o vocabulário, a frase sobre o dinheiro que some no fim do mês — é conhecimento de
**domínio**, que serve a todas as profissionais. Era só isso que ela precisava
entregar.

Ver [DEC-013](../04-DECISOES.md#dec-013) e
[09-CONFIGURACAO.md](../09-CONFIGURACAO.md).
