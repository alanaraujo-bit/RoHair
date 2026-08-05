import { describe, expect, it } from 'vitest';

import { hashSessionToken } from '@/core/crypto/session-token';

import { ACCOUNT_POLICY } from '../domain/throttle';
import { authenticateStaff, type AuthenticateDeps } from './authenticate-staff';
import type { StaffCredentials } from './ports';

/**
 * O caso de uso é testado com dublês porque é onde mora a regra de segurança —
 * e regra de segurança que só é exercitada com banco de pé acaba não sendo
 * exercitada.
 */

const ROZIELE: StaffCredentials = {
  userId: 'user-1',
  organizationId: 'org-1',
  name: 'Roziele',
  passwordHash: 'hash-verdadeiro',
  roles: ['OWNER'],
};

const AGORA = new Date('2026-08-01T12:00:00Z');

type Cenario = {
  readonly deps: AuthenticateDeps;
  readonly sessoesCriadas: { userId: string; tokenHash: string; expiresAt: Date }[];
  readonly tentativas: { bucket: string; succeeded: boolean }[];
  readonly limpos: string[];
  readonly auditoria: string[];
  readonly verificacoes: string[];
};

function cenario(options: {
  conta?: StaffCredentials | null;
  falhas?: Record<string, { failures: number; lastFailureAt: Date | null }>;
}): Cenario {
  const sessoesCriadas: Cenario['sessoesCriadas'] = [];
  const tentativas: Cenario['tentativas'] = [];
  const limpos: string[] = [];
  const auditoria: string[] = [];
  const verificacoes: string[] = [];
  const falhas = options.falhas ?? {};

  const deps: AuthenticateDeps = {
    credentials: {
      findByIdentifier: async () => options.conta ?? null,
    },
    sessions: {
      create: async (input) => {
        sessoesCriadas.push(input);
      },
    },
    attempts: {
      stateOf: async (bucket) => falhas[bucket] ?? { failures: 0, lastFailureAt: null },
      record: async (bucket, succeeded) => {
        tentativas.push({ bucket, succeeded });
      },
      clear: async (bucket) => {
        limpos.push(bucket);
      },
    },
    hasher: {
      hash: async () => 'hash-novo',
      verify: async (hash, password) => {
        verificacoes.push(hash);
        return hash === 'hash-verdadeiro' && password === 'senha-certa';
      },
      discardHash: async () => 'hash-de-descarte',
    },
    audit: {
      record: async (input) => {
        auditoria.push(input.action);
      },
    },
    clock: { now: () => AGORA },
  };

  return { deps, sessoesCriadas, tentativas, limpos, auditoria, verificacoes };
}

describe('entrar no painel', () => {
  it('cria sessão quando a senha confere', async () => {
    const c = cenario({ conta: ROZIELE });

    const resultado = await authenticateStaff(
      { identifier: 'Roziele', password: 'senha-certa', address: '1.1.1.1' },
      c.deps,
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.value.organizationId).toBe('org-1');
    expect(c.sessoesCriadas).toHaveLength(1);
  });

  it('grava o HASH do token, nunca o token', async () => {
    const c = cenario({ conta: ROZIELE });

    const resultado = await authenticateStaff(
      { identifier: 'roziele', password: 'senha-certa', address: null },
      c.deps,
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    const gravada = c.sessoesCriadas[0];
    expect(gravada?.tokenHash).toBe(hashSessionToken(resultado.value.token));
    expect(gravada?.tokenHash).not.toBe(resultado.value.token);
  });

  it('recusa senha errada sem criar sessão', async () => {
    const c = cenario({ conta: ROZIELE });

    const resultado = await authenticateStaff(
      { identifier: 'roziele', password: 'senha-errada', address: null },
      c.deps,
    );

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.error.kind).toBe('credenciais-invalidas');
    expect(c.sessoesCriadas).toHaveLength(0);
  });

  it('responde a mesma coisa quando a conta não existe', async () => {
    const semConta = cenario({ conta: null });
    const comConta = cenario({ conta: ROZIELE });

    const a = await authenticateStaff(
      { identifier: 'ninguem', password: 'senha-errada', address: null },
      semConta.deps,
    );
    const b = await authenticateStaff(
      { identifier: 'roziele', password: 'senha-errada', address: null },
      comConta.deps,
    );

    expect(a).toEqual(b);
  });

  it('gasta Argon2 mesmo sem conta, para o relógio não denunciar', async () => {
    const c = cenario({ conta: null });

    await authenticateStaff(
      { identifier: 'ninguem', password: 'qualquer', address: null },
      c.deps,
    );

    expect(c.verificacoes).toEqual(['hash-de-descarte']);
  });

  it('conta a falha nos dois baldes', async () => {
    const c = cenario({ conta: ROZIELE });

    await authenticateStaff(
      { identifier: 'roziele', password: 'errada', address: '1.1.1.1' },
      c.deps,
    );

    expect(c.tentativas).toEqual([
      { bucket: 'conta:roziele', succeeded: false },
      { bucket: 'ip:1.1.1.1', succeeded: false },
    ]);
  });

  it('bloqueia depois das tentativas livres, sem nem consultar a senha', async () => {
    const c = cenario({
      conta: ROZIELE,
      falhas: {
        'conta:roziele': {
          failures: ACCOUNT_POLICY.freeAttempts + 1,
          lastFailureAt: AGORA,
        },
      },
    });

    const resultado = await authenticateStaff(
      { identifier: 'roziele', password: 'senha-certa', address: null },
      c.deps,
    );

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.error).toEqual({
      kind: 'muitas-tentativas',
      retryAfterSeconds: ACCOUNT_POLICY.baseDelaySeconds,
    });
    expect(c.verificacoes).toHaveLength(0);
    expect(c.sessoesCriadas).toHaveLength(0);
  });

  it('conta a tentativa feita durante o bloqueio — insistir não sai de graça', async () => {
    const c = cenario({
      conta: ROZIELE,
      falhas: {
        'conta:roziele': {
          failures: ACCOUNT_POLICY.freeAttempts + 1,
          lastFailureAt: AGORA,
        },
      },
    });

    await authenticateStaff(
      { identifier: 'roziele', password: 'errada', address: null },
      c.deps,
    );

    expect(c.tentativas).toEqual([{ bucket: 'conta:roziele', succeeded: false }]);
  });

  it('zera o balde da conta ao acertar, mas não o do endereço', async () => {
    const c = cenario({ conta: ROZIELE });

    await authenticateStaff(
      { identifier: 'roziele', password: 'senha-certa', address: '1.1.1.1' },
      c.deps,
    );

    expect(c.limpos).toEqual(['conta:roziele']);
  });

  it('registra o login na auditoria', async () => {
    const c = cenario({ conta: ROZIELE });

    await authenticateStaff(
      { identifier: 'roziele', password: 'senha-certa', address: null },
      c.deps,
    );

    expect(c.auditoria).toEqual(['auth.login']);
  });
});
