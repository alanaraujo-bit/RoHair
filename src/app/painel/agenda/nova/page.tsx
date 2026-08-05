import type { Metadata } from 'next';

import { businessDay } from '@/core/kernel/time';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { opcoesParaAgendar } from '@/features/painel/infrastructure/painel-repository';

import { NovoHorarioForm } from './novo-horario-form';

export const metadata: Metadata = { title: 'Novo horário · RoHair' };
export const dynamic = 'force-dynamic';

const FUSO = 'America/Sao_Paulo';

/**
 * Novo horário. Chega pré-selecionada quando vem do botão \"Agendar\" da ficha
 * (`?cliente=<id>`); vazia quando vem do \"+ Novo\" da agenda.
 */
export default async function NovoHorarioPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { organizationId } = await requireStaffSession();

  const parametros = await searchParams;
  const opcoes = await opcoesParaAgendar(organizationId);

  return (
    <NovoHorarioForm
      opcoes={opcoes}
      clienteInicial={
        typeof parametros.cliente === 'string' ? parametros.cliente : undefined
      }
      dataInicial={businessDay(new Date(), FUSO)}
    />
  );
}
