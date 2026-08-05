import { createHmac } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/core/db/generated/client';
import { loadEnvLocal } from './load-env';
import { SEED_PRODUTOS, SEED_SERVICES } from './seed-catalog';

loadEnvLocal();

/**
 * Popula o banco com a organização da Roziele e dados realistas.
 *
 * Idempotente: roda quantas vezes for preciso sem duplicar nada. É o que
 * permite rodá-lo contra produção sem medo enquanto não há dado de verdade.
 */

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL ausente.');

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const HASH_SECRET = process.env.CPF_HASH_SECRET ?? 'semente-local-sem-valor-real-0001';
const hashCpf = (digits: string) =>
  createHmac('sha256', HASH_SECRET).update(digits).digest('hex');

/** Datas relativas a hoje, para a agenda nunca aparecer vazia. */
function today(hour: number, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function daysAgo(days: number, hour = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const organization =
    (await db.organization.findFirst({ where: { name: 'Roziele Hair' } })) ??
    (await db.organization.create({ data: { name: 'Roziele Hair' } }));

  const organizationId = organization.id;
  console.log(`Organização: ${organization.name}`);

  /* ---------------------------------------------------------- catálogo */

  const services = new Map<string, string>();
  for (const seed of SEED_SERVICES.filter((s) => s.suggested)) {
    const existing = await db.service.findFirst({
      where: { organizationId, name: seed.name },
    });
    const service =
      existing ??
      (await db.service.create({
        data: {
          organizationId,
          name: seed.name,
          isChemical: seed.isChemical,
          priceCents: seed.priceCents,
          durationMin: seed.durationMin,
        },
      }));
    services.set(seed.slug, service.id);
  }

  const products = new Map<string, string>();
  for (const seed of SEED_PRODUTOS.slice(0, 4)) {
    const existing = await db.product.findFirst({
      where: { organizationId, name: seed.name },
    });
    const product =
      existing ??
      (await db.product.create({
        data: {
          organizationId,
          name: seed.name,
          brand: seed.brand,
          category: seed.category,
          unit: seed.unit,
          unitCostCents: seed.slug === 'progressiva' ? 8900 : 4200,
          yieldPerUnit: seed.yieldPerUnit,
        },
      }));
    products.set(seed.slug, product.id);
  }

  /**
   * Estoque inicial, convergindo para um alvo em vez de criar uma vez só.
   *
   * O saldo é a soma das movimentações (nunca um campo mutável), então "ajustar
   * o estoque" é lançar a diferença — que é exatamente o que a profissional faz
   * na vida real quando confere a prateleira.
   *
   * A progressiva entra baixa de propósito: rende 8 aplicações por frasco, e
   * 0,25 frasco dá ~2 atendimentos. É o que faz o alerta de "produto acabando"
   * aparecer na tela Hoje em vez de ficar teórico.
   */
  const ALVO_MILLI: Record<string, number> = { progressiva: 250 };

  for (const [slug, productId] of products) {
    const alvo = ALVO_MILLI[slug] ?? 3000;
    const movimentos = await db.stockMovement.findMany({ where: { productId } });
    const saldo = movimentos.reduce((total, m) => total + m.quantityMilli, 0);
    if (saldo === alvo) continue;

    await db.stockMovement.create({
      data: {
        productId,
        quantityMilli: alvo - saldo,
        reason: movimentos.length === 0 ? 'PURCHASE' : 'ADJUSTMENT',
        unitCostCents: slug === 'progressiva' ? 8900 : 4200,
      },
    });
  }

  /* ----------------------------------------------------------- clientes */

  const CLIENTES = [
    {
      name: 'Carla Menezes',
      cpf: '52998224725',
      phone: '+5511987654321',
      curvature: 'CACHEADO' as const,
      visitas: 8,
    },
    {
      name: 'Juliana Alves',
      cpf: null,
      phone: '+5511988887777',
      curvature: 'ONDULADO' as const,
      visitas: 12,
    },
    {
      name: 'Márcia Lima',
      cpf: null,
      phone: '+5511977776666',
      curvature: 'LISO' as const,
      visitas: 5,
    },
    {
      name: 'Ana Beatriz',
      cpf: null,
      phone: '+5511966665555',
      curvature: 'CACHEADO' as const,
      visitas: 3,
    },
    {
      name: 'Paula Souza',
      cpf: null,
      phone: '+5511955554444',
      curvature: 'CRESPO' as const,
      visitas: 6,
    },
    {
      name: 'Denise Rocha',
      cpf: '11144477735',
      phone: '+5511944443333',
      curvature: 'CACHEADO' as const,
      visitas: 0,
    },
  ];

  const clients = new Map<string, string>();
  for (const seed of CLIENTES) {
    const existing = await db.client.findFirst({
      where: { organizationId, name: seed.name },
    });
    const client =
      existing ??
      (await db.client.create({
        data: {
          organizationId,
          name: seed.name,
          cpfHash: seed.cpf ? hashCpf(seed.cpf) : null,
          phone: seed.phone,
          curvature: seed.curvature,
          origin: seed.name === 'Denise Rocha' ? 'SELF_REGISTERED' : 'CREATED_BY_STAFF',
        },
      }));
    clients.set(seed.name, client.id);
  }

  /* -------------------------------------------------------- histórico */

  const progressivaId = services.get('progressiva');
  const escovaId = services.get('escova');
  const carlaId = clients.get('Carla Menezes');
  const marciaId = clients.get('Márcia Lima');

  const jaTemHistorico = await db.attendance.findFirst({ where: { organizationId } });

  if (!jaTemHistorico && progressivaId && carlaId && marciaId && escovaId) {
    // Carla: progressiva há 3 meses — é ela que dispara o "hora de voltar"
    const carlaAtendimento = await db.attendance.create({
      data: {
        organizationId,
        clientId: carlaId,
        status: 'FINALIZADO',
        startedAt: daysAgo(92, 9),
        finishedAt: daysAgo(92, 12),
        assessment: {
          create: {
            hasChemistry: true,
            previousProduct: 'Let Me Be',
            lastStraightenedAt: daysAgo(180),
            strandTestResult: 'PASSED',
            strandTestedAt: daysAgo(92, 9),
          },
        },
        items: {
          create: {
            serviceId: progressivaId,
            name: 'Progressiva',
            unitPriceCents: 22000,
          },
        },
        payments: {
          create: { method: 'PIX', amountCents: 22000, paidAt: daysAgo(92, 12) },
        },
        timeEntries: {
          create: { startedAt: daysAgo(92, 9), endedAt: daysAgo(92, 12) },
        },
      },
    });

    await db.transaction.create({
      data: {
        organizationId,
        attendanceId: carlaAtendimento.id,
        kind: 'RECEITA',
        category: 'Atendimento',
        amountCents: 22000,
        businessDay: daysAgo(92, 12),
      },
    });

    // Márcia sumiu: última visita há 4 meses
    await db.attendance.create({
      data: {
        organizationId,
        clientId: marciaId,
        status: 'FINALIZADO',
        startedAt: daysAgo(124, 14),
        finishedAt: daysAgo(124, 17),
        items: {
          create: {
            serviceId: progressivaId,
            name: 'Progressiva',
            unitPriceCents: 20000,
          },
        },
      },
    });

    // Alguns atendimentos deste mês, para o financeiro não ficar zerado
    for (const dia of [1, 3, 6, 9, 12]) {
      const atendimento = await db.attendance.create({
        data: {
          organizationId,
          clientId: clients.get('Ana Beatriz') ?? carlaId,
          status: 'FINALIZADO',
          startedAt: daysAgo(dia, 14),
          finishedAt: daysAgo(dia, 15),
          items: {
            create: { serviceId: escovaId, name: 'Escova', unitPriceCents: 4000 },
          },
          payments: {
            create: { method: 'PIX', amountCents: 4000, paidAt: daysAgo(dia, 15) },
          },
        },
      });
      await db.transaction.create({
        data: {
          organizationId,
          attendanceId: atendimento.id,
          kind: 'RECEITA',
          category: 'Atendimento',
          amountCents: 4000,
          businessDay: daysAgo(dia, 15),
        },
      });
    }
  }

  /* ----------------------------------------------------------- agenda */

  const jaTemAgenda = await db.appointment.findFirst({
    where: { organizationId, startsAt: { gte: today(0) } },
  });

  if (!jaTemAgenda && progressivaId && escovaId) {
    const juliana = clients.get('Juliana Alves');
    const denise = clients.get('Denise Rocha');

    if (juliana) {
      await db.appointment.create({
        data: {
          organizationId,
          clientId: juliana,
          serviceId: escovaId,
          startsAt: today(16),
          endsAt: today(16, 40),
          status: 'CONFIRMADO',
        },
      });
    }
    if (denise) {
      await db.appointment.create({
        data: {
          organizationId,
          clientId: denise,
          serviceId: progressivaId,
          startsAt: today(18, 30),
          endsAt: today(21),
          status: 'AGENDADO',
        },
      });
    }
  }

  console.log('Semente aplicada.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
