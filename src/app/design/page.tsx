import type { Metadata } from 'next';

import { Monogram } from '@/shared/ui/brand/monogram';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

import { Catalog } from './catalog';

/**
 * Catálogo vivo do design system Áurea.
 *
 * **Por que uma rota do app e não Storybook.** A Fase 2 previa Storybook, e a
 * troca é deliberada: o Storybook mantém a própria configuração de build, o
 * próprio pipeline de CSS e o próprio carregamento de fonte. Com Tailwind v4
 * (`@theme inline`) e `next/font`, isso significa que o catálogo poderia passar
 * enquanto o aplicativo real quebra — a falha mais cara que um catálogo pode
 * ter, porque ela destrói a confiança em tudo que ele mostra.
 *
 * Esta rota usa **exatamente** o pipeline de produção: mesmas fontes, mesmo
 * CSS, mesmo alternador de tema, mesmo deploy. Publica junto com o aplicativo,
 * sem segundo projeto na Vercel e sem segundo job de CI.
 *
 * O que se perde: controles de argumento e documentação gerada. Se isso fizer
 * falta, o Storybook entra depois sem desfazer nada daqui.
 */
export const metadata: Metadata = {
  title: 'Áurea — catálogo',
  description: 'Os primitivos do design system do RoHair, nos dois temas.',
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-10">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monogram size="md" />
          <div className="flex flex-col">
            <h1 className="font-display text-[length:var(--text-2xl)] leading-none text-[var(--aurea-ink)]">
              Áurea
            </h1>
            <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              Catálogo do design system
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <p className="max-w-prose text-[length:var(--text-base)] text-[var(--aurea-ink-muted)]">
        Troque o tema no canto: cada primitivo foi desenhado para os dois, e o contraste
        é verificado por cálculo no CI, não conferido a olho.
      </p>

      <Catalog />

      <footer className="border-t border-[var(--aurea-border)] pt-6 text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
        Fase 2 · os primitivos saíram dos 16 wireframes da Fase 1, não de uma lista
        genérica.
      </footer>
    </main>
  );
}
