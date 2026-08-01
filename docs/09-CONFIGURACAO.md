# Modelo de configuração

> **O sistema chega sabendo o domínio da beleza. A profissional seleciona o que é
> dela e ajusta o que for diferente.**
>
> Substitui a descoberta por entrevista ([DEC-013](04-DECISOES.md#dec-013)). Tudo
> que eu ia perguntar à Rosiele por mensagem — preço, duração, produto, horário —
> é campo de cadastro, e cadastro é para todas as profissionais, não só para ela.

---

## 1. O princípio

A pergunta que decide tudo: **quem sabe a resposta?**

| Quem sabe                                             | Onde vive                      |
| ----------------------------------------------------- | ------------------------------ |
| O domínio da beleza — vale para qualquer profissional | **Vem pronto.** Nível 1        |
| Só ela — preço, horário, jeito de trabalhar           | **Ela configura.** Nível 2     |
| Ninguém ainda — só o uso revela                       | **O sistema aprende.** Nível 3 |

O erro que essa tabela evita: pedir no cadastro o que só o uso responde. Perguntar
"quanto tempo leva uma progressiva?" numa tela de cadastro é exigir precisão de
quem nunca cronometrou. O sistema mede, e ela nunca precisa acertar de primeira.

**Nenhuma tela de configuração começa vazia.** Estado vazio que só oferece um botão
"adicionar" é abandono disfarçado de liberdade.

---

## 2. Nível 1 — o que vem pronto

Conhecimento do domínio, embarcado no produto. A profissional **marca o que faz** e
ignora o resto. É o que transforma o cadastro de digitação em seleção.

### Serviços

Cada um chega com duração e faixa de preço sugeridas, e com o consumo típico já
ligado à categoria de produto certa.

| Grupo          | Serviços na semente                                                    |
| -------------- | ---------------------------------------------------------------------- |
| **Alisamento** | Progressiva · Retoque de raiz · Selagem · Botox capilar · Relaxamento  |
| **Tratamento** | Nutrição · Hidratação · Reconstrução · Cronograma capilar              |
| **Modelagem**  | Escova · Escova modelada · Escova com babyliss · Penteado              |
| **Corte**      | Corte · Corte de pontas                                                |
| **Cor**        | Coloração · Retoque de cor · Mechas · Luzes · Matização · Descoloração |

🗣️ A ordem não é alfabética de propósito: **progressiva, nutrição, escova e corte
de pontas aparecem primeiro**, porque é o que a Rosiele faz — e é uma aposta
razoável para autônoma de cabelo em geral. Ela marca quatro caixas e o catálogo
está pronto.

### Produtos

Por categoria, com unidade e rendimento típico pré-preenchidos.

| Categoria   | Exemplos na semente                                |
| ----------- | -------------------------------------------------- |
| Alisamento  | Progressiva · Ativo de alisamento · Neutralizante  |
| Tratamento  | Máscara · Ampola · Óleo · Leave-in                 |
| Lavagem     | Shampoo · Shampoo antirresíduo · Condicionador     |
| Cor         | Coloração · Oxidante · Pó descolorante · Matizador |
| Finalização | Protetor térmico · Finalizador · Sérum             |

Marcas conhecidas entram como sugestão de digitação, não como lista fechada —
🗣️ **Let Me Be** e **Wella** já estão lá porque vieram dela.

### Unidades

**Frasco · aplicação · ml · g · kit · ampola · caixa**

🗣️ **Frasco e aplicação vêm primeiro.** Ninguém pensa em mililitro no meio do
atendimento; pensa em "esse frasco dá umas oito escovas". O sistema converte por
dentro, e nunca obriga ninguém a falar a língua dele.

### Outros catálogos semente

- **Formas de pagamento:** Pix · Dinheiro · Débito · Crédito · Fiado
- **Categorias de despesa:** Produto · Aluguel · Energia · Transporte · Equipamento
  · Marketing · Impostos
- **Curvatura:** Liso · Ondulado · Cacheado · Crespo — 🗣️ nomes, não notação `3B`
- **Perguntas da anamnese:** as cinco que ela já faz, marcáveis e editáveis (§ 3.5)

---

## 3. Nível 2 — o que ela configura

Tudo com **padrão sugerido preenchido**. Ela ajusta o que for diferente e ignora o
resto.

### 3.1 Serviços

Por serviço marcado: preço, duração, e **variantes** se o preço mudar conforme o
cabelo. A variante é opcional e nasce desligada — quem cobra preço único nunca vê
essa complexidade.

🗣️ Quando ligada, o eixo padrão é **curvatura** (liso → crespo), não comprimento.
Foi o que apareceu na conversa: o caso difícil dela foi _"progressiva em cabelo
cacheado"_, e a curvatura também define quando a cliente volta.

### 3.2 Serviços compostos

Um serviço pode conter etapas. 🗣️ _"Wella para nutrição pra escovar"_ — a nutrição
existe para viabilizar a escova.

Isso resolve, por configuração, a pergunta que eu ia fazer por mensagem: se para
ela a nutrição é etapa da escova, ela monta assim; se for serviço vendido à parte,
monta do outro jeito. **O sistema não precisa saber a resposta — precisa suportar
as duas.**

### 3.3 Agenda

Dias e horários de trabalho, duração do intervalo, folgas, antecedência mínima. O
padrão sugerido é segunda a sábado, 9h às 18h — ajustável em uma tela.

### 3.4 Políticas do portal

Aqui é onde a decisão vira chave. **[D-05](04-DECISOES.md#d-05--poder-de-agendamento-da-cliente-no-portal)
deixa de ser decisão de projeto.**

| Chave                              | Padrão                | Por que esse padrão                               |
| ---------------------------------- | --------------------- | ------------------------------------------------- |
| Cliente pode **solicitar** horário | ✅ ligado             | Tira a conversa do WhatsApp sem entregar a agenda |
| Cliente pode **agendar direto**    | ⬜ desligado          | Preserva o controle. Quem quiser, liga            |
| Cliente vê antes e depois          | ✅ ligado             | É o coração emocional do portal                   |
| Visibilidade padrão da foto        | **Só a profissional** | Nunca expor por omissão                           |
| Cliente vê valores do histórico    | ⬜ desligado          | Pode ser constrangedor dos dois lados             |

Cada profissional decide o produto que quer ter. Nós entregamos o padrão bom.

### 3.5 Anamnese

🗣️ As cinco perguntas que a Rosiele já faz vêm marcadas: já fez alisamento, qual
produto usou, quando foi, se está quebrando, se está caindo. Mais o **teste de
mecha** como etapa obrigatória de serviço químico.

Ela desmarca o que não usa e acrescenta o que for dela. Uma profissional que só faz
corte desliga a anamnese inteira em um toque.

**Ficha técnica configurável, não formulário fixo** — mas com o formulário certo já
montado.

---

## 4. Nível 3 — o que o sistema aprende

O nível que torna o cadastro barato: ela pode **errar tudo no começo** sem
consequência.

| O que ela chuta      | O que o sistema mede                | Como corrige                                                                      |
| -------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Duração do serviço   | Cronômetro real de cada atendimento | Depois de algumas visitas: _"suas progressivas levam 3h20, não 2h30. Atualizar?"_ |
| Consumo de produto   | Baixa registrada por atendimento    | Corrige o custo real e o rendimento do frasco                                     |
| Intervalo de retorno | Quando a cliente de fato volta      | Ajusta o lembrete por serviço **e por cliente**                                   |
| Duração por cliente  | Histórico daquela pessoa            | Sugere o horário certo na hora de agendar                                         |

🗣️ O retorno começa em **3 meses para progressiva, mais cedo conforme a curvatura**
— regra que veio dela e serve de padrão para todas. Depois, o uso ajusta.

**Nada disso é aplicado sozinho.** O sistema propõe, ela confirma. Número mudando
sem autorização quebra a confiança, que é o único ativo que não se recupera.

---

## 5. O que **não** é configurável

Nem tudo cabe numa chave. Estas são decisões de arquitetura, e eu as tomo agora em
vez de perguntar — retrofitar qualquer uma delas custa uma reescrita.

| #    | Questão                              | Decisão                                                                                     | Por quê                                                                                                                                     |
| ---- | ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| M-02 | Atender duas clientes ao mesmo tempo | **O modelo permite. A interface começa com uma.** Sem invariante de atendimento único       | Duas cadeiras é comum na área, e concorrência não se acrescenta depois sem refazer o cronômetro e o painel. Permitir custa quase nada agora |
| M-01 | Um serviço por visita ou vários      | **Sempre lista.** `AttendanceItem` em coleção                                               | Custa uma tabela. Fundir depois custa migrar todo o histórico financeiro                                                                    |
| M-06 | Pagamento parcial e fiado            | **Existe sempre**, escondido quando não usado                                               | Um `Payment` em lista suporta os dois. Supor pagamento integral e descobrir o fiado na Fase 10 quebra o fechamento de caixa                 |
| M-07 | Cortesia                             | **Estado próprio**, distinto de "não pago"                                                  | Sem isso, atendimento de graça vira dívida eterna no relatório                                                                              |
| M-11 | Teste reprovado gera cobrança        | **Configurável** — mas o estado `ENCERRADO_SEM_SERVICO` existe sempre                       | O desfecho é arquitetura; cobrar ou não é política dela                                                                                     |
| M-12 | Trabalhar sozinha ou com equipe      | **`Membership` existe desde a Fase 3.** A interface só aparece quando há mais de uma pessoa | Multi-usuário retrofitado é migração de identidade — o erro mais caro do catálogo                                                           |
| D-07 | Encontro das pontas sem CPF          | **Fusão assistida**, CPF opcional                                                           | Já registrado. Casar por telefone automaticamente expõe histórico de terceiros                                                              |

Padrão das sete: **o modelo é permissivo, a interface é simples.** O que é barato
agora e caro depois entra desde já, escondido até fazer falta.

---

## 6. O onboarding

O que sobra das perguntas que eu ia mandar por mensagem: elas viram esta tela.

```
1. Quem é você            nome, foto, nome do negócio
2. O que você faz         marca serviços da semente          ← 4 toques
3. Quanto e quanto tempo  preço e duração, já sugeridos      ← pode pular
4. Quando você atende     dias e horários, já sugeridos      ← pode pular
5. Pronto                 "vamos agendar a primeira?"
```

**Regras:**

- Os passos 3 e 4 são **puláveis**. Quem pula opera com os padrões e ajusta depois
- Produtos e estoque **não estão no onboarding**. Cadastrar estoque antes de ter
  cliente é a forma mais rápida de abandonar um app. Entram quando ela registrar o
  primeiro consumo
- Nenhum passo exige dado que ela não tenha na cabeça naquele momento
- Meta: **da conta criada ao primeiro agendamento em menos de 3 minutos**, sem
  ajuda — que é o DoD da Fase 16 antecipado para o dia 1

---

## 7. O que a conversa com a Rosiele ainda serviu

Ela não foi desperdício, e não vai se repetir. O que veio dela virou:

- **`HairAssessment`** e o estado **`ENCERRADO_SEM_SERVICO`** — arquitetura que eu
  não teria descoberto sozinho
- **O catálogo semente**, com a ordem certa e o vocabulário certo: nutrição em vez
  de hidratação, frasco antes de mililitro, curvatura como eixo de preço
- **A tese do produto**, na frase sobre o dinheiro que some no fim do mês

Uma conversa gerou conhecimento de domínio que serve a **todas** as profissionais.
Era para isso que ela existia. As perguntas de preço e duração nunca deveriam ter
sido feitas — elas são a tela do passo 3.
