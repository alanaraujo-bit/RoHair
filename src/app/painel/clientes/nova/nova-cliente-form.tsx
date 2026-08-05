'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  CURVATURAS,
  type Curvatura,
} from '@/features/painel/application/painel-queries';
import { Button } from '@/shared/ui/primitives/button';
import { Field, Input, Select } from '@/shared/ui/primitives/field';

import { criarClienteAction, type AcaoClienteState } from './actions';

const CURVATURA_ROTULO: Record<Curvatura, string> = {
  LISO: 'Liso',
  ONDULADO: 'Ondulado',
  CACHEADO: 'Cacheado',
  CRESPO: 'Crespo',
};

/**
 * Ficha nova. CPF e data de nascimento ficam de fora de propósito (D-07/D-08):
 * a profissional não pede isso hoje, e exigir travaria o cadastro. Telefone e
 * curvatura entram porque são as duas chaves de ação: WhatsApp e o retorno.
 */
export function NovaClienteForm() {
  const [estado, formAction, pending] = useActionState<AcaoClienteState, FormData>(
    criarClienteAction,
    { erro: null },
  );

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
          Nova cliente
        </h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Nome" error={estado.erro ?? undefined}>
          {(ids) => (
            <Input
              {...ids}
              name="nome"
              placeholder="Nome da cliente"
              autoComplete="name"
              required
            />
          )}
        </Field>

        <Field
          label="Telefone"
          optional
          hint="Com DDD. É o que liga o botão WhatsApp na ficha."
        >
          {(ids) => (
            <Input
              {...ids}
              name="telefone"
              inputMode="tel"
              placeholder="(11) 98765-4321"
            />
          )}
        </Field>

        <Field label="Curvatura" optional>
          {(ids) => (
            <Select {...ids} name="curvatura" defaultValue="">
              <option value="">Não sei ainda</option>
              {CURVATURAS.map((curvatura) => (
                <option key={curvatura} value={curvatura}>
                  {CURVATURA_ROTULO[curvatura]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Button type="submit" size="lg" block loading={pending}>
          Salvar cliente
        </Button>
      </form>
    </div>
  );
}
