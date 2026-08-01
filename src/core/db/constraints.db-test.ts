import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPrismaClient } from './client';
import type { PrismaClient } from './generated/client';

/**
 * As garantias que só o BANCO pode dar.
 *
 * Roda na suíte `db`, contra um Postgres 18 efêmero levantado pelo CI. Está
 * separada da suíte `domain` de propósito: aquela precisa terminar em menos de
 * dois segundos e não pode depender de rede.
 *
 * O que se testa aqui não é o Prisma — é o SQL escrito à mão na migration.
 * Validação na aplicação é UX; **garantia é do banco**, e a diferença entre as
 * duas só aparece sob concorrência.
 */

const url = process.env.DATABASE_URL;

// Sem banco, a suíte inteira é pulada em vez de falhar: na máquina do dono só
// roda `npm run dev`, e quebrar o comando de teste local não ajudaria ninguém.
const suite = url ? describe : describe.skip;

let db: PrismaClient;
let organizationId: string;
let clientId: string;

const at = (iso: string) => new Date(iso);

async function newAppointment(start: string, end: string, status = 'AGENDADO') {
  return db.appointment.create({
    data: {
      organizationId,
      clientId,
      startsAt: at(start),
      endsAt: at(end),
      status: status as 'AGENDADO',
    },
  });
}

