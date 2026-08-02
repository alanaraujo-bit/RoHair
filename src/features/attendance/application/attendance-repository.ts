import type { Attendance, HairAssessment, PaymentMethod } from '../domain/attendance';

/**
 * Portas do atendimento.
 *
 * O agregado do domínio não sabe nomear serviço nem contar frasco — ele só
 * conhece ids, preços e regras. Quem monta a tela precisa de nome, e é por isso
 * que existe `AttendanceScreen`: o agregado **mais** o que é preciso para
 * desenhar, resolvido de uma vez no servidor.
 *
 * A porta é feita de comandos e não de um `save(attendance)` genérico. Salvar o
 * agregado inteiro exigiria comparar o que mudou contra o banco a cada
 * gravação — trabalho que o Prisma faria errado e que os comandos tornam
 * desnecessário. Cada ação da tela já sabe o que mudou.
 */

export type ServiceOption = {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly durationMin: number;
  readonly isChemical: boolean;
};

export type ProductOption = {
  readonly id: string;
  readonly name: string;
  readonly brand: string | null;
  readonly unit: string;
  readonly unitCostCents: number;
  /** Consumo padrão do serviço escolhido; é o que vem pré-marcado. */
  readonly suggestedQuantityMilli: number | null;
};

/** O histórico que a anamnese usa para chegar preenchida em vez de vazia. */
export type AssessmentSuggestion = {
  readonly hasChemistry: boolean;
  readonly previousProduct: string | null;
  readonly lastStraightenedAt: Date | null;
  /** De onde veio a sugestão, para a tela poder dizer. */
  readonly source: string | null;
};

export type AttendanceScreen = {
  readonly attendance: Attendance;
  readonly clientName: string;
  readonly clientId: string;
  /** Serviços do catálogo, para escolher e acrescentar. */
  readonly catalog: readonly ServiceOption[];
  readonly products: readonly ProductOption[];
  readonly suggestion: AssessmentSuggestion;
  /** Algum item escolhido é químico? É o que liga o portão da anamnese. */
  readonly hasChemicalService: boolean;
};

export type AttendanceRepository = {
  /** Sempre por organização: o id na URL nunca decide sozinho o que é visível. */
  load(organizationId: string, attendanceId: string): Promise<AttendanceScreen | null>;

  /** Já existe atendimento aberto para esta cliente? Devolve o id. */
  findOpenForClient(organizationId: string, clientId: string): Promise<string | null>;

  open(input: {
    readonly organizationId: string;
    readonly clientId: string;
    readonly appointmentId: string | null;
  }): Promise<string>;

  replaceItems(
    attendanceId: string,
    items: readonly {
      readonly serviceId: string;
      readonly unitPriceCents: number;
      readonly name: string;
    }[],
  ): Promise<void>;

  replaceUsages(
    attendanceId: string,
    usages: readonly {
      readonly productId: string;
      readonly quantityMilli: number;
      readonly unitCostCents: number;
      readonly fromStrandTest: boolean;
    }[],
  ): Promise<void>;

  saveAssessment(attendanceId: string, assessment: HairAssessment): Promise<void>;

  setStatus(attendanceId: string, status: Attendance['status']): Promise<void>;

  openTimeEntry(attendanceId: string, at: Date): Promise<void>;
  closeOpenTimeEntries(attendanceId: string, at: Date): Promise<void>;

  /**
   * Fecha o atendimento **numa transação só** (INV-09): status, pagamento,
   * baixa de estoque e lançamento no caixa. Metade disso gravado é pior do que
   * nada gravado — seria estoque que não bate com dinheiro que não bate com
   * histórico.
   */
  finalize(input: {
    readonly attendanceId: string;
    readonly organizationId: string;
    /** Fecha o agendamento de origem junto, quando veio de um. */
    readonly appointmentId: string | null;
    readonly at: Date;
    readonly status: 'FINALIZADO' | 'ENCERRADO_SEM_SERVICO';
    readonly courtesy: boolean;
    readonly payment: {
      readonly method: PaymentMethod;
      readonly amountCents: number;
      readonly paidAt: Date | null;
    } | null;
    readonly businessDay: string;
    readonly revenueCents: number;
    readonly description: string;
  }): Promise<void>;
};
