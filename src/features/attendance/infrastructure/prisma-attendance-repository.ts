import { moneyOf } from '@/core/kernel/money';
import { prisma } from '@/core/db/client';

import type {
  AttendanceRepository,
  AttendanceScreen,
  ProductOption,
} from '../application/attendance-repository';
import type { Attendance } from '../domain/attendance';

/**
 * Persistência do atendimento.
 *
 * Duas coisas merecem atenção aqui:
 *
 * 1. **`load` devolve o agregado inteiro numa consulta.** A tela do atendimento
 *    é usada com as mãos ocupadas; ida e volta ao banco por seção seria latência
 *    somada onde ela menos pode esperar.
 * 2. **`finalize` é uma transação.** Estoque, caixa e histórico entram juntos ou
 *    não entram (INV-09). Sem isso, uma falha no meio deixaria produto baixado
 *    sem receita lançada — e o número que ela mais confia passaria a mentir.
 */

export const attendanceRepository: AttendanceRepository = {
  async load(organizationId, attendanceId) {
    const row = await prisma().attendance.findFirst({
      where: { id: attendanceId, organizationId },
      include: {
        client: { select: { id: true, name: true } },
        assessment: true,
        items: true,
        usages: true,
        timeEntries: { orderBy: { startedAt: 'asc' } },
        payments: true,
      },
    });

    if (row === null) return null;

    const [catalogo, produtos] = await Promise.all([
      prisma().service.findMany({
        where: { organizationId, active: true, parentId: null },
        orderBy: { name: 'asc' },
      }),
      prisma().product.findMany({
        where: { organizationId, active: true },
        orderBy: { name: 'asc' },
        include: { serviceUse: true },
      }),
    ]);

    const servicosEscolhidos = new Set(row.items.map((item) => item.serviceId));

    const attendance: Attendance = {
      id: row.id,
      organizationId: row.organizationId,
      clientId: row.clientId,
      appointmentId: row.appointmentId,
      status: row.status,
      courtesy: row.courtesy,
      finishedAt: row.finishedAt,
      assessment: row.assessment && {
        hasChemistry: row.assessment.hasChemistry,
        previousProduct: row.assessment.previousProduct,
        lastStraightenedAt: row.assessment.lastStraightenedAt,
        isBreaking: row.assessment.isBreaking,
        isFalling: row.assessment.isFalling,
        strandTestResult: row.assessment.strandTestResult,
        strandTestedAt: row.assessment.strandTestedAt,
      },
      items: row.items.map((item) => ({
        id: item.id,
        parentId: item.parentId,
        serviceId: item.serviceId,
        name: item.name,
        unitPriceCents: moneyOf(item.unitPriceCents),
      })),
      productUsages: row.usages.map((uso) => ({
        productId: uso.productId,
        quantityMilli: uso.quantityMilli,
        unitCostCents: moneyOf(uso.unitCostCents),
        fromStrandTest: uso.fromStrandTest,
      })),
      timeEntries: row.timeEntries.map((entry) => ({
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
      })),
      payments: row.payments.map((pagamento) => ({
        method: pagamento.method,
        amountCents: moneyOf(pagamento.amountCents),
        paidAt: pagamento.paidAt,
      })),
    };

    const opcoesDeProduto: ProductOption[] = produtos.map((produto) => {
      const uso = produto.serviceUse.find((u) => servicosEscolhidos.has(u.serviceId));
      return {
        id: produto.id,
        name: produto.name,
        brand: produto.brand,
        unit: produto.unit,
        unitCostCents: produto.unitCostCents,
        suggestedQuantityMilli: uso?.quantityMilli ?? null,
      };
    });

    return {
      attendance,
      clientId: row.client.id,
      clientName: row.client.name,
      catalog: catalogo.map((servico) => ({
        id: servico.id,
        name: servico.name,
        priceCents: servico.priceCents,
        durationMin: servico.durationMin,
        isChemical: servico.isChemical,
      })),
      products: opcoesDeProduto,
      suggestion: await sugestaoDeAnamnese(organizationId, row.clientId, row.id),
      hasChemicalService: catalogo.some(
        (servico) => servico.isChemical && servicosEscolhidos.has(servico.id),
      ),
    } satisfies AttendanceScreen;
  },

  async findOpenForClient(organizationId, clientId) {
    const aberto = await prisma().attendance.findFirst({
      where: {
        organizationId,
        clientId,
        status: { in: ['ABERTO', 'AVALIACAO', 'EM_ANDAMENTO'] },
      },
      orderBy: { startedAt: 'desc' },
      select: { id: true },
    });
    return aberto?.id ?? null;
  },

  async open({ organizationId, clientId, appointmentId }) {
    const criado = await prisma().attendance.create({
      data: { organizationId, clientId, appointmentId },
      select: { id: true },
    });
    return criado.id;
  },

  async replaceItems(attendanceId, items) {
    await prisma().$transaction([
      prisma().attendanceItem.deleteMany({ where: { attendanceId } }),
      prisma().attendanceItem.createMany({
        data: items.map((item) => ({
          attendanceId,
          serviceId: item.serviceId,
          name: item.name,
          unitPriceCents: item.unitPriceCents,
        })),
      }),
    ]);
  },

  async replaceUsages(attendanceId, usages) {
    await prisma().$transaction([
      prisma().productUsage.deleteMany({ where: { attendanceId } }),
      prisma().productUsage.createMany({
        data: usages.map((uso) => ({ attendanceId, ...uso })),
      }),
    ]);
  },

  async saveAssessment(attendanceId, assessment) {
    const dados = {
      hasChemistry: assessment.hasChemistry,
      previousProduct: assessment.previousProduct,
      lastStraightenedAt: assessment.lastStraightenedAt,
      isBreaking: assessment.isBreaking,
      isFalling: assessment.isFalling,
      strandTestResult: assessment.strandTestResult,
      strandTestedAt: assessment.strandTestedAt,
    };

    await prisma().hairAssessment.upsert({
      where: { attendanceId },
      create: { attendanceId, ...dados },
      update: dados,
    });
  },

  async setStatus(attendanceId, status) {
    await prisma().attendance.update({ where: { id: attendanceId }, data: { status } });
  },

  async openTimeEntry(attendanceId, at) {
    await prisma().timeEntry.create({ data: { attendanceId, startedAt: at } });
  },

  async closeOpenTimeEntries(attendanceId, at) {
    await prisma().timeEntry.updateMany({
      where: { attendanceId, endedAt: null },
      data: { endedAt: at },
    });
  },

  async finalize(input) {
    const usages = await prisma().productUsage.findMany({
      where: { attendanceId: input.attendanceId },
    });

    await prisma().$transaction(async (tx) => {
      await tx.timeEntry.updateMany({
        where: { attendanceId: input.attendanceId, endedAt: null },
        data: { endedAt: input.at },
      });

      await tx.attendance.update({
        where: { id: input.attendanceId },
        data: {
          status: input.status,
          courtesy: input.courtesy,
          finishedAt: input.at,
        },
      });

      if (input.payment !== null) {
        await tx.payment.create({
          data: { attendanceId: input.attendanceId, ...input.payment },
        });
      }

      // Baixa de estoque: negativa, com o custo do momento. A tabela é
      // append-only — o saldo é a soma, nunca um campo que alguém sobrescreve.
      if (usages.length > 0) {
        await tx.stockMovement.createMany({
          data: usages.map((uso) => ({
            productId: uso.productId,
            attendanceId: input.attendanceId,
            quantityMilli: -uso.quantityMilli,
            reason: 'USAGE' as const,
            unitCostCents: uso.unitCostCents,
          })),
        });
      }

      if (input.revenueCents > 0) {
        await tx.transaction.create({
          data: {
            organizationId: input.organizationId,
            attendanceId: input.attendanceId,
            kind: 'RECEITA',
            category: 'servico',
            amountCents: input.revenueCents,
            businessDay: new Date(`${input.businessDay}T00:00:00.000Z`),
            description: input.description,
          },
        });
      }

      if (input.appointmentId !== undefined && input.appointmentId !== null) {
        await tx.appointment.update({
          where: { id: input.appointmentId },
          data: { status: 'CONCLUIDO' },
        });
      }
    });
  },
};

/**
 * 🗣️ "Pré-preenchidas pelo histórico — para uma cliente conhecida ela confere em
 * vez de digitar."
 *
 * Busca a última anamnese **de outro atendimento** da mesma cliente. É o que
 * transforma cinco perguntas em cinco confirmações, e é também o que evita
 * sobrepor química incompatível por esquecimento.
 */
async function sugestaoDeAnamnese(
  organizationId: string,
  clientId: string,
  attendanceIdAtual: string,
) {
  const anterior = await prisma().hairAssessment.findFirst({
    where: {
      attendance: { organizationId, clientId, id: { not: attendanceIdAtual } },
    },
    orderBy: { createdAt: 'desc' },
    include: { attendance: { select: { finishedAt: true, startedAt: true } } },
  });

  if (anterior === null) {
    return {
      hasChemistry: false,
      previousProduct: null,
      lastStraightenedAt: null,
      source: null,
    };
  }

  const quando = anterior.attendance.finishedAt ?? anterior.attendance.startedAt;

  return {
    hasChemistry: anterior.hasChemistry,
    previousProduct: anterior.previousProduct,
    lastStraightenedAt: anterior.lastStraightenedAt,
    source: new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(quando),
  };
}
