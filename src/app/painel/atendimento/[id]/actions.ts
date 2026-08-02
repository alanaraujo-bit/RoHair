'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  ajustarProdutos,
  comecar,
  encerrarSemServico,
  escolherServicos,
  finalizar,
  iniciarAtendimento,
  pausar,
  registrarAnamnese,
  retomar,
  type Deps,
  type HairAssessment,
  type UseCaseError,
} from '@/features/attendance/application/attendance-use-cases';
import { attendanceRepository } from '@/features/attendance/infrastructure/prisma-attendance-repository';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';

/**
 * Raiz de composição do atendimento.
 *
 * Toda ação daqui começa por `requireStaffSession()`, e o `organizationId` sai
 * dela. **Nenhuma ação confia no id da URL sozinho**: ele diz qual atendimento,
 * a sessão diz de quem — e é a combinação dos dois que o repositório exige.
 */

const FUSO = 'America/Sao_Paulo';

function deps(): Deps {
  return { repository: attendanceRepository, now: () => new Date(), timeZone: FUSO };
}

function mensagem(erro: UseCaseError): string {
  switch (erro.kind) {
    case 'nao-encontrado':
      return 'Este atendimento não existe mais.';
    case 'anamnese-obrigatoria':
      return 'Antes de começar, responda a anamnese.';
    case 'teste-de-mecha-obrigatorio':
      return 'Falta o teste de mecha.';
    case 'servico-impedido-pelo-teste':
      return 'O teste reprovou. Este serviço não pode acontecer hoje.';
    case 'atendimento-imutavel':
      return 'Este atendimento já foi encerrado.';
    case 'ja-existe-intervalo-aberto':
      return 'O cronômetro já está correndo.';
    case 'nenhum-intervalo-aberto':
      return 'O cronômetro já está pausado.';
    default:
      return 'Não deu para concluir. Tente de novo.';
  }
}

export async function iniciarAtendimentoAction(formData: FormData): Promise<void> {
  const { organizationId } = await requireStaffSession();
  const clientId = z.uuid().parse(formData.get('clienteId'));
  const appointmentId = formData.get('agendamentoId');

  const id = await iniciarAtendimento(
    {
      organizationId,
      clientId,
      appointmentId: typeof appointmentId === 'string' ? appointmentId : null,
    },
    deps(),
  );

  redirect(`/painel/atendimento/${id}`);
}

export async function escolherServicosAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  const { organizationId } = await requireStaffSession();
  const attendanceId = z.uuid().parse(formData.get('atendimentoId'));
  const serviceIds = formData.getAll('servico').map(String);

  if (serviceIds.length === 0) return 'Escolha pelo menos um serviço.';

  const resultado = await escolherServicos(
    { organizationId, attendanceId, serviceIds },
    deps(),
  );

  if (!resultado.ok) return mensagem(resultado.error);

  revalidatePath(`/painel/atendimento/${attendanceId}`);
  return null;
}

export async function registrarAnamneseAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  const { organizationId } = await requireStaffSession();
  const attendanceId = z.uuid().parse(formData.get('atendimentoId'));

  const teste = formData.get('teste');
  if (teste !== 'PASSED' && teste !== 'FAILED') {
    return 'Falta dizer se o teste de mecha passou.';
  }

  const dataDigitada = String(formData.get('ultimoAlisamento') ?? '');
  const assessment: HairAssessment = {
    hasChemistry: formData.get('quimica') === 'sim',
    previousProduct: (String(formData.get('produto') ?? '').trim() || null) as
      string | null,
    // `T12:00` e não meia-noite: a data é do dia, e meia-noite em UTC volta um
    // dia no fuso de São Paulo — o registro de 12/08 viraria 11/08.
    lastStraightenedAt: dataDigitada ? new Date(`${dataDigitada}T12:00:00`) : null,
    isBreaking: formData.get('quebrando') === 'sim',
    isFalling: formData.get('caindo') === 'sim',
    strandTestResult: teste,
    strandTestedAt: new Date(),
  };

  const resultado = await registrarAnamnese(
    { organizationId, attendanceId, assessment },
    deps(),
  );

  if (!resultado.ok) return mensagem(resultado.error);

  revalidatePath(`/painel/atendimento/${attendanceId}`);
  return null;
}

