import { add, sum, ZERO, type Money } from '@/core/kernel/money';
import { andThen, err, ok, type Result } from '@/core/kernel/result';
import { businessDay } from '@/core/kernel/time';

/**
 * Agregado de atendimento — o que **aconteceu**.
 *
 * Distinto de `Appointment`, que é o que estava **planejado** (08-MODELO, §4.1).
 * Existe atendimento sem agendamento (encaixe) e agendamento sem atendimento
 * (falta); nenhum dos dois é exceção.
 *
 * Este arquivo concentra sete invariantes: INV-06, 07, 08, 16, 17, 18 e 19.
 */

export type AttendanceStatus =
  'ABERTO' | 'AVALIACAO' | 'EM_ANDAMENTO' | 'ENCERRADO_SEM_SERVICO' | 'FINALIZADO';

export type StrandTestResult = 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';

export type HairAssessment = {
  readonly hasChemistry: boolean;
  readonly previousProduct: string | null;
  readonly lastStraightenedAt: Date | null;
  readonly isBreaking: boolean;
  readonly isFalling: boolean;
  readonly strandTestResult: StrandTestResult;
  readonly strandTestedAt: Date | null;
};

/** Intervalo do cronômetro. `endedAt` nulo significa "correndo agora". */
export type TimeEntry = {
  readonly startedAt: Date;
  readonly endedAt: Date | null;
};

/**
 * Item de serviço executado.
 *
 * `parentId` é o que sustenta a INV-19: em serviço composto, o **preço** vive
 * no item pai e o **custo e a baixa de estoque** vivem nas folhas. Gravar o
 * preço nos dois níveis contaria o valor em dobro.
 */
export type AttendanceItem = {
  readonly id: string;
  readonly parentId: string | null;
  readonly serviceId: string;
  readonly name: string;
  /** Snapshot, nunca referência viva ao catálogo (INV-05). */
  readonly unitPriceCents: Money;
};

export type ProductUsage = {
  readonly productId: string;
  readonly quantityMilli: number;
  /** Snapshot do custo no momento do uso (INV-05). */
  readonly unitCostCents: Money;
  /** Consumo do teste de mecha, não da execução do serviço (INV-17). */
  readonly fromStrandTest: boolean;
};

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'FIADO';

export type Payment = {
  readonly method: PaymentMethod;
  readonly amountCents: Money;
  readonly paidAt: Date | null;
};

export type Attendance = {
  readonly id: string;
  readonly organizationId: string;
  readonly clientId: string;
  readonly appointmentId: string | null;
  readonly status: AttendanceStatus;
  readonly assessment: HairAssessment | null;
  readonly items: readonly AttendanceItem[];
  readonly productUsages: readonly ProductUsage[];
  readonly timeEntries: readonly TimeEntry[];
  readonly payments: readonly Payment[];
  /** Cortesia é estado próprio, nunca "não pago" (M-07). */
  readonly courtesy: boolean;
  readonly finishedAt: Date | null;
};

export type AttendanceError =
  | {
      readonly kind: 'transicao-invalida';
      readonly from: AttendanceStatus;
      readonly to: AttendanceStatus;
    }
  | { readonly kind: 'anamnese-obrigatoria' }
  | { readonly kind: 'teste-de-mecha-obrigatorio' }
  | { readonly kind: 'ja-existe-intervalo-aberto' }
  | { readonly kind: 'nenhum-intervalo-aberto' }
  | { readonly kind: 'intervalos-sobrepostos' }
  | { readonly kind: 'atendimento-imutavel'; readonly status: AttendanceStatus }
  | { readonly kind: 'servico-impedido-pelo-teste' }
  | { readonly kind: 'preco-em-item-filho'; readonly itemId: string }
  | { readonly kind: 'pai-inexistente'; readonly itemId: string };

/* ---------------------------------------------------------- Invariantes */

/**
 * INV-16 — atendimento com serviço **químico** exige anamnese, e o teste de
 * mecha é etapa dela.
 *
 * A primeira versão desta regra exigia anamnese em todo atendimento, o que
 * contradizia a configuração que permite desligá-la e obrigaria uma escova
 * simples a passar por avaliação química (GAP-05).
 */
export function requiresAssessment(hasChemicalService: boolean): boolean {
  return hasChemicalService;
}

/** INV-07 — no máximo um intervalo aberto por atendimento. */
export function openEntries(entries: readonly TimeEntry[]): readonly TimeEntry[] {
  return entries.filter((entry) => entry.endedAt === null);
}

