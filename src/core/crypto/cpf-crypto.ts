import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

import { type Cpf } from '@/core/kernel/cpf';
import { err, ok, type Result } from '@/core/kernel/result';

/**
 * Tratamento criptográfico do CPF (DEC-009).
 *
 * Um vazamento de banco não pode virar vazamento de CPF. Duas representações,
 * com propósitos incompatíveis entre si:
 *
 *   `cpfHash`      HMAC-SHA256 determinístico. É o que recebe o índice único
 *                  `(organizationId, cpfHash)` e o que é usado nas buscas.
 *                  Determinístico **porque precisa** — sem isso não há como
 *                  procurar por CPF nem impedir duplicata.
 *   `cpfEncrypted` AES-256-GCM, com IV aleatório por gravação. É o que permite
 *                  exibir no painel. Nunca é usado para buscar.
 *
 * Por que as duas. O hash sozinho não permite mostrar o número à profissional;
 * a criptografia sozinha não permite buscar, porque o mesmo CPF gera cifras
 * diferentes a cada gravação. Custa trinta linhas e elimina o pior cenário de
 * LGPD do produto.
 *
 * Fica em `core/crypto` e não no kernel porque depende de chave secreta, e o
 * kernel precisa continuar testável sem ambiente.
 */

export type CpfCryptoError =
  | { readonly kind: 'chave-ausente'; readonly which: 'hash' | 'encryption' }
  | { readonly kind: 'chave-invalida'; readonly which: 'hash' | 'encryption' }
  | { readonly kind: 'texto-cifrado-invalido' }
  | { readonly kind: 'autenticacao-falhou' };

export type CpfCrypto = {
  readonly hash: (value: Cpf) => string;
  readonly encrypt: (value: Cpf) => string;
  readonly decrypt: (payload: string) => Result<string, CpfCryptoError>;
};

const IV_BYTES = 12; // 96 bits, o tamanho recomendado para GCM
const TAG_BYTES = 16;

/**
 * Monta o serviço a partir das chaves.
 *
 * Recebe as chaves em vez de ler o ambiente por dentro: assim o teste roda com
 * chave própria, sem `.env`, e a validação acontece uma vez só, na composição.
 */
export function createCpfCrypto(config: {
  readonly hashSecret: string;
  readonly encryptionKeyHex: string;
}): Result<CpfCrypto, CpfCryptoError> {
  if (config.hashSecret.length < 32) {
    return err({ kind: 'chave-invalida', which: 'hash' });
  }

  // 64 caracteres hexadecimais = 32 bytes = AES-256.
  if (!/^[0-9a-f]{64}$/i.test(config.encryptionKeyHex)) {
    return err({ kind: 'chave-invalida', which: 'encryption' });
  }

  const key = Buffer.from(config.encryptionKeyHex, 'hex');

  return ok({
    hash(value: Cpf): string {
      return createHmac('sha256', config.hashSecret).update(value).digest('hex');
    },

    encrypt(value: Cpf): string {
      const iv = randomBytes(IV_BYTES);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
      // Um só campo no banco: IV, tag e cifra concatenados. Guardar em três
      // colunas convidaria alguém a gravar uma e esquecer as outras.
      return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
    },

    decrypt(payload: string): Result<string, CpfCryptoError> {
      let raw: Buffer;
      try {
        raw = Buffer.from(payload, 'base64');
      } catch {
        return err({ kind: 'texto-cifrado-invalido' });
      }

      if (raw.length <= IV_BYTES + TAG_BYTES) {
        return err({ kind: 'texto-cifrado-invalido' });
      }

      const iv = raw.subarray(0, IV_BYTES);
      const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
      const ciphertext = raw.subarray(IV_BYTES + TAG_BYTES);

      try {
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return ok(plain.toString('utf8'));
      } catch {
        // GCM autentica: se o texto foi adulterado no banco, `final()` lança.
        // É o comportamento desejado — dado alterado não deve ser exibido.
        return err({ kind: 'autenticacao-falhou' });
      }
    },
  });
}
