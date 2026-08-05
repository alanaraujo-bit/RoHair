import { describe, expect, it } from 'vitest';

import { moneyOf } from '@/core/kernel/money';
import { isErr, isOk, unwrap } from '@/core/kernel/result';

import {
  attendanceDay,
  closeWithoutService,
  elapsedMs,
  finish,
  hasOverlappingEntries,
  netResult,
  openAttendance,
  openEntries,
  pauseWork,
  recordAssessment,
  resumeWork,
  startWork,
  totalCost,
  totalPrice,
  validateItemTree,
  type Attendance,
  type HairAssessment,
} from './attendance';

/**
 * As invariantes do atendimento, como teste executável.
 *
 * Cada bloco cita a invariante de 08-MODELO-DE-DOMINIO.md que protege. A lista
 * numerada existe justamente para virar isto — e é o contrato entre a Fase 1 e
 * esta fase.
 */

const at = (iso: string) => new Date(iso);

const APROVADA: HairAssessment = {
  hasChemistry: true,
  previousProduct: 'Let Me Be',
  lastStraightenedAt: at('2026-08-12T12:00:00Z'),
  isBreaking: false,
  isFalling: false,
  strandTestResult: 'PASSED',
  strandTestedAt: at('2026-11-06T12:00:00Z'),
};

const REPROVADA: HairAssessment = {
  ...APROVADA,
  previousProduct: 'guanidina',
  strandTestResult: 'FAILED',
};

function base(): Attendance {
  return openAttendance({ id: 'a1', organizationId: 'org1', clientId: 'c1' });
}

/** Atalho: leva o atendimento até `EM_ANDAMENTO` com o teste aprovado. */
function emAndamento(start = at('2026-11-06T12:00:00Z')): Attendance {
  const avaliado = unwrap(recordAssessment(base(), APROVADA));
  return unwrap(startWork(avaliado, { hasChemicalService: true, at: start }));
}

describe('INV-16 · anamnese obrigatória só em serviço químico', () => {
  it('serviço químico sem anamnese não começa', () => {
    const result = startWork(base(), {
      hasChemicalService: true,
      at: at('2026-11-06T12:00:00Z'),
    });
    expect(result).toEqual({ ok: false, error: { kind: 'anamnese-obrigatoria' } });
  });

  it('escova simples começa sem anamnese', () => {
    // GAP-05: a versão anterior da invariante exigia anamnese em tudo, e
    // contradizia a configuração que permite desligá-la.
    const result = startWork(base(), {
      hasChemicalService: false,
      at: at('2026-11-06T12:00:00Z'),
    });
    expect(isOk(result)).toBe(true);
  });

  it('serviço químico com teste ainda não feito não começa', () => {
    const avaliado = unwrap(
      recordAssessment(base(), { ...APROVADA, strandTestResult: 'NOT_APPLICABLE' }),
    );
    expect(
      startWork(avaliado, { hasChemicalService: true, at: at('2026-11-06T12:00:00Z') }),
    ).toEqual({ ok: false, error: { kind: 'teste-de-mecha-obrigatorio' } });
  });
});

describe('Portão de segurança · o teste de mecha pode reprovar', () => {
  it('teste reprovado impede iniciar o serviço', () => {
    const avaliado = unwrap(recordAssessment(base(), REPROVADA));
    expect(
      startWork(avaliado, { hasChemicalService: true, at: at('2026-11-06T12:00:00Z') }),
    ).toEqual({ ok: false, error: { kind: 'servico-impedido-pelo-teste' } });
  });

  it('encerrar sem serviço é desfecho válido, não erro', () => {
    const avaliado = unwrap(recordAssessment(base(), REPROVADA));
    const encerrado = unwrap(closeWithoutService(avaliado, at('2026-11-06T12:30:00Z')));

    expect(encerrado.status).toBe('ENCERRADO_SEM_SERVICO');
    expect(encerrado.finishedAt).toEqual(at('2026-11-06T12:30:00Z'));
  });

  it('INV-17 · o produto do teste continua contando como gasto', () => {
    // GAP-01: a versão anterior dizia que atendimento reprovado não gerava
    // ProductUsage. O teste consome produto de verdade; sem baixa, o estoque
    // mente — que é exatamente a dor da Roziele.
    const avaliado = unwrap(recordAssessment(base(), REPROVADA));
    const comGasto: Attendance = {
      ...avaliado,
      productUsages: [
        {
          productId: 'let-me-be',
          quantityMilli: 50,
          unitCostCents: moneyOf(8000),
          fromStrandTest: true,
        },
      ],
    };

    const encerrado = unwrap(closeWithoutService(comGasto, at('2026-11-06T12:30:00Z')));

    expect(encerrado.productUsages).toHaveLength(1);
    expect(totalCost(encerrado.productUsages)).toBe(400);
    // Custo sem receita: o resultado é negativo, e isso é a verdade
    expect(netResult(encerrado)).toBe(-400);
  });

  it('não é possível encerrar sem serviço tendo item de serviço lançado', () => {
    const comItem: Attendance = {
      ...base(),
      items: [
        {
          id: 'i1',
          parentId: null,
          serviceId: 's1',
          name: 'Progressiva',
          unitPriceCents: moneyOf(22000),
        },
      ],
    };
    expect(isErr(closeWithoutService(comItem, at('2026-11-06T12:30:00Z')))).toBe(true);
  });
});

