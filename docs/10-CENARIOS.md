# Cinco cenários — a validação do modelo

> **Entregável 1.6 da Fase 1.** DoD: _"o modelo de domínio foi validado contra 5
> cenários de atendimento"_.
>
> Cada cenário foi escolhido para **atacar** uma parte diferente do modelo, não para
> confirmá-lo. Cenário que passa liso não valida nada.
>
> Resultado: **5 buracos encontrados**, todos corrigidos em
> [08-MODELO-DE-DOMINIO.md](08-MODELO-DE-DOMINIO.md). A seção 7 lista cada um.

---

## Cenário 1 · O retorno de progressiva

**Ataca:** histórico, anamnese repetida, snapshot de preço, retorno calculado.

> Carla fez progressiva há três meses. O sistema avisou que era hora de voltar; ela
> confirmou pelo portal. Chega no horário. A Roziele abre a ficha e faz a anamnese
> de sempre: já fez alisamento — sim, aqui mesmo, em abril; está quebrando — um
> pouco nas pontas; está caindo — não. Teste de mecha passa. Progressiva e corte de
> pontas. Duas horas e quarenta. Paga R$ 220 no Pix. Foto do antes e do depois,
> as duas liberadas para ela ver. Próximo retorno em três meses.

| Verificação                               | Resultado                                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Retorno calculado por serviço + curvatura | ✅ Regra do domínio, sem depender de histórico                                                                                                |
| Anamnese pré-preenchida pelo histórico    | ✅ E a resposta gravada é a **confirmada por ela**, não a derivada — se Carla tiver alisado em outro lugar, a anamnese sabe e o histórico não |
| Preço congelado no item                   | ✅ INV-05                                                                                                                                     |
| Duas fotos com visibilidade explícita     | ✅ INV-11                                                                                                                                     |
| Duração real alimenta a estimativa        | ✅ Nível 3 da configuração                                                                                                                    |

**Passou inteiro.** Era esperado — é o caminho feliz, e serve de linha de base.

---

## Cenário 2 · O teste de mecha reprova

**Ataca:** o portão de segurança, o estado `ENCERRADO_SEM_SERVICO`, o estoque.

> Denise nunca veio. Marcou progressiva. Na anamnese conta que fez alisamento com
> guanidina há dois meses, num salão que fechou. A Roziele faz o teste de mecha: o
> fio esgarça. **Não dá para fazer.** Explica, indica reconstrução por algumas
> semanas e marca um retorno para reavaliar. Denise vai embora sem progressiva. A
> Roziele não cobra nada.

| Verificação                              | Resultado                                 |
| ---------------------------------------- | ----------------------------------------- |
| Estado terminal sem serviço executado    | ✅ `ENCERRADO_SEM_SERVICO`                |
| Cobrança nesse caso                      | ✅ Configurável (M-11), padrão não cobrar |
| Química incompatível registrada na ficha | ✅ `HairAssessment` com `previousProduct` |
| **Baixa do produto gasto no teste**      | 🔴 **GAP-01**                             |

> ### 🔴 GAP-01 · O teste consome produto, e o modelo dizia que não
>
> A INV-17 dizia: _"atendimento com teste reprovado nunca gera `ProductUsage` do
> produto reprovado"_. **Está errada.** O teste de mecha **usa** o produto — pouco,
> mas usa. Se não houver baixa, o estoque mente, e mentir sobre estoque é
> exatamente a dor da Roziele: _"comprar algo que está faltando"_.
>
> **Correção:** `ENCERRADO_SEM_SERVICO` **tem** `ProductUsage` — o consumido no
> teste. O que não pode existir é o `AttendanceItem` do serviço impedido.
> Consumo sem receita é um custo real, e tem que aparecer no lucro.

---

## Cenário 3 · O encaixe que virou três coisas

**Ataca:** atendimento sem agendamento, serviço composto, custo por etapa.

