import { describe, expect, it } from 'vitest';

import { moneyOf } from '@/core/kernel/money';

import {
  openAttendance,
  type Attendance,
  type HairAssessment,
} from '../domain/attendance';
import type { AttendanceRepository, AttendanceScreen } from './attendance-repository';
import {
  ajustarProdutos,
  comecar,
  encerrarSemServico,
  escolherServicos,
  finalizar,
  iniciarAtendimento,
  registrarAnamnese,
  type Deps,
} from './attendance-use-cases';

/**
 * O atendimento é o caminho onde dinheiro e estoque se movem juntos. Testar com
 * dublês é o que permite exercitar "reprovou no teste de mecha" e "cortesia"
 * dezenas de vezes por minuto — cenários que, com banco, ninguém roda.
 */

const AGORA = new Date('2026-08-02T14:00:00Z');

const PROGRESSIVA = {
  id: 'srv-quimico',
  name: 'Progressiva',
  priceCents: 22000,
  durationMin: 180,
  isChemical: true,
};

const CORTE = {
  id: 'srv-simples',
  name: 'Corte de pontas',
  priceCents: 4000,
  durationMin: 30,
  isChemical: false,
};

const PRODUTO_DA_PROGRESSIVA = {
  id: 'prod-1',
  name: 'Let Me Be',
  brand: 'Let Me Be',
  unit: 'APLICACAO',
  unitCostCents: 7360,
  suggestedQuantityMilli: 1000,
};

const PRODUTO_SOLTO = {
  id: 'prod-2',
  name: 'Máscara de nutrição',
  brand: null,
  unit: 'FRASCO',
  unitCostCents: 3000,
  suggestedQuantityMilli: null,
};

type Registro = {
  itens: { serviceId: string; unitPriceCents: number; name: string }[][];
  usos: { productId: string; quantityMilli: number; fromStrandTest: boolean }[][];
  status: string[];
  intervalosAbertos: Date[];
  intervalosFechados: Date[];
  anamneses: HairAssessment[];
  finalizacoes: Parameters<AttendanceRepository['finalize']>[0][];
  abertos: number;
};

function cenario(attendance: Attendance, opcoes?: { abertoExistente?: string | null }) {
  const registro: Registro = {
    itens: [],
    usos: [],
    status: [],
    intervalosAbertos: [],
    intervalosFechados: [],
    anamneses: [],
    finalizacoes: [],
    abertos: 0,
  };

  const screen: AttendanceScreen = {
    attendance,
    clientId: attendance.clientId,
    clientName: 'Carla',
    catalog: [PROGRESSIVA, CORTE],
    products: [PRODUTO_DA_PROGRESSIVA, PRODUTO_SOLTO],
    suggestion: {
      hasChemistry: true,
      previousProduct: 'Let Me Be',
      lastStraightenedAt: new Date('2026-05-02T12:00:00Z'),
      source: '2 de mai. de 2026',
    },
    hasChemicalService: attendance.items.some(
      (item) => item.serviceId === PROGRESSIVA.id,
    ),
  };

  const repository: AttendanceRepository = {
    load: async () => screen,
    findOpenForClient: async () => opcoes?.abertoExistente ?? null,
    open: async () => {
      registro.abertos += 1;
      return 'atendimento-novo';
    },
    replaceItems: async (_id, itens) => {
      registro.itens.push([...itens]);
    },
    replaceUsages: async (_id, usos) => {
      registro.usos.push(usos.map((u) => ({ ...u })));
    },
    saveAssessment: async (_id, anamnese) => {
      registro.anamneses.push(anamnese);
    },
    setStatus: async (_id, status) => {
      registro.status.push(status);
    },
    openTimeEntry: async (_id, at) => {
      registro.intervalosAbertos.push(at);
    },
    closeOpenTimeEntries: async (_id, at) => {
      registro.intervalosFechados.push(at);
    },
    finalize: async (entrada) => {
      registro.finalizacoes.push(entrada);
    },
  };

  const deps: Deps = { repository, now: () => AGORA, timeZone: 'America/Sao_Paulo' };
  return { deps, registro };
}

function novoAtendimento(): Attendance {
  return openAttendance({
    id: 'atd-1',
    organizationId: 'org-1',
    clientId: 'cli-1',
  });
}

const ENTRADA = { organizationId: 'org-1', attendanceId: 'atd-1' };

const ANAMNESE_APROVADA: HairAssessment = {
  hasChemistry: true,
  previousProduct: 'Let Me Be',
  lastStraightenedAt: new Date('2026-05-02T12:00:00Z'),
  isBreaking: false,
  isFalling: false,
  strandTestResult: 'PASSED',
  strandTestedAt: AGORA,
};

