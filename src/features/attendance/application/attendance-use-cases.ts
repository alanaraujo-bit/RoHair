import { moneyOf } from '@/core/kernel/money';
import { err, ok, type Result } from '@/core/kernel/result';
import { businessDay } from '@/core/kernel/time';

import {
  closeWithoutService,
  finish,
  netResult,
  pauseWork,
  resumeWork,
  startWork,
  totalPrice,
  type Attendance,
  type AttendanceError,
  type HairAssessment,
  type PaymentMethod,
  recordAssessment,
} from '../domain/attendance';
import type { AttendanceRepository, AttendanceScreen } from './attendance-repository';

/**
 * Casos de uso do atendimento.
 *
 * Cada um segue a mesma forma: **carrega, chama o domínio, grava o que mudou**.
 * A regra nunca vive aqui — se uma condição de negócio aparecer neste arquivo,
 * é sinal de que ela escapou do agregado.
 *
 * O que vive aqui, e só aqui, é a **orquestração**: finalizar toca atendimento,
 * estoque e caixa de uma vez, e nenhum dos três pode enxergar o outro. É por
 * isso que a INV-09 é responsabilidade da aplicação e não do domínio.
 */

export type UseCaseError = AttendanceError | { readonly kind: 'nao-encontrado' };

/**
 * Reexportado para a borda.
 *
 * A rota precisa montar a anamnese a partir do formulário, mas o lint proíbe
 * `app` de importar `domain` — e com razão: sem a proibição, a próxima tela
 * chamaria uma regra do agregado direto e a camada de aplicação viraria
 * decoração. Reexportar o **tipo** dá à borda o vocabulário sem lhe dar acesso
 * ao comportamento.
 */
export type { HairAssessment } from '../domain/attendance';

export type Deps = {
  readonly repository: AttendanceRepository;
  readonly now: () => Date;
  readonly timeZone: string;
};

async function carregar(
  organizationId: string,
  attendanceId: string,
  deps: Deps,
): Promise<Result<AttendanceScreen, UseCaseError>> {
  const screen = await deps.repository.load(organizationId, attendanceId);
  return screen === null ? err({ kind: 'nao-encontrado' }) : ok(screen);
}

/**
 * Abre o atendimento, ou devolve o que já está aberto.
 *
 * Reaproveitar em vez de criar não é economia: dois atendimentos abertos para a
 * mesma cliente dariam dois cronômetros correndo e duas baixas de estoque para
 * o mesmo trabalho. Tocar duas vezes em "iniciar" é o normal com o celular na
 * bancada.
 */
export async function iniciarAtendimento(
  input: {
    readonly organizationId: string;
    readonly clientId: string;
    readonly appointmentId?: string | null;
  },
  deps: Deps,
): Promise<string> {
  const aberto = await deps.repository.findOpenForClient(
    input.organizationId,
    input.clientId,
  );
  if (aberto !== null) return aberto;

  return deps.repository.open({
    organizationId: input.organizationId,
    clientId: input.clientId,
    appointmentId: input.appointmentId ?? null,
  });
}

/**
 * Escolhe o que vai ser feito.
 *
 * Quando nada é químico, já começa a trabalhar — evita um toque que não decide
 * nada. Quando há química, para: a anamnese é o portão (INV-16).
 */
export async function escolherServicos(
  input: {
    readonly organizationId: string;
    readonly attendanceId: string;
    readonly serviceIds: readonly string[];
  },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const escolhidos = carregado.value.catalog.filter((servico) =>
    input.serviceIds.includes(servico.id),
  );

  await deps.repository.replaceItems(
    input.attendanceId,
    escolhidos.map((servico) => ({
      serviceId: servico.id,
      name: servico.name,
      unitPriceCents: servico.priceCents,
    })),
  );

  await marcarProdutosSugeridos(input.attendanceId, carregado.value, escolhidos, deps);

  if (escolhidos.some((servico) => servico.isChemical)) return ok(null);

  // Os itens acabaram de ser gravados; o agregado em memória é a verdade mais
  // nova. Reler aqui repetiria o erro que o teste da anamnese já expôs.
  return abrirTrabalho(
    input.attendanceId,
    { ...carregado.value.attendance, items: [] },
    false,
    deps,
  );
}

