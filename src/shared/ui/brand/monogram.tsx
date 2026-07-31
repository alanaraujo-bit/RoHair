import { cn } from '@/shared/utils/cn';

type MonogramSize = 'sm' | 'md' | 'lg';

const SIZE: Record<MonogramSize, string> = {
  sm: 'h-9 w-9 text-[15px] rounded-[10px]',
  md: 'h-12 w-12 text-xl rounded-[14px]',
  lg: 'h-20 w-20 text-[34px] rounded-[24px]',
};

/**
 * Monograma "Ro" — o núcleo da identidade do RoHair (DEC-011).
 *
 * O nome vem de Rosiele. A marca é pessoal por decisão de produto, então o
 * monograma carrega o nome dela e não uma abstração genérica de "beleza".
 */
export function Monogram({
  size = 'md',
  className,
}: {
  size?: MonogramSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden select-none',
        'bg-gradient-to-br from-[var(--aurea-gold)] via-[var(--aurea-rose)] to-[var(--aurea-rose-strong)]',
        'shadow-[0_8px_24px_-8px_var(--aurea-glow)]',
        SIZE[size],
        className,
      )}
    >
      {/* Brilho superior: dá o acabamento metálico do ouro rosé */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent" />
      <span className="relative font-display leading-none font-medium tracking-tight text-white">
        Ro
      </span>
    </span>
  );
}
