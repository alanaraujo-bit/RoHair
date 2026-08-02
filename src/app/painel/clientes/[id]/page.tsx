import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { iniciarAtendimentoAction } from '@/app/painel/atendimento/[id]/actions';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { fichaDaCliente } from '@/features/painel/infrastructure/painel-repository';
import { Button } from '@/shared/ui/primitives/button';
import { MoneyText } from '@/shared/ui/primitives/money-display';
import { SafetyAlert } from '@/shared/ui/primitives/safety-alert';
import { Badge, Card } from '@/shared/ui/primitives/surface';
import { formatMoney } from '@/shared/utils/format-money';

export const metadata: Metadata = { title: 'Ficha · RoHair' };
export const dynamic = 'force-dynamic';

const CURVATURA: Record<string, string> = {
  LISO: 'liso',
  ONDULADO: 'ondulado',
  CACHEADO: 'cacheado',
  CRESPO: 'crespo',
};

/**
 * Ficha da cliente.
 *
 * O **alerta de química é a primeira coisa da tela**, acima de qualquer
 * métrica. É o dado que a profissional busca antes de aplicar qualquer coisa —
 * sobrepor química incompatível pode partir o fio. Enterrá-lo no histórico
 * seria erro de segurança, não de layout.
 */
export default async function FichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireStaffSession();

  // A ficha é buscada com o `organizationId` da SESSÃO, nunca com um vindo da
  // URL. É isto que faz trocar o id no endereço não alcançar cliente de outra
  // organização: o filtro não é palpite do cliente, é fato do servidor.
  const ficha = await fichaDaCliente(organizationId, id);
  if (!ficha) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Link
          href="/painel/clientes"
          className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]"
        >
          ‹ Clientes
        </Link>
        <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
          {ficha.nome}
        </h1>
      </div>

      {ficha.quimica ? (
        <SafetyAlert
          level="chemistry"
          title={ficha.quimica.produto ?? 'Química registrada'}
          detail={
            ficha.quimica.quando
              ? `${formatarData(ficha.quimica.quando)} · ${descreverIntervalo(ficha.quimica.quando)}`
              : undefined
          }
        />
      ) : (
        <SafetyAlert level="clear" title="Nenhuma química registrada" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {ficha.temConta && <Badge tone="neutral">tem conta no app</Badge>}
        {ficha.curvatura && (
          <Badge tone="gold">{CURVATURA[ficha.curvatura] ?? ficha.curvatura}</Badge>
        )}
      </div>

      <Card tone="quiet" className="grid grid-cols-3 gap-2 text-center">
        <Estatistica rotulo="visitas" valor={String(ficha.totalVisitas)} />
        <Estatistica rotulo="gasto" valor={formatMoney(ficha.totalGastoCents)} />
        <Estatistica
          rotulo="média"
          valor={ficha.duracaoMediaMin ? formatarDuracao(ficha.duracaoMediaMin) : '—'}
        />
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm">
          Agendar
        </Button>
        <Button variant="secondary" size="sm">
          WhatsApp
        </Button>
      </div>
      <form action={iniciarAtendimentoAction}>
        <input type="hidden" name="clienteId" value={ficha.id} />
        <Button type="submit" size="lg" block>
          Iniciar atendimento
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
          Visitas
        </h2>

        {ficha.visitas.length === 0 ? (
          <Card tone="quiet">
            <p className="text-center text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              Nunca veio ainda.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {ficha.visitas.map((visita) => (
              <li key={visita.id}>
                <Card className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium text-[var(--aurea-ink)]">
                      {visita.servicos}
                    </span>
                    <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                      {formatarData(visita.data)}
                      {visita.duracaoMin
                        ? ` · ${formatarDuracao(visita.duracaoMin)}`
                        : ''}
                    </span>
                  </span>
                  <MoneyText
                    cents={visita.valorCents}
                    muted={visita.valorCents === 0}
                  />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Estatistica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[length:var(--text-lg)] text-[var(--aurea-ink)]">
        {valor}
      </span>
      <span className="text-[length:var(--text-2xs)] text-[var(--aurea-ink-subtle)] uppercase">
        {rotulo}
      </span>
    </div>
  );
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(data);
}

function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h${resto.toString().padStart(2, '0')}`;
}

function descreverIntervalo(data: Date): string {
  const dias = Math.floor((Date.now() - data.getTime()) / 86_400_000);
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}
