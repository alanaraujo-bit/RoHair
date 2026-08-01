'use client';

import { useId } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Controles de escolha: SegmentedControl e Switch.
 *
 * Os dois são construídos sobre `input` nativo — `radio` e `checkbox` — em vez
 * de `div` com `role`. O ganho não é economia de código: é que a navegação por
 * setas dentro de um grupo de rádios, o comportamento de formulário e o anúncio
 * do leitor de tela vêm prontos e corretos, e reimplementá-los sempre sai pior.
 */

/* ------------------------------------------------------- SegmentedControl */

export type Segment<T extends string> = {
  readonly value: T;
  readonly label: string;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  label,
  className,
}: {
  readonly segments: readonly Segment<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  /** Rótulo do grupo para o leitor de tela. Ex.: "Visão da agenda". */
  readonly label: string;
  readonly className?: string;
}) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex gap-0.5 rounded-full bg-[var(--aurea-canvas-subtle)] p-1',
        className,
      )}
    >
      {segments.map((segment) => {
        const checked = segment.value === value;
        return (
          <label
            key={segment.value}
            className={cn(
              'relative flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4',
              'text-[length:var(--text-sm)] font-medium whitespace-nowrap',
              'transition-colors duration-[var(--duration-fast)]',
              checked
                ? 'bg-[var(--aurea-surface)] text-[var(--aurea-ink)] shadow-[var(--aurea-shadow-sm)]'
                : 'text-[var(--aurea-ink-muted)]',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--aurea-rose)]',
            )}
          >
            <input
              type="radio"
              name={name}
              value={segment.value}
              checked={checked}
              onChange={() => onChange(segment.value)}
              className="sr-only"
            />
            {segment.label}
          </label>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Switch */

/**
 * Chave liga/desliga.
 *
 * Usada nas políticas do portal (docs/09-CONFIGURACAO.md, § 3.4) — é o
 * componente através do qual a D-05 deixou de ser decisão de projeto e virou
 * escolha de cada profissional.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  return (
    <label
      className={cn(
        'flex min-h-[var(--size-touch)] items-center justify-between gap-4',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-[var(--aurea-rose)]',
        'rounded-[var(--radius-sm)]',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[length:var(--text-base)] text-[var(--aurea-ink)]">
          {label}
        </span>
        {description && (
          <span className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          'relative h-[30px] w-[50px] shrink-0 rounded-full',
          'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]',
          checked ? 'bg-[var(--aurea-action)]' : 'bg-[var(--aurea-border-strong)]',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] left-[3px] h-6 w-6 rounded-full bg-white',
            'shadow-[0_1px_3px_rgba(0,0,0,0.28)]',
            'transition-transform duration-[var(--duration-base)] ease-[var(--ease-spring)]',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </label>
  );
}
