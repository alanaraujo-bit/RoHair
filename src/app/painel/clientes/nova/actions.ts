'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { phoneNumber } from '@/core/kernel/phone';
import { CURVATURAS } from '@/features/painel/application/painel-queries';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { criarCliente } from '@/features/painel/infrastructure/painel-repository';

export type AcaoClienteState = { readonly erro: string | null };

const schema = z.object({
  nome: z.string().trim().min(2).max(60),
  telefone: z.string().trim().max(20),
  curvatura: z.union([z.literal(''), z.enum(CURVATURAS)]),
});

/**
 * Cliente nova pela interface — antes só existia pela semente ou pelo portal.
 *
 * O telefone passa pelo value object do kernel: é ele que normaliza para o
 * padrão `+55…` que a busca da fusão de fichas (D-07) e o botão WhatsApp usam.
 */
export async function criarClienteAction(
  _state: AcaoClienteState,
  formData: FormData,
): Promise<AcaoClienteState> {
  const { organizationId } = await requireStaffSession();

  const parsed = schema.safeParse({
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    curvatura: formData.get('curvatura') ?? '',
  });
  if (!parsed.success) return { erro: 'Confira o nome da cliente.' };

  let phone: string | null = null;
  if (parsed.data.telefone !== '') {
    const resultado = phoneNumber(parsed.data.telefone);
    if (!resultado.ok) return { erro: 'Confira o telefone — faltou o DDD?' };
    phone = resultado.value;
  }

  const resultado = await criarCliente(organizationId, {
    name: parsed.data.nome,
    phone,
    curvature: parsed.data.curvatura === '' ? null : parsed.data.curvatura,
  });
  if (!resultado.ok) return { erro: resultado.erro };

  redirect(`/painel/clientes/${resultado.id}`);
}
