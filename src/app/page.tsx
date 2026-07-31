import { Monogram } from '@/shared/ui/brand/monogram';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

/**
 * Painel de acompanhamento da Fase 0.
 *
 * Tela temporária, substituída pelo app shell na Fase 5. Existe por dois
 * motivos: dar ao dono do produto uma leitura honesta do que já está de pé, e
 * servir de primeiro teste real dos tokens do Áurea nos dois temas.
 */

type Status = 'pronto' | 'andamento' | 'pendente';

type FoundationItem = {
  readonly title: string;
  readonly detail: string;
  readonly status: Status;
};

const FOUNDATION: readonly FoundationItem[] = [
  {
    title: 'Next.js 16 · React 19 · TypeScript estrito',
    detail: 'App Router, modo strict e zero any imposto por configuração',
    status: 'pronto',
  },
  {
    title: 'Design tokens Áurea',
    detail: 'Cor em OKLCH, dois temas com identidade própria, movimento por mola',
    status: 'pronto',
  },
  {
    title: 'Arquitetura em camadas',
    detail: 'app · features · shared · core, com fronteiras explícitas',
    status: 'pronto',
  },
  {
    title: 'Validação de ambiente com Zod',
    detail: 'A aplicação não sobe com variável faltando ou inválida',
    status: 'pronto',
  },
  {
    title: 'Lint de fronteiras entre camadas',
    detail: 'Import indevido entre camadas falha o build, não a revisão',
    status: 'pronto',
  },
  {
    title: 'Vitest · Playwright',
    detail: '8 testes de unidade em 345ms · 3 testes de fumaça ponta a ponta',
    status: 'pronto',
  },
  {
    title: 'CI no GitHub Actions',
    detail: 'Tipo, lint, formato, teste, build e E2E em todo pull request',
    status: 'pronto',
  },
  {
    title: 'PostgreSQL e Redis no Railway',
    detail: 'Depende de você autorizar o Railway no repositório',
    status: 'pendente',
  },
  {
    title: 'Deploy automático na Vercel',
    detail: 'Depende de você conectar a Vercel ao repositório',
    status: 'pendente',
  },
] as const;

const STATUS_STYLE: Record<Status, { dot: string; label: string; text: string }> = {
  pronto: {
    dot: 'bg-[var(--aurea-success)]',
    label: 'Pronto',
    text: 'text-[var(--aurea-success)]',
  },
  andamento: {
    dot: 'bg-[var(--aurea-gold)] animate-breathe',
    label: 'Em andamento',
    text: 'text-[var(--aurea-gold)]',
  },
  pendente: {
    dot: 'bg-line-strong',
    label: 'A seguir',
    text: 'text-ink-subtle',
  },
};

const STACK = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Tailwind 4',
  'OKLCH',
  'Prisma',
  'PostgreSQL',
  'Serwist',
] as const;

export default function FoundationPage() {
  const done = FOUNDATION.filter((item) => item.status === 'pronto').length;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-6 py-10 sm:px-10">
      {/* Halo de fundo: a única licença decorativa da tela, e ela existe para
          dar profundidade ao tema escuro sem recorrer a bordas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, var(--aurea-rose-soft), transparent 68%)',
        }}
      />

      <header className="animate-rise mx-auto flex w-full max-w-3xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Monogram size="sm" />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-ink">RoHair</p>
            <p className="text-xs text-ink-subtle">Ambiente de desenvolvimento</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
        <section className="animate-rise" style={{ animationDelay: '80ms' }}>
          <Monogram size="lg" className="mb-8" />

          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs font-medium text-ink-muted backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-rose" />
            Fase 0 · Fundação de Infraestrutura
          </p>

          <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-normal tracking-[-0.02em] text-balance text-ink">
            A fundação está sendo levantada.
          </h1>

          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-ink-muted">
            Nenhuma tela do produto foi construída ainda — e isso é proposital. O que
            está de pé agora é a base que torna cada fase seguinte verificável: camadas,
            tipos, temas e a esteira que testa tudo antes de publicar.
          </p>
        </section>

        <section
          className="animate-rise mt-14"
          style={{ animationDelay: '160ms' }}
          aria-labelledby="fundacao"
        >
          <div className="mb-5 flex items-baseline justify-between">
            <h2
              id="fundacao"
              className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase"
            >
              Fundação
            </h2>
            <p className="font-display text-sm text-ink-subtle">
              <span className="text-ink">{done}</span> de {FOUNDATION.length}
            </p>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/50 backdrop-blur-xl">
            {FOUNDATION.map((item) => {
              const style = STATUS_STYLE[item.status];
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-4 px-5 py-4 transition-colors duration-300"
                >
                  <span
                    className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium tracking-tight text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-subtle">
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={`hidden shrink-0 text-xs font-medium sm:block ${style.text}`}
                  >
                    {style.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <footer
        className="animate-rise mx-auto w-full max-w-3xl"
        style={{ animationDelay: '240ms' }}
      >
        <ul className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-subtle"
            >
              {tech}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-ink-subtle">
          Toque no ícone acima para alternar entre{' '}
          <span className="text-ink-muted">Porcelana</span> e{' '}
          <span className="text-ink-muted">Veludo</span> — os dois temas são desenhados
          separadamente, não invertidos.
        </p>
      </footer>
    </main>
  );
}
