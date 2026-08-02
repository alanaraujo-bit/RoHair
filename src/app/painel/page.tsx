import type { Metadata } from 'next';
import Link from 'next/link';

import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import {
  agendaDeHoje,
  alertasDeHoje,
  atendimentoAberto,
  resumoDeHoje,
} from '@/features/painel/infrastructure/painel-repository';
import { IconBottle, IconCalendar, IconReturn } from '@/shared/ui/icons/domain-icons';
import { Button } from '@/shared/ui/primitives/button';
import { MoneyFigure } from '@/shared/ui/primitives/money-display';
import { Badge, Card, EmptyState } from '@/shared/ui/primitives/surface';

export const metadata: Metadata = { title: 'Hoje · RoHair' };

/** Sempre fresco: agenda e caixa do dia não podem vir de cache. */
export const dynamic = 'force-dynamic';

/**
 * Tela Hoje — a primeira coisa que a profissional vê.
 *
 * Responde "o que eu tenho hoje?" sem rolar. O número grande é **o que
 * sobrou**, nunca o faturamento: faturamento é a ilusão que ela já tem, e o app
 * não pode ser mais uma fonte dela. O que entrou aparece pequeno ao lado,
 * porque escondê-lo seria desonesto.
 */
export default async function HojePage() {
  const { organizationId } = await requireStaffSession();

  const [resumo, agenda, alertas, aberto] = await Promise.all([
    resumoDeHoje(organizationId),
    agendaDeHoje(organizationId),
    alertasDeHoje(organizationId),
    atendimentoAberto(organizationId),
  ]);

  const hoje = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-subtle)]">
        {hoje}
      </p>

      <Card tone="raised">
        <MoneyFigure
          label="Sobrou hoje"
          netCents={resumo.sobrouCents}
          grossCents={resumo.entrouCents}
          costCents={resumo.custoCents}
        />
      </Card>

      {aberto && (
        <section className="flex flex-col gap-2">
          <Titulo>Agora</Titulo>
          <Card tone="raised" className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <p className="font-medium text-[var(--aurea-ink)]">
                {aberto.client.name}
              </p>
              <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                atendimento em andamento
              </p>
            </div>
            <Link href={`/painel/atendimento/${aberto.id}`}>
              <Button size="sm">Abrir</Button>
            </Link>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <Titulo>{aberto ? 'Depois' : 'Hoje'}</Titulo>

        {agenda.length === 0 ? (
          <Card tone="quiet">
            <EmptyState
              icon={<IconCalendar size={38} />}
              title="Nenhum horário hoje"
              description="Aproveite para conferir quem está para voltar."
              action={
                <Link href="/painel/clientes">
                  <Button size="sm">Ver clientes</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {agenda.map((item) => (
              <li key={item.id}>
                <Link href={`/painel/clientes/${item.clienteId}`} className="block">
                  <Card className="flex items-center gap-3">
                    <span className="font-display text-[length:var(--text-lg)] text-[var(--aurea-ink)] tabular-nums">
                      {item.hora}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-[var(--aurea-ink)]">
                          {item.clienteNome}
                        </span>
                        {item.nova && <Badge tone="rose">nova</Badge>}
                        {item.confirmado && <Badge tone="success">confirmado</Badge>}
                      </span>
                      <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                        {item.servico} · {item.duracaoMin}min
                      </span>
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {alertas.length > 0 && (
        <section className="flex flex-col gap-2">
          <Titulo>Atenção</Titulo>
          <ul className="flex flex-col gap-2">
            {alertas.map((alerta) => (
              <li key={alerta.id}>
                <Link href={alerta.href} className="block">
                  <Card
                    tone="quiet"
                    className="flex items-start gap-3 border-l-[3px] border-l-[var(--aurea-warning)]"
                  >
                    <span className="mt-0.5 text-[var(--aurea-warning)]">
                      {alerta.tipo === 'estoque' ? (
                        <IconBottle size={20} />
                      ) : (
                        <IconReturn size={20} />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium text-[var(--aurea-ink)]">
                        {alerta.titulo}
                      </span>
                      <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                        {alerta.detalhe}
                      </span>
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
      {children}
    </h2>
  );
}
