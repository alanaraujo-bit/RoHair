'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { UNIDADES } from '@/features/painel/application/painel-queries';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import {
  criarProduto,
  registrarCompra,
} from '@/features/painel/infrastructure/painel-repository';

export type AcaoEstoqueState = { readonly ok: boolean; readonly erro: string | null };

/** O dinheiro entra em reais e vira centavos na borda — nunca número decimal no banco. */
function paraCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * O teclado pt-BR digita vírgula; o `Number` não lê "120,50". Normalizar antes
 * de validar é o que faz o campo aceitar a forma como a Roziele escreve.
 */
function valorDoForm(formData: FormData, nome: string): string {
  return String(formData.get(nome) ?? '').replace(',', '.');
}

const compraSchema = z.object({
  productId: z.string().min(1),
  quantidade: z.coerce.number().int().min(1).max(1000),
  custoReais: z.coerce.number().min(0).max(100_000),
});

export async function comprarProdutoAction(
  _state: AcaoEstoqueState,
  formData: FormData,
): Promise<AcaoEstoqueState> {
  const { organizationId } = await requireStaffSession();

  const parsed = compraSchema.safeParse({
    productId: formData.get('productId'),
    quantidade: formData.get('quantidade'),
    custoReais: valorDoForm(formData, 'custoReais'),
  });
  if (!parsed.success) return { ok: false, erro: 'Confira a quantidade e o custo.' };

  const resultado = await registrarCompra(organizationId, {
    productId: parsed.data.productId,
    quantityUnits: parsed.data.quantidade,
    unitCostCents: paraCentavos(parsed.data.custoReais),
  });
  if (!resultado.ok) return { ok: false, erro: resultado.erro };

  // O alerta da tela Hoje conta o mesmo estoque; ele precisa saber da compra.
  revalidatePath('/painel/estoque');
  revalidatePath('/painel');
  return { ok: true, erro: null };
}

const produtoSchema = z.object({
  nome: z.string().trim().min(2).max(60),
  marca: z.string().trim().max(40),
  categoria: z.string().trim().min(1).max(40),
  unidade: z.enum(UNIDADES),
  custoReais: z.coerce.number().min(0).max(100_000),
  rendimento: z.string().trim().max(4),
});

/**
 * Campo opcional de verdade: vazio vira ausência. `rendimento` chega como
 * texto para não misturar "não preenchi" com "zero".
 */
function rendimentoValido(rendimento: string): number | null {
  if (rendimento === '') return null;
  if (!/^\d{1,4}$/.test(rendimento)) return null;
  const valor = Number(rendimento);
  return valor >= 1 && valor <= 1000 ? valor : null;
}

export async function criarProdutoAction(
  _state: AcaoEstoqueState,
  formData: FormData,
): Promise<AcaoEstoqueState> {
  const { organizationId } = await requireStaffSession();

  const parsed = produtoSchema.safeParse({
    nome: formData.get('nome'),
    marca: formData.get('marca'),
    categoria: formData.get('categoria'),
    unidade: formData.get('unidade'),
    custoReais: valorDoForm(formData, 'custoReais'),
    rendimento: formData.get('rendimento'),
  });
  if (!parsed.success) return { ok: false, erro: 'Confira o cadastro do produto.' };

  const rendimento = rendimentoValido(parsed.data.rendimento);
  if (parsed.data.rendimento !== '' && rendimento === null) {
    return { ok: false, erro: 'O rendimento deve ser um número entre 1 e 1000.' };
  }

  const resultado = await criarProduto(organizationId, {
    name: parsed.data.nome,
    brand: parsed.data.marca === '' ? null : parsed.data.marca,
    category: parsed.data.categoria,
    unit: parsed.data.unidade,
    unitCostCents: paraCentavos(parsed.data.custoReais),
    yieldPerUnit: rendimento,
  });
  if (!resultado.ok) return { ok: false, erro: resultado.erro };

  revalidatePath('/painel/estoque');
  revalidatePath('/painel');
  return { ok: true, erro: null };
}
