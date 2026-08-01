import { err, ok, type Result } from './result';

/**
 * CPF — a chave natural da cliente e o ponto de encontro entre as duas pontas
 * do produto (DEC-008, DEC-009).
 *
 * **Este value object é puro de propósito.** Ele valida, normaliza e mascara;
 * não faz HMAC nem criptografia, porque as duas precisam de chave secreta e
 * chave secreta vem do ambiente. Se o `Cpf` importasse a configuração, o
 * domínio deixaria de ser testável sem ambiente — que é a promessa inteira da
 * camada. O que precisa de chave vive em `core/crypto`.
 *
 * O tipo é `branded`: uma `string` qualquer não passa onde se espera `Cpf`.
 */

declare const CPF: unique symbol;

export type Cpf = string & { readonly [CPF]: 'Cpf' };

export type CpfError =
  | { readonly kind: 'tamanho-invalido'; readonly digits: number }
  | { readonly kind: 'todos-iguais' }
  | { readonly kind: 'digito-verificador-invalido' };

/** Remove tudo que não for dígito. `123.456.789-01` → `12345678901`. */
export function normalizeCpf(input: string): string {
  return input.replace(/\D/g, '');
}

export function cpf(input: string): Result<Cpf, CpfError> {
  const digits = normalizeCpf(input);

  if (digits.length !== 11) {
    return err({ kind: 'tamanho-invalido', digits: digits.length });
  }

  /**
   * `11111111111` passa nos dígitos verificadores por acaso — a matemática
   * fecha. São rejeitados explicitamente porque não são CPF de ninguém, e
   * porque `00000000000` é o que chega quando alguém "preenche para passar".
   */
  if (/^(\d)\1{10}$/.test(digits)) {
    return err({ kind: 'todos-iguais' });
  }

  if (!hasValidCheckDigits(digits)) {
    return err({ kind: 'digito-verificador-invalido' });
  }

  return ok(digits as Cpf);
}

/**
 * Algoritmo oficial: cada dígito verificador é o resto da soma ponderada
 * módulo 11, com resto menor que 2 virando zero.
 */
function hasValidCheckDigits(digits: string): boolean {
  return (
    checkDigit(digits, 9) === Number(digits[9]) &&
    checkDigit(digits, 10) === Number(digits[10])
  );
}

function checkDigit(digits: string, upTo: number): number {
  let total = 0;
  for (let index = 0; index < upTo; index += 1) {
    total += Number(digits[index]) * (upTo + 1 - index);
  }
  const remainder = (total * 10) % 11;
  return remainder >= 10 ? 0 : remainder;
}

/** `12345678901` → `123.456.789-01`. Só para exibição autorizada. */
export function formatCpf(value: Cpf): string {
  return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
}

/**
 * `12345678901` → `123.•••.•••-01`.
 *
 * O padrão de exibição no painel. Mostra o suficiente para a profissional
 * reconhecer a cliente numa tela de fusão de fichas, sem expor o documento
 * inteiro para quem estiver olhando a tela por cima do ombro.
 */
export function maskCpf(value: Cpf): string {
  return `${value.slice(0, 3)}.•••.•••-${value.slice(9)}`;
}
