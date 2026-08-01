import { cn } from '@/shared/utils/cn';

/**
 * Superfícies e sinais: Card, Badge, Chip, Skeleton, EmptyState.
 *
 * Agrupados num arquivo porque são pequenos e compartilham a mesma decisão de
 * elevação. Separá-los em cinco arquivos de vinte linhas custaria navegação sem
 * ganhar nada.
 */

/* ------------------------------------------------------------------ Card */

type CardTone = 'plain' | 'raised' | 'quiet';

const CARD_TONE: Record<CardTone, string> = {
  plain: 'bg-[var(--aurea-surface)] border border-[var(--aurea-border)]',
  // No tema Veludo a elevação vem da luminosidade, não da sombra: sombra sobre
  // fundo escuro não é vista. Por isso `surface-raised` muda com o tema.
  raised:
    'bg-[var(--aurea-surface-raised)] border border-[var(--aurea-border)] shadow-[var(--aurea-shadow-md)]',
  quiet: 'bg-[var(--aurea-canvas-subtle)]',
};

export function Card({
  tone = 'plain',
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'div'> & { readonly tone?: CardTone }) {
  return (
    <div
      className={cn('rounded-[var(--radius-lg)] p-4', CARD_TONE[tone], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Badge */

type BadgeTone = 'neutral' | 'rose' | 'gold' | 'success' | 'warning' | 'danger';

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--aurea-canvas-subtle)] text-[var(--aurea-ink-muted)]',
  rose: 'bg-[var(--aurea-rose-soft)] text-[var(--aurea-rose-strong)]',
  gold: 'bg-[var(--aurea-gold)]/18 text-[var(--aurea-ink)]',
  success: 'bg-[var(--aurea-success)]/15 text-[var(--aurea-success)]',
  warning: 'bg-[var(--aurea-warning)]/18 text-[var(--aurea-ink)]',
  danger: 'bg-[var(--aurea-danger)]/12 text-[var(--aurea-danger)]',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  readonly tone?: BadgeTone;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[length:var(--text-2xs)] font-semibold tracking-wide uppercase',
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Chip */

export function Chip({
  selected = false,
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'button'> & { readonly selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-[var(--size-touch)] items-center gap-1.5 rounded-full px-4',
        'text-[length:var(--text-sm)] font-medium',
        'transition-colors duration-[var(--duration-fast)]',
        selected
          ? 'bg-[var(--aurea-action)] text-[var(--aurea-on-action)]'
          : 'bg-[var(--aurea-canvas-subtle)] text-[var(--aurea-ink-muted)]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------- Skeleton */

/**
 * Esqueleto de carregamento.
 *
 * A regra do produto é que o esqueleto tenha **a forma real** do conteúdo, por
 * isso este primitivo não tenta adivinhar layout: ele é um bloco, e cada tela
 * compõe os blocos no formato do que vai chegar. Um esqueleto genérico de três
 * linhas cinzas mente sobre o que está vindo.
 */
export function Skeleton({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-sm)] bg-[var(--aurea-canvas-subtle)]',
        'motion-safe:animate-pulse',
        className,
      )}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------ EmptyState */

/**
 * Estado vazio.
 *
 * `action` é obrigatório de propósito. O princípio "nada de tela morta" diz que
 * todo estado vazio propõe uma ação — e a forma de garantir isso é o tipo não
 * compilar sem ela, não a revisão de código lembrar.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span className="motion-safe:animate-breathe text-[var(--aurea-rose)] opacity-70">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-display text-[length:var(--text-lg)] text-[var(--aurea-ink)]">
          {title}
        </p>
        {description && (
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            {description}
          </p>
        )}
      </div>
      <div className="mt-1">{action}</div>
    </div>
  );
}
