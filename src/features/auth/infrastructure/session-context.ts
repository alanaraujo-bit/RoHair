import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE, SESSION_COOKIE_SECURE } from '@/core/auth/session-cookie';
import {
  isSessionExpired,
  SESSION_TTL_SECONDS,
  sessionExpiryFrom,
  shouldRenewSession,
} from '@/core/auth/session-lifetime';
import { hashSessionToken } from '@/core/crypto/session-token';
import { prisma } from '@/core/db/client';

/**
 * Quem está usando o painel, resolvido a partir do cookie.
 *
 * **A sessão é resolvida aqui, no servidor, contra o banco — nunca a partir do
 * conteúdo do cookie.** O cookie carrega um token opaco e nada mais: não há
 * `organizationId` nem papel dentro dele, logo não há nada que valha a pena
 * forjar.
 *
 * `cache()` do React deduplica a consulta dentro de uma mesma renderização: a
 * casca e a página perguntam quem está logado, e o banco responde uma vez só.
 */

export type StaffSession = {
  readonly userId: string;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly name: string;
  readonly roles: readonly string[];
};

export const currentStaffSession = cache(async (): Promise<StaffSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma().session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          deletedAt: true,
          organizationId: true,
          organization: { select: { name: true } },
          memberships: { select: { role: true } },
        },
      },
    },
  });

  const user = session?.user;
  // Sessão de cliente (`accountId`) não serve para o painel: chega aqui com
  // `user` nulo e é tratada como ausência de sessão. É a fronteira da DEC-008
  // valendo em tempo de execução, não só no schema.
  if (!session || !user || user.deletedAt !== null) return null;

  const now = new Date();

  if (isSessionExpired(session.expiresAt, now)) {
    await prisma().session.delete({ where: { id: session.id } });
    return null;
  }

  if (shouldRenewSession(session.expiresAt, now)) {
    await prisma().session.update({
      where: { id: session.id },
      data: { expiresAt: sessionExpiryFrom(now) },
    });
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    name: user.name,
    roles: user.memberships.map((m) => m.role),
  };
});

/**
 * Exigida por **toda** página do painel, e não apenas pela casca.
 *
 * O motivo é uma característica do App Router que é fácil de errar: layout e
 * página renderizam em paralelo. Um guarda que vivesse só no layout deixaria a
 * consulta da página acontecer mesmo com o redirecionamento a caminho — o dado
 * privado seria lido do banco antes de a porta fechar. Cada página pede a
 * sessão porque cada página precisa do `organizationId` de qualquer forma.
 */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await currentStaffSession();
  if (session === null) redirect('/entrar');
  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: SESSION_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Apaga a linha da sessão **e** o cookie. Só o cookie deixaria o token válido. */
export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma().session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  jar.delete(SESSION_COOKIE);
}