> Sábado, 16h. Uma cliente liga: deu tempo, pode ir? A Roziele encaixa. Era para ser
> escova. Ao lavar, vê o cabelo ressecado e sugere nutrição antes. As pontas estão
> feias, corta. Sai escova + nutrição + corte de pontas por R$ 90 — o preço da
> escova com nutrição, que ela cadastrou como serviço composto, mais nada pelo
> corte de pontas, que ela nunca cobra à parte.

| Verificação                               | Resultado                        |
| ----------------------------------------- | -------------------------------- |
| `Attendance` sem `Appointment`            | ✅ Encaixe não é exceção (§ 4.1) |
| Serviço composto configurável             | ✅ § 3.2 da configuração         |
| Serviço acrescentado no meio              | ✅ `AttendanceItem` em lista     |
| **Margem por serviço e baixa de estoque** | 🔴 **GAP-02**                    |

> ### 🔴 GAP-02 · Serviço composto quebra o custo e a baixa
>
> O preço está no serviço composto ("escova com nutrição", R$ 90). O **consumo de
> produto** está nas etapas — o Wella é da nutrição, não da escova.
>
> Se o atendimento gravar só o item pai, **nenhuma baixa acontece**: o consumo
> padrão está nas etapas. Se gravar só as etapas, o preço se perde ou é rateado
> por chute, e a margem por serviço vira ficção.
>
> **Correção:** `AttendanceItem` ganha `parentItemId`, referência a si mesmo.
> O pai carrega o **preço**; as etapas carregam o **custo** e disparam a baixa. A
> margem do composto é preço do pai menos a soma do custo das folhas.
>
> Consequência direta: **a baixa de estoque é calculada sobre as folhas**, nunca
> sobre o item de topo. Sem isso, o DoD da Fase 7 — _"finalizar dá baixa automática
> correta"_ — falha em silêncio no caso mais comum dela.

---

## Cenário 4 · A cliente que já existia duas vezes

**Ataca:** o encontro das duas pontas, fusão de fichas, unicidade da conta.

> A Roziele atende Juliana há dois anos. Ficha antiga: nome, telefone, sem CPF, sem
> data de nascimento. Juliana descobre o app, tenta entrar, o CPF não acha nada e
> ela **se autocadastra**. Ficha nova, `SELF_REGISTERED`, com CPF e conta ativa.
> Marca um horário pelo portal e é atendida — a Roziele lança o atendimento na
> ficha nova, que apareceu na busca.
>
> Semanas depois, a Roziele percebe a duplicata na bandeja de novos cadastros e
> funde as duas. **E a ficha antiga também tinha uma conta**, criada num teste
> antigo que ninguém lembra.

| Verificação                                    | Resultado                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Autocadastro não casa por telefone sozinho     | ✅ D-07 — nada vaza sem decisão humana                                |
| Fusão sugerida por nome e telefone             | ✅ D-07                                                               |
| Histórico das duas preservado                  | ✅ `mergedIntoId`                                                     |
| **Duas contas na mesma ficha depois da fusão** | 🔴 **GAP-03**                                                         |
| **Receita contada duas vezes**                 | ✅ Não acontece — `Transaction` referencia o atendimento, não a ficha |

> ### 🔴 GAP-03 · Fusão pode criar duas credenciais para uma ficha
>
> A INV-10 diz que uma `Client` tem no máximo uma `ClientAccount`. A fusão de duas
> fichas que **ambas** têm conta viola isso, e o modelo não tinha regra.
>
> **Correção:** a fusão é uma operação de domínio com invariante própria.
> Sobrevive a conta com **login bem-sucedido mais recente**; a outra vai para
> `REVOKED`, nunca é apagada, e o `AuditLog` registra qual venceu e por quê.
>
> Por que não apagar: a conta perdedora pode ser a que a cliente realmente usa, e
> uma escolha automática errada tranca a pessoa fora do próprio histórico. Revogada
> e registrada, a Roziele reverte em um toque.

---

## Cenário 5 · O atendimento que atravessou a meia-noite