/**
 * 🗣️ Pré-marca o que ela costuma usar naquele serviço.
 *
 * "Confirmar é mais rápido que escolher" — e é o que dá baixa correta sem
 * exigir disciplina. Só marca o que o catálogo já sabe; ela desmarca o que não
 * usou.
 */
async function marcarProdutosSugeridos(
  attendanceId: string,
  screen: AttendanceScreen,
  escolhidos: readonly { readonly id: string }[],
  deps: Deps,
): Promise<void> {
  if (escolhidos.length === 0) {
    await deps.repository.replaceUsages(attendanceId, []);
    return;
  }

  const sugeridos = screen.products.filter(
    (produto) => produto.suggestedQuantityMilli !== null,
  );

  await deps.repository.replaceUsages(
    attendanceId,
    sugeridos.map((produto) => ({
      productId: produto.id,
      quantityMilli: produto.suggestedQuantityMilli ?? 0,
      unitCostCents: produto.unitCostCents,
      fromStrandTest: false,
    })),
  );
}

export async function registrarAnamnese(
  input: {
    readonly organizationId: string;
    readonly attendanceId: string;
    readonly assessment: HairAssessment;
  },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const resultado = recordAssessment(carregado.value.attendance, input.assessment);
  if (!resultado.ok) return resultado;

  await deps.repository.saveAssessment(input.attendanceId, input.assessment);
  await deps.repository.setStatus(input.attendanceId, resultado.value.status);

  // Aprovado no teste, começa na hora: 🗣️ do "iniciar" ao "finalizar" em 3 toques.
  if (input.assessment.strandTestResult === 'PASSED') {
    return abrirTrabalho(
      input.attendanceId,
      resultado.value,
      carregado.value.hasChemicalService,
      deps,
    );
  }

  return ok(null);
}

export async function comecar(
  input: { readonly organizationId: string; readonly attendanceId: string },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  return abrirTrabalho(
    input.attendanceId,
    carregado.value.attendance,
    carregado.value.hasChemicalService,
    deps,
  );
}

/**
 * Começa a trabalhar a partir do agregado **em memória**.
 *
 * Recebe o atendimento como ele ficou depois da última mudança, e não relê o
 * banco. A primeira versão relia — e o teste da anamnese aprovada pegou o
 * problema: gravar e reler faz o caso de uso depender de a escrita já estar
 * visível, o que é frágil e é o tipo de bug que só aparece em produção, sob
 * carga, uma vez a cada tanto.
 */
async function abrirTrabalho(
  attendanceId: string,
  attendance: Attendance,
  hasChemicalService: boolean,
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const agora = deps.now();
  const resultado = startWork(attendance, { hasChemicalService, at: agora });
  if (!resultado.ok) return resultado;

  await deps.repository.openTimeEntry(attendanceId, agora);
  await deps.repository.setStatus(attendanceId, resultado.value.status);
  return ok(null);
}

export async function pausar(
  input: { readonly organizationId: string; readonly attendanceId: string },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const agora = deps.now();
  const resultado = pauseWork(carregado.value.attendance, agora);
  if (!resultado.ok) return resultado;

  await deps.repository.closeOpenTimeEntries(input.attendanceId, agora);
  return ok(null);
}

export async function retomar(
  input: { readonly organizationId: string; readonly attendanceId: string },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const agora = deps.now();
  const resultado = resumeWork(carregado.value.attendance, agora);
  if (!resultado.ok) return resultado;

  await deps.repository.openTimeEntry(input.attendanceId, agora);
  return ok(null);
}

export async function ajustarProdutos(
  input: {
    readonly organizationId: string;
    readonly attendanceId: string;
    readonly productIds: readonly string[];
    readonly fromStrandTest?: boolean;
  },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const escolhidos = carregado.value.products.filter((produto) =>
    input.productIds.includes(produto.id),
  );

  await deps.repository.replaceUsages(
    input.attendanceId,
    escolhidos.map((produto) => ({
      productId: produto.id,
      // Sem consumo padrão no catálogo, uma unidade é o palpite honesto — e ela
      // corrige no estoque. Zero seria pior: viraria custo invisível.
      quantityMilli: produto.suggestedQuantityMilli ?? 1000,
      unitCostCents: produto.unitCostCents,
      fromStrandTest: input.fromStrandTest ?? false,
    })),
  );

  return ok(null);
}

