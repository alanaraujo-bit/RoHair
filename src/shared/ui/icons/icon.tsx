import { cn } from '@/shared/utils/cn';

/**
 * Base de todos os ícones autorais do RoHair.
 *
 * Por que ícones próprios e não uma biblioteca pronta: a especificidade é a
 * vantagem competitiva do produto (ver 01-VISAO-PRODUTO.md, anti-objetivos).
 * Um ícone genérico de "tesoura" existe em qualquer lugar; um secador, um
 * frasco de progressiva e uma mecha de cabelo desenhados para este domínio são
 * o que faz a profissional reconhecer o app como sendo do mundo dela.
 *
 * Regras da grade, para que o conjunto pareça uma família e não uma coleção:
 *
 *   - Caixa de 24×24, com o desenho contido em 20×20 (2px de respiro)
 *   - Traço de 1.5, arredondado nas duas pontas e nas junções
 *   - Nada de preenchimento: só contorno, para funcionar nos dois temas
 *   - `currentColor` sempre — a cor é decidida por quem usa
 *   - Curva antes de canto: a marca é orgânica e leve, não técnica
 */

export type IconProps = {
  /** Tamanho em pixels do lado da caixa. Padrão 20 — o tamanho de linha de UI. */
  readonly size?: number;
  readonly className?: string;
  /**
   * Rótulo para leitor de tela. Sem ele o ícone é decorativo e fica escondido —
   * que é o caso correto sempre que houver texto ao lado.
   */
  readonly label?: string;
};

type IconShellProps = IconProps & {
  readonly children: React.ReactNode;
};

export function IconShell({ size = 20, className, label, children }: IconShellProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('shrink-0', className)}
    >
      {children}
    </svg>
  );
}
