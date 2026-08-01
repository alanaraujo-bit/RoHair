import { prisma } from '@/core/db/client';

import type {
  AlertaDoDia,
  ClienteDaLista,
  FichaDaCliente,
  ItemDaAgenda,
  ResumoDoDia,
} from '../application/painel-queries';

/**
 * Leituras do painel, direto no Prisma.
 *
 * Enquanto a Fase 4 não traz sessão, a organização é resolvida por nome. É
 * temporário e está marcado como tal — quando houver login, sai daqui e vem do
 * contexto da requisição.
 */

const FUSO = 'America/Sao_Paulo';

export async function organizacaoAtual(): Promise<{ id: string; nome: string } | null> {
  const org = await prisma().organization.findFirst({ orderBy: { createdAt: 'asc' } });
  return org ? { id: org.id, nome: org.name } : null;
}

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
    if (!atendimento.courtesy) {
      // Só os itens de topo: em serviço composto o preço vive no pai (INV-19)
      for (const item of atendimento.items) {
        if (item.parentId === null) entrou += item.unitPriceCents;
      }
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
