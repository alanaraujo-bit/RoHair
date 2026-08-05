# Wireframes — baixa fidelidade

> **Entregável 1.8 da Fase 1.**
>
> Feio de propósito. Wireframe de baixa fidelidade existe para discutir
> **hierarquia e fluxo**; se ficar bonito cedo demais, a conversa vira sobre cor
> antes de a estrutura estar certa. A alta fidelidade é a Fase 2.
>
> Todos desenhados na largura do iPhone, uma mão. Desktop é adaptação, nunca origem.
>
> **Legenda:** `[ ]` botão · `( )` opção · `▸` navega · `···` menu · 🗣️ vem da
> conversa com a Roziele

---

## Índice

**Onboarding:** [1](#1--onboarding)
**Painel:** [2 Hoje](#2--hoje) · [3 Agenda](#3--agenda) · [4 Novo horário](#4--novo-horário) ·
[5 Clientes](#5--clientes) · [6 Ficha](#6--ficha-da-cliente) · [7 Fusão](#7--bandeja-e-fusão-de-fichas) ·
[8 Anamnese](#8--atendimento--abertura-e-anamnese) · [9 Em andamento](#9--atendimento--em-andamento) ·
[10 Checkout](#10--atendimento--checkout) · [11 Estoque](#11--estoque) · [12 Dinheiro](#12--dinheiro)
**Portal:** [13 Entrada](#13--portal--primeiro-acesso) · [14 Início](#14--portal--início) ·
[15 Evolução](#15--portal--meus-antes-e-depois) · [16 Meu cuidado](#16--portal--meu-cuidado)

---

## 1 · Onboarding

Cinco passos. Os dois do meio são puláveis. Nenhuma tela começa vazia.

```
PASSO 2 de 5                    PASSO 3 de 5
┌──────────────────────────────┐┌──────────────────────────────┐
│ ● ● ○ ○ ○                    ││ ● ● ● ○ ○           [Pular]  │
│                              ││                              │
│ O que você faz?              ││ Quanto e quanto tempo?       │
│ Marque o que você oferece.   ││ Pode chutar. O RoHair ajusta │
│                              ││ sozinho depois de algumas    │
│ ALISAMENTO                   ││ vezes.                       │
│ [✓] Progressiva              ││                              │
│ [ ] Retoque de raiz          ││ Progressiva                  │
│ [ ] Selagem                  ││   R$ [ 200 ]   [ 2h30 ]      │
│ [ ] Botox capilar            ││                              │
│                              ││ Nutrição                     │
│ TRATAMENTO                   ││   R$ [  50 ]   [ 0h40 ]      │
│ [✓] Nutrição                 ││                              │
│ [ ] Hidratação               ││ Escova                       │
│ [ ] Reconstrução             ││   R$ [  40 ]   [ 0h40 ]      │
│                              ││                              │
│ MODELAGEM                    ││ Corte de pontas              │
│ [✓] Escova                   ││   R$ [   0 ]   [ 0h15 ]      │
│ [ ] Escova com babyliss      ││   ⓘ R$ 0 = não cobro à parte │
│                              ││                              │
│ CORTE                        ││                              │
│ [✓] Corte de pontas          ││                              │
│ [ ] Corte                    ││                              │
│                              ││                              │
│ + Não achei o que eu faço    ││                              │
│                              ││                              │
│ [ Continuar ]                ││ [ Continuar ]                │
└──────────────────────────────┘└──────────────────────────────┘
```

🗣️ A ordem não é alfabética: progressiva, nutrição, escova e corte de pontas
primeiro. Quatro toques e o catálogo dela está pronto.

**Estoque não está no onboarding.** Cadastrar produto antes de ter cliente é a
forma mais rápida de abandonar um app. Entra quando ela registrar o primeiro
consumo.

**Meta:** conta criada → primeiro agendamento em menos de 3 minutos.

---

## 2 · Hoje

A tela inicial. Responde _"o que eu tenho hoje?"_ sem rolar.

```
┌──────────────────────────────┐
│ Ro          quinta, 6 nov  ···│
│                              │
│ ┌──────────────────────────┐ │
│ │ SOBROU HOJE              │ │
│ │ R$ 186,40                │ │
│ │ de R$ 260 · produto 73,60│ │
│ └──────────────────────────┘ │
│                              │
│ AGORA                        │
│ ┌──────────────────────────┐ │
│ │ ⏱ Carla · progressiva    │ │
│ │ 1h12 · pausa até 14:05   │ │
│ │              [ Abrir ]   │ │
│ └──────────────────────────┘ │
│                              │
│ DEPOIS                       │
│ 16:00  Juliana               │
│        escova · 40min      ▸ │
│ 18:30  Denise      NOVA      │
│        progressiva · 2h30  ▸ │
│                              │
│ ATENÇÃO                      │
│ ⚠ Let Me Be: 1 frasco       │
│   ~3 progressivas          ▸ │
│ ↩ Márcia sumiu há 4 meses  ▸ │
│                              │
│ ─────────────────────────────│
│  Hoje  Agenda  Clientes  R$  │
└──────────────────────────────┘
```

**A decisão mais importante desta tela: o número grande é "sobrou", não "entrou".**
Faturamento é a ilusão que ela já tem. O R$ 260 aparece pequeno, ao lado, porque
esconder o faturamento seria desonesto — mas ele não é a manchete.

O card **AGORA** só existe quando há atendimento aberto, e leva de volta em 1 toque
— o widget persistente exigido pela Fase 9.

**ATENÇÃO** é o motor de insights atacando a frase do fim do mês: produto acabando
antes de acabar, cliente sumindo antes de sumir. Todo card leva a uma ação.

---

## 3 · Agenda

```
DIA                             SEMANA
┌──────────────────────────────┐┌──────────────────────────────┐
│ ‹  quinta, 6 nov  ›   [Dia ▾]││ ‹  3–9 nov  ›       [Sem. ▾] │
│                              ││                              │
│ 09 ┌────────────────────────┐││    S  T  Q  Q  S  S          │
│    │ Carla                  │││    3  4  5  6  7  8          │
│ 10 │ progressiva            │││ 09 ▓  ░  ▓  ▓▓ ▓  ▓          │
│    │ ⏱ em andamento         │││ 10 ▓  ░  ▓  ▓▓ ▓  ▓▓         │
│ 11 └────────────────────────┘││ 11 ▓  ░  ░  ▓▓ ▓▓ ▓▓         │
│                              ││ 12 ░  ░  ░  ░  ░  ▓▓         │
│ 12    almoço                 ││ 13 ·  ·  ·  ·  ·  ·          │
│                              ││ 14 ▓  ▓  ▓  ·  ▓  ▓▓         │
│ 13    vaga                   ││ 15 ▓  ▓  ▓  ·  ▓  ▓▓         │
│                              ││ 16 ░  ▓  ▓  ▓  ▓  ▓          │
│ 14    vaga                   ││ 17 ·  ▓  ·  ▓  ·  ▓          │
│                              ││ 18 ·  ·  ·  ▓▓ ·  ·          │
│ 15    vaga                   ││                              │
│                              ││ ▓ ocupado  ░ vaga  · fechado │
│ 16 ┌────────────────────────┐││                              │
│    │ Juliana · escova       │││ 6 nov · 3 horários · 1 vaga  │
│ 17 └────────────────────────┘││                     [ Ver ]  │
│                              ││                              │
│ 18 ┌────────────────────────┐││                              │
│    │ Denise · progressiva   │││                              │
│ 19 │ NOVA                   │││                              │
│    └────────────────────────┘││                              │
│                          [ + ]││                              │
└──────────────────────────────┘└──────────────────────────────┘
```

🗣️ **"Vaga", não "livre" nem "disponível".** Ela escreveu _"verifico se tenho vaga
naquele dia e horário"_ — é a palavra de quem olha a agenda pelo espaço vazio, não
pelo compromisso marcado.

Arrastar o bloco reagenda. Swipe confirma ou cancela.

---

## 4 · Novo horário

```
┌──────────────────────────────┐
│ ✕            Novo horário    │
│                              │
│ QUEM                         │
│ ┌──────────────────────────┐ │
│ │ 🔍 nome, telefone ou CPF │ │
│ └──────────────────────────┘ │
│ Recentes                     │
│ ( ) Carla Menezes            │
│ ( ) Juliana Alves            │
│ + Cliente nova               │
│                              │
│ O QUE                        │
│ [✓] Progressiva              │
│ [ ] Nutrição                 │
│ [ ] Escova                   │
│                              │
│ ⓘ Carla: cacheado            │
│   as dela levam 3h10         │
│   (não 2h30 do catálogo)     │
│                              │
│ QUANDO                       │
│ qui 6 nov  ▾                 │
│ ┌────┐┌────┐┌────┐┌────┐    │
│ │13:00││14:00││15:00││ +  │  │
│ └────┘└────┘└────┘└────┘    │
│ ⓘ 18:30 não cabe: 3h10 passa │
│   do fim do expediente       │
│                              │
│ [ Agendar ]                  │
└──────────────────────────────┘
```

**"O app trabalha, a usuária confirma"** literal: a duração vem do histórico
**daquela cliente**, não do catálogo — e o sistema explica por quê. Os horários
oferecidos já são os que cabem.

Da tela Hoje ao agendado: **3 toques** (`+` → cliente → horário).

---

## 5 · Clientes

```
┌──────────────────────────────┐
│ Clientes            [ + ]    │
│ ┌──────────────────────────┐ │
│ │ 🔍 nome, telefone ou CPF │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ 2 cadastros novos do app │ │
│ │ vindos do portal      ▸  │ │
│ └──────────────────────────┘ │
│                              │
│ PRECISAM VOLTAR              │
│ ● Márcia Lima          📱   ▸│
│   progressiva · há 4 meses   │
│ ● Paula Souza               ▸│
│   progressiva · há 3 meses   │
│                              │
│ TODAS · 47                   │
│ ○ Ana Beatriz          📱   ▸│
│   escova · há 2 semanas      │
│ ○ Carla Menezes        📱   ▸│
│   progressiva · hoje         │
│ ○ Denise Rocha    NOVA      ▸│
│   nunca veio                 │
│                              │
│ ─────────────────────────────│
│  Hoje  Agenda  Clientes  R$  │
└──────────────────────────────┘
```

**Ordenada por quem precisa de ação**, nunca alfabética. Lista alfabética é banco de
dados; esta é uma lista de trabalho.

📱 = tem conta no app. `●` = retorno vencido, calculado por serviço + curvatura.

---

## 6 · Ficha da cliente

```
┌──────────────────────────────┐
│ ‹            Carla Menezes ···│
│                              │
│ ┌──────────────────────────┐ │
│ │ ⚠ QUÍMICA                │ │
│ │ Progressiva Let Me Be    │ │
│ │ 12 ago · 3 meses         │ │
│ └──────────────────────────┘ │
│                              │
│ 📱 tem conta  ·  cacheado    │
│ 8 visitas · R$ 1.640         │
│ média 3h10 · volta a cada 3m │
│                              │
│ [Agendar][Ligar][WhatsApp]   │
│ [    Iniciar atendimento   ] │
│                              │
│ ANTES E DEPOIS               │
│ ┌────┐┌────┐┌────┐┌────┐    │
│ │ago ││mai ││fev ││nov │  ▸ │
│ └────┘└────┘└────┘└────┘    │
│                              │
│ VISITAS                      │
│ 12 ago · progressiva         │
│   3h05 · R$ 220 · Pix      ▸ │
│ 14 mai · progressiva+pontas  │
│   3h20 · R$ 220 · Pix      ▸ │
│                              │
│ NOTAS                        │
│ "não gosta de cheiro forte"  │
│ 14 mai · Roziele             │
│                              │
│ ⚙ Preferências · LGPD      ▸ │
└──────────────────────────────┘
```

**O alerta de química é a primeira coisa da tela** — acima do nome de qualquer
métrica. 🗣️ É o dado que ela busca antes de aplicar qualquer coisa, e enterrá-lo no
histórico seria um erro de segurança, não de UX.

"Iniciar atendimento" em **1 toque** a partir daqui.

---

## 7 · Bandeja e fusão de fichas

A tela que faz as duas pontas se encontrarem (D-07).

```
BANDEJA                         FUSÃO
┌──────────────────────────────┐┌──────────────────────────────┐
│ ‹     Cadastros novos        ││ ✕      Mesma pessoa?         │
│                              ││                              │
│ Vieram do app. Confira antes ││ ┌──────────────────────────┐ │
│ de misturar com as suas.     ││ │ SUA FICHA                │ │
│                              ││ │ Juliana Alves            │ │
│ ┌──────────────────────────┐ ││ │ (11) 98••••-4321         │ │
│ │ Juliana Alves       NOVA │ ││ │ 12 visitas desde 2024    │ │
│ │ (11) 98765-4321          │ ││ │ sem CPF                  │ │
│ │                          │ ││ └──────────────────────────┘ │
│ │ ⚠ Parece a Juliana Alves │ ││            ⇅                 │
│ │   que você já atende     │ ││ ┌──────────────────────────┐ │
│ │   (mesmo telefone)       │ ││ │ VEIO DO APP              │ │
│ │                          │ ││ │ Juliana Alves            │ │
│ │ [É a mesma][É outra]     │ ││ │ (11) 98••••-4321         │ │
│ └──────────────────────────┘ ││ │ CPF 123.•••.•••-01       │ │
│                              ││ │ 1 visita · conta ativa   │ │
│ ┌──────────────────────────┐ ││ └──────────────────────────┘ │
│ │ Denise Rocha        NOVA │ ││                              │
│ │ nenhuma parecida         │ ││ Vira uma ficha só:           │
│ │            [ Confirmar ] │ ││ 13 visitas · CPF · conta     │
│ └──────────────────────────┘ ││ Nada se perde.               │
│                              ││                              │
│                              ││ [ Sim, é a mesma pessoa ]    │
│                              ││ [ Não, são duas pessoas ]    │
└──────────────────────────────┘└──────────────────────────────┘
```

**A máquina sugere, a pessoa decide.** Casar por telefone automaticamente exporia o
histórico de alguém para outra pessoa quando o número tiver sido reaproveitado —
risco inaceitável num produto que guarda foto de cliente. A Roziele conhece as
clientes pelo nome; é o melhor desambiguador que existe, e é grátis.

Telefone e CPF aparecem **mascarados** mesmo para ela: o suficiente para reconhecer,
sem expor o dado inteiro numa tela de comparação.

---

## 8 · Atendimento — abertura e anamnese

```
CLIENTE CONHECIDA               TESTE REPROVOU
┌──────────────────────────────┐┌──────────────────────────────┐
│ ✕     Carla · progressiva    ││ ✕     Denise · progressiva   │
│                              ││                              │
│ ANTES DE COMEÇAR             ││ ┌──────────────────────────┐ │
│ Confira o que mudou.         ││ │ ⛔ O cabelo não aguentou  │ │
│                              ││ │                          │ │
│ Já fez alisamento?           ││ │ Guanidina há 2 meses +   │ │
│ (•) Sim  ( ) Não             ││ │ progressiva pode partir  │ │
│                              ││ │ o fio.                   │ │
│ Qual produto?                ││ └──────────────────────────┘ │
│ [ Let Me Be            ▾ ]   ││                              │
│ ⓘ do seu registro de 12 ago  ││ O que fazer agora:           │
│                              ││                              │
│ Última vez que alisou?       ││ [ Encerrar sem o serviço ]   │
│ [ 12/08/2026 ]               ││ [ Marcar reavaliação ]       │
│ ⓘ aqui mesmo, há 3 meses     ││ [ Fazer outro serviço ]      │
│                              ││                              │
│ Está quebrando?              ││ ⓘ O produto do teste entra   │
│ ( ) Sim  (•) Um pouco ( )Não ││   como gasto. Nada será      │
│                              ││   cobrado da Denise.         │
│ Está caindo?                 ││                              │
│ ( ) Sim  (•) Não             ││                              │
│                              ││                              │
│ TESTE DE MECHA               ││                              │
│ [ Passou ] [ Não passou ]    ││                              │
└──────────────────────────────┘└──────────────────────────────┘
```

🗣️ As cinco perguntas são exatamente as dela, na ordem dela. **Pré-preenchidas pelo
histórico** — para uma cliente conhecida ela confere em vez de digitar; para uma
nova, vem vazio.

A tela da direita é o `ENCERRADO_SEM_SERVICO`. **Tratada como trabalho bem feito, não
como falha** — é o momento em que ela mais protege a cliente. E é honesta sobre o
produto gasto no teste, que vira custo real (GAP-01).

---

## 9 · Atendimento — em andamento

A tela mais importante do produto. Mãos ocupadas, alvos grandes.

```
┌──────────────────────────────┐
│ ‹  Carla · progressiva    ⏸  │
│                              │
│         1:12:40              │
│      ▁▁▁▁▁▁▁▁▁▁▁▁▁▁          │
│   em pausa · produto agindo  │
│   volta em 14:05  ⏰         │
│                              │
│ ┌──────────────────────────┐ │
│ │      📷  ANTES / DEPOIS   │ │
│ └──────────────────────────┘ │
│                              │
│ PRODUTOS                     │
│ ✓ Let Me Be · 1 aplicação    │
│ ✓ Wella · 1 aplicação        │
│ + Usei outra coisa           │
│ ⓘ marcados pelo que você     │
│   costuma usar na Carla      │
│                              │
│ SERVIÇOS                     │
│ ✓ Progressiva      R$ 220    │
│ + Acrescentar                │
│                              │
│ 🎤 Observação rápida         │
│                              │
│ [       Finalizar          ] │
└──────────────────────────────┘
```

🗣️ O cronômetro sabe do **tempo de pausa** e mostra a hora de voltar — é a janela
real de mãos livres, e é quando esta tela é usada.

Produtos vêm **pré-marcados pelo histórico daquela cliente**. Ela desmarca o que não
usou. Confirmar é mais rápido que escolher, e é o que dá baixa de estoque correta
sem exigir disciplina.

Fechar o app aqui não perde nada: o cronômetro é lista de intervalos no banco.

---

## 10 · Atendimento — checkout

```
┌──────────────────────────────┐
│ ‹     Finalizar · Carla      │
│                              │
│ 3h05 · progressiva + pontas  │
│                              │
│ Progressiva          220,00  │
│ Corte de pontas        0,00  │
│ ─────────────────────────────│
│ Total                220,00  │
│ [ Desconto ]                 │
│                              │
│ COMO PAGOU                   │
│ ( ) Pix  ( ) Dinheiro        │
│ ( ) Cartão                   │
│ ( ) Depois   ( ) Cortesia    │
│                              │
│ ┌──────────────────────────┐ │
│ │ Você lucrou R$ 146,40    │ │
│ │ produto usado: R$ 73,60  │ │
│ └──────────────────────────┘ │
│                              │
│ PRÓXIMA VEZ                  │
│ Retorno sugerido: 6 fev      │
│ 3 meses · cacheado           │
│ [ Marcar agora ]  [ Depois ] │
│                              │
│ CUIDADO EM CASA              │
│ [ Shampoo sem sal        ▾]  │
│ [ + orientação             ] │
│ ⓘ Carla vê isso no app dela  │
│                              │
│ [        Concluir          ] │
└──────────────────────────────┘
```

**O lucro aparece na hora, não no fim do mês.** É o antídoto direto para a frase
dela: se o custo do produto aparece a cada atendimento, o fim do mês deixa de ser
surpresa.

🗣️ "Cuidado em casa" e "retorno" são o que ela já faz falando na porta. Aqui o que
ela diz **chega em casa com a cliente**, no portal.

Do "iniciar" ao "finalizar": **3 toques**.

---

## 11 · Estoque

```
┌──────────────────────────────┐
│ ‹            Produtos    [+] │
│                              │
│ ┌──────────────────────────┐ │
│ │ ⚠ Let Me Be              │ │
│ │ 1 frasco ~3 progressivas │ │
│ │ acaba em ~10 dias        │ │
│ │           [ Comprei ]    │ │
│ └──────────────────────────┘ │
│                              │
│ Wella nutrição               │
│   3 frascos · ~24 escovas    │
│ Shampoo antirresíduo         │
│   2 frascos                  │
│                              │
│ ─────────────────────────────│
│ NO MÊS                       │
│ Gasto em produto   R$ 412    │
│ Custo por atendim.  R$ 34    │
│ Serviço mais rentável:       │
│   escova · 76% de margem     │
└──────────────────────────────┘
```

**"Acaba em ~10 dias", não "estoque baixo".** O alerta é sobre tempo, porque o
problema dela não é a quantidade — é ser surpreendida. Aviso com prazo permite
comprar planejado em vez de correndo.

🗣️ Unidade em **frasco**, com o rendimento traduzido em atendimentos. Ninguém pensa
em mililitro no meio do dia.

---

## 12 · Dinheiro

```
┌──────────────────────────────┐
│ Dinheiro          [Mês ▾]    │
│                              │
│      SOBROU EM NOVEMBRO      │
│         R$ 2.847             │
│                              │
│ Entrou            R$ 3.740   │
│ Produto           − R$ 412   │
│ Outras despesas   − R$ 481   │
│                              │
│ ┌──────────────────────────┐ │
│ │ ⓘ Em outubro sobrou      │ │
│ │   R$ 2.190. Você está    │ │
│ │   R$ 657 melhor.         │ │
│ └──────────────────────────┘ │
│                              │
│ ▁▂▃▅▆▅▇▆▇█▇▆                │
│ sobrou, semana a semana      │
│                              │
│ 18 atendimentos · R$ 208 méd │
│                              │
│ [ Lançar despesa ]           │
│ [ Fechar o dia ]             │
│                              │
│ ─────────────────────────────│
│  Hoje  Agenda  Clientes  R$  │
└──────────────────────────────┘
```

Mesma hierarquia da tela Hoje: **sobrou grande, entrou pequeno.** Todo valor é
tocável e leva à transação de origem — DoD da Fase 10.

---

## 13 · Portal — primeiro acesso

```
┌──────────────────────────────┐
│                              │
│            Ro                │
│                              │
│   O seu cabelo, com a        │
│   Roziele.                   │
│                              │
│ CPF                          │
│ [ ___.___.___-__ ]           │
│                              │
│ Data de nascimento           │
│ [ __/__/____ ]               │
│                              │
│ [        Entrar            ] │
│                              │
│ ─────────────────────────────│
│ Já tenho usuário e senha   ▸ │
└──────────────────────────────┘
```

Duas caixas. Sem "criar conta", sem "esqueci a senha" em destaque — a mesma porta
serve para tudo. 🗣️ Tom na primeira pessoa da Roziele, nunca institucional.

Quando a ficha existe mas falta a data de nascimento, esta tela **não nega**: pede
liberação à Roziele, que resolve em um toque (D-08).

---

## 14 · Portal — início

```
┌──────────────────────────────┐
│ Ro                        ⚙  │
│                              │
│ Oi, Carla                    │
│                              │
│ ┌──────────────────────────┐ │
│ │ SEU PRÓXIMO HORÁRIO      │ │
│ │ quinta, 6 de fevereiro   │ │
│ │ 14:00 · progressiva      │ │
│ │                          │ │
│ │ [ Confirmo que vou ]     │ │
│ └──────────────────────────┘ │
│                              │
│ SUA EVOLUÇÃO                 │
│ ┌────┐┌────┐┌────┐┌────┐    │
│ │nov ││ago ││mai ││fev │  ▸ │
│ └────┘└────┘└────┘└────┘    │
│ 8 visitas com a Roziele      │
│                              │
│ ┌──────────────────────────┐ │
│ │ 💧 Shampoo sem sal       │ │
│ │ Recomendado pela Roziele │ │
│ │                       ▸  │ │
│ └──────────────────────────┘ │
│                              │
│ ─────────────────────────────│
│  Início  Visitas  Evolução   │
└──────────────────────────────┘
```

Confirmar presença em **1 toque** — e essa confirmação aparece no painel da Roziele
sem recarregar.

Sem valores: 🗣️ o histórico de preços nasce desligado na configuração.

---

## 15 · Portal — meus antes e depois

O coração emocional do portal.

```
┌──────────────────────────────┐
│ ‹        Sua evolução        │
│                              │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │   antes  ◀ ║ ▶   depois  │ │
│ │                          │ │
│ │                          │ │
│ │                          │ │
│ └──────────────────────────┘ │
│    arraste para comparar     │
│                              │
│ 12 de agosto de 2026         │
│ progressiva                  │
│                              │
│ ● ○ ○ ○ ○ ○ ○ ○              │
│ ago mai fev nov ago mai...   │
│                              │
│ ┌──────────────────────────┐ │
│ │ 2 anos de cuidado.       │ │
│ │ Sua primeira foto é de   │ │
│ │ novembro de 2024.        │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Uma foto por vez, arrastar para comparar, linha do tempo embaixo. **Só aparecem as
fotos liberadas** pela Roziele — a cliente não sabe que existem outras, e não pode
saber (INV-11).

O card do fim é o que faz ela não trocar de profissional.

---

## 16 · Portal — meu cuidado

🗣️ A tela que digitaliza o que a Roziele já faz falando na porta.

```
┌──────────────────────────────┐
│ ‹         Meu cuidado        │
│                              │
│ DA ROZIELE PARA VOCÊ         │
│ 12 de agosto                 │
│                              │
│ ┌──────────────────────────┐ │
│ │ 💧 Shampoo sem sal       │ │
│ │ Progressiva sai mais     │ │
│ │ rápido com sal.          │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🚫 Não prenda molhado    │ │
│ │ Nos primeiros 3 dias.    │ │
│ └──────────────────────────┘ │
│                              │
│ QUANDO VOLTAR                │
│ ┌──────────────────────────┐ │
│ │ Por volta de 6 de        │ │
│ │ fevereiro                │ │
│ │ 3 meses · seu cabelo é   │ │
│ │ cacheado e cresce rápido │ │
│ │                          │ │
│ │ [ Pedir esse horário ]   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

🗣️ _"Deixo as orientações dos produtos que deve utilizar e o tempo do retoque."_
Falado, isso se perde antes de a cliente chegar em casa. Escrito, vira o motivo de
ela abrir o app de novo.

**"Pedir esse horário"**, não "agendar" — é o padrão de D-05, e a Roziele aprova.

---

## O que estes wireframes decidiram

| Decisão                                               | Onde         |
| ----------------------------------------------------- | ------------ |
| **O número grande é "sobrou", nunca "entrou"**        | Telas 2 e 12 |
| **O alerta de química vem antes de tudo na ficha**    | Tela 6       |
| **A anamnese vem pré-preenchida pelo histórico**      | Tela 8       |
| **Reprovar no teste é sucesso, não erro**             | Tela 8       |
| **Produtos pré-marcados pelo hábito daquela cliente** | Tela 9       |
| **O lucro aparece no checkout, não no fim do mês**    | Tela 10      |
| **Alerta de estoque em dias, não em quantidade**      | Tela 11      |
| **A fusão de fichas é sugerida, nunca automática**    | Tela 7       |
| 🗣️ **"Vaga" em vez de "livre"**                       | Tela 3       |
| **Estoque fora do onboarding**                        | Tela 1       |

### Regra dos 3 toques — verificação

| Ação                         | Caminho                        | Toques |
| ---------------------------- | ------------------------------ | ------ |
| Agendar                      | Hoje → `+` → cliente → horário | 3      |
| Iniciar atendimento          | Hoje → card → Iniciar          | 3      |
| Voltar ao atendimento aberto | Hoje → Abrir                   | 2      |
| Dar baixa em produto         | automática no Finalizar        | 0      |
| Receber pagamento            | Finalizar → forma → Concluir   | 3      |
| Marcar retorno               | dentro do checkout             | 1      |

Todas dentro do limite. A que estava em risco era "dar baixa em produto" — resolvida
tirando-a das mãos dela: baixa automática pelo consumo pré-marcado.
