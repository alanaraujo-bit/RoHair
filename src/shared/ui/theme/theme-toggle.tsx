'use client';

import { useTheme } from './use-theme';

/**
 * Alternância entre Porcelana e Veludo.
 *
 * O alvo de 44px não é estético: é o mínimo da WCAG 2.2 para toque, e o teste
 * de fumaça em e2e/fundacao.spec.ts falha se alguém encolher isto.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={isDark}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70 text-ink-muted backdrop-blur-xl transition-[color,border-color,transform] duration-300 hover:border-line-strong hover:text-ink focus-visible:outline-rose active:scale-95"
    >
      <span className="sr-only">
        {isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
      </span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        )}
      </svg>
    </button>
  );
}