describe('INV-06 e INV-07 · o cronômetro é lista imutável de intervalos', () => {
  it('no máximo um intervalo aberto', () => {
    const corrente = emAndamento();
    expect(openEntries(corrente.timeEntries)).toHaveLength(1);

    expect(resumeWork(corrente, at('2026-11-06T13:00:00Z'))).toEqual({
      ok: false,
      error: { kind: 'ja-existe-intervalo-aberto' },
    });
  });

  it('pausar sem intervalo aberto é erro', () => {
    const avaliado = unwrap(recordAssessment(base(), APROVADA));
    expect(pauseWork(avaliado, at('2026-11-06T13:00:00Z'))).toEqual({
      ok: false,
      error: { kind: 'nenhum-intervalo-aberto' },
    });
  });

  it('pausar e retomar produz intervalos que não se sobrepõem', () => {
    const corrente = emAndamento(at('2026-11-06T12:00:00Z'));
    const pausado = unwrap(pauseWork(corrente, at('2026-11-06T12:40:00Z')));
    const retomado = unwrap(resumeWork(pausado, at('2026-11-06T13:00:00Z')));

    expect(retomado.timeEntries).toHaveLength(2);
    expect(hasOverlappingEntries(retomado.timeEntries)).toBe(false);
  });

  it('detecta intervalos sobrepostos vindos de dado corrompido', () => {
    expect(
      hasOverlappingEntries([
        { startedAt: at('2026-11-06T12:00:00Z'), endedAt: at('2026-11-06T13:00:00Z') },
        { startedAt: at('2026-11-06T12:30:00Z'), endedAt: at('2026-11-06T14:00:00Z') },
      ]),
    ).toBe(true);
  });

  it('o tempo total sobrevive a fechar o app', () => {
    // O componente nunca guarda o total: ele vem daqui, dos intervalos gravados.
    const corrente = emAndamento(at('2026-11-06T12:00:00Z'));
    const pausado = unwrap(pauseWork(corrente, at('2026-11-06T12:40:00Z')));
    const retomado = unwrap(resumeWork(pausado, at('2026-11-06T13:00:00Z')));

    // 40 minutos fechados + 20 correndo
    expect(elapsedMs(retomado.timeEntries, at('2026-11-06T13:20:00Z'))).toBe(
      60 * 60 * 1000,
    );
  });

  it('finalizar fecha o intervalo que estava aberto', () => {
    const finalizado = unwrap(
      finish(emAndamento(at('2026-11-06T12:00:00Z')), at('2026-11-06T15:05:00Z')),
    );
    expect(openEntries(finalizado.timeEntries)).toHaveLength(0);
  });
});

