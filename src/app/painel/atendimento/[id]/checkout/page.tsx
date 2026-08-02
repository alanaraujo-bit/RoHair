import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  formatarDuracao,
  montarView,
} from '@/features/attendance/application/attendance-view';
import { attendanceRepository } from '@/features/attendance/infrastructure/prisma-attendance-repository';
import { CheckoutForm } from '@/features/attendance/presentation/checkout-form';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';

import { finalizarAction } from '../actions';

export const metadata: Metadata = { title: 'Finalizar · RoHair' };
export const dynamic = 'force-dynamic';

/**
 * Checkout.
 *
 * Rota própria, e não uma seção da tela anterior, por um motivo prático: é a
 * única parte do atendimento em que ela para, olha e decide. Deixar o
 * cronômetro correndo ao lado faria a decisão de dinheiro competir com a de
 * trabalho.
 */
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireStaffSession();

  const tela = await attendanceRepository.load(organizationId, id);
  if (tela === null) notFound();

  const view = montarView(tela, new Date());

  // Já encerrado: quem volta pelo histórico do navegador vê o resumo, e não um
  // formulário que fecharia de novo o que já está fechado.
  if (view.status !== 'EM_ANDAMENTO') redirect(`/painel/atendimento/${id}`);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Link
          href={`/painel/atendimento/${id}`}
          className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]"
        >
          ‹ Voltar ao atendimento
        </Link>
        <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
          Finalizar · {view.clienteNome}
        </h1>
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          {formatarDuracao(view.minutos)} · {view.titulo}
        </p>
      </div>

      <CheckoutForm
        atendimentoId={id}
        itens={view.itens}
        totalCents={view.totalCents}
        custoCents={view.custoCents}
        action={finalizarAction}
      />
    </div>
  );
}