**Ataca:** cronômetro persistente, pagamento parcial, cortesia, fuso, anamnese.

> Sexta, 21h40. A prima da Roziele chega para uma escova, de graça — nunca cobra
> dela. No meio, o celular descarrega e o app fecha. Termina 00h20 de sábado. Não há
> pagamento: é cortesia. A foto do depois fica marcada como **só a profissional**,
> porque a prima não gosta de aparecer.

| Verificação                                   | Resultado                                                 |
| --------------------------------------------- | --------------------------------------------------------- |
| App fecha no meio, cronômetro sobrevive       | ✅ `TimeEntry` em intervalos (INV-06, INV-07)             |
| Cortesia sem virar dívida                     | ✅ Estado próprio (M-07)                                  |
| Cortesia consome produto e dá prejuízo no dia | ✅ **Correto e desejado** — custo sem receita é a verdade |
| Foto privada                                  | ✅ Padrão já é `PROFESSIONAL_ONLY`                        |
| **A que dia pertence este atendimento**       | 🔴 **GAP-04**                                             |
| **Escova não precisa de anamnese química**    | 🔴 **GAP-05**                                             |

> ### 🔴 GAP-04 · Nenhuma regra dizia a que dia a receita pertence
>
> Começou sexta, terminou sábado. Datas em UTC, fuso na organização — mas nada
> definia **qual instante** decide o dia do faturamento. Sem regra, o relatório do
> dia muda conforme o campo que a consulta usar.
>
> **Correção, nova INV-18:** o atendimento pertence ao dia da **finalização**,
> convertido para o fuso da organização. Um só instante decide, e é o mesmo que
> gera receita, baixa e histórico na transação única da INV-09.
>
> Vale para o fechamento de caixa da Fase 10 e para o "quanto entrou hoje" do
> painel. É exatamente a classe de bug que a arquitetura queria matar — _"o
> faturamento do dia mudou depois da meia-noite"_ — e ela tinha voltado pela porta
> dos fundos.

> ### 🔴 GAP-05 · A anamnese obrigatória contradizia a configuração
>
> A INV-16 dizia que **todo** `Attendance` tem uma `HairAssessment`. Mas a
> configuração (§ 3.5) permite desligar a anamnese, e uma escova não precisa de
> avaliação química. Dois documentos meus, escritos com horas de diferença, se
> contradiziam.
>
> **Correção:** a anamnese é obrigatória em atendimento com **serviço químico**, e
> o teste de mecha é etapa obrigatória dentro dela. Fora disso, é opcional e segue a
> configuração da profissional. Quem só faz corte nunca vê a tela.

---

## Resumo

| Cenário                    | O que atacou                    | Buracos        |
| -------------------------- | ------------------------------- | -------------- |
| 1 · Retorno de progressiva | Histórico, preço, retorno       | —              |
| 2 · Teste reprova          | Portão de segurança, estoque    | GAP-01         |
| 3 · Encaixe composto       | Serviço composto, margem, baixa | GAP-02         |
| 4 · Ficha duplicada        | Encontro das pontas, fusão      | GAP-03         |
| 5 · Atravessa a meia-noite | Cronômetro, cortesia, fuso      | GAP-04, GAP-05 |

**Cinco buracos em cinco cenários.** Dois deles — GAP-02 e GAP-04 — quebrariam DoDs
de fases inteiras em silêncio: baixa de estoque errada na Fase 7 e faturamento que
não bate na Fase 10. Nenhum apareceria em teste unitário, porque o modelo estava
internamente coerente; só a narrativa concreta os expõe.

É por isso que este documento existe, e é por isso que o DoD pede cinco.

---

## Três cenários adversariais

Continuam valendo como testes da Fase 3, e não mudaram:

1. **Corrida de agendamento** — duas requisições no mesmo horário; uma falha no
   banco, não na aplicação (INV-01)
2. **App fechado no meio** — coberto pelo cenário 5
3. **Reajuste retroativo** — mudar o preço hoje não altera mês fechado (INV-05)
