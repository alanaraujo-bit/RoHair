import type { Metadata } from 'next';

import {
  businessDay,
  DEFAULT_TIME_ZONE as FUSO,
  monthBounds,
} from '@/core/kernel/time';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import {
  produtosDoEstoque,
  resumoDoMes,
} from '@/features/painel/infrastructure/painel-repository';
import { SEED_CATEGORIAS_PRODUTO } from '../../../../prisma/seed-catalog';

import { EstoqueConteudo } from './estoque-form';

export const metadata: Metadata = { title: 'Produtos · RoHair' };
export const dynamic = 'force-dynamic';

/**
 * Estoque — o alerta da tela Hoje deixa de dar 404.
 *
 * A tela é o para onde o alerta leva: quem está acabando vem primeiro, com o
 * botão \"Comprei\" a um toque. O resumo do mês é o gasto em produto e o custo
 * médio por atendimento — a outra metade da frase do fim do mês.
 */
export default async function EstoquePage() {
  const { organizationId } = await requireStaffSession();

  const hoje = businessDay(new Date(), FUSO);
  const partes = hoje.split('-').map((parte) => Number(parte));
  const ano = partes[0] ?? 0;
  const mes = partes[1] ?? 0;
  const bounds = monthBounds(ano, mes);

  const [produtos, resumo] = await Promise.all([
    produtosDoEstoque(organizationId),
    resumoDoMes(organizationId, bounds),
  ]);

  return (
    <EstoqueConteudo
      produtos={produtos}
      resumo={resumo}
      categorias={SEED_CATEGORIAS_PRODUTO}
    />
  );
}
