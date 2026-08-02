'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  authenticateStaff,
  describeAuthenticationFailure,
} from '@/features/auth/application/authenticate-staff';
import { systemClock } from '@/features/auth/application/ports';
import { argon2Hasher } from '@/features/auth/infrastructure/argon2-hasher';
import {
  attemptRepository,
  auditRecorder,
  sessionRepository,
  staffCredentialsRepository,
} from '@/features/auth/infrastructure/prisma-auth-repository';
import {
  destroyCurrentSession,
  setSessionCookie,
} from '@/features/auth/infrastructure/session-context';
import { type LoginState } from '@/features/auth/presentation/login-form';

/**
 * A raiz de composição do login: é aqui que os adapters concretos entram no
 * lugar das portas. O caso de uso continua sem saber que existe Prisma.
 */

const schema = z.object({
  identificador: z.string().min(1).max(255),
  senha: z.string().min(1).max(128),
  destino: z.string().optional(),
});

export async function entrarAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    identificador: formData.get('identificador'),
    senha: formData.get('senha'),
    destino: formData.get('destino'),
  });

  // O identificador volta para a tela em todo caminho de erro; a senha, nunca.
  const digitado = String(formData.get('identificador') ?? '').slice(0, 255);

  if (!parsed.success) {
    return { erro: 'Preencha o usuário e a senha.', identificador: digitado };
  }

  const resultado = await authenticateStaff(
    {
      identifier: parsed.data.identificador,
      password: parsed.data.senha,
      address: await clientAddress(),
    },
    {
      credentials: staffCredentialsRepository,
      sessions: sessionRepository,
      attempts: attemptRepository,
      hasher: argon2Hasher,
      audit: auditRecorder,
      clock: systemClock,
    },
  );

  if (!resultado.ok) {
    return {
      erro: describeAuthenticationFailure(resultado.error),
      identificador: digitado,
    };
  }

  await setSessionCookie(resultado.value.token);

  // `redirect` lança por dentro — precisa ficar fora de qualquer try/catch, e
  // depois do cookie já estar posto.
  redirect(destinoSeguro(parsed.data.destino));
}

export async function sairAction(): Promise<void> {
  await destroyCurrentSession();
  redirect('/entrar');
}

/**
 * Só caminho interno. Aceitar `destino` como URL completa transformaria o login
 * em redirecionador aberto — o clássico "entre pelo link oficial e caia no site
 * do golpista já autenticada". `//outro.site` também é URL, daí a segunda
 * checagem.
 */
function destinoSeguro(destino: string | undefined): string {
  if (destino === undefined) return '/painel';
  if (!destino.startsWith('/') || destino.startsWith('//')) return '/painel';
  if (!destino.startsWith('/painel')) return '/painel';
  return destino;
}

/**
 * O endereço vem do `x-forwarded-for` da Vercel. É falsificável em tese, e por
 * isso é o balde **secundário** — o balde da conta é o que protege uma pessoa
 * específica, e esse não depende de nada que o cliente informe.
 */
async function clientAddress(): Promise<string | null> {
  const lista = (await headers()).get('x-forwarded-for');
  return lista?.split(',')[0]?.trim() ?? null;
}
