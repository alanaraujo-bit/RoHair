import Link from 'next/link';

import { Monogram } from '@/shared/ui/brand/monogram';
import { IconCalendar, IconMirror, IconMoney } from '@/shared/ui/icons/domain-icons';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

/**
 * Casca do Painel Profissional.
 *
 * Navegação inferior com quatro destinos e alvo de 44px, porque é usada com uma
 * mão e o polegar não alcança o topo da tela do iPhone.
 *
 * ⚠️ **Sem autenticação ainda.** A sessão chega na Fase 4; até lá o painel lê a
 * primeira organização do banco. Os dados são de demonstração.
 */

const DESTINOS = [
  { href: '/painel', rotulo: 'Hoje', Icone: IconMoney },
  { href: '/painel/agenda', rotulo: 'Agenda', Icone: IconCalendar },
  { href: '/painel/clientes', rotulo: 'Clientes', Icone: IconMirror },
] as const;

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link href="/painel" className="flex items-center gap-2.5">
          <Monogram size="sm" />
          <span className="sr-only">RoHair — painel</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-5 pb-28">{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t border-[var(--aurea-border)] bg-[var(--aurea-surface)]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      >
        <ul className="flex">
          {DESTINOS.map(({ href, rotulo, Icone }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex min-h-[var(--size-touch)] flex-col items-center gap-1 py-2.5 text-[var(--aurea-ink-muted)] transition-colors hover:text-[var(--aurea-ink)]"
              >
                <Icone size={22} />
                <span className="text-[length:var(--text-2xs)] font-medium">
                  {rotulo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
