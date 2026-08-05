# Visão de Produto

## Posicionamento

**RoHair não é uma agenda com relatórios. É o sistema operacional do negócio de
uma profissional autônoma da beleza.**

Agendas existem aos montes e competem por preço. O que não existe bem feito é o
**fluxo de trabalho do dia**: a profissional está com as mãos ocupadas, o celular
no balcão, a cliente na cadeira. Ela precisa registrar em dois toques o que
acabou de acontecer — e não preencher formulário.

Por isso o produto é desenhado a partir do **atendimento em execução**, e não a
partir do CRUD. Toda decisão de UX é validada contra essa cena.

## Princípios (usados como critério de aceite)

### 1. Regra dos 3 toques

Qualquer ação do dia a dia — iniciar atendimento, dar baixa em produto, receber
pagamento, agendar retorno — acontece em no máximo 3 toques a partir da tela
inicial. Se precisou de mais, o desenho está errado.

### 2. O app trabalha, a usuária confirma

O sistema propõe: preço sugerido, duração estimada pelo histórico daquela
cliente, produtos que ela costuma usar, data de retorno ideal. A usuária confirma
ou ajusta. Ela nunca digita do zero aquilo que já é inferível.

### 3. Nada de tela morta

Todo estado vazio propõe uma ação. Todo carregamento é skeleton com a forma real
do conteúdo. Toda ação responde em menos de 100ms, mesmo com rede ruim — se
preciso, de forma otimista.

### 4. Honestidade de estado

O app nunca finge que salvou. Nunca mostra número que não bate. Nunca esconde
erro. Confiança é o único ativo que não se recupera.

### 5. Elegância é função, não enfeite

Animação existe para explicar de onde a coisa veio e para onde foi. Cor existe
para hierarquizar. Nenhum efeito entra por ser bonito — entra por comunicar.

---

## Usuárias

### Persona primária — a profissional

Autônoma, atende em casa ou em espaço alugado. Trabalha com escova, hidratação e
progressiva. Usa iPhone. Faz tudo sozinha: agenda pelo WhatsApp, anota preço em
caderno ou bloco de notas, não sabe direito quanto lucra por atendimento porque
não conta o custo do produto.

**Dores reais:**

- Não sabe o lucro real, só o faturamento
- Perde cliente por não lembrar de chamar de volta
- Descobre que o produto acabou no meio do atendimento
- Não sabe quanto tempo realmente leva cada serviço
- Esquece preferência e histórico de cliente que não vê há meses

**O que ela contrata o RoHair para fazer:**

1. "Me diga o que eu tenho hoje" — clareza sobre o dia, em um olhar
2. "Registre o que eu fiz sem me atrapalhar" — atendimento com mãos ocupadas
3. "Me diga se estou ganhando dinheiro" — lucro real, não faturamento
4. "Não me deixe perder cliente" — quem sumiu, quem faz aniversário, quem volta
5. "Não me deixe faltar produto" — estoque que avisa antes de acabar

### Persona secundária — a cliente

**Usuária direta do produto**, com aplicativo próprio (Fase 12). Não é
espectadora: tem conta, entra e usa.

Acessa pela primeira vez com **CPF e data de nascimento**, cria usuário e senha, e
a partir daí entra direto. Se a Roziele já a tinha cadastrado, todo o histórico
aparece de uma vez. Se ainda não, ela mesma se cadastra — e, quando a Roziele for
lançar o atendimento, a ficha já está lá.

**O que ela contrata o RoHair para fazer:**

1. "Me mostre a minha evolução" — o antes e depois de cada visita, no tempo. É o
   coração emocional do portal
2. "Quando é meu horário?" — sem procurar conversa antiga no WhatsApp
3. "O que ela usou no meu cabelo?" — histórico do próprio cuidado
4. "Quero marcar" — sem depender de a Roziele estar com o celular na mão
5. "Quando eu devo voltar?" — o retorno ideal, sem parecer cobrança

**Por que isso importa comercialmente:** quase nenhum concorrente dá aplicativo à
cliente final. Uma cliente que abre o app para rever o próprio antes e depois é
uma cliente que não troca de profissional.

---

## Escopo de serviços

**Agora:** escova, hidratação, progressiva.

**Arquitetura desde o dia 1:** serviço é uma entidade genérica com variantes,
duração, preço e consumo de produto configuráveis. Nenhum procedimento está
codificado no sistema. Adicionar coloração, mechas, botox capilar ou qualquer
outro serviço é cadastro, nunca desenvolvimento.

---

## Identidade

**RoHair = Roziele + Hair.** O nome carrega o nome da profissional — e por isso a
marca não pode ser genérica. O monograma **"Ro"** é o núcleo da identidade: ícone
do app, splash, marca d'água opcional nas fotos, elemento de carregamento. O tom
de voz é pessoal, na primeira pessoa da Roziele, nunca institucional.

Elegante · feminina · sofisticada · premium · minimalista · orgânica · leve.

Referências de qualidade de execução: Apple, Linear, Notion, Stripe, Vercel.
Referência de sensação: um app que parece caro de usar, e que a profissional tem
orgulho de abrir na frente da cliente.

**Design system:** "Áurea" — dois temas com identidade própria (Porcelana e
Veludo), paleta em rosa e rose gold construída em OKLCH. Detalhes em
[02-ARQUITETURA.md](02-ARQUITETURA.md) e na Fase 2 do roadmap.

---

## Anti-objetivos

O que o RoHair **não** vai ser, e por quê:

- **Não é rede social de beleza.** Feed e curtida diluem o foco no trabalho.
- **Não é ERP.** Nada de nota fiscal, folha, contabilidade completa. Clareza de
  caixa, não conformidade fiscal.
- **Não é genérico para "prestadores de serviço".** Vocabulário, ícones e regras
  são do universo da beleza. Especificidade é a vantagem competitiva.
- **Não é primeiro-desktop.** Desktop e tablet funcionam perfeitamente, mas cada
  decisão de UX nasce no iPhone, com uma mão só.
