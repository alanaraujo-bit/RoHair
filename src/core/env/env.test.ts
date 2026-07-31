import { describe, expect, it } from 'vitest';

import { parseServerEnv } from './env';

/**
 * O contrato protegido aqui não é "o Zod funciona" — é a promessa de que
 * configuração inválida derruba a aplicação no boot, em vez de virar bug
 * silencioso em produção.
 */
describe('env do servidor', () => {
  it('aplica os padrões de desenvolvimento quando nada é informado', () => {
    const env = parseServerEnv({});

    expect(env.APP_ENV).toBe('local');
    expect(env.NODE_ENV).toBe('development');
  });

  it('recusa APP_ENV desconhecido', () => {
    expect(() => parseServerEnv({ APP_ENV: 'homologacao' })).toThrow(/APP_ENV/);
  });

  it('recusa DATABASE_URL que não é uma URL', () => {
    expect(() => parseServerEnv({ DATABASE_URL: 'localhost:5432' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('recusa chave de criptografia de CPF com tamanho errado', () => {
    expect(() => parseServerEnv({ CPF_ENCRYPTION_KEY: 'curta' })).toThrow(
      /CPF_ENCRYPTION_KEY/,
    );
  });

  it('aceita configuração de produção completa', () => {
    const env = parseServerEnv({
      NODE_ENV: 'production',
      APP_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@host:5432/rohair',
      CPF_ENCRYPTION_KEY: 'a'.repeat(64),
      CPF_HASH_SECRET: 'b'.repeat(32),
    });

    expect(env.APP_ENV).toBe('production');
    expect(env.DATABASE_URL).toContain('rohair');
  });
});
