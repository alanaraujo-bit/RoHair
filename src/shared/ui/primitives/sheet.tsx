'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Bottom sheet e diálogo, sobre o elemento `<dialog>` nativo.
 *
 * **Por que não Radix.** O `<dialog>` do navegador já entrega, nativamente e
 * corretamente, tudo que uma biblioteca de overlay existe para resolver:
 * armadilha de foco, `Esc` para fechar, `inert` no resto da página, ordem de
 * leitura correta na camada superior e `::backdrop`. Está disponível no Safari
 * desde a 15.4 (2022), muito antes do piso do nosso público.
 *
 * Adotar Radix aqui significaria trazer uma dependência para reimplementar em
 * JavaScript o que a plataforma faz melhor — e ainda herdar o risco de a
 * biblioteca divergir do comportamento nativo. Radix continua sendo a escolha
 * certa para o que o HTML não resolve; overlay não é mais esse caso.
 *
 * O arrasto para fechar chega na Fase 5, junto com os demais gestos.
 */

type SheetSide = 'bottom' | 'center';

export function Sheet({
  open,
  onClose,
  title,
  description,
  side = 'bottom',
  children,
  footer,
  className,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly side?: SheetSide;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // `showModal` é o que ativa a camada superior e o `inert` implícito.
    // `open={true}` como atributo NÃO faz isso — abriria um diálogo sem foco
    // preso e sem fundo bloqueado, que é pior que não ter diálogo nenhum.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // O `Esc` do navegador fecha o elemento sem passar pelo nosso estado.
    // Sem ouvir `close`, o React continuaria achando que está aberto.
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const isBottom = side === 'bottom';

  return (
    <dialog
      ref={ref}
      aria-label={title}
      // Clicar no fundo fecha. O alvo do clique é o próprio `<dialog>` apenas
      // quando o toque cai fora do conteúdo, porque o painel interno cobre a
      // área útil — daí a comparação com `event.target`.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        'w-full bg-transparent p-0 text-[var(--aurea-ink)] backdrop:bg-black/45',
        'backdrop:backdrop-blur-[2px]',
        'motion-safe:backdrop:animate-[aurea-fade_var(--duration-base)_var(--ease-out-soft)]',
        isBottom
          ? 'mt-auto mb-0 max-w-[var(--container-lg)] sm:mx-auto sm:mb-6'
          : 'm-auto max-w-[26rem] px-4',
      )}
    >
      {/* O conteúdo é um filho separado para que o clique no fundo tenha alvo próprio */}
      <div
        className={cn(
          'flex max-h-[85dvh] flex-col bg-[var(--aurea-surface)]',
          'shadow-[var(--aurea-shadow-lg)]',
          isBottom
            ? 'rounded-t-[var(--radius-2xl)] pb-[env(safe-area-inset-bottom)] sm:rounded-b-[var(--radius-2xl)]'
            : 'rounded-[var(--radius-xl)]',
          'motion-safe:animate-[aurea-sheet-in_var(--duration-base)_var(--ease-spring)]',
          className,
        )}
      >
        {isBottom && (
          <span
            aria-hidden="true"
            className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-[var(--aurea-border-strong)]"
          />
        )}

        <header className="flex flex-col gap-1 px-5 pt-4 pb-3">
          <h2 className="font-display text-[length:var(--text-xl)] leading-tight text-[var(--aurea-ink)]">
            {title}
          </h2>
          {description && (
            <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              {description}
            </p>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && (
          <footer className="border-t border-[var(--aurea-border)] px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
