import type { Metadata } from 'next';
import Link from 'next/link';

import {
  agendaDeHoje,
  organizacaoAtual,
} from '@/features/painel/infrastructure/painel-repository';
import { Badge, Card } from '@/shared/ui/primitives/surface';

export const metadata: Metadata = { title: 'Agenda · RoHair' };
export const dynamic = 'force-dynamic';

/** Horário de funcionamento padrão. Vira configuração na Fase 7. */
const ABERTURA = 9;
const FECHAMENTO = 20;

/**
 * Agenda do dia.
 *
 * 🗣️ O espaço livre se chama **"vaga"** — a palavra dela: *"verifico se tenho
 * vaga naquele dia e horário"*. É a palavra de quem olha a agenda pelo espaço
 * vazio, não pelo compromisso marcado.
 */
export default async function AgendaPage() {
  const org = await organizacaoAtual();
  if (!org) return null;

  const agenda = await agendaDeHoje(org.id);
  const ocupados = new Map(agenda.map((item) => [Number(item.hora.slice(0, 2)), item]));

  const hoje = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const vagas = Array.from(
    { length: FECHAMENTO - ABERTURA },
    (_, i) => ABERTURA + i,
  ).filter((hora) => !ocupados.has(hora)).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
          Agenda
        </h1>
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          {hoje} · {agenda.length} {agenda.length === 1 ? 'horário' : 'horários'} ·{' '}
          {vagas} vagas
        </p>
      </div>

      <ol className="flex flex-col">
        {Array.from({ length: FECHAMENTO - ABERTURA }, (_, i) => ABERTURA + i).map(
          (hora) => {
            const item = ocupados.get(hora);

            return (
              <li
                key={hora}
                className="flex gap-3 border-t border-[var(--aurea-border)] py-2"
              >
                <span className="w-10 shrink-0 pt-2 text-[length:var(--text-sm)] text-[var(--aurea-ink-subtle)] tabular-nums">
                  {hora.toString().padStart(2, '0')}
                </span>

                {item ? (
                  <Link href={`/painel/clientes/${item.clienteId}`} className="flex-1">
                    <Card className="flex items-center gap-2">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium text-[var(--aurea-ink)]">
                            {item.clienteNome}
                          </span>
                          {item.nova && <Badge tone="rose">nova</Badge>}
                        </span>
                        <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                          {item.servico} · {item.duracaoMin}min
                        </span>
                      </span>
                    </Card>
                  </Link>
                ) : (
                  <span className="flex flex-1 items-center py-3 text-[length:var(--text-sm)] text-[var(--aurea-ink-subtle)]">
                    vaga
                  </span>
                )}
              </li>
            );
          },
        )}
      </ol>
    </div>
  );
}