/** INV-06 — intervalos do mesmo atendimento nunca se sobrepõem. */
export function hasOverlappingEntries(entries: readonly TimeEntry[]): boolean {
  const closed = entries
    .filter((entry): entry is TimeEntry & { endedAt: Date } => entry.endedAt !== null)
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

  for (let index = 1; index < closed.length; index += 1) {
    const previous = closed[index - 1];
    const current = closed[index];
    if (!previous || !current) continue;
    if (current.startedAt.getTime() < previous.endedAt.getTime()) return true;
  }
  return false;
}

/**
 * Tempo total trabalhado.
 *
 * Some os intervalos fechados e, se houver um aberto, o que passou dele até
 * `now`. O componente de interface nunca guarda o total — ele vem daqui, e é
 * por isso que fechar o app no meio do atendimento não perde um segundo.
 */
export function elapsedMs(entries: readonly TimeEntry[], now: Date): number {
  return entries.reduce((total, entry) => {
    const end = entry.endedAt ?? now;
    return total + Math.max(0, end.getTime() - entry.startedAt.getTime());
  }, 0);
}

/**
 * INV-19 — preço no pai, custo nas folhas.
 *
 * Valida a árvore de itens: todo item com `parentId` aponta para um pai que
 * existe, e nenhum filho carrega preço.
 */
export function validateItemTree(
  items: readonly AttendanceItem[],
): Result<null, AttendanceError> {
  const ids = new Set(items.map((item) => item.id));

  for (const item of items) {
    if (item.parentId === null) continue;
    if (!ids.has(item.parentId)) {
      return err({ kind: 'pai-inexistente', itemId: item.id });
    }
    if (item.unitPriceCents !== 0) {
      return err({ kind: 'preco-em-item-filho', itemId: item.id });
    }
  }
  return ok(null);
}

/** O que a cliente paga: só os itens de topo (INV-19). */
export function totalPrice(items: readonly AttendanceItem[]): Money {
  return sum(
    items.filter((item) => item.parentId === null).map((i) => i.unitPriceCents),
  );
}

/**
 * O que foi gasto de produto. Inclui o consumo do **teste de mecha** (INV-17):
 * custo sem receita é a verdade do que aconteceu, e esconder isso faria o
 * estoque mentir — que é exatamente a dor da Rosiele.
 */
export function totalCost(usages: readonly ProductUsage[]): Money {
  return usages.reduce(
    (total, usage) =>
      add(
        total,
        Math.round((usage.quantityMilli * usage.unitCostCents) / 1000) as Money,
      ),
    ZERO,
  );
}

/** O que sobrou. É este número que o painel mostra grande, nunca o faturamento. */
export function netResult(attendance: Attendance): Money {
  const revenue = attendance.courtesy ? ZERO : totalPrice(attendance.items);
  return (revenue - totalCost(attendance.productUsages)) as Money;
}

/**
 * INV-18 — o dia a que o atendimento pertence é o da **finalização**, no fuso
 * da organização. Um só instante decide receita, baixa e histórico.
 */
export function attendanceDay(attendance: Attendance, timeZone: string): string | null {
  return attendance.finishedAt ? businessDay(attendance.finishedAt, timeZone) : null;
}

/* ----------------------------------------------------------- Transições */

const ALLOWED: Record<AttendanceStatus, readonly AttendanceStatus[]> = {
  ABERTO: ['AVALIACAO', 'EM_ANDAMENTO'],
  AVALIACAO: ['EM_ANDAMENTO', 'ENCERRADO_SEM_SERVICO'],
  EM_ANDAMENTO: ['FINALIZADO'],
  ENCERRADO_SEM_SERVICO: [],
  FINALIZADO: [],
};

function transition(
  attendance: Attendance,
  to: AttendanceStatus,
): Result<Attendance, AttendanceError> {
  if (!ALLOWED[attendance.status].includes(to)) {
    return err({ kind: 'transicao-invalida', from: attendance.status, to });
  }
  return ok({ ...attendance, status: to });
}

/** INV-08 — atendimento finalizado é imutável. Correção é lançamento de ajuste. */
function ensureMutable(attendance: Attendance): Result<Attendance, AttendanceError> {
  if (
    attendance.status === 'FINALIZADO' ||
    attendance.status === 'ENCERRADO_SEM_SERVICO'
  ) {
    return err({ kind: 'atendimento-imutavel', status: attendance.status });
  }
  return ok(attendance);
}

export function recordAssessment(
  attendance: Attendance,
  assessment: HairAssessment,
): Result<Attendance, AttendanceError> {
  return andThen(ensureMutable(attendance), (current) =>
    transition({ ...current, assessment }, 'AVALIACAO'),
  );
}

/**
 * Começa a trabalhar.
 *
 * Se o serviço é químico, exige anamnese com teste aprovado — o portão de
 * segurança da Rosiele virado em código.
 */
