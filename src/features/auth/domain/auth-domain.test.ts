import { describe, expect, it } from 'vitest';

import { normalizeIdentifier } from './identifier';
import { checkPasswordShape, PASSWORD_MAX_LENGTH } from './password-policy';
import { ACCOUNT_POLICY, describeWait, evaluateThrottle } from './throttle';

describe('identificador de login', () => {
  it('normaliza espaços e caixa', () => {
    expect(normalizeIdentifier('  Roziele  ').value).toBe('roziele');
    expect(normalizeIdentifier('ROZIELE@EXEMPLO.COM').value).toBe(
      'roziele@exemplo.com',
    );
  });

  it('reconhece e-mail pela arroba', () => {
    expect(normalizeIdentifier('roziele@exemplo.com').looksLikeEmail).toBe(true);
    expect(normalizeIdentifier('roziele').looksLikeEmail).toBe(false);
  });
});

describe('política de senha', () => {
  it('aceita uma frase longa sem exigir símbolo', () => {
    expect(checkPasswordShape('meu cabelo favorito').ok).toBe(true);
  });

  it('recusa senha curta', () => {
    const result = checkPasswordShape('curta1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('muito-curta');
  });

  it('recusa só espaços, mesmo passando do mínimo', () => {
    const result = checkPasswordShape('          ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('so-espacos');
  });

  it('recusa senha acima do teto, que é o vetor de negação de serviço', () => {
    const result = checkPasswordShape('a'.repeat(PASSWORD_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('muito-longa');
  });

  it('conta emoji como um caractere', () => {
    // Oito code points. Contar por `.length` daria dezesseis e aprovaria por
    // engano uma senha com metade da entropia esperada.
    expect(checkPasswordShape('🌸'.repeat(7)).ok).toBe(false);
    expect(checkPasswordShape('🌸'.repeat(8)).ok).toBe(true);
  });
});

describe('bloqueio progressivo', () => {
  const agora = new Date('2026-08-01T12:00:00Z');

  it('deixa passar enquanto está dentro das tentativas livres', () => {
    const decisao = evaluateThrottle(
      { failures: ACCOUNT_POLICY.freeAttempts, lastFailureAt: agora },
      ACCOUNT_POLICY,
      agora,
    );
    expect(decisao.allowed).toBe(true);
  });

  it('atrasa na primeira falha excedente', () => {
    const decisao = evaluateThrottle(
      { failures: ACCOUNT_POLICY.freeAttempts + 1, lastFailureAt: agora },
      ACCOUNT_POLICY,
      agora,
    );
    expect(decisao).toEqual({
      allowed: false,
      retryAfterSeconds: ACCOUNT_POLICY.baseDelaySeconds,
    });
  });

  it('dobra o atraso a cada falha seguinte', () => {
    const decisao = evaluateThrottle(
      { failures: ACCOUNT_POLICY.freeAttempts + 3, lastFailureAt: agora },
      ACCOUNT_POLICY,
      agora,
    );
    expect(decisao).toEqual({
      allowed: false,
      retryAfterSeconds: ACCOUNT_POLICY.baseDelaySeconds * 4,
    });
  });

  it('nunca passa do teto — o bloqueio não pode virar exclusão', () => {
    const decisao = evaluateThrottle(
      { failures: ACCOUNT_POLICY.freeAttempts + 40, lastFailureAt: agora },
      ACCOUNT_POLICY,
      agora,
    );
    expect(decisao).toEqual({
      allowed: false,
      retryAfterSeconds: ACCOUNT_POLICY.maxDelaySeconds,
    });
  });

  it('libera sozinho quando o atraso passa', () => {
    const depois = new Date(agora.getTime() + ACCOUNT_POLICY.baseDelaySeconds * 1000);
    const decisao = evaluateThrottle(
      { failures: ACCOUNT_POLICY.freeAttempts + 1, lastFailureAt: agora },
      ACCOUNT_POLICY,
      depois,
    );
    expect(decisao.allowed).toBe(true);
  });

  it('descreve a espera em português, sem "180 segundos"', () => {
    expect(describeWait(1)).toBe('1 segundo');
    expect(describeWait(45)).toBe('45 segundos');
    expect(describeWait(180)).toBe('3 minutos');
  });
});
