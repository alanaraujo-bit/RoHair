import { describe, expect, it } from 'vitest';

import { cpf } from '@/core/kernel/cpf';
import { isErr, unwrap } from '@/core/kernel/result';

import { createCpfCrypto } from './cpf-crypto';

/** Chaves de teste. Nunca chegam perto de produção — são literais no arquivo. */
const CONFIG = {
  hashSecret: 'segredo-de-teste-com-mais-de-32-caracteres',
  encryptionKeyHex: 'a'.repeat(64),
};

const crypto = unwrap(createCpfCrypto(CONFIG));
const CPF = unwrap(cpf('529.982.247-25'));
const OUTRO = unwrap(cpf('111.444.777-35'));

describe('CpfCrypto — DEC-009', () => {
  it('recusa chave curta ou malformada', () => {
    expect(isErr(createCpfCrypto({ ...CONFIG, hashSecret: 'curto' }))).toBe(true);
    expect(isErr(createCpfCrypto({ ...CONFIG, encryptionKeyHex: 'zz' }))).toBe(true);
    // 63 caracteres: um a menos que AES-256 exige
    expect(
      isErr(createCpfCrypto({ ...CONFIG, encryptionKeyHex: 'a'.repeat(63) })),
    ).toBe(true);
  });

  describe('hash', () => {
    it('é determinístico — é o que permite buscar e impedir duplicata', () => {
      expect(crypto.hash(CPF)).toBe(crypto.hash(CPF));
    });

    it('distingue CPFs diferentes', () => {
      expect(crypto.hash(CPF)).not.toBe(crypto.hash(OUTRO));
    });

    it('não contém o CPF em claro', () => {
      expect(crypto.hash(CPF)).not.toContain('52998224725');
    });

    it('muda inteiro se a chave mudar', () => {
      const outroServico = unwrap(
        createCpfCrypto({
          ...CONFIG,
          hashSecret: 'outro-segredo-com-mais-de-32-chars!!',
        }),
      );
      // Consequência operacional: rotacionar CPF_HASH_SECRET invalida todos os
      // índices de busca. É por isso que a chave não se troca sem migração.
      expect(outroServico.hash(CPF)).not.toBe(crypto.hash(CPF));
    });
  });

  describe('criptografia', () => {
    it('vai e volta', () => {
      expect(unwrap(crypto.decrypt(crypto.encrypt(CPF)))).toBe('52998224725');
    });

    it('produz cifra diferente a cada gravação', () => {
      // IV aleatório. É por isso que a cifra NÃO serve para buscar — e é por
      // isso que o hash determinístico precisa existir em paralelo.
      expect(crypto.encrypt(CPF)).not.toBe(crypto.encrypt(CPF));
    });

    it('não contém o CPF em claro', () => {
      const payload = crypto.encrypt(CPF);
      expect(Buffer.from(payload, 'base64').toString('utf8')).not.toContain(
        '52998224725',
      );
    });

    it('detecta adulteração — GCM autentica', () => {
      const raw = Buffer.from(crypto.encrypt(CPF), 'base64');
      // `noUncheckedIndexedAccess` está ligado, então o índice é `number | undefined`
      const last = raw.length - 1;
      raw.writeUInt8((raw.readUInt8(last) ^ 0xff) & 0xff, last);

      const result = crypto.decrypt(raw.toString('base64'));
      expect(result).toEqual({ ok: false, error: { kind: 'autenticacao-falhou' } });
    });

    it('recusa payload curto demais para conter IV e tag', () => {
      expect(crypto.decrypt(Buffer.from('curto').toString('base64'))).toEqual({
        ok: false,
        error: { kind: 'texto-cifrado-invalido' },
      });
    });

    it('não decifra com chave diferente', () => {
      const outroServico = unwrap(
        createCpfCrypto({ ...CONFIG, encryptionKeyHex: 'b'.repeat(64) }),
      );
      expect(isErr(outroServico.decrypt(crypto.encrypt(CPF)))).toBe(true);
    });
  });
});