describe('abrir atendimento', () => {
  it('reaproveita o que já está aberto em vez de criar outro', async () => {
    const { deps, registro } = cenario(novoAtendimento(), {
      abertoExistente: 'atd-ja-aberto',
    });

    const id = await iniciarAtendimento(
      { organizationId: 'org-1', clientId: 'cli-1' },
      deps,
    );

    expect(id).toBe('atd-ja-aberto');
    expect(registro.abertos).toBe(0);
  });

  it('cria quando não há nenhum aberto', async () => {
    const { deps, registro } = cenario(novoAtendimento());

    const id = await iniciarAtendimento(
      { organizationId: 'org-1', clientId: 'cli-1' },
      deps,
    );

    expect(id).toBe('atendimento-novo');
    expect(registro.abertos).toBe(1);
  });
});

describe('escolher serviços', () => {
  it('serviço sem química já começa a trabalhar, sem toque a mais', async () => {
    const { deps, registro } = cenario(novoAtendimento());

    const resultado = await escolherServicos(
      { ...ENTRADA, serviceIds: [CORTE.id] },
      deps,
    );

    expect(resultado.ok).toBe(true);
    expect(registro.status).toEqual(['EM_ANDAMENTO']);
    expect(registro.intervalosAbertos).toEqual([AGORA]);
  });

  it('serviço químico para na anamnese — o portão da INV-16', async () => {
    const atendimento = novoAtendimento();
    const { deps, registro } = cenario({
      ...atendimento,
      items: [
        {
          id: 'i1',
          parentId: null,
          serviceId: PROGRESSIVA.id,
          name: PROGRESSIVA.name,
          unitPriceCents: moneyOf(PROGRESSIVA.priceCents),
        },
      ],
    });

    const resultado = await escolherServicos(
      { ...ENTRADA, serviceIds: [PROGRESSIVA.id] },
      deps,
    );

    expect(resultado.ok).toBe(true);
    expect(registro.status).toEqual([]);
    expect(registro.intervalosAbertos).toEqual([]);
  });

  it('pré-marca o produto que o catálogo já sabe que aquele serviço usa', async () => {
    const { deps, registro } = cenario(novoAtendimento());

    await escolherServicos({ ...ENTRADA, serviceIds: [CORTE.id] }, deps);

    expect(registro.usos.at(0)).toEqual([
      {
        productId: PRODUTO_DA_PROGRESSIVA.id,
        quantityMilli: 1000,
        unitCostCents: PRODUTO_DA_PROGRESSIVA.unitCostCents,
        fromStrandTest: false,
      },
    ]);
  });
});

describe('anamnese', () => {
  const comQuimica = () => ({
    ...novoAtendimento(),
    items: [
      {
        id: 'i1',
        parentId: null,
        serviceId: PROGRESSIVA.id,
        name: PROGRESSIVA.name,
        unitPriceCents: moneyOf(PROGRESSIVA.priceCents),
      },
    ],
  });

  it('aprovada no teste começa na hora', async () => {
    const { deps, registro } = cenario(comQuimica());

    const resultado = await registrarAnamnese(
      { ...ENTRADA, assessment: ANAMNESE_APROVADA },
      deps,
    );

    expect(resultado.ok).toBe(true);
    expect(registro.anamneses).toHaveLength(1);
    expect(registro.status).toContain('EM_ANDAMENTO');
  });

  it('reprovada não começa nada', async () => {
    const { deps, registro } = cenario(comQuimica());

    const resultado = await registrarAnamnese(
      { ...ENTRADA, assessment: { ...ANAMNESE_APROVADA, strandTestResult: 'FAILED' } },
      deps,
    );

    expect(resultado.ok).toBe(true);
    expect(registro.status).toEqual(['AVALIACAO']);
    expect(registro.intervalosAbertos).toEqual([]);
  });

  it('sem anamnese, serviço químico não começa', async () => {
    const { deps } = cenario(comQuimica());

    const resultado = await comecar(ENTRADA, deps);

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.error.kind).toBe('anamnese-obrigatoria');
  });
});

describe('encerrar sem serviço', () => {
  const reprovado = (): Attendance => ({
    ...novoAtendimento(),
    status: 'AVALIACAO',
    assessment: { ...ANAMNESE_APROVADA, strandTestResult: 'FAILED' },
    items: [
      {
        id: 'i1',
        parentId: null,
        serviceId: PROGRESSIVA.id,
        name: PROGRESSIVA.name,
        unitPriceCents: moneyOf(PROGRESSIVA.priceCents),
      },
    ],
    productUsages: [
      {
        productId: PRODUTO_DA_PROGRESSIVA.id,
        quantityMilli: 200,
        unitCostCents: moneyOf(PRODUTO_DA_PROGRESSIVA.unitCostCents),
        fromStrandTest: true,
      },
    ],
  });

  it('tira o serviço mas não cobra nada', async () => {
    const { deps, registro } = cenario(reprovado());

    const resultado = await encerrarSemServico(ENTRADA, deps);

    expect(resultado.ok).toBe(true);
    expect(registro.itens.at(0)).toEqual([]);
    const fim = registro.finalizacoes.at(0);
    expect(fim?.status).toBe('ENCERRADO_SEM_SERVICO');
    expect(fim?.revenueCents).toBe(0);
    expect(fim?.payment).toBeNull();
  });

  it('mantém o produto gasto no teste — INV-17', async () => {
    const { deps, registro } = cenario(reprovado());

    await encerrarSemServico(ENTRADA, deps);

    // Nenhuma chamada apagou os consumos: o custo do teste continua de pé.
    expect(registro.usos).toEqual([]);
  });
});