/**
 * Saída de emergência do portão: a anamnese está aprovada mas o cronômetro não
 * chegou a abrir — queda de rede entre uma gravação e a seguinte. Sem este
 * botão, o atendimento ficaria preso numa tela sem saída.
 */
export async function comecarAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  const { organizationId } = await requireStaffSession();
  const attendanceId = z.uuid().parse(formData.get('atendimentoId'));

  const resultado = await comecar({ organizationId, attendanceId }, deps());
  if (!resultado.ok) return mensagem(resultado.error);

  revalidatePath(`/painel/atendimento/${attendanceId}`);
  return null;
}

export async function alternarPausaAction(
  attendanceId: string,
  emPausa: boolean,
): Promise<void> {
  const { organizationId } = await requireStaffSession();

  const resultado = emPausa
    ? await retomar({ organizationId, attendanceId }, deps())
    : await pausar({ organizationId, attendanceId }, deps());

  // Pausar duas vezes seguidas — dois toques com a mão molhada — não é erro que
  // mereça tela vermelha. O estado já é o desejado.
  if (!resultado.ok && resultado.error.kind === 'nao-encontrado') {
    redirect('/painel');
  }

  revalidatePath(`/painel/atendimento/${attendanceId}`);
}

export async function salvarProdutosAction(
  attendanceId: string,
  formData: FormData,
): Promise<void> {
  const { organizationId } = await requireStaffSession();
  const productIds = formData.getAll('produto').map(String);

  await ajustarProdutos({ organizationId, attendanceId, productIds }, deps());
  revalidatePath(`/painel/atendimento/${attendanceId}`);
}

export async function encerrarSemServicoAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  const { organizationId } = await requireStaffSession();
  const attendanceId = z.uuid().parse(formData.get('atendimentoId'));

  const resultado = await encerrarSemServico({ organizationId, attendanceId }, deps());
  if (!resultado.ok) return mensagem(resultado.error);

  revalidatePath('/painel');
  redirect(`/painel/atendimento/${attendanceId}`);
}

export async function finalizarAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  const { organizationId } = await requireStaffSession();
  const attendanceId = z.uuid().parse(formData.get('atendimentoId'));

  const cortesia = formData.get('cortesia') === 'on';
  const forma = z
    .enum(['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO', 'FIADO'])
    .safeParse(formData.get('forma'));

  if (!cortesia && !forma.success) return 'Escolha como ela pagou.';

  /**
   * O `try` cobre só a chamada do caso de uso, e nunca o `redirect` abaixo —
   * `redirect` funciona lançando, e engoli-lo faria a navegação sumir.
   *
   * Ele existe porque esta é a ação mais cara de falhar: ela acabou de
   * trabalhar três horas e quer fechar. Uma falha inesperada aqui virava tela
   * branca com "ERROR 3272828623" — aconteceu de verdade, com um serviço de
   * preço zero. Erro do sistema não pode custar o atendimento dela.
   */
  let resultado;
  try {
    resultado = await finalizar(
      {
        organizationId,
        attendanceId,
        fechamento: {
          courtesy: cortesia,
          method: cortesia ? null : (forma.data ?? null),
        },
      },
      deps(),
    );
  } catch (erro) {
    console.error('[atendimento] falha ao finalizar', { attendanceId, erro });
    return 'Não deu para fechar agora. O atendimento continua aberto — tente de novo.';
  }

  if (!resultado.ok) return mensagem(resultado.error);

  revalidatePath('/painel');
  redirect(`/painel/atendimento/${attendanceId}`);
}
