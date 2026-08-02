import { randomBytes } from 'node:crypto';

import { hash, verify, type Algorithm } from '@node-rs/argon2';

import type { PasswordHasher } from '../application/ports';

/**
 * Argon2id (DEC-008).
 *
 * Parâmetros explícitos, não os padrões da biblioteca: o padrão de hoje pode
 * mudar numa atualização menor, e um custo que cai sem ninguém perceber é uma
 * regressão de segurança silenciosa. Os valores são a linha de base da OWASP —
 * 19 MiB de memória, duas passagens, sem paralelismo.
 *
 * O que faz o Argon2id valer o custo é justamente a memória: ela é o que impede
 * que uma GPU teste bilhões de senhas por segundo, coisa que SHA-256 com salt
 * não impede de jeito nenhum.
 *
 * `@node-rs/argon2` é binding nativo com binário pré-compilado — não exige
 * `node-gyp` na Vercel, que é onde a alternativa clássica quebra.
 */

/**
 * `Algorithm.Argon2id` é `const enum`, e `verbatimModuleSyntax` — que este
 * projeto usa — proíbe ler o valor em tempo de execução. O valor é 2 e faz
 * parte do formato do hash gravado (`$argon2id$`), então não é um número que
 * possa mudar sem quebrar todas as senhas existentes.
 */
const ARGON2ID = 2 as Algorithm;

const PARAMS = {
  algorithm: ARGON2ID,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

let discardHashPromise: Promise<string> | undefined;

export const argon2Hasher: PasswordHasher = {
  hash: (password) => hash(password, PARAMS),

  verify: async (storedHash, password) => {
    try {
      return await verify(storedHash, password, PARAMS);
    } catch {
      // Hash corrompido ou em formato desconhecido. É falha de verificação, não
      // exceção: deixar vazar aqui distinguiria esse caso de "senha errada" na
      // resposta, e essa distinção é exatamente o que não pode existir.
      return false;
    }
  },

  /**
   * Calculado uma vez por processo, sobre uma senha aleatória que ninguém
   * conhece — nem quem lê este código. Memoizado porque o custo é o mesmo de um
   * login, e pagá-lo a cada tentativa inválida seria alavanca de negação de
   * serviço.
   */
  discardHash: () => {
    discardHashPromise ??= hash(randomBytes(32).toString('hex'), PARAMS);
    return discardHashPromise;
  },
};
