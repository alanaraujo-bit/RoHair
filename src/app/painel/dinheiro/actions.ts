'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import {
  lancarDespesa,
  receberFiado,
} from '@/features/painel/infrastructure/painel-repository';

export type AcaoDinheiroState = { readonly ok: boolean; readonly erro: string | null };

/** O dinheiro entra em reais e vira centavos na borda — nunca decimal no banco. */
function paraCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/** O teclado pt-BR digita vírgula; o `Number` não lê "120,50". Normalizar primeiro. */
function valorDoForm(formData: FormData, nome: string): string {
  return String(formData.get(nome) ?? '').replace(',', '.');
}

const despesaSchema = z.object({
  categoria: z.string().trim().min(1).max(40),
  valorReais: z.coerce.number().min(0.01).max(1_000_000),
  descricao: z.string().trim().max(120),
});

export async function lancarDespesaAction(
  _state: AcaoDinheiroState,
  formData: FormData,
): Promise<AcaoDinheiroState> {
  const { organizationId } = await requireStaffSession();

  const parsed = despesaSchema.safeParse({
    categoria: formData.get('categoria'),
    valorReais: valorDoForm(formData, 'valorReais'),
    descricao: formData.get('descricao'),
  });
  if (!parsed.success) return { ok: false, erro: 'Confira o valor e a categoria.' };

  const resultado = await lancarDespesa(organizationId, {
    category: parsed.data.categoria,
    amountCents: paraCentavos(parsed.data.valorReais),
    description: parsed.data.descricao === '' ? null : parsed.data.descricao,
  });
  if (!resultado.ok) return { ok: false, erro: resultado.erro };

  revalidatePath('/painel/dinheiro');
  revalidatePath('/painel');
  return { ok: true, erro: null };
}

export async function receberFiadoAction(
  _state: AcaoDinheiroState,
  formData: FormData,
): Promise<AcaoDinheiroState> {
  const { organizationId } = await requireStaffSession();

  const paymentId = String(formData.get('paymentId') ?? '');
  if (paymentId === '') return { ok: false, erro: 'Cobrança inválida.' };

  const resultado = await receberFiado(organizationId, paymentId);
  if (!resultado.ok) return { ok: false, erro: resultado.erro };

  revalidatePath('/painel/dinheiro');
  revalidatePath('/painel');
  return { ok: true, erro: null };
}
