# Glossário do domínio

> **Entregável 1.2 da Fase 1 — v0.5**, atualizado com a primeira rodada de
> respostas da Rosiele ([leitura-01.md](descoberta/leitura-01.md)).
>
> Este documento existe por um motivo específico: **vocabulário errado vira
> software errado.** Se eu chamar de "serviço" o que ela chama de "procedimento",
> ou tratar "escova" como uma coisa quando na verdade são três, o erro atravessa o
> modelo de dados, os nomes das tabelas, os rótulos dos botões e as telas — e sai
> caro na Fase 6.
>
> Um dos anti-objetivos do produto é não ser genérico para "prestadores de serviço"
> (ver [01-VISAO-PRODUTO.md](01-VISAO-PRODUTO.md)). Especificidade é a vantagem
> competitiva, e ela começa aqui.

## Como ler

| Marca | Significa |
| ----- | --------- |
| 🗣️ | **Palavra da Rosiele.** Confirmada na primeira rodada. Estas vencem qualquer preferência minha |
| ✅ | Termo do domínio da beleza com significado estável no mercado brasileiro |
| ⚠️ | **A confirmar com a Rosiele** — ou eu não sei se ela usa, ou o termo tem mais de um significado em uso |
| 🔷 | Termo do **produto RoHair**, definido por nós. Precisa ser aprovado como o nome que aparece na interface |

**Nada aqui é definitivo.** Este glossário nasce como hipótese e será reescrito na
Fase 1B com o vocabulário real da Rosiele. Onde o termo dela divergir do meu,
**o dela vence** — inclusive se for gramaticalmente estranho ou regional.

---

## 1. Serviços — o escopo de hoje

Os três serviços do escopo atual. Todo o resto é cadastro, não desenvolvimento.

### Escova ✅⚠️

Lavagem, secagem e modelagem do fio com secador e escova. Não é procedimento
químico e o efeito dura até a próxima lavagem.

⚠️ **Armadilha de modelagem.** "Escova" é usado no Brasil com três sentidos
diferentes, e preciso saber qual é o da Rosiele:

1. **A ferramenta** — a escova física
2. **O serviço de modelagem** — lavar, secar e modelar
3. **A finalização de outro serviço** — a escova que vem depois da hidratação

Se (3) for cobrado à parte, escova é um serviço. Se estiver embutido, é uma etapa.
Isso muda se `Attendance` tem um serviço ou vários. Perguntas 21, 23 do roteiro.

Variações usuais: **escova lisa** (fio reto), **escova modelada** (com movimento
nas pontas), **escova com babyliss** (cachos ou ondas ao final).

### Nutrição 🗣️

**A palavra dela é "nutrição", não "hidratação".** Toda a documentação anterior
listava o escopo como "escova, hidratação, progressiva"; as palavras da Rosiele são
**progressiva, nutrição, escova**. A interface usa o termo dela.

