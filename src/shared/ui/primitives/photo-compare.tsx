'use client';

import { useCallback, useId, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Comparador de antes e depois.
 *
 * O coração emocional do Portal da Cliente (docs/12-WIREFRAMES.md, tela 15) e o
 * motivo pelo qual uma cliente não troca de profissional.
 *
 * Três decisões:
 *
 * 1. **Pointer Events, não mouse + touch.** Um só caminho de código cobre dedo,
 *    caneta e mouse, e `setPointerCapture` mantém o arrasto funcionando quando o
 *    dedo escorrega para fora da imagem — que é o que sempre acontece no celular.
 *
 * 2. **É um `input[type=range]` de verdade, por baixo.** Dá teclado, leitor de
 *    tela e incremento por seta de graça, corretamente. Um `div` com
 *    `role="slider"` exigiria reimplementar tudo isso pior.
 *
 * 3. **`touch-action: none` só no manípulo**, não na imagem: assim a página
 *    ainda rola quando o dedo começa fora da alça.
 */

export function PhotoCompare({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  className,
}: {
  readonly beforeSrc: string;
  readonly afterSrc: string;
  readonly beforeAlt: string;
  readonly afterAlt: string;
  readonly className?: string;
}) {
  const [position, setPosition] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const moveTo = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const { left, width } = frame.getBoundingClientRect();
    if (width === 0) return;
    const next = ((clientX - left) / width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      moveTo(event.clientX);
    },
    [moveTo],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      moveTo(event.clientX);
    },
    [moveTo],
  );

  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={cn(
          'relative aspect-[4/5] w-full overflow-hidden select-none',
          'rounded-[var(--radius-xl)] bg-[var(--aurea-canvas-subtle)]',
        )}
      >
        {/* Depois fica embaixo, inteiro; o antes é recortado por cima. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt={beforeAlt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <Divider position={position} />

        <Corner side="left" label="antes" />
        <Corner side="right" label="depois" />
      </div>

      {/*
        O range é visualmente discreto mas é o controle real: quem navega por
        teclado ajusta por aqui, com as setas, e o leitor de tela lê a posição.
      */}
      <label htmlFor={labelId} className="sr-only">
        Comparar antes e depois
      </label>
      <input
        id={labelId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(position)}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-valuetext={`${Math.round(position)}% do antes visível`}
        className="accent-[var(--aurea-rose)]"
      />
      <figcaption className="text-center text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
        arraste para comparar
      </figcaption>
    </figure>
  );
}

function Divider({ position }: { readonly position: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ left: `${position}%` }}
      className="absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.35)]"
    >
      <span
        className={cn(
          'absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2',
          'items-center justify-center rounded-full bg-white/95 text-[var(--aurea-ink)]',
          '[touch-action:none] shadow-[0_4px_16px_rgba(0,0,0,0.28)]',
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
        </svg>
      </span>
    </div>
  );
}

function Corner({
  side,
  label,
}: {
  readonly side: 'left' | 'right';
  readonly label: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute bottom-3 rounded-full bg-black/45 px-2.5 py-1',
        'text-[length:var(--text-2xs)] font-semibold tracking-wide text-white uppercase',
        'backdrop-blur-sm',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {label}
    </span>
  );
}
