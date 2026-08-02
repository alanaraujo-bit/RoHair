import { sessionExpiryFrom } from '@/core/auth/session-lifetime';
import { createSessionToken } from '@/core/crypto/session-token';
import { err, ok, type Result } from '@/core/kernel/result';

import { normalizeIdentifier } from '../domain/identifier';
import {
  ACCOUNT_POLICY,
  ADDRESS_POLICY,
  describeWait,
  evaluateThrottle,
  type ThrottlePolicy,
} from '../domain/throttle';
import type {
  AttemptRepository,
  AuditRecorder,
  Clock,
  PasswordHasher,
  SessionRepository,
  StaffCredentialsRepository,
} from './ports';

/**
 * Entrar no painel.
 *
 * Três invariantes que este arquivo existe para garantir:
 *
 * 1. **A resposta nunca revela se a conta existe.** Erro de usuário e erro de
 *    senha são a mesma mensagem, e o caminho "conta inexistente" também paga o
 *    custo do Argon2 — senão o relógio contaria o que a mensagem calou.
 * 2. **Toda tentativa é contada**, antes de qualquer decisão, nos dois baldes.
 * 3. **Sessão só nasce de senha conferida.** O token é gerado aqui e sai desta
 *    função uma única vez; o que fica gravado é o hash dele.
 */

export type AuthenticateInput = {
  readonly identifier: string;
  readonly password: string;
  /** Endereço de origem, para o segundo balde. `null` quando indisponível. */
  readonly address: string | null;
};

export type AuthenticatedSession = {
  /** Vai para o cookie e não é persistido em lugar nenhum. */
  readonly token: string;
  readonly expiresAt: Date;
  readonly userId: string;
  readonly organizationId: string;
  readonly name: string;
};

export type AuthenticationFailure =
  | { readonly kind: 'credenciais-invalidas' }
  | { readonly kind: 'muitas-tentativas'; readonly retryAfterSeconds: number };

export type AuthenticateDeps = {
  readonly credentials: StaffCredentialsRepository;
  readonly sessions: SessionRepository;
  readonly attempts: AttemptRepository;
  readonly hasher: PasswordHasher;
  readonly audit: AuditRecorder;
  readonly clock: Clock;
};

export async function authenticateStaff(
  input: AuthenticateInput,
  deps: AuthenticateDeps,
): Promise<Result<AuthenticatedSession, AuthenticationFailure>> {
  const now = deps.clock.now();
  const identifier = normalizeIdentifier(input.identifier);

  const buckets = [
    { key: `conta:${identifier.value}`, policy: ACCOUNT_POLICY },
    ...(input.address === null
      ? []
      : [{ key: `ip:${input.address}`, policy: ADDRESS_POLICY }]),
  ] satisfies readonly { key: string; policy: ThrottlePolicy }[];

  const blocked = await firstBlocked(buckets, deps, now);
  if (blocked !== null) {
    // A tentativa bloqueada também é registrada: sem isso, insistir durante o
    // bloqueio sairia de graça e o atraso pararia de crescer.
    await recordAll(buckets, false, deps);
    return err({ kind: 'muitas-tentativas', retryAfterSeconds: blocked });
  }

  const found = await deps.credentials.findByIdentifier(identifier.value);

  // Sem conta: verifica contra um hash de descarte. O trabalho do Argon2
  // acontece igual, e o tempo de resposta deixa de ser um oráculo de existência.
  const passwordOk = await deps.hasher.verify(
    found?.passwordHash ?? (await deps.hasher.discardHash()),
    input.password,
  );

  if (found === null || !passwordOk) {
    await recordAll(buckets, false, deps);
    return err({ kind: 'credenciais-invalidas' });
  }

  await recordAll(buckets, true, deps);
  // Limpa só o balde da conta. O do endereço continua contando: quem acerta uma
  // senha depois de varrer cinquenta não deve zerar a varredura.
  await deps.attempts.clear(`conta:${identifier.value}`);

  const { token, tokenHash } = createSessionToken();
  const expiresAt = sessionExpiryFrom(now);

  await deps.sessions.create({ userId: found.userId, tokenHash, expiresAt });

  await deps.audit.record({
    organizationId: found.organizationId,
    actorType: 'USER',
    actorId: found.userId,
    action: 'auth.login',
    targetType: 'User',
    targetId: found.userId,
  });

  return ok({
    token,
    expiresAt,
    userId: found.userId,
    organizationId: found.organizationId,
    name: found.name,
  });
}

/**
 * A frase que a tela mostra.
 *
 * Fica aqui, e não na rota, porque **é regra de segurança e não de layout**:
 * usuário inexistente e senha errada precisam produzir exatamente o mesmo
 * texto, senão a tela vira consulta de quem tem conta. Deixar isso a cargo de
 * quem desenha a tela é confiar demais na memória de quem edita.
 */
export function describeAuthenticationFailure(failure: AuthenticationFailure): string {
  switch (failure.kind) {
    case 'credenciais-invalidas':
      return 'Usuário ou senha não confere.';
    case 'muitas-tentativas':
      return `Muitas tentativas. Tente de novo em ${describeWait(failure.retryAfterSeconds)}.`;
  }
}

async function firstBlocked(
  buckets: readonly { key: string; policy: ThrottlePolicy }[],
  deps: AuthenticateDeps,
  now: Date,
): Promise<number | null> {
  for (const { key, policy } of buckets) {
    const state = await deps.attempts.stateOf(key, policy.windowSeconds, now);
    const decision = evaluateThrottle(state, policy, now);
    if (!decision.allowed) return decision.retryAfterSeconds;
  }
  return null;
}

async function recordAll(
  buckets: readonly { key: string; policy: ThrottlePolicy }[],
  succeeded: boolean,
  deps: AuthenticateDeps,
): Promise<void> {
  await Promise.all(buckets.map(({ key }) => deps.attempts.record(key, succeeded)));
}
