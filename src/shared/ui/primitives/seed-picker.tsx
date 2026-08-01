'use client';

import { cn } from '@/shared/utils/cn';

/**
 * Lista de marcar do catálogo semente.
 *
 * É o componente que carrega a DEC-013: o sistema **chega sabendo o domínio da
 * beleza**, e a profissional seleciona o que é dela em vez de digitar tudo do
 * zero. Nenhuma tela de configuração começa vazia — estado vazio com um botão
 * "adicionar" é abandono disfarçado de liberdade.
 *
 * Detalhes que fazem diferença:
 *
 *   - A linha inteira é o alvo de toque, não só a caixinha
 *   - `<fieldset>` + `<legend>` de verdade: o leitor de tela anuncia o grupo
 *     antes de cada item, então "Progressiva" vira "Alisamento, Progressiva"
 *   - O item sugerido vem marcado, mas nunca travado
 */

export type SeedOption = {
  readonly id: string;
  readonly label: string;
  /** Segunda linha discreta — duração típica, categoria, o que ajudar a decidir. */
  readonly detail?: string;
};

export type SeedGroup = {
  readonly label: string;
  readonly options: readonly SeedOption[];
};

export function SeedPicker({
  groups,
  selected,
  onToggle,
  footer,
  className,
}: {
  readonly groups: readonly SeedGroup[];
  readonly selected: ReadonlySet<string>;
  readonly onToggle: (id: string) => void;
  /** Escape para o que não está na semente. Sempre presente, sempre no fim. */
  readonly footer?: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {groups.map((group) => (
        <fieldset key={group.label} className="flex flex-col gap-1">
          <legend className="mb-1.5 text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
            {group.label}
          </legend>

          {group.options.map((option) => (
            <SeedRow
              key={option.id}
              option={option}
              checked={selected.has(option.id)}
              onToggle={() => onToggle(option.id)}
            />
          ))}
        </fieldset>
      ))}

      {footer}
    </div>
  );
}

function SeedRow({
  option,
  checked,
  onToggle,
}: {
  readonly option: SeedOption;
  readonly checked: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        'flex min-h-[var(--size-touch)] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2',
        'transition-colors duration-[var(--duration-fast)]',
        checked
          ? 'bg-[var(--aurea-rose-soft)]'
          : 'hover:bg-[var(--aurea-canvas-subtle)]',
        // O foco vive no input, que é invisível — então o anel precisa ser
        // desenhado na linha, ou navegar por teclado fica às cegas.
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--aurea-rose)]',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2',
          'transition-[background-color,border-color] duration-[var(--duration-fast)]',
          checked
            ? 'border-[var(--aurea-action)] bg-[var(--aurea-action)] text-[var(--aurea-on-action)]'
            : 'border-[var(--aurea-border-strong)]',
        )}
      >
        {checked && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7" />
          </svg>
        )}
      </span>

      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'text-[length:var(--text-base)]',
            checked
              ? 'font-medium text-[var(--aurea-ink)]'
              : 'text-[var(--aurea-ink-muted)]',
          )}
        >
          {option.label}
        </span>
        {option.detail && (
          <span className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
            {option.detail}
          </span>
        )}
      </span>
    </label>
  );
}
