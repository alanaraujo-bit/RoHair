import { businessDay, DEFAULT_TIME_ZONE as FUSO } from '@/core/kernel/time';
import { prisma } from '@/core/db/client';

import type {
  AlertaDoDia,
  ClienteDaLista,
  Curvatura,
  EscritaResultado,
  FichaDaCliente,
  FiadoAberto,
  ItemDaAgenda,
  OpcoesParaAgendar,
  ProdutoDoEstoque,
  ResumoDoDia,
  ResumoDoMes,
  TransacaoDoMes,
  Unidade,
} from '../application/painel-queries';

/**
 * Leituras do painel, direto no Prisma.
 *
 * Toda função aqui recebe `organizationId` como primeiro argumento, e ele vem
 * **sempre da sessão** — nunca da URL, nunca de um formulário. Enquanto não
 * existia login, este arquivo resolvia a organização sozinho, pegando a
 * primeira do banco; essa função sumiu junto com o painel aberto.
 */

function inicioDoDia(): Date {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return agora;
}

function fimDoDia(): Date {
  const agora = new Date();
  agora.setHours(23, 59, 59, 999);
  return agora;
}

function diasDesde(data: Date): number {
  return Math.floor((Date.now() - data.getTime()) / 86_400_000);
}

/** Saldo em milésimos vira número em português: `250` → `"0,25"`. */
function formatarSaldo(milli: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(
    milli / 1000,
  );
}

/**
 * O número que a tela Hoje mostra grande.
 *
 * Calcula **o que sobrou**, não o que entrou: receita menos o custo do produto
 * consumido. É a decisão de produto mais importante do painel — faturamento é a
 * ilusão que ela já tem, e o app não pode ser mais uma fonte dela.
 *
 * A receita vem dos **pagamentos recebidos**, não dos itens do atendimento
 * (DEC-018). Um serviço fiado tem preço mas não tem dinheiro; contá-lo aqui
 * diria que sobrou o que não entrou — a mesma ilusão, por outro caminho. O
 * custo do produto, esse, conta sempre: ele saiu do estoque de qualquer jeito.
 */
export async function resumoDeHoje(organizationId: string): Promise<ResumoDoDia> {
  const atendimentos = await prisma().attendance.findMany({
    where: {
      organizationId,
      status: 'FINALIZADO',
      finishedAt: { gte: inicioDoDia(), lte: fimDoDia() },
    },
    include: { items: true, usages: true, payments: true },
  });

  let entrou = 0;
  let custo = 0;

  for (const atendimento of atendimentos) {
    for (const pagamento of atendimento.payments) {
      // `paidAt` nulo é fiado: o valor existe, o dinheiro ainda não.
      if (pagamento.paidAt !== null) entrou += pagamento.amountCents;
    }
    for (const uso of atendimento.usages) {
      custo += Math.round((uso.quantityMilli * uso.unitCostCents) / 1000);
    }
  }

  return { sobrouCents: entrou - custo, entrouCents: entrou, custoCents: custo };
}

export async function agendaDeHoje(organizationId: string): Promise<ItemDaAgenda[]> {
  const agendamentos = await prisma().appointment.findMany({
    where: {
      organizationId,
      startsAt: { gte: inicioDoDia(), lte: fimDoDia() },
      status: { notIn: ['CANCELADO'] },
    },
    include: { client: true, service: true },
    orderBy: { startsAt: 'asc' },
  });

  return agendamentos.map((agendamento) => ({
    id: agendamento.id,
    hora: new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: FUSO,
    }).format(agendamento.startsAt),
    clienteId: agendamento.clientId,
    clienteNome: agendamento.client.name,
    servico: agendamento.service?.name ?? 'A definir',
    duracaoMin: Math.round(
      (agendamento.endsAt.getTime() - agendamento.startsAt.getTime()) / 60_000,
    ),
    nova: agendamento.client.origin === 'SELF_REGISTERED',
    confirmado: agendamento.status === 'CONFIRMADO',
  }));
}

/**
 * Os alertas da tela Hoje.
 *
 * As duas regras que atacam a frase dela sobre o dinheiro que some: produto
 * acabando **antes de acabar**, e cliente que passou do retorno.
 */
