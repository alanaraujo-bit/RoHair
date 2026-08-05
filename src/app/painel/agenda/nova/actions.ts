'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { DEFAULT_TIME_ZONE as FUSO, zonedTimeToUtc } from '@/core/kernel/time';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { criarAgendamento } from '@/features/painel/infrastructure/painel-repository';

export type AcaoAgendamentoState = { readonly erro: string | null };

const schema = z.object({
  clienteId: z.string().min(1),
  serviceId: z.string().trim().max(40),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duracaoMin: z.coerce.number().int().min(5).max(1440),
});

/**
 * Agenda um horário. A data e a hora vêm no relógio do salão; `zonedTimeToUtc`
 * resolve o instante UTC na mesma lógica de `businessDay` (INV-18).
 */
export async function criarAgendamentoAction(
  _state: AcaoAgendamentoState,
  formData: FormData,
): Promise<AcaoAgendamentoState> {
  const { organizationId } = await requireStaffSession();

  const parsed = schema.safeParse({
    clienteId: formData.get('clienteId'),
    serviceId: formData.get('serviceId'),
    data: formData.get('data'),
    hora: formData.get('hora'),
    duracaoMin: formData.get('duracaoMin'),
  });
  if (!parsed.success) return { erro: 'Preencha a cliente, o dia e o horário.' };

  const startsAt = zonedTimeToUtc(parsed.data.data, parsed.data.hora, FUSO);
  const endsAt = new Date(startsAt.getTime() + parsed.data.duracaoMin * 60_000);

  let resultado;
  try {
    resultado = await criarAgendamento(organizationId, {
      clientId: parsed.data.clienteId,
      serviceId: parsed.data.serviceId === '' ? null : parsed.data.serviceId,
      startsAt,
      endsAt,
    });
  } catch (erro) {
    // A checagem amigável de conflito já aconteceu no repositório; chegar aqui
    // é a corrida de verdade (dois toques no mesmo horário) ou uma falha
    // inesperada — e nenhum dos dois pode derrubar a tela.
    console.error('Falha ao criar agendamento:', erro);
    return { erro: 'Não foi possível agendar agora. Tente de novo.' };
  }
  if (!resultado.ok) return { erro: resultado.erro };

  redirect('/painel/agenda');
}
