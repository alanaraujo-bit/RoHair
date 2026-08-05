'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import type { OpcoesParaAgendar } from '@/features/painel/application/painel-queries';
import { Button } from '@/shared/ui/primitives/button';
import { Field, Input, Select } from '@/shared/ui/primitives/field';
import { formatMoney } from '@/shared/utils/format-money';

import { criarAgendamentoAction, type AcaoAgendamentoState } from './actions';

/**
 * Novo horário — do botão à vaga preenchida em três toques.
 *
 * O serviço escolhido define a duração, e a duração aparece na tela: agendar
 * sem mostrar quanto tempo está sendo reservado esconderia a decisão. A
 * checagem de conflito acontece no servidor, onde a constraint EXCLUDE é a
 * garantia final (INV-01).
 */
export function NovoHorarioForm({
  opcoes,
  clienteInicial,
  dataInicial,
}: {
  readonly opcoes: OpcoesParaAgendar;
  readonly clienteInicial?: string;
  readonly dataInicial: string;
}) {
  const [estado, formAction, pending] = useActionState<AcaoAgendamentoState, FormData>(
    criarAgendamentoAction,
    { erro: null },
  );
  const [clienteId, setClienteId] = useState(clienteInicial ?? '');
  const [serviceId, setServiceId] = useState('');

  const servico = opcoes.services.find((servico) => servico.id === serviceId);
  const duracaoMin = servico?.durationMin ?? 60;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Link
          href="/painel/agenda"
          className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]"
        >
          ‹ Agenda
        </Link>
        <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
          Novo horário
        </h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Quem">
          {(ids) => (
            <Select
              {...ids}
              name="clienteId"
              value={clienteId}
              onChange={(evento) => setClienteId(evento.target.value)}
              required
            >
              <option value="" disabled>
                Escolha a cliente
              </option>
              {opcoes.clients.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="O que" optional>
          {(ids) => (
            <Select
              {...ids}
              name="serviceId"
              value={serviceId}
              onChange={(evento) => setServiceId(evento.target.value)}
            >
              <option value="">A definir</option>
              {opcoes.services.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.name} · {formatMoney(servico.priceCents)} ·{' '}
                  {servico.durationMin}min
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dia">
            {(ids) => (
              <Input
                {...ids}
                type="date"
                name="data"
                defaultValue={dataInicial}
                min={dataInicial}
                required
              />
            )}
          </Field>
          <Field label="Hora">
            {(ids) => (
              <Input
                {...ids}
                type="time"
                name="hora"
                min="09:00"
                max="19:30"
                defaultValue="09:00"
                required
              />
            )}
          </Field>
        </div>

        <input type="hidden" name="duracaoMin" value={duracaoMin} />

        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          Duração: {formatarDuracao(duracaoMin)} — vem do catálogo do serviço.
        </p>

        {estado.erro !== null && (
          <p
            role="alert"
            className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
          >
            {estado.erro}
          </p>
        )}

        <Button type="submit" size="lg" block loading={pending}>
          Agendar
        </Button>
      </form>
    </div>
  );
}

function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h${resto.toString().padStart(2, '0')}`;
}