suite('Constraints do banco', () => {
  beforeAll(async () => {
    db = createPrismaClient(url ?? '');

    const org = await db.organization.create({ data: { name: 'Teste' } });
    organizationId = org.id;

    const client = await db.client.create({
      data: { organizationId, name: 'Cliente de teste' },
    });
    clientId = client.id;
  });

  afterAll(async () => {
    if (!db) return;
    await db.organization.deleteMany({ where: { id: organizationId } });
    await db.$disconnect();
  });

  describe('uuidv7() nativo do Postgres 18', () => {
    it('gera id sem a aplicação precisar informar', async () => {
      const org = await db.organization.create({ data: { name: 'Sem id' } });
      expect(org.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/i);
      await db.organization.delete({ where: { id: org.id } });
    });

    it('é ordenável por tempo — a razão de escolher v7 e não v4', async () => {
      const primeiro = await db.organization.create({ data: { name: 'A' } });
      const segundo = await db.organization.create({ data: { name: 'B' } });

      // Localidade de índice de inteiro sequencial, sem expor volume de negócio
      expect(primeiro.id < segundo.id).toBe(true);

      await db.organization.deleteMany({
        where: { id: { in: [primeiro.id, segundo.id] } },
      });
    });
  });

  describe('INV-01 · agendamentos não se sobrepõem', () => {
    it('recusa sobreposição parcial', async () => {
      const primeiro = await newAppointment(
        '2027-01-04T12:00:00Z',
        '2027-01-04T14:00:00Z',
      );

      await expect(
        newAppointment('2027-01-04T13:00:00Z', '2027-01-04T15:00:00Z'),
      ).rejects.toThrow();

      await db.appointment.delete({ where: { id: primeiro.id } });
    });

    it('ACEITA quando um termina onde o outro começa', async () => {
      // Semântica `[)`. Sem isso, agendar de hora em hora seria impossível —
      // e precisa bater com `overlaps()` em core/kernel/time.ts.
      const primeiro = await newAppointment(
        '2027-01-05T09:00:00Z',
        '2027-01-05T10:00:00Z',
      );
      const segundo = await newAppointment(
        '2027-01-05T10:00:00Z',
        '2027-01-05T11:00:00Z',
      );

      expect(segundo.id).toBeTruthy();
      await db.appointment.deleteMany({
        where: { id: { in: [primeiro.id, segundo.id] } },
      });
    });

    it('cancelado e falta liberam o horário', async () => {
      const cancelado = await newAppointment(
        '2027-01-06T09:00:00Z',
        '2027-01-06T11:00:00Z',
        'CANCELADO',
      );
      const novo = await newAppointment('2027-01-06T09:00:00Z', '2027-01-06T11:00:00Z');

      expect(novo.id).toBeTruthy();
      await db.appointment.deleteMany({
        where: { id: { in: [cancelado.id, novo.id] } },
      });
    });

    it('sob corrida, exatamente uma das duas passa', async () => {
      // O teste que justifica a constraint existir. A checagem na aplicação
      // não protege daqui: as duas leriam "livre" antes de qualquer escrita.
      const resultados = await Promise.allSettled([
        newAppointment('2027-02-01T09:00:00Z', '2027-02-01T11:00:00Z'),
        newAppointment('2027-02-01T10:00:00Z', '2027-02-01T12:00:00Z'),
      ]);

      const aceitos = resultados.filter((r) => r.status === 'fulfilled');
      expect(aceitos).toHaveLength(1);

      await db.appointment.deleteMany({ where: { organizationId } });
    });
  });

  describe('INV-03 · cpf_hash único por organização, só quando existe', () => {
    it('recusa o mesmo cpf_hash duas vezes na mesma organização', async () => {
      const primeira = await db.client.create({
        data: { organizationId, name: 'Primeira', cpfHash: 'hash-repetido' },
      });

      await expect(
        db.client.create({
          data: { organizationId, name: 'Segunda', cpfHash: 'hash-repetido' },
        }),
      ).rejects.toThrow();

      await db.client.delete({ where: { id: primeira.id } });
    });

    it('ACEITA várias fichas sem CPF — é o caso normal (D-07)', async () => {
      const fichas = await Promise.all([
        db.client.create({ data: { organizationId, name: 'Sem CPF 1' } }),
        db.client.create({ data: { organizationId, name: 'Sem CPF 2' } }),
        db.client.create({ data: { organizationId, name: 'Sem CPF 3' } }),
      ]);

      expect(fichas).toHaveLength(3);
      await db.client.deleteMany({ where: { id: { in: fichas.map((f) => f.id) } } });
    });
  });

  describe('INV-07 · um só intervalo de cronômetro aberto', () => {
    it('recusa dois intervalos abertos no mesmo atendimento', async () => {
      const atendimento = await db.attendance.create({
        data: { organizationId, clientId },
      });

      await db.timeEntry.create({
        data: { attendanceId: atendimento.id, startedAt: at('2027-01-07T12:00:00Z') },
      });

      // Duas abas no mesmo atendimento passariam pela aplicação; aqui não passam
      await expect(
        db.timeEntry.create({
          data: { attendanceId: atendimento.id, startedAt: at('2027-01-07T12:30:00Z') },
        }),
      ).rejects.toThrow();

      await db.attendance.delete({ where: { id: atendimento.id } });
    });
  });

  describe('INV-19 · item filho não carrega preço', () => {
    it('recusa preço em item com pai', async () => {
      const atendimento = await db.attendance.create({
        data: { organizationId, clientId },
      });
      const service = await db.service.create({
        data: { organizationId, name: 'Escova com nutrição', priceCents: 9000 },
      });
      const pai = await db.attendanceItem.create({
        data: {
          attendanceId: atendimento.id,
          serviceId: service.id,
          name: 'Escova com nutrição',
          unitPriceCents: 9000,
        },
      });

      await expect(
        db.attendanceItem.create({
          data: {
            attendanceId: atendimento.id,
            parentId: pai.id,
            serviceId: service.id,
            name: 'Nutrição',
            unitPriceCents: 5000,
          },
        }),
      ).rejects.toThrow();

      await db.attendance.delete({ where: { id: atendimento.id } });
      await db.service.delete({ where: { id: service.id } });
    });
  });

  describe('Sanidade de intervalo', () => {
    it('recusa agendamento que termina antes de começar', async () => {
      await expect(
        newAppointment('2027-01-08T14:00:00Z', '2027-01-08T12:00:00Z'),
      ).rejects.toThrow();
    });
  });
});
