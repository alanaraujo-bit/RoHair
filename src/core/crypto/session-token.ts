import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Token de sessão.
 *
 * O token é **opaco e aleatório**, não um JWT. A escolha é deliberada: um JWT
 * não pode ser revogado antes de expirar sem uma lista de revogação — ou seja,
 * sem uma consulta ao banco, que é exatamente o custo que ele prometia evitar.
 * O produto precisa de "revogar acesso em um toque" (DEC-008); um token opaco
 * entrega isso apagando uma linha.
 *
 * O que vai para o cookie é o token; o que vai para o banco é o **SHA-256 dele**.
 * Um vazamento da tabela `session` não vira acesso às contas. Não é preciso
 * Argon2 aqui — diferente de senha, o token já tem 256 bits de entropia, e não
 * há o que adivinhar por força bruta.
 */

const TOKEN_BYTES = 32;

export type SessionToken = {
  /** Vai para o cookie. Nunca é persistido. */
  readonly token: string;
  /** Vai para o banco. Nunca sai dele. */
  readonly tokenHash: string;
};

export function createSessionToken(): SessionToken {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Comparação em tempo constante.
 *
 * A busca no banco já é por igualdade de hash, então isto existe para os
 * lugares onde a comparação acontece em memória — o tempo de resposta não pode
 * revelar quantos caracteres iniciais estavam certos.
 */
export function sessionTokenMatches(token: string, tokenHash: string): boolean {
  const candidate = Buffer.from(hashSessionToken(token), 'hex');
  const expected = Buffer.from(tokenHash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