Ela usa **Wella**, e a frase foi *"Wella para nutrição pra escovar"* — o "pra" liga
as duas coisas: a nutrição existe para viabilizar a escova. ⚠️ Sinaliza que
nutrição é **etapa da escova**, não serviço vendido à parte — mas isso deixou de
ser pergunta: o catálogo suporta **serviço composto**, e ela monta do jeito dela
([09-CONFIGURACAO.md § 3.2](09-CONFIGURACAO.md#32-serviços-compostos)).

Hidratação e reconstrução também estão na semente, desmarcadas.

Nutrição faz parte de um trio que o mercado distingue com precisão, e é comum a
profissional usar um dos nomes como guarda-chuva para os três:

| Termo | Repõe | Quando se usa |
| ----- | ----- | ------------- |
| **Hidratação** | Água | Cabelo ressecado, sem brilho |
| **Nutrição** | Lipídios, óleos | Cabelo poroso, áspero |
| **Reconstrução** | Massa, proteína, queratina | Cabelo quebradiço, elástico, danificado por química |

Os três entram como serviços separados na semente. Quem distingue marca os três;
quem chama tudo de nutrição marca um. Nenhuma das duas precisa nos avisar.

### Progressiva ✅⚠️

Procedimento químico de alisamento e redução de volume. Também chamada de **escova
progressiva** — daí a ambiguidade acima.

Pontos que importam para o modelo:

- 🗣️ Produto que ela usa: **Let Me Be**
- 🗣️ **O retorno é de três meses**, *"ou antes dependendo da curvatura"*. E ela
  reconhece o ciclo como estrutural: *"sempre fica nesse loop pois cabelo alisado é
  assim mesmo"*. Isso torna o retorno **calculável** — serviço + curvatura — em vez
  de estimado por histórico
- 🗣️ O caso mais difícil que ela citou foi **progressiva em cabelo cacheado**
- É a mais longa e a mais cara dos três — provável caso extremo de duração
- Tem **tempo de pausa** obrigatório, em que o produto age no fio
- Existe com e sem formol; a formulação define ventilação, duração e risco ⚠️
- ⚠️ Eu supus precificação por **comprimento e volume**. O sinal dela aponta para
  **curvatura** — apareceu duas vezes, definindo tanto a dificuldade quanto o
  intervalo de retorno. Virou o **eixo padrão** da variante de serviço, ajustável
  por quem preferir outro

---

## 2. Serviços fora do escopo atual

Não serão construídos agora. Estão aqui para que o modelo de domínio não os torne
impossíveis depois — adicionar um serviço deve ser cadastro, nunca código.

| Termo | O que é |
| ----- | ------- |
| **Botox capilar** ✅ | Tratamento de redução de volume e alinhamento. Não tem relação com toxina botulínica — o nome é comercial |
| **Selagem** ✅ | Selamento das cutículas, efeito mais leve que a progressiva |
| **Relaxamento** ✅ | Alisamento com base em guanidina ou tioglicolato, comum em cabelo crespo |
| **Coloração** ✅ | Tintura. Envolve mistura de coloração com oxidante |
| **Descoloração** ✅ | Remoção de pigmento com pó descolorante + oxidante |
| **Mechas / luzes** ✅ | Clareamento parcial. **Balayage** e **ombré** são técnicas de distribuição |
| **Matização** ✅ | Neutraliza tons amarelados após clareamento. Costuma ser cobrada à parte |
| **Corte de pontas** 🗣️ | **Confirmado e rotineiro:** *"As pontas sempre cortamos na maioria das vezes pra não ficar ressecadas."* Entra na semente do catálogo, marcado. Se é etapa embutida ou serviço à parte, ela decide na configuração |
| **Cronograma capilar** ✅ | **Não é um serviço — é uma sequência.** Alternância planejada entre hidratação, nutrição e reconstrução ao longo de semanas. Se a Rosiele trabalha assim, o produto precisa entender uma **série de atendimentos com um plano**, não visitas isoladas. ⚠️ Isso teria impacto real no modelo e no portal da cliente |

---

## 3. O cabelo — o que descreve a cliente

Estes termos provavelmente viram campos da ficha. Cada um só entra se resolver um
problema real dela.

| Termo | O que é | Por que pode virar campo |
| ----- | ------- | ------------------------ |
| **Raiz** ✅ | Trecho do fio próximo ao couro cabeludo | Define "retoque de raiz" como serviço menor e mais barato |
| **Comprimento** ✅ | O corpo do fio | Base de preço e de consumo de produto |
| **Pontas** ✅ | Extremidade, a parte mais velha e danificada | "Pontas duplas" é queixa comum |
| **Curvatura** 🗣️ | Liso, ondulado, cacheado, crespo — o mercado classifica de 1 a 4 com subníveis (2A, 3B…) | **A variável mais importante que ela citou.** Aparece duas vezes: define o intervalo de retorno da progressiva e define o caso mais difícil. ⚠️ Ela disse "cacheado", não "3B" — provavelmente usa os nomes, não a notação |
| **Porosidade** ✅ | Capacidade do fio de absorver e reter água. Alta porosidade absorve rápido e perde rápido | Define produto e tempo de pausa |
| **Espessura do fio** ✅ | Fino, médio, grosso | Junto com comprimento, é a variável de preço mais provável |
| **Volume / densidade** ✅ | Quantidade de fios | Afeta duração e consumo |
| **Química** ✅ | Termo guarda-chuva: "esse cabelo tem química" significa que já passou por processo químico | **Informação crítica de segurança** — ver seção 5 |

---

## 4. Produtos e insumos

### Os produtos que ela usa 🗣️

Os primeiros dados reais de catálogo — e as duas marcas entram como sugestão na
semente. Custo e rendimento são **campo de cadastro**, preenchidos por ela quando
registrar o produto.

| Marca citada | Para quê |
| ------------ | -------- |
| **Let Me Be** | Progressiva |
| **Wella** | Nutrição, antes da escova |

⚠️ Ela citou marca, não linha nem tamanho de frasco. Um "Let Me Be" pode ser vários
produtos diferentes; o cadastro precisa do item exato.

### Vocabulário geral

| Termo | O que é |
| ----- | ------- |
| **Máscara** ✅ | Produto de tratamento de maior densidade, com tempo de pausa |
| **Ampola** ✅ | Dose única de tratamento concentrado |
| **Leave-in** ✅ | Finalizador que não se enxágua |
| **Shampoo antirresíduo** ✅ | Abre a cutícula e remove acúmulo. Costuma preceder química |
| **Oxidante / água oxigenada** ✅ | Ativa coloração e descoloração. Vendida em volumes (10, 20, 30, 40) — quanto maior, mais forte e mais agressivo |
| **Pó descolorante** ✅ | Removedor de pigmento, usado com oxidante |
| **Ativo** ✅ | O componente que produz o efeito do produto |
| **Touca térmica** ✅ | Potencializa tratamento pelo calor |
| **Secador · prancha · babyliss · difusor** ✅ | Equipamento. **Não é insumo** — não é consumido, mas tem custo e desgaste. ⚠️ Provavelmente fora do escopo da Fase 7 |

⚠️ **Unidade de medida é uma pergunta aberta importante.** Estoque em Postgres pode
ser mililitro, grama, "frasco" ou "aplicação". Ela quase certamente pensa em
frascos, não em mililitros — e o produto tem que falar a língua dela mesmo que o
cálculo interno use outra. Perguntas 36 e 37.

---

## 5. Execução e segurança

| Termo | O que é | Consequência para o produto |
| ----- | ------- | --------------------------- |
| **Tempo de pausa** (ou tempo de ação) ✅ | Quanto tempo o produto fica agindo antes do enxágue | É tempo em que **as mãos dela estão livres**. Provavelmente a única janela real para usar o celular durante o atendimento — pergunta 28. Pode ser a janela em que o app inteiro é usado |
| **Teste de mecha** 🗣️ | Teste em uma mecha isolada antes de aplicar química no cabelo todo | **Muito mais importante do que eu supunha.** Ela abre o atendimento com ele: *"Inicio fazendo teste de mecha pra ver se o cabelo suporta o produto."* Não é etapa opcional — é **portão**, e um portão que pode reprovar. Ver [modelo de domínio](08-MODELO-DE-DOMINIO.md) |
| **Anamnese capilar** 🗣️🔷 | O conjunto de perguntas que ela faz **a toda cliente** antes de começar: já fez alisamento, qual produto usou, quanto tempo faz, se está quebrando, se está caindo | **Achado principal da primeira rodada.** Ela descreveu a mesma sequência duas vezes, sem ser perguntada. Não é anotação — é formulário estruturado que decide se o serviço pode acontecer. Virou entidade própria no [modelo de domínio](08-MODELO-DE-DOMINIO.md). ⚠️ "Anamnese" é o termo do mercado; **ela não usou essa palavra** — o nome na interface ainda não está decidido |
| **Incompatibilidade química** ✅🗣️ | Certas químicas **não podem** ser sobrepostas. Guanidina sobre amônia, por exemplo, pode literalmente partir o fio | **Confirmado como o dado mais crítico da ficha.** É a razão de existir da anamnese: ela pergunta qual produto a cliente usou antes justamente para não sobrepor química incompatível. Não é histórico — é **alerta de segurança** que aparece antes de iniciar |
| **Emborrachamento** ✅ | Fio elástico e gosmento, por excesso de hidratação ou dano | Sintoma que ela reconhece; pode virar observação padrão |
| **Lavatório** ✅ | A pia de lavar cabelo, e por extensão a etapa | ⚠️ Pode ser um "posto de trabalho" — relevante só se ela atender duas clientes ao mesmo tempo. Pergunta 25 |
| **Finalização** ✅ | Última etapa: secar, modelar, finalizar | Pode ser o gatilho natural da foto "depois" |

---

## 6. O negócio

| Termo | O que é | Nota |
| ----- | ------- | ---- |
| **Encaixe** ✅ | Atender fora da agenda planejada, espremendo entre dois horários | Fase 8. Provavelmente frequente |
| **Retorno / manutenção** ✅ | A próxima visita recomendada. Progressiva tem intervalo previsível | Base do insight "hora de voltar" e de "Meu cuidado" no portal |
| **Falta** ⚠️ | Cliente não aparece e não avisa. Também dito **"furo"** ou **"deu bolo"** | Preciso do termo dela — vai virar rótulo de estado na agenda. Pergunta 13 |
| **Comanda** ✅ | Em salão, o registro do consumo da cliente na visita, fechado no caixa | ⚠️ Vocabulário de salão grande. Se ela não usa, **não usar na interface** |
| **Fechamento de caixa** ✅ | Conferência do que entrou no dia | Fase 10, pergunta 60 |
| **Cortesia** 🔷 | Atendimento feito sem cobrança, por escolha dela | Precisa ser um estado explícito. Se um atendimento sem valor virar "pendente de pagamento", o financeiro nunca fecha. Pergunta 44 |

---

## 7. Vocabulário do RoHair

Termos que **nós** definimos. Estes precisam de aprovação: são os nomes que
aparecem na tela.

| Termo | Definição no sistema | Nome provável na interface |
| ----- | -------------------- | -------------------------- |
| **Organização** 🔷 | A unidade de isolamento de dados. Hoje: a Rosiele. Amanhã: cada profissional assinante | Nunca aparece na interface na Fase 1–15 |
| **Ficha** 🔷 | `Client` — o registro de negócio da cliente. **Existe sem conta e sem app** | "Ficha" ou "Cliente" ⚠️ |
| **Conta da cliente** 🔷 | `ClientAccount` — a credencial de acesso ao portal. 1:1 opcional com a ficha | "Acesso ao app" |
| **Agendamento** 🔷 | `Appointment` — o compromisso futuro | "Horário" ⚠️ — provavelmente é como ela fala |
| **Solicitação** 🔷 | `AppointmentRequest` — pedido da cliente aguardando aprovação | Depende de D-05 |
| **Atendimento** 🔷 | `Attendance` — o que **aconteceu**. Distinto do agendamento, que é o que **estava planejado** | "Atendimento" |
| **Serviço** 🔷 | `Service` — item do catálogo, com preço e duração | "Serviço" |
| **Variante** 🔷 | `ServiceVariant` — a mesma coisa com preço/duração diferentes por comprimento ou volume | ⚠️ Palavra técnica. Na tela provavelmente vira "Curto · Médio · Longo" |
| **Insight** 🔷 | Observação acionável gerada por regra | ⚠️ Estrangeirismo. Talvez "Alerta", "Sugestão" ou "Você sabia" |

### Uma distinção que precisa sobreviver ao projeto inteiro

**Agendamento ≠ Atendimento.**

O agendamento é a **intenção**: quem, quando, o que estava previsto. O atendimento
é o **fato**: o que foi feito, quanto tempo levou de verdade, que produto foi
gasto, quanto foi pago.

Fundir os dois é o erro mais comum em software de agenda, e ele cobra o preço na
hora de responder "quanto tempo essa escova leva de verdade?" — pergunta 22 — ou
"quanto eu perdi com faltas?". Separados, os dois se comparam. Fundidos, a
realidade sobrescreve o plano e a informação some.

Existe atendimento sem agendamento (encaixe) e agendamento sem atendimento
(falta). Nenhum dos dois é exceção.

---

## 8. Perguntas em aberto

Por [DEC-013](04-DECISOES.md#dec-013), estas perguntas **não vão ser feitas à
Rosiele**. Quase todas eram sobre o que ela faz — e o que ela faz é escolha dela na
tela de configuração, não descoberta nossa.

| # | Pergunta | Resolução |
| - | -------- | --------- |
| G-01 | "Escova" é serviço próprio ou etapa de outro? | ⚙️ Serviço composto — ela monta do jeito dela |
| G-02 | Hidratação, nutrição e reconstrução são distintas? | ⚙️ Os três estão na semente. Ela marca os que faz. 🗣️ Nutrição vem marcada |
| G-03 | Ela trabalha com cronograma capilar? | ⚙️ Está na semente, desmarcado |
| G-04 | Como ela chama quem não apareceu? | 🏛️ O estado existe; o rótulo padrão é **"Faltou"**. Não vale configurar texto de estado |
| G-05 | Precisa saber a química anterior? | ✅ **Sim — portão de segurança.** Gerou a anamnese |
| G-06 | Em que unidade pensa estoque? | ⚙️ 🗣️ **Frasco e aplicação primeiro**, conversão interna |
| G-07 | Ela usa "comanda"? | 🏛️ Não apareceu espontaneamente — é vocabulário de salão grande. **Não entra** |
| G-08 | Diz "horário" ou "agendamento"? | 🏛️ Ela disse 🗣️ **"vaga"**. Ver nota abaixo |
| G-09 | Ela faz corte? | ✅ **Sim** — corte e corte de pontas estão na semente, marcados |
| G-10 | Classifica curvatura por número? | 🏛️ 🗣️ Usa **nomes** — liso, ondulado, cacheado, crespo. Sem notação `3B` |

**Legenda:** ✅ resolvida pela conversa · ⚙️ vira
[configuração](09-CONFIGURACAO.md) · 🏛️ decidida por nós

**Nota sobre G-08.** Ela escreveu *"verifico se tenho **vaga** naquele dia e
horário"*. Nem "horário", nem "agendamento" — **"vaga"**. É a palavra de quem olha
a agenda pelo espaço livre, não pelo compromisso marcado, e descreve melhor o que
ela faz ao abrir a tela. Candidata forte para a interface da agenda na Fase 8.

Este é o tipo de coisa que só uma conversa entrega, e é por isso que a conversa
valeu — não pelos preços, que são campo de cadastro.

---

**Próxima versão (v1):** junto com a validação do modelo contra os cinco cenários.
Os ⚠️ que sobram são hipóteses do domínio, não perguntas para ela.
