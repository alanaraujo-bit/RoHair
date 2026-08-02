import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { currentStaffSession } from '@/features/auth/infrastructure/session-context';
import { LoginForm } from '@/features/auth/presentation/login-form';
import { Monogram } from '@/shared/ui/brand/monogram';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

import { entrarAction } from './actions';

export const metadata: Metadata = { title: 'Entrar · RoHair' };

/** Nunca em cache: a decisão depende de quem está pedindo. */
export const dynamic = 'force-dynamic';

/**
 * A porta do painel.
 *
 * Uma caixa só, no meio da tela, com o monograma acima — a mesma gramática da
 * tela 13 do portal. 🗣️ O tom é da Rosiele, na primeira pessoa: quem entra aqui
 * é ela e a equipe dela, não "usuários do sistema".
 *
 * Sem "criar conta": pela DEC-008 não existe autocadastro de equipe. A primeira
 * conta nasce por script; as demais, pelo painel, pelas mãos da OWNER.
 */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}) {
  // Quem já está logado não vê tela de login. Sem isso, o botão "voltar" depois
  // de entrar mostra o formulário de novo e parece que a sessão se perdeu.
  if ((await currentStaffSession()) !== null) redirect('/painel');

  const { destino } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center gap-8 px-6 py-12">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-5">
          <Monogram size="lg" />
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-[length:var(--text-2xl)] leading-tight text-[var(--aurea-ink)]">
              O meu salão,
              <br />
              no meu bolso.
            </h1>
            <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              Entre para ver o dia de hoje.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <LoginForm action={entrarAction} destino={destino ?? '/painel'} />

      <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
        As contas da equipe são criadas por quem é dona do salão. Se você esqueceu a
        senha, peça para ela redefinir.
      </p>
    </div>
  );
}
