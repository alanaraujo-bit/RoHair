import { formatMoney, splitMoney } from '@/shared/utils/format-money';
import { cn } from '@/shared/utils/cn';

/**
 * O número que responde "quanto sobrou".
 *
 * Este componente carrega a decisão de produto mais importante da Fase 1:
 *
 *   > 🗣️ "Fim do dia estou com dinheiro mas fim do mês não tenho mais devido
 *   > comprar algo que está faltando."
 *
 * A Rosiele enxerga **caixa**, não lucro — e faturamento é justamente a ilusão
 * que ela já tem. O app não pode ser mais uma fonte dela. Por isso o valor em
 * destaque é sempre o que **sobrou**, e o que **entrou** aparece pequeno ao
 * lado: escondê-lo seria desonesto, mas ele não é a manchete.
 *
 * A API força isso. Não existe uma variante "grande" genérica — existe
 * `Figure`, que é o que sobrou, e `gross`, que é o contexto abaixo dele.
 */

export function MoneyFigure({
  /** O que sobrou, em centavos. É este número que fica grande. */
  netCents,
  /** O que entrou, em centavos. Contexto, nunca destaque. */
  grossCents,
  /** Quanto do bruto virou custo, em centavos. */
  costCents,
  label,
  className,
}: {
  readonly netCents: number;
  readonly grossCents?: number;
  readonly costCents?: number;
  readonly label: string;
  readonly className?: string;
}) {
  const { symbol, whole, cents, negative } = splitMoney(netCents);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
        {label}
      </p>

      {/*
        O valor acessível vai num rótulo próprio: o leitor de tela não deve
        soletrar "R cifrão 186 vírgula 40" a partir de três spans separados.
      */}
      <p
        className="flex items-baseline gap-1 font-display leading-none tracking-[-0.02em] text-[var(--aurea-ink)]"
        aria-label={`${label}: ${formatMoney(netCents)}`}
      >
        <span aria-hidden="true" className="contents">
          {negative && <span className="text-[length:var(--text-xl)]">−</span>}
          <span className="text-[length:var(--text-lg)] text-[var(--aurea-ink-muted)]">
            {symbol}
          </span>
          <span className="text-[length:var(--text-figure)] font-medium">{whole}</span>
          <span className="text-[length:var(--text-lg)] text-[var(--aurea-ink-muted)]">
            ,{cents}
          </span>
        </span>
      </p>

      {(grossCents !== undefined || costCents !== undefined) && (
        <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
          {grossCents !== undefined && <>de {formatMoney(grossCents)}</>}
          {grossCents !== undefined && costCents !== undefined && ' · '}
          {costCents !== undefined && <>produto {formatMoney(costCents)}</>}
        </p>
      )}
    </div>
  );
}

/**
 * Valor em linha — listas, itens de checkout, histórico.
 *
 * `muted` existe para o R$ 0,00 do corte de pontas, que a profissional não
 * cobra à parte: mostrar zero em peso normal sugere erro de cadastro.
 */
export function MoneyText({
  cents,
  muted = false,
  className,
}: {
  readonly cents: number;
  readonly muted?: boolean;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        'font-display tracking-[-0.01em] tabular-nums',
        muted ? 'text-[var(--aurea-ink-subtle)]' : 'text-[var(--aurea-ink)]',
        className,
      )}
    >
      {formatMoney(cents)}
    </span>
  );
}