export async function alertasDeHoje(organizationId: string): Promise<AlertaDoDia[]> {
  const alertas: AlertaDoDia[] = [];

  const produtos = await prisma().product.findMany({
    where: { organizationId, active: true },
    include: { movements: true },
  });

  for (const produto of produtos) {
    const saldoMilli = produto.movements.reduce((t, m) => t + m.quantityMilli, 0);
    const rendimento = produto.yieldPerUnit ?? 10;
    const aplicacoes = Math.floor((saldoMilli / 1000) * rendimento);

    if (aplicacoes <= 4) {
      alertas.push({
        id: `estoque-${produto.id}`,
        tipo: 'estoque',
        titulo: produto.name,
        // O alerta fala em **atendimentos**, não em quantidade: o problema dela
        // não é o número no frasco, é ser surpreendida. Saber que dá para mais
        // dois permite comprar planejado em vez de correndo.
        detalhe:
          aplicacoes <= 0
            ? 'acabou'
            : `${formatarSaldo(saldoMilli)} ${produto.unit.toLowerCase()} · dá para ~${aplicacoes} ${aplicacoes === 1 ? 'atendimento' : 'atendimentos'}`,
        href: '/painel/estoque',
      });
    }
  }

  // Retorno vencido: última visita há mais de 90 dias
  const clientes = await prisma().client.findMany({
    where: { organizationId, deletedAt: null, mergedIntoId: null },
    include: {
      attendances: {
        where: { status: 'FINALIZADO' },
        orderBy: { finishedAt: 'desc' },
        take: 1,
      },
    },
  });

  for (const cliente of clientes) {
    const ultima = cliente.attendances[0]?.finishedAt;
    if (!ultima) continue;
    const dias = diasDesde(ultima);
    if (dias < 100) continue;

    alertas.push({
      id: `retorno-${cliente.id}`,
      tipo: 'retorno',
      titulo: `${cliente.name} sumiu`,
      detalhe: `última visita há ${Math.floor(dias / 30)} meses`,
      href: `/painel/clientes/${cliente.id}`,
    });
  }

  return alertas.slice(0, 4);
}

