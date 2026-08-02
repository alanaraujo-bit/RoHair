import { cn } from '@/shared/utils/cn';

/**
 * Botão.
 *
 * Cinco variantes, e nenhuma a mais. Cada uma existe porque uma tela dos
 * wireframes pede, e a lista fechada é o que impede o produto de acumular
 * quinze tons de "primário" ao longo das fases.
 *
 * `quiet` merece explicação: é o botão de ação secundária que NÃO pode parecer
 * desligado. A tela 8 usa nele o "Não passou" do teste de mecha — reprovar é um
 * desfecho seguro e correto, e pintá-lo de vermelho ensinaria a profissional a
 * evitar o caminho certo.
 */

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  // `action` / `on-action`, nunca `rose` + branco: no tema Veludo o rosa é
  // claro e o texto precisa inverter para tinta escura. O par garante AA nos
  // dois temas sem o componente saber qual está ativo.
  primary: cn(
    'bg-[var(--aurea-action)] text-[var(--aurea-on-action)]',
    'shadow-[0_6px_18px_-8px_var(--aurea-glow)]',
    'hover:brightness-[1.06]',
  ),
  secondary: cn(
    'bg-[var(--aurea-surface)] text-[var(--aurea-ink)]',
    'border border-[var(--aurea-border-strong)]',
    'shadow-[var(--aurea-shadow-sm)]',
    'hover:bg-[var(--aurea-canvas-subtle)]',
  ),
  quiet: cn(
    'bg-[var(--aurea-rose-soft)] text-[var(--aurea-rose-strong)]',
    'hover:brightness-[0.97]',
  ),
  ghost: cn('text-[var(--aurea-ink-muted)]', 'hover:bg-[var(--aurea-canvas-subtle)]'),
  danger: cn('bg-[var(--aurea-danger)] text-white', 'hover:brightness-95'),
};

const SIZE: Record<ButtonSize, string> = {
  // O alvo mínimo é sempre 44px, mesmo no tamanho `sm`: o que encolhe é o
  // texto e o preenchimento horizontal, nunca a área tocável (WCAG 2.2 + iOS).
  sm: 'min-h-[var(--size-touch)] px-3.5 text-[length:var(--text-sm)] rounded-[var(--radius-sm)]',
  md: 'min-h-[var(--size-touch)] px-5 text-[length:var(--text-base)] rounded-[var(--radius-md)]',
  lg: 'min-h-[3.25rem] px-6 text-[length:var(--text-md)] rounded-[var(--radius-lg)]',
};

/**
 * As classes do botão, para quem **não é** um `<button>`.
 *
 * Existe por causa de um erro que este projeto cometeu e pagou: `<Link>` com um
 * `<Button>` dentro. É HTML inválido — controle interativo dentro de controle
 * interativo — e o preço não é teórico: o cálculo do nome acessível ignora o
 * conteúdo interativo, então o link fica **sem nome** para leitor de tela. Foi
 * assim que um teste em produção não achou o botão "Finalizar": ele existia na
 * tela e não existia para quem navega por acessibilidade.
 *
 * Quem navega, navega por link. Quem age, aciona botão. Um link com cara de
 * botão usa isto.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly block?: boolean;
  readonly className?: string;
} = {}): string {
  return cn(
    'relative inline-flex items-center justify-center gap-2',
    'font-medium tracking-[-0.01em] whitespace-nowrap',
    'transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
    'active:translate-y-px',
    VARIANT[variant],
    SIZE[size],
    block && 'w-full',
    className,
  );
}

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Ocupa toda a largura disponível. O padrão das ações principais no celular. */
  readonly block?: boolean;
  /**
   * Em andamento. Desabilita e anuncia por `aria-busy`, mas **mantém a largura**
   * — botão que encolhe ao carregar faz o layout pular sob o dedo.
   */
  readonly loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-medium tracking-[-0.01em] whitespace-nowrap',
        'transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
        // O afundar de 1px é a única resposta tátil disponível no Safari do iPhone,
        // que não expõe `navigator.vibrate`. Ver 02-ARQUITETURA.md, seção 8.
        'active:translate-y-px',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANT[variant],
        SIZE[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      <span className={cn('contents', loading && 'invisible')}>{children}</span>
      {loading && <Spinner />}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute h-4 w-4 rounded-full',
        'border-2 border-current/25 border-t-current',
        'motion-safe:animate-spin',
      )}
    />
  );
}
