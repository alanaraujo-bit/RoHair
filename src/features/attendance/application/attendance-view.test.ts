import { describe, expect, it } from 'vitest';

import { moneyOf } from '@/core/kernel/money';

import { openAttendance, type Attendance } from '../domain/attendance';
import type { AttendanceScreen } from './attendance-repository';
import { formatarDuracao, montarView } from './attendance-view';

const AGORA = new Date('2026-08-02T15:00:00Z');

function tela(attendance: Attendance): AttendanceScreen {
  return {
    attendance,
    clientId: 'cli-1',
    clientName: 'Denise',
    catalog: [],
    products: [],
    suggestion: {
      hasChemistry: false,
      previousProduct: null,
      lastStraightenedAt: null,
      source: null,
    },
    hasChemicalService: false,
  };
}

const base = (): Attendance =>
  openAttendance({ id: 'atd', organizationId: 'org', clientId: 'cli-1' });

describe('cronômetro', () => {
  it('o que vai para o cronômetro exclui o intervalo aberto', () => {
    // O `Timer` soma `agora − correndoDesde` ao valor que recebe. Se o valor já
    // contivesse o intervalo aberto, o mesmo tempo contaria duas vezes — foi o
    // que aconteceu em produção: 14:47 num atendimento de 8 minutos.
    const view = montarView(
      tela({
        ...base(),
        status: 'EM_ANDAMENTO',
        timeEntries: [
          {
            startedAt: new Date('2026-08-02T14:00:00Z'),
            endedAt: new Date('2026-08-02T14:30:00Z'),
          },
          { startedAt: new Date('2026-08-02T14:50:00Z'), endedAt: null },
        ],
      }),
      AGORA,
    );

    expect(view.acumuladoFechadoMs).toBe(30 * 60_000);
    expect(view.decorridoMs).toBe(40 * 60_000);
    expect(view.correndoDesde).toBe('2026-08-02T14:50:00.000Z');
    expect(view.emPausa).toBe(false);
  });

  it('pausado: os dois valores coincidem e não há de onde animar', () => {
    const view = montarView(
      tela({
        ...base(),
        status: 'EM_ANDAMENTO',
        timeEntries: [
          {
            startedAt: new Date('2026-08-02T14:00:00Z'),
            endedAt: new Date('2026-08-02T14:25:00Z'),
          },
        ],
      }),
      AGORA,
    );

    expect(view.acumuladoFechadoMs).toBe(view.decorridoMs);
    expect(view.correndoDesde).toBeNull();
    expect(view.emPausa).toBe(true);
  });
});

describe('números do atendimento', () => {
  const comValores = (): Attendance => ({
    ...base(),
    status: 'EM_ANDAMENTO',
    items: [
      {
        id: 'i1',
        parentId: null,
        serviceId: 'srv',
        name: 'Nutrição',
        unitPriceCents: moneyOf(5000),
      },
      // Filho de serviço composto: carrega custo, nunca preço (INV-19).
      {
        id: 'i2',
        parentId: 'i1',
        serviceId: 'srv-etapa',
        name: 'Etapa',
        unitPriceCents: moneyOf(0),
      },
    ],
    productUsages: [
      {
        productId: 'p1',
        quantityMilli: 1000,
        unitCostCents: moneyOf(4200),
        fromStrandTest: false,
      },
    ],
  });

  it('mostra só os itens de topo e o que sobrou', () => {
    const view = montarView(tela(comValores()), AGORA);

    expect(view.itens).toHaveLength(1);
    expect(view.totalCents).toBe(5000);
    expect(view.custoCents).toBe(4200);
    expect(view.sobrouCents).toBe(800);
  });

  it('cortesia zera a receita mas mantém o custo do produto', () => {
    const view = montarView(tela({ ...comValores(), courtesy: true }), AGORA);

    expect(view.totalCents).toBe(0);
    expect(view.custoCents).toBe(4200);
    expect(view.sobrouCents).toBe(-4200);
  });
});

describe('duração em português', () => {
  it('mostra hora e minuto como ela lê', () => {
    expect(formatarDuracao(8)).toBe('8min');
    expect(formatarDuracao(60)).toBe('1h00');
    expect(formatarDuracao(185)).toBe('3h05');
  });
});