export async function atendimentoAberto(organizationId: string) {
  return prisma().attendance.findFirst({
    where: { organizationId, status: { in: ['ABERTO', 'AVALIACAO', 'EM_ANDAMENTO'] } },
    include: { client: true, items: true, timeEntries: true },
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Lista de clientes, **ordenada por quem precisa de ação**.
 *
 * Nunca alfabética: lista alfabética é banco de dados, esta é lista de
 * trabalho. Quem passou do retorno vem primeiro.
 */
export async function listaDeClientes(
  organizationId: string,
): Promise<ClienteDaLista[]> {
  const clientes = await prisma().client.findMany({
    where: { organizationId, deletedAt: null, mergedIntoId: null },
    include: {
      account: true,
      attendances: {
        where: { status: 'FINALIZADO' },
        orderBy: { finishedAt: 'desc' },
        take: 1,
        include: { items: true },
      },
    },
  });

  const lista = clientes.map((cliente): ClienteDaLista => {
    const ultima = cliente.attendances[0];
    const dias = ultima?.finishedAt ? diasDesde(ultima.finishedAt) : null;

    return {
      id: cliente.id,
      nome: cliente.name,
      ultimoServico: ultima?.items[0]?.name ?? null,
      ultimaVisitaDias: dias,
      retornoVencido: dias !== null && dias >= 100,
      temConta: cliente.account !== null,
      nova: cliente.origin === 'SELF_REGISTERED',
    };
  });

  return lista.sort((a, b) => {
    if (a.retornoVencido !== b.retornoVencido) return a.retornoVencido ? -1 : 1;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

export async function fichaDaCliente(
  organizationId: string,
  clientId: string,
): Promise<FichaDaCliente | null> {
  const cliente = await prisma().client.findFirst({
    where: { id: clientId, organizationId, deletedAt: null },
    include: {
      account: true,
      attendances: {
        where: { status: 'FINALIZADO' },
        orderBy: { finishedAt: 'desc' },
        include: { items: true, assessment: true, timeEntries: true },
      },
    },
  });

  if (!cliente) return null;

  const visitas = cliente.attendances.map((atendimento) => {
    const minutos = atendimento.timeEntries.reduce((total, entrada) => {
      if (!entrada.endedAt) return total;
      return total + (entrada.endedAt.getTime() - entrada.startedAt.getTime()) / 60_000;
    }, 0);

    return {
      id: atendimento.id,
      data: atendimento.finishedAt ?? atendimento.startedAt,
      servicos:
        atendimento.items
          .filter((item) => item.parentId === null)
          .map((item) => item.name)
          .join(' + ') || 'Sem serviço',
      duracaoMin: minutos > 0 ? Math.round(minutos) : null,
      valorCents: atendimento.items
        .filter((item) => item.parentId === null)
        .reduce((total, item) => total + item.unitPriceCents, 0),
    };
  });

  // O alerta de química vem da anamnese mais recente que registrou química —
  // é o dado que ela busca antes de aplicar qualquer coisa.
  const comQuimica = cliente.attendances.find((a) => a.assessment?.hasChemistry);

  const duracoes = visitas.filter((v) => v.duracaoMin !== null);

  return {
    id: cliente.id,
    nome: cliente.name,
    telefone: cliente.phone,
    curvatura: cliente.curvature,
    temConta: cliente.account !== null,
    quimica: comQuimica?.assessment
      ? {
          produto: comQuimica.assessment.previousProduct,
          quando: comQuimica.finishedAt,
        }
      : null,
    totalVisitas: visitas.length,
    totalGastoCents: visitas.reduce((total, visita) => total + visita.valorCents, 0),
    duracaoMediaMin: duracoes.length
      ? Math.round(
          duracoes.reduce((t, v) => t + (v.duracaoMin ?? 0), 0) / duracoes.length,
        )
      : null,
    visitas,
  };
}

/* ----------------------------------------------------------------- Estoque */

/**
 * Produtos com o saldo calculado, na ordem de trabalho: quem está acabando
 * primeiro. O alerta fala em **atendimentos restantes**, nunca em quantidade.
 */
export async function produtosDoEstoque(
  organizationId: string,
): Promise<ProdutoDoEstoque[]> {
  const produtos = await prisma().product.findMany({
    where: { organizationId, active: true },
    include: { movements: true },
    orderBy: { name: 'asc' },
  });

  return produtos
    .map((produto) => {
      const saldoMilli = produto.movements.reduce(
        (total, movimento) => total + movimento.quantityMilli,
        0,
      );
      const rendimento = produto.yieldPerUnit ?? 10;
      const aplicacoes = Math.floor((saldoMilli / 1000) * rendimento);

      return {
        id: produto.id,
        name: produto.name,
        brand: produto.brand,
        unit: produto.unit.toLowerCase(),
        unitCostCents: produto.unitCostCents,
        saldo: formatarSaldo(saldoMilli),
        aplicacoes,
        critico: aplicacoes <= 4,
        zerado: aplicacoes <= 0,
      };
    })
    .sort((a, b) => {
      if (a.critico !== b.critico) return a.critico ? -1 : 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
}

/**
 * Compra registrada: entra no estoque com o custo do momento, e o custo atual
 * do produto acompanha a última compra — é ele que o próximo atendimento vai
 * usar para calcular o custo real.
 */
export async function registrarCompra(
  organizationId: string,
  input: {
    readonly productId: string;
    readonly quantityUnits: number;
    readonly unitCostCents: number;
  },
): Promise<EscritaResultado> {
  const produto = await prisma().product.findFirst({
    where: { id: input.productId, organizationId, active: true },
    select: { id: true },
  });
  if (produto === null) return { ok: false, erro: 'Produto não encontrado.' };

  // O custo atual só acompanha a compra quando ela tem custo informado: um
  // zero digitado (ou produto comprado sem preço) não pode apagar o custo
  // registrado — senão o próximo atendimento calcularia lucro inflado.
  await prisma().$transaction([
    prisma().stockMovement.create({
      data: {
        productId: input.productId,
        quantityMilli: input.quantityUnits * 1000,
        reason: 'PURCHASE',
        unitCostCents: input.unitCostCents,
      },
    }),
    ...(input.unitCostCents > 0
      ? [
          prisma().product.update({
            where: { id: input.productId },
            data: { unitCostCents: input.unitCostCents },
          }),
        ]
      : []),
  ]);

  return { ok: true };
}

export async function criarProduto(
  organizationId: string,
  input: {
    readonly name: string;
    readonly brand: string | null;
    readonly category: string;
    readonly unit: Unidade;
    readonly unitCostCents: number;
    readonly yieldPerUnit: number | null;
  },
): Promise<EscritaResultado> {
  await prisma().product.create({
    data: {
      organizationId,
      name: input.name,
      brand: input.brand,
      category: input.category,
      unit: input.unit,
      unitCostCents: input.unitCostCents,
      yieldPerUnit: input.yieldPerUnit,
    },
  });
  return { ok: true };
}

/* --------------------------------------------------------------- Financeiro */

/**
 * O mês resolvido para a tela Dinheiro: sobrou, entrou, produto e despesas.
 *
 * Entrou = transações RECEITA (dinheiro recebido, DEC-018). Produto = compras
 * do mês. Despesas = transações DESPESA manuais. Sobrou é o que sobra das
 * três — a mesma hierarquia da tela Hoje, no tamanho do mês.
 */
export async function resumoDoMes(
  organizationId: string,
  bounds: { readonly start: Date; readonly end: Date },
): Promise<ResumoDoMes> {
  const [transacoes, compras, atendimentos] = await Promise.all([
    prisma().transaction.findMany({
      where: {
        organizationId,
        businessDay: { gte: bounds.start, lt: bounds.end },
      },
    }),
    prisma().stockMovement.findMany({
      where: {
        reason: 'PURCHASE',
        createdAt: { gte: bounds.start, lt: bounds.end },
        product: { organizationId },
      },
    }),
    prisma().attendance.findMany({
      where: {
        organizationId,
        status: 'FINALIZADO',
        finishedAt: { gte: bounds.start, lt: bounds.end },
      },
      include: { usages: true },
    }),
  ]);

  let entrou = 0;
  let despesas = 0;
  for (const transacao of transacoes) {
    if (transacao.kind === 'RECEITA') entrou += transacao.amountCents;
    else despesas += transacao.amountCents;
  }

  const produtoCents = compras.reduce(
    (total, compra) =>
      total + Math.round((compra.quantityMilli * compra.unitCostCents) / 1000),
    0,
  );

  const custoProduto = atendimentos.reduce(
    (total, atendimento) =>
      total +
      atendimento.usages.reduce(
        (soma, uso) =>
          soma + Math.round((uso.quantityMilli * uso.unitCostCents) / 1000),
        0,
      ),
    0,
  );

  return {
    sobrouCents: entrou - produtoCents - despesas,
    entrouCents: entrou,
    produtoCents,
    despesasCents: despesas,
    atendimentos: atendimentos.length,
    custoPorAtendimentoCents: atendimentos.length
      ? Math.round(custoProduto / atendimentos.length)
      : 0,
  };
}

export async function transacoesDoMes(
  organizationId: string,
  bounds: { readonly start: Date; readonly end: Date },
): Promise<TransacaoDoMes[]> {
  const transacoes = await prisma().transaction.findMany({
    where: {
      organizationId,
      businessDay: { gte: bounds.start, lt: bounds.end },
    },
    include: {
      attendance: {
        include: { client: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ businessDay: 'desc' }, { createdAt: 'desc' }],
  });

  return transacoes.map((transacao) => ({
    id: transacao.id,
    kind: transacao.kind,
    category: transacao.category,
    amountCents: transacao.amountCents,
    description: transacao.description,
    businessDay: transacao.businessDay,
    origem: transacao.attendance
      ? {
          type: 'atendimento',
          clientId: transacao.attendance.client.id,
          clientName: transacao.attendance.client.name,
        }
      : { type: 'manual' },
  }));
}

/**
 * A receber: pagamentos fiados ainda não recebidos, do mais antigo para o
 * mais novo — a dívida velha é a que mais merece o toque.
 */
export async function fiadosAbertos(organizationId: string): Promise<FiadoAberto[]> {
  const pagamentos = await prisma().payment.findMany({
    where: {
      paidAt: null,
      attendance: { organizationId, status: 'FINALIZADO' },
    },
    include: {
      attendance: {
        include: {
          client: { select: { id: true, name: true } },
          items: true,
        },
      },
    },
    orderBy: { attendance: { startedAt: 'asc' } },
  });

  return pagamentos.map((pagamento) => ({
    paymentId: pagamento.id,
    attendanceId: pagamento.attendanceId,
    clientId: pagamento.attendance.client.id,
    clientName: pagamento.attendance.client.name,
    amountCents: pagamento.amountCents,
    data: pagamento.attendance.finishedAt ?? pagamento.attendance.startedAt,
    servico:
      pagamento.attendance.items
        .filter((item) => item.parentId === null)
        .map((item) => item.name)
        .join(' + ') || 'Sem serviço',
  }));
}

/**
 * Recebe um fiado: o pagamento ganha a data de recebimento e o caixa ganha a
 * receita — DEC-018. Fiado só vira "sobrou" no dia em que o dinheiro entrou.
 */
export async function receberFiado(
  organizationId: string,
  paymentId: string,
): Promise<EscritaResultado> {
  const pagamento = await prisma().payment.findFirst({
    where: {
      id: paymentId,
      paidAt: null,
      attendance: { organizationId },
    },
    include: {
      attendance: { include: { client: { select: { name: true } } } },
    },
  });
  if (pagamento === null) {
    return { ok: false, erro: 'Cobrança não encontrada ou já recebida.' };
  }

  const agora = new Date();
  await prisma().$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { paidAt: agora },
    });
    await tx.transaction.create({
      data: {
        organizationId,
        attendanceId: pagamento.attendanceId,
        kind: 'RECEITA',
        category: 'fiado',
        amountCents: pagamento.amountCents,
        businessDay: new Date(`${businessDay(agora, FUSO)}T00:00:00.000Z`),
        description: `Fiado recebido · ${pagamento.attendance.client.name}`,
      },
    });
  });

  return { ok: true };
}

/** Despesa manual: sai do caixa, entra no livro com o dia de hoje. */
export async function lancarDespesa(
  organizationId: string,
  input: {
    readonly category: string;
    readonly amountCents: number;
    readonly description: string | null;
  },
): Promise<EscritaResultado> {
  const hoje = businessDay(new Date(), FUSO);
  await prisma().transaction.create({
    data: {
      organizationId,
      kind: 'DESPESA',
      category: input.category,
      amountCents: input.amountCents,
      businessDay: new Date(`${hoje}T00:00:00.000Z`),
      description: input.description,
    },
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ Cliente */

export async function criarCliente(
  organizationId: string,
  input: {
    readonly name: string;
    readonly phone: string | null;
    readonly curvature: Curvatura | null;
  },
): Promise<EscritaResultado> {
  const criado = await prisma().client.create({
    data: {
      organizationId,
      name: input.name,
      phone: input.phone,
      curvature: input.curvature,
      origin: 'CREATED_BY_STAFF',
    },
    select: { id: true },
  });
  return { ok: true, id: criado.id };
}

/* --------------------------------------------------------------- Agendamento */

export async function opcoesParaAgendar(
  organizationId: string,
): Promise<OpcoesParaAgendar> {
  const [clientes, servicos] = await Promise.all([
    prisma().client.findMany({
      where: { organizationId, deletedAt: null, mergedIntoId: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma().service.findMany({
      where: { organizationId, active: true, parentId: null },
      select: { id: true, name: true, durationMin: true, priceCents: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { clients: clientes, services: servicos };
}

/**
 * Cria o agendamento com checagem de conflito amigável.
 *
 * A constraint `EXCLUDE USING gist` no banco é a garantia final (INV-01); esta
 * checagem é a que devolve uma frase em vez de erro de banco. A action que
 * chama isto também captura o erro da constraint como rede de segurança.
 */
export async function criarAgendamento(
  organizationId: string,
  input: {
    readonly clientId: string;
    readonly serviceId: string | null;
    readonly startsAt: Date;
    readonly endsAt: Date;
  },
): Promise<EscritaResultado> {
  // A cliente e o serviço vêm do formulário; os dois precisam ser da mesma
  // organização da sessão. A FK só confere existência da linha, não o escopo —
  // sem esta checagem, um POST forjado agendaria contra a ficha de outra
  // organização (a mesma regra de `registrarCompra` e `receberFiado`).
  const cliente = await prisma().client.findFirst({
    where: { id: input.clientId, organizationId, deletedAt: null, mergedIntoId: null },
    select: { id: true },
  });
  if (cliente === null) return { ok: false, erro: 'Cliente não encontrada.' };

  if (input.serviceId !== null) {
    const servico = await prisma().service.findFirst({
      where: { id: input.serviceId, organizationId, active: true },
      select: { id: true },
    });
    if (servico === null) return { ok: false, erro: 'Serviço não encontrado.' };
  }

  const conflito = await prisma().appointment.findFirst({
    where: {
      organizationId,
      status: { notIn: ['CANCELADO', 'FALTOU'] },
      startsAt: { lt: input.endsAt },
      endsAt: { gt: input.startsAt },
    },
    select: { id: true },
  });
  if (conflito !== null) {
    return { ok: false, erro: 'Esse horário já está ocupado. Escolha outro.' };
  }

  const criado = await prisma().appointment.create({
    data: {
      organizationId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: 'AGENDADO',
    },
    select: { id: true },
  });
  return { ok: true, id: criado.id };
}
