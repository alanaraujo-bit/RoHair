import { err, ok, type Result } from '@/core/kernel/result';

/**
 * Política de senha.
 *
 * Deliberadamente **sem** exigência de maiúscula, número e símbolo. A regra
 * clássica produz `Senha@123` — curta, previsível e presente em qualquer lista
 * de vazamento — enquanto pune quem escolhe uma frase longa e boa. O NIST
 * abandonou a composição obrigatória pelo mesmo motivo em 2017.
 *
 * O que fica no lugar dela: comprimento mínimo, e **verificação contra senhas
 * vazadas**, que é a única checagem que mede o que realmente importa — se a
 * senha já está em uso conhecido por atacantes. Essa parte é assíncrona e vive
 * atrás de uma porta (`LeakedPasswordChecker`), porque depende de rede.
 *
 * O teto de 128 caracteres não é estética: Argon2id gasta tempo proporcional ao
 * tamanho da entrada, e sem limite um formulário de login vira alavanca de
 * negação de serviço.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordProblem =
  | { readonly kind: 'muito-curta'; readonly minimo: number }
  | { readonly kind: 'muito-longa'; readonly maximo: number }
  | { readonly kind: 'so-espacos' };

export function checkPasswordShape(password: string): Result<string, PasswordProblem> {
  if (password.trim().length === 0) return err({ kind: 'so-espacos' });
  // Contagem por code point: um emoji conta como um caractere, não como dois.
  const length = [...password].length;
  if (length < PASSWORD_MIN_LENGTH) {
    return err({ kind: 'muito-curta', minimo: PASSWORD_MIN_LENGTH });
  }
  if (length > PASSWORD_MAX_LENGTH) {
    return err({ kind: 'muito-longa', maximo: PASSWORD_MAX_LENGTH });
  }
  return ok(password);
}

export function describePasswordProblem(problem: PasswordProblem): string {
  switch (problem.kind) {
    case 'muito-curta':
      return `A senha precisa de pelo menos ${problem.minimo} caracteres.`;
    case 'muito-longa':
      return `A senha passou de ${problem.maximo} caracteres.`;
    case 'so-espacos':
      return 'A senha não pode ser só espaços.';
  }
}