/**
 * O teste reprovou.
 *
 * 🗣️ Desfecho de trabalho bem feito, não falha — é o momento em que ela mais
 * protege a cliente. Os itens de serviço saem (o serviço não aconteceu), mas o
 * **produto gasto no teste fica** (INV-17): custo sem receita é a verdade, e
 * esconder isso faria o estoque mentir.
 */
export async function encerrarSemServico(
  input: { readonly organizationId: string; readonly attendanceId: string },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  await deps.repository.replaceItems(input.attendanceId, []);

  const semItens = { ...carregado.value.attendance, items: [] };
  const agora = deps.now();
  const resultado = closeWithoutService(semItens, agora);
  if (!resultado.ok) return resultado;

  await deps.repository.finalize({
    attendanceId: input.attendanceId,
    organizationId: input.organizationId,
    appointmentId: carregado.value.attendance.appointmentId,
    at: agora,
    status: 'ENCERRADO_SEM_SERVICO',
    courtesy: false,
    payment: null,
    businessDay: businessDay(agora, deps.timeZone),
    revenueCents: 0,
    description: `Teste de mecha reprovado · ${carregado.value.clientName}`,
  });

  return ok(null);
}

export type Fechamento = {
  readonly method: PaymentMethod | null;
  readonly courtesy: boolean;
};

/**
 * Finaliza: dinheiro, estoque e histórico numa transação só (INV-09).
 *
 * **Cortesia não é "não pago"** (M-07): é estado próprio, sem pagamento e sem
 * receita, e o custo do produto continua contando. Fiado grava o pagamento com
 * `paidAt` nulo e **não lança receita** — o painel diz "sobrou", e dizer que
 * sobrou dinheiro que não entrou seria a mesma ilusão que o produto combate.
 */
export async function finalizar(
  input: {
    readonly organizationId: string;
    readonly attendanceId: string;
    readonly fechamento: Fechamento;
  },
  deps: Deps,
): Promise<Result<null, UseCaseError>> {
  const carregado = await carregar(input.organizationId, input.attendanceId, deps);
  if (!carregado.ok) return carregado;

  const agora = deps.now();
  const comCortesia = {
    ...carregado.value.attendance,
    courtesy: input.fechamento.courtesy,
  };

  const resultado = finish(comCortesia, agora);
  if (!resultado.ok) return resultado;

  const total = input.fechamento.courtesy
    ? moneyOf(0)
    : totalPrice(carregado.value.attendance.items);

  // Pagamento de zero não é pagamento — e o banco concorda: a constraint
  // `payment_valor_positivo` recusa a linha. Acontece de verdade, com serviço
  // de preço zero no catálogo, e o teste abaixo é o que impede a volta.
  const method =
    input.fechamento.courtesy || total === 0 ? null : input.fechamento.method;
  const recebido = method !== null && method !== 'FIADO';

  await deps.repository.finalize({
    attendanceId: input.attendanceId,
    organizationId: input.organizationId,
    appointmentId: carregado.value.attendance.appointmentId,
    at: agora,
    status: 'FINALIZADO',
    courtesy: input.fechamento.courtesy,
    payment:
      method === null
        ? null
        : { method, amountCents: total, paidAt: recebido ? agora : null },
    businessDay: businessDay(agora, deps.timeZone),
    revenueCents: recebido ? total : 0,
    description: `Atendimento · ${carregado.value.clientName}`,
  });

  return ok(null);
}

/** O que o checkout mostra em destaque: o lucro na hora, não no fim do mês. */
export function resultadoDoAtendimento(screen: AttendanceScreen, courtesy: boolean) {
  const attendance = { ...screen.attendance, courtesy };
  return {
    totalCents: courtesy ? 0 : totalPrice(screen.attendance.items),
    liquidoCents: netResult(attendance),
  };
}
