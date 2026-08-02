import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, SESSION_COOKIE_SECURE } from '@/core/auth/session-cookie';
import { SESSION_TTL_SECONDS } from '@/core/auth/session-lifetime';

/**
 * Porta de entrada do painel.
 *
 * O arquivo se chama `proxy` e não `middleware` porque o Next 16.2 depreciou a
 * convenção antiga; construir em cima de API depreciada é dívida com data
 * marcada.
 *
 * **Isto não é a verificação de sessão.** O proxy roda antes da aplicação, sem
 * banco: tudo que ele sabe é se existe um cookie. Quem valida de verdade é
 * `requireStaffSession()`, no servidor, contra a tabela `session` — e é ele que
 * cada página do painel chama.
 *
 * O proxy existe por dois motivos honestos:
 *
 * 1. **Redirecionar cedo.** Quem não tem cookie nenhum não precisa acordar o
 *    banco para descobrir que precisa entrar.
 * 2. **Rolar a validade do cookie.** O servidor renova a sessão no banco a cada
 *    uso, mas um componente de servidor não pode reescrever cookie. Sem este
 *    passo, a sessão morreria no cliente trinta dias depois do login, por mais
 *    que fosse usada todo dia.
 *
 * Um cookie inválido ou expirado passa por aqui e é barrado adiante. Trocar a
 * ordem — validar aqui, confiar depois — é que seria o erro.
 */

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const destino = new URL('/entrar', request.url);
    // Para voltar exatamente à tela pedida depois de entrar. Só o caminho, nunca
    // uma URL absoluta: aceitar host de fora transformaria o login em
    // redirecionador aberto.
    const alvo = request.nextUrl.pathname + request.nextUrl.search;
    if (alvo !== '/painel') destino.searchParams.set('destino', alvo);
    return NextResponse.redirect(destino);
  }

  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: SESSION_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

export const config = {
  matcher: ['/painel/:path*'],
};
