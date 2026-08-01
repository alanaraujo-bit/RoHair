# Personas e Jobs to be Done

> **Entregável 1.7 da Fase 1.**
>
> Escritas do **domínio**, não de uma pessoa. A Rosiele é a primeira instância da
> persona, não a definição dela — se o produto só servir para ela, a Fase 16 não
> existe ([DEC-013](04-DECISOES.md#dec-013)).
>
> O que veio dela e serve a todas está marcado 🗣️.

---

## Persona primária · a profissional autônoma

Trabalha sozinha ou com uma ajudante ocasional. Atende em espaço próprio, alugado
ou na casa da cliente. iPhone na mão, mãos molhadas, cliente na cadeira.

Não se vê como empresária. Vê-se como alguém que **é boa no que faz** — e é a parte
administrativa que a atrapalha de fazer mais disso.

🗣️ *"Não me irrito, amo trabalhar com cabelo, tenho orgulho."* Ela não procura um
app para reclamar do trabalho. Procura para o trabalho render mais.

### O que ela não é

- **Não é leiga em tecnologia.** Usa WhatsApp o dia inteiro, faz Pix, posta story.
  O que ela rejeita não é tecnologia — é formulário
- **Não quer relatório.** Quer resposta
- **Não vai migrar dados.** Se o app exigir cadastrar 200 clientes antes de servir
  para alguma coisa, ele morre na primeira semana

### A cena que define o produto

Meio do atendimento. Uma mão na cabeça da cliente, luva com produto, celular no
balcão a um braço de distância. Conversando sobre a vida — 🗣️ *"tento ao máximo
deixar um ambiente leve"*.

**Qualquer interação que exija duas mãos, atenção contínua ou mais de 15 segundos
não vai acontecer.** É o filtro de toda tela do painel.

🗣️ A janela real de uso é o **tempo de pausa**: o produto agindo, mãos livres,
alguns minutos. É quando o app é usado de verdade.

### Jobs to be Done, por momento

| Momento | O que ela contrata o RoHair para fazer | Fase |
| ------- | -------------------------------------- | ---- |
| **Ao acordar** | "Me diga o que eu tenho hoje, num olhar" | 8, 11 |
| **Antes de a cliente chegar** | "Me lembre quem é essa pessoa e o que ela fez da última vez" | 6 |
| **No início** 🗣️ | "Não me deixe aplicar química em cabelo que não aguenta" | 9 |
| **Durante** | "Registre o que eu fiz sem me atrapalhar" | 9 |
| **No fim** 🗣️ | "Diga a ela quando voltar e o que usar em casa, por mim" | 9, 12 |
| **Fim do dia** | "Me diga o que sobrou, não o que entrou" | 10 |
| **Fim do mês** 🗣️ | "Não me deixe ser surpreendida de novo" | 10, 11 |
| **Sempre** | "Não me deixe perder cliente nem faltar produto" | 7, 11 |

### A dor central, na voz dela

> 🗣️ **"Fim do dia estou com dinheiro mas fim do mês não tenho mais devido comprar
> algo que está faltando."**

Duas falhas encadeadas: ela enxerga **caixa**, não lucro; e compra produto **depois**
da falta. O custo do produto não está ligado ao atendimento que o consumiu.

**Critério de sucesso do produto inteiro:** no fim do mês, ela não é mais
surpreendida.

**Consequência de design:** o número de destaque do painel nunca é faturamento.
Faturamento é a ilusão que ela já tem — o app não pode ser mais uma fonte dela.

---

## Persona secundária · a cliente

Usuária direta, com aplicativo próprio. Não é espectadora.

Não quer um app de salão. Quer duas coisas específicas, e o resto é ruído.

### Jobs to be Done

| # | O que ela contrata o RoHair para fazer | Por quê |
| - | -------------------------------------- | ------- |
| 1 | **"Me mostre a minha evolução"** | O antes e depois no tempo. É o coração emocional, e o motivo de ela não trocar de profissional |
| 2 | **"Quando é meu horário?"** | Sem caçar conversa antiga no WhatsApp |
| 3 | 🗣️ **"O que eu tenho que usar em casa?"** | A profissional já dá essa orientação falada, na porta. Falada, se perde |
| 4 | 🗣️ **"Quando eu devo voltar?"** | O retorno é calculável — 3 meses para progressiva, antes se for cacheado |
| 5 | **"Quero marcar"** | Sem depender de ela estar com o celular na mão |

Os jobs 3 e 4 **não foram inventados**: a Rosiele já faz os dois, falando, no fim do
atendimento. O portal não cria comportamento novo — impede que o existente evapore
no caminho até em casa.

### O que ela não quer

Feed, curtida, pontuação, gamificação. E, provavelmente, **não quer ver o quanto
gastou** — por isso o histórico de valores nasce desligado na
[configuração](09-CONFIGURACAO.md#34-políticas-do-portal).

---

## O que as duas personas têm em comum

Nenhuma das duas vai ler manual, assistir tutorial ou pedir ajuda. As duas abrem o
app com uma pergunta na cabeça e desistem se a resposta não estiver na primeira
tela.

Por isso a **regra dos 3 toques** é critério de aceite, não aspiração — e por isso
todo estado vazio propõe uma ação.
