import { describe, expect, it } from 'vitest';

import {
  isSessionExpired,
  SESSION_TTL_SECONDS,
  sessionExpiryFrom,
  shouldRenewSession,
} from './session-lifetime';

describe('vida da sessão', () => {
  const agora = new Date('2026-08-01T12:00:00Z');

  it('expira trinta dias depois', () => {
    expect(sessionExpiryFrom(agora).getTime() - agora.getTime()).toBe(
      SESSION_TTL_SECONDS * 1000,
    );
  });

  it('não renova sessão recém-criada — escrita por página aberta não', () => {
    expect(shouldRenewSession(sessionExpiryFrom(agora), agora)).toBe(false);
  });

  it('renova depois de gasto um terço da vida', () => {
    const criada = new Date(agora.getTime() - (SESSION_TTL_SECONDS / 3 + 60) * 1000);
    expect(shouldRenewSession(sessionExpiryFrom(criada), agora)).toBe(true);
  });

  it('trata como expirada no instante exato do vencimento', () => {
    expect(isSessionExpired(agora, agora)).toBe(true);
  });
});
