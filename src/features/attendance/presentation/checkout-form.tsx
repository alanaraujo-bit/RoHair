'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/shared/ui/primitives/button';
import { MoneyFigure } from '@/shared/ui/primitives/money-display';
import { Card } from '@/shared/ui/primitives/surface';
import { formatMoney } from '@/shared/utils/format-money';

/**
 * Checkout — **o lucro aparece na hora, não no fim do mês.**
 *
 * É o antídoto direto para a frase que orienta o produto inteiro: 🗣️ *"Fim do
 * dia estou com dinheiro mas fim do mês não tenho mais devido comprar algo que
 * está faltando."* Se o custo do produto aparece a cada atendimento, o fim do
 * mês deixa de ser surpresa.
 *
 * **Cortesia é forma de fechamento, não desconto de 100%** (M-07): some o
 * pagamento da tela, o custo do produto continua contando, e o número grande
 * mostra o prejuízo real de um agrado — que é uma informação que ela merece ter
 * antes de fazer o próximo.
 */

export type FormaDePagamento = 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'FIADO';

const FORMAS: readonly { readonly valor: FormaDePagamento; readonly rotulo: string }[] =
  [
    { valor: 'PIX', rotulo: 'Pix' },
    { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
    { valor: 'DEBITO', rotulo: 'Débito' },
    { valor: 'CREDITO', rotulo: 'Crédito' },
    { valor: 'FIADO', rotulo: 'Depois' },
  ];

export function CheckoutForm({
  itens,
  atendimentoId,
  totalCents,
  custoCents,
  action,
}: {
  readonly itens: readonly {
    readonly id: string;
    readonly nome: string;
    readonly precoCents: number;
  }[];
  readonly atendimentoId: string;
  readonly totalCents: number;
  readonly custoCents: number;
  readonly action: (state: string | null, formData: FormData) => Promise<string | null>;
}) {
  const [erro, formAction, pending] = useActionState(action, null);
  const [cortesia, setCortesia] = useState(false);
  const [forma, setForma] = useState<FormaDePagamento>('PIX');

  const receita = cortesia ? 0 : totalCents;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="atendimentoId" value={atendimentoId} />

      <section className="flex flex-col gap-2">
        <Card tone="quiet" className="flex flex-col gap-2">
          {itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <span className="text-[var(--aurea-ink)]">{item.nome}</span>
              <span className="text-[var(--aurea-ink-muted)] tabular-nums">
                {formatMoney(item.precoCents)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 border-t border-[var(--aurea-border)] pt-2">
            <span className="font-medium text-[var(--aurea-ink)]">Total</span>
            <span className="font-medium text-[var(--aurea-ink)] tabular-nums">
              {formatMoney(receita)}
            </span>
          </div>
        </Card>
      </section>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
          Como pagou
        </legend>

        <div className="grid grid-cols-2 gap-2">
          {FORMAS.map((opcao) => (
            <label
              key={opcao.valor}
              className={[
                'flex min-h-[var(--size-touch)] cursor-pointer items-center justify-center gap-2',
                'rounded-[var(--radius-md)] border border-[var(--aurea-border-strong)]',
                'bg-[var(--aurea-surface)] px-3 text-[var(--aurea-ink)]',
                'has-[:checked]:border-[var(--aurea-rose)] has-[:checked]:bg-[var(--aurea-rose-soft)]',
                cortesia ? 'opacity-40' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name="forma"
                value={opcao.valor}
                checked={forma === opcao.valor}
                disabled={cortesia}
                onChange={() => setForma(opcao.valor)}
                className="h-4 w-4 accent-[var(--aurea-action)]"
              />
              {opcao.rotulo}
            </label>
          ))}

          <label className="flex min-h-[var(--size-touch)] cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--aurea-border-strong)] bg-[var(--aurea-surface)] px-3 text-[var(--aurea-ink)] has-[:checked]:border-[var(--aurea-gold)] has-[:checked]:bg-[var(--aurea-canvas-subtle)]">
            <input
              type="checkbox"
              name="cortesia"
              checked={cortesia}
              onChange={(evento) => setCortesia(evento.target.checked)}
              className="h-4 w-4 accent-[var(--aurea-gold)]"
            />
            Cortesia
          </label>
        </div>

        {forma === 'FIADO' && !cortesia && (
          <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
            Fica registrado como a receber. Só entra no caixa quando ela pagar.
          </p>
        )}
      </fieldset>

      <Card tone="raised">
        <MoneyFigure
          label={cortesia ? 'Custou a você' : 'Você lucrou'}
          netCents={receita - custoCents}
          grossCents={receita}
          costCents={custoCents}
        />
      </Card>

      {erro !== null && (
        <p
          role="alert"
          className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
        >
          {erro}
        </p>
      )}

      <Button type="submit" size="lg" block loading={pending}>
        Concluir
      </Button>
    </form>
  );
}