export function startWork(
  attendance: Attendance,
  options: { readonly hasChemicalService: boolean; readonly at: Date },
): Result<Attendance, AttendanceError> {
  const mutable = ensureMutable(attendance);
  if (!mutable.ok) return mutable;

  if (requiresAssessment(options.hasChemicalService)) {
    if (!attendance.assessment) return err({ kind: 'anamnese-obrigatoria' });
    if (attendance.assessment.strandTestResult === 'FAILED') {
      return err({ kind: 'servico-impedido-pelo-teste' });
    }
    if (attendance.assessment.strandTestResult === 'NOT_APPLICABLE') {
      return err({ kind: 'teste-de-mecha-obrigatorio' });
    }
  }

  if (openEntries(attendance.timeEntries).length > 0) {
    return err({ kind: 'ja-existe-intervalo-aberto' });
  }

  const entries = [...attendance.timeEntries, { startedAt: options.at, endedAt: null }];
  if (hasOverlappingEntries(entries)) return err({ kind: 'intervalos-sobrepostos' });

  return transition({ ...attendance, timeEntries: entries }, 'EM_ANDAMENTO');
}

/** Pausa: fecha o intervalo aberto. Retomar abre um novo. */
export function pauseWork(
  attendance: Attendance,
  at: Date,
): Result<Attendance, AttendanceError> {
  const mutable = ensureMutable(attendance);
  if (!mutable.ok) return mutable;

  const open = openEntries(attendance.timeEntries);
  if (open.length === 0) return err({ kind: 'nenhum-intervalo-aberto' });

  const entries = attendance.timeEntries.map((entry) =>
    entry.endedAt === null ? { ...entry, endedAt: at } : entry,
  );
  if (hasOverlappingEntries(entries)) return err({ kind: 'intervalos-sobrepostos' });

  return ok({ ...attendance, timeEntries: entries });
}

export function resumeWork(
  attendance: Attendance,
  at: Date,
): Result<Attendance, AttendanceError> {
  const mutable = ensureMutable(attendance);
  if (!mutable.ok) return mutable;

  if (openEntries(attendance.timeEntries).length > 0) {
    return err({ kind: 'ja-existe-intervalo-aberto' });
  }

  const entries = [...attendance.timeEntries, { startedAt: at, endedAt: null }];
  if (hasOverlappingEntries(entries)) return err({ kind: 'intervalos-sobrepostos' });

  return ok({ ...attendance, timeEntries: entries });
}

/**
 * O teste reprovou.
 *
 * **Não é erro nem cancelamento** — é o desfecho seguro. O consumo do teste
 * permanece registrado (INV-17): produto foi gasto, e o estoque precisa saber.
 * O que não pode existir é item do serviço impedido.
 */
export function closeWithoutService(
  attendance: Attendance,
  at: Date,
): Result<Attendance, AttendanceError> {
  const mutable = ensureMutable(attendance);
  if (!mutable.ok) return mutable;

  const blockedItems = attendance.items.length > 0;
  if (blockedItems) return err({ kind: 'servico-impedido-pelo-teste' });

  return transition(
    {
      ...attendance,
      finishedAt: at,
      timeEntries: attendance.timeEntries.map((entry) =>
        entry.endedAt === null ? { ...entry, endedAt: at } : entry,
      ),
    },
    'ENCERRADO_SEM_SERVICO',
  );
}

/**
 * Finaliza.
 *
 * A INV-09 — receita, baixa e histórico numa transação só — é responsabilidade
 * do use case, não do agregado: só a camada de aplicação enxerga estoque e
 * financeiro. O que o domínio garante aqui é que o atendimento chega ao
 * checkout num estado consistente.
 */
export function finish(
  attendance: Attendance,
  at: Date,
): Result<Attendance, AttendanceError> {
  const mutable = ensureMutable(attendance);
  if (!mutable.ok) return mutable;

  const tree = validateItemTree(attendance.items);
  if (!tree.ok) return tree;

  const entries = attendance.timeEntries.map((entry) =>
    entry.endedAt === null ? { ...entry, endedAt: at } : entry,
  );
  if (hasOverlappingEntries(entries)) return err({ kind: 'intervalos-sobrepostos' });

  return transition(
    { ...attendance, timeEntries: entries, finishedAt: at },
    'FINALIZADO',
  );
}

/** Atendimento novo, no estado inicial. */
export function openAttendance(input: {
  readonly id: string;
  readonly organizationId: string;
  readonly clientId: string;
  readonly appointmentId?: string | null;
}): Attendance {
  return {
    id: input.id,
    organizationId: input.organizationId,
    clientId: input.clientId,
    appointmentId: input.appointmentId ?? null,
    status: 'ABERTO',
    assessment: null,
    items: [],
    productUsages: [],
    timeEntries: [],
    payments: [],
    courtesy: false,
    finishedAt: null,
  };
}
