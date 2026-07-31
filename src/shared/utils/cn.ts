type ClassValue = string | number | null | undefined | false;

/**
 * Concatena classes condicionais.
 *
 * Deliberadamente sem `clsx`/`tailwind-merge` nesta fase: a resolução de
 * conflito entre classes do Tailwind só passa a valer a pena quando existirem
 * componentes com variantes sobrepostas, o que chega na Fase 2. Até lá, esta
 * função de três linhas resolve, sem dependência.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
