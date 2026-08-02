'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/shared/ui/primitives/button';
import { Card } from '@/shared/ui/primitives/surface';
import { formatMoney } from '@/shared/utils/format-money';

/**
 * 🗣️ "O que vamos fazer hoje?"
 *
 * Primeiro passo do atendimento. Lista fechada, toque grande, sem busca: o
 * catálogo de uma profissional autônoma tem uma dezena de serviços, e um campo
 * de busca aqui seria teclado aberto sem necessidade, com as mãos ocupadas.
 *
 * Marcar mais de um é normal — 🗣️ "progressiva + pontas" é o caso dela.
 */

export type ServicoDisponivel = {
  readonly id: string;
  readonly nome: string;
  readonly precoCents: number;
  readonly duracaoMin: number;
  readonly quimico: boolean;
};

export function ServicePicker({
  servicos,
  atendimentoId,
  action,
}: {
  readonly servicos: readonly ServicoDisponivel[];
  readonly atendimentoId: string;
  readonly action: (state: string | null, formData: FormData) => Promise<string | null>;
}) {
  const [erro, formAction, pending] = useActionState(action, null);
  const [escolhidos, setEscolhidos] = useState<ReadonlySet<string>>(new Set());

  function alternar(id: string) {
    setEscolhidos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="atendimentoId" value={atendimentoId} />

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Serviços deste atendimento</legend>

        {servicos.map((servico) => {
          const marcado = escolhidos.has(servico.id);
          return (
            <Card
              key={servico.id}
              tone={marcado ? 'raised' : 'quiet'}
              className={
                marcado
                  ? 'border-[var(--aurea-rose)] ring-1 ring-[var(--aurea-rose)]'
                  : undefined
              }
            >
              <label className="flex min-h-[var(--size-touch)] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="servico"
                  value={servico.id}
                  checked={marcado}
                  onChange={() => alternar(servico.id)}
                  className="h-5 w-5 shrink-0 accent-[var(--aurea-action)]"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium text-[var(--aurea-ink)]">
                    {servico.nome}
                  </span>
                  <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                    {formatMoney(servico.precoCents)} · {servico.duracaoMin}min
                    {servico.quimico && ' · pede anamnese'}
                  </span>
                </span>
              </label>
            </Card>
          );
        })}
      </fieldset>

      {erro !== null && (
        <p
          role="alert"
          className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
        >
          {erro}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        block
        loading={pending}
        disabled={escolhidos.size === 0}
      >
        Começar
      </Button>
    </form>
  );
}