describe('INV-19 · preço no pai, custo nas folhas', () => {
  const composto: Attendance = {
    ...base(),
    items: [
      {
        id: 'pai',
        parentId: null,
        serviceId: 'escova-com-nutricao',
        name: 'Escova com nutrição',
        unitPriceCents: moneyOf(9000),
      },
      {
        id: 'etapa-1',
        parentId: 'pai',
        serviceId: 'nutricao',
        name: 'Nutrição',
        unitPriceCents: moneyOf(0),
      },
      {
        id: 'etapa-2',
        parentId: 'pai',
        serviceId: 'escova',
        name: 'Escova',
        unitPriceCents: moneyOf(0),
      },
    ],
  };

  it('o total soma só os itens de topo', () => {
    // Somar as folhas junto contaria o valor em dobro
    expect(totalPrice(composto.items)).toBe(9000);
  });

  it('item filho com preço é rejeitado', () => {
    const invalido = composto.items.map((item) =>
      item.id === 'etapa-1' ? { ...item, unitPriceCents: moneyOf(5000) } : item,
    );
    expect(validateItemTree(invalido)).toEqual({
      ok: false,
      error: { kind: 'preco-em-item-filho', itemId: 'etapa-1' },
    });
  });

  it('filho apontando para pai inexistente é rejeitado', () => {
    const orfao = [
      {
        id: 'x',
        parentId: 'nao-existe',
        serviceId: 's',
        name: 'Etapa solta',
        unitPriceCents: moneyOf(0),
      },
    ];
    expect(validateItemTree(orfao)).toEqual({
      ok: false,
      error: { kind: 'pai-inexistente', itemId: 'x' },
    });
  });

  it('finalizar valida a árvore antes de fechar', () => {
    const corrente = { ...emAndamento(), items: composto.items };
    expect(isOk(finish(corrente, at('2026-11-06T15:00:00Z')))).toBe(true);

    const quebrado = {
      ...emAndamento(),
      items: composto.items.map((item) =>
        item.parentId ? { ...item, unitPriceCents: moneyOf(1) } : item,
      ),
    };
    expect(isErr(finish(quebrado, at('2026-11-06T15:00:00Z')))).toBe(true);
  });
});

describe('INV-08 · atendimento finalizado é imutável', () => {
  it('não aceita pausar, retomar nem finalizar de novo', () => {
    const finalizado = unwrap(finish(emAndamento(), at('2026-11-06T15:00:00Z')));

    for (const operacao of [
      () => pauseWork(finalizado, at('2026-11-06T16:00:00Z')),
      () => resumeWork(finalizado, at('2026-11-06T16:00:00Z')),
      () => finish(finalizado, at('2026-11-06T16:00:00Z')),
      () => recordAssessment(finalizado, APROVADA),
    ]) {
      expect(operacao()).toEqual({
        ok: false,
        error: { kind: 'atendimento-imutavel', status: 'FINALIZADO' },
      });
    }
  });

  it('encerrado sem serviço também é imutável', () => {
    const avaliado = unwrap(recordAssessment(base(), REPROVADA));
    const encerrado = unwrap(closeWithoutService(avaliado, at('2026-11-06T12:30:00Z')));

    expect(isErr(finish(encerrado, at('2026-11-06T13:00:00Z')))).toBe(true);
  });
});

describe('Transições impossíveis', () => {
  it('não vai direto de ABERTO para FINALIZADO', () => {
    expect(finish(base(), at('2026-11-06T15:00:00Z'))).toEqual({
      ok: false,
      error: { kind: 'transicao-invalida', from: 'ABERTO', to: 'FINALIZADO' },
    });
  });
});

describe('Cortesia — M-07', () => {
  it('não gera receita, mas o custo do produto continua real', () => {
    const cortesia: Attendance = {
      ...emAndamento(),
      courtesy: true,
      items: [
        {
          id: 'i1',
          parentId: null,
          serviceId: 'escova',
          name: 'Escova',
          unitPriceCents: moneyOf(4000),
        },
      ],
      productUsages: [
        {
          productId: 'wella',
          quantityMilli: 125,
          unitCostCents: moneyOf(6400),
          fromStrandTest: false,
        },
      ],
    };

    expect(totalPrice(cortesia.items)).toBe(4000);
    // Cortesia zera a receita; o prejuízo do dia é honesto
    expect(netResult(cortesia)).toBe(-800);
  });
});

describe('INV-18 · o dia do atendimento é o da finalização', () => {
  const SP = 'America/Sao_Paulo';

  it('atendimento que atravessa a meia-noite pertence a um dia só', () => {
    // Cenário 5: sexta 21h40 → sábado 00h20, hora local
    const corrente = emAndamento(at('2026-11-07T00:40:00Z'));
    const finalizado = unwrap(finish(corrente, at('2026-11-07T03:20:00Z')));

    expect(attendanceDay(finalizado, SP)).toBe('2026-11-07');
  });

  it('atendimento não finalizado ainda não pertence a nenhum dia', () => {
    expect(attendanceDay(emAndamento(), SP)).toBeNull();
  });
});
