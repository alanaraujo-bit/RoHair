'use client';

import { useActionState } from 'react';

import { Button } from '@/shared/ui/primitives/button';

/**
 * Formulário de um botão só, que sabe mostrar o erro que a ação devolveu.
 *
 * Existe porque `<form action={...}>` puro não tem para onde levar uma
 * mensagem: a ação devolve texto e ninguém o lê. Aqui o erro aparece **acima do
 * botão**, no mesmo lugar em todas as telas do atendimento — errar na mesma
 * posição é o que faz o erro ser lido.
 */
export function ActionForm({
  atendimentoId,
  rotulo,
  action,
  variant = 'primary',
}: {
  readonly atendimentoId: string;
  readonly rotulo: string;
  readonly action: (state: string | null, formData: FormData) => Promise<string | null>;
  readonly variant?: 'primary' | 'secondary';
}) {
  const [erro, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="atendimentoId" value={atendimentoId} />

      {erro !== null && (
        <p
          role="alert"
          className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
        >
          {erro}
        </p>
      )}

      <Button type="submit" variant={variant} size="lg" block loading={pending}>
        {rotulo}
      </Button>
    </form>
  );
}