describe('finalizar', () => {
  const trabalhando = (): Attendance => ({
    ...novoAtendimento(),
    status: 'EM_ANDAMENTO',
    items: [
      {
        id: 'i1',
        parentId: null,
        serviceId: PROGRESSIVA.id,
        name: PROGRESSIVA.name,
        unitPriceCents: moneyOf(22000),
      },
    ],
    productUsages: [
      {
        productId: PRODUTO_DA_PROGRESSIVA.id,
        quantityMilli: 1000,
        unitCostCents: moneyOf(7360),
        fromStrandTest: false,
      },
    ],
    timeEntries: [{ startedAt: new Date('2026-08-02T11:00:00Z'), endedAt: null }],
  });

  it('serviço de preço zero não gera pagamento', async () => {
    // Pegou uma falha real em produção: o banco recusa `amountCents = 0`
    // (`payment_valor_positivo`), e a transação inteira caía com 500 na cara de
    // quem só queria fechar o atendimento.
    const { deps, registro } = cenario({
      ...trabalhando(),
      items: [
        {
          id: 'i1',
          parentId: null,
          serviceId: CORTE.id,
          name: CORTE.name,
          unitPriceCents: moneyOf(0),
        },
      ],
    });

    const resultado = await finalizar(
      { ...ENTRADA, fechamento: { method: 'PIX', courtesy: false } },
      deps,
    );

    expect(resultado.ok).toBe(true);
    const fim = registro.finalizacoes.at(0);
    expect(fim?.payment).toBeNull();
    expect(fim?.status).toBe('FINALIZADO');
  });

  it('pago no Pix lança receita e registra o pagamento', async () => {
    const { deps, registro } = cenario(trabalhando());

    const resultado = await finalizar(
      { ...ENTRADA, fechamento: { method: 'PIX', courtesy: false } },
      deps,
    );

    expect(resultado.ok).toBe(true);
    const fim = registro.finalizacoes.at(0);
    expect(fim?.revenueCents).toBe(22000);
    expect(fim?.payment).toEqual({ method: 'PIX', amountCents: 22000, paidAt: AGORA });
  });

  it('fiado registra o pagamento em aberto e NÃO lança receita', async () => {
    const { deps, registro } = cenario(trabalhando());

    await finalizar(
      { ...ENTRADA, fechamento: { method: 'FIADO', courtesy: false } },
      deps,
    );

    const fim = registro.finalizacoes.at(0);
    expect(fim?.payment).toEqual({ method: 'FIADO', amountCents: 22000, paidAt: null });
    // Dizer que sobrou dinheiro que não entrou seria a ilusão que o produto combate.
    expect(fim?.revenueCents).toBe(0);
  });

  it('cortesia não tem pagamento nem receita, mas o produto continua custando', async () => {
    const { deps, registro } = cenario(trabalhando());

    await finalizar({ ...ENTRADA, fechamento: { method: null, courtesy: true } }, deps);

    const fim = registro.finalizacoes.at(0);
    expect(fim?.courtesy).toBe(true);
    expect(fim?.payment).toBeNull();
    expect(fim?.revenueCents).toBe(0);
  });

  it('atendimento já finalizado não finaliza de novo — INV-08', async () => {
    const { deps } = cenario({ ...trabalhando(), status: 'FINALIZADO' });

    const resultado = await finalizar(
      { ...ENTRADA, fechamento: { method: 'PIX', courtesy: false } },
      deps,
    );

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.error.kind).toBe('atendimento-imutavel');
  });
});

describe('produtos usados', () => {
  it('produto sem consumo padrão entra como uma unidade, nunca como zero', async () => {
    const { deps, registro } = cenario({
      ...novoAtendimento(),
      status: 'EM_ANDAMENTO',
    });

    await ajustarProdutos({ ...ENTRADA, productIds: [PRODUTO_SOLTO.id] }, deps);

    expect(registro.usos.at(0)).toEqual([
      {
        productId: PRODUTO_SOLTO.id,
        quantityMilli: 1000,
        unitCostCents: PRODUTO_SOLTO.unitCostCents,
        fromStrandTest: false,
      },
    ]);
  });
});
