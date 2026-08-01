import { err, ok, type Result } from './result';

/**
 * Telefone brasileiro, normalizado em E.164 (`+5511987654321`).
 *
 * Guardar normalizado importa mais aqui do que em outros projetos: o telefone é
 * a **segunda chave** de busca na fusão de fichas (D-07), quando a cliente não
 * tem CPF. Se metade das fichas tiver `(11) 98765-4321` e a outra metade
 * `11987654321`, a sugestão de fusão simplesmente não encontra a duplicata — e
 * o encontro entre as duas pontas do produto falha em silêncio.
 */

declare const PHONE: unique symbol;

export type PhoneNumber = string & { readonly [PHONE]: 'PhoneNumber' };

export type PhoneError =
  | { readonly kind: 'tamanho-invalido'; readonly digits: number }
  | { readonly kind: 'ddd-invalido'; readonly ddd: string }
  | { readonly kind: 'celular-sem-nove'; readonly digits: string };

/** DDDs em uso no Brasil. Fora desta lista, é erro de digitação. */
const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68,
  69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95,
  96, 97, 98, 99,
]);

export function phoneNumber(input: string): Result<PhoneNumber, PhoneError> {
  let digits = input.replace(/\D/g, '');

  // Tolera o 55 já digitado e o zero de operadora antes do DDD — as duas formas
  // chegam de colagem do WhatsApp o tempo todo.
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  if (digits.length === 12 && digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length !== 10 && digits.length !== 11) {
    return err({ kind: 'tamanho-invalido', digits: digits.length });
  }

  const ddd = digits.slice(0, 2);
  if (!VALID_DDD.has(Number(ddd))) {
    return err({ kind: 'ddd-invalido', ddd });
  }

  // Onze dígitos significa celular, e todo celular do Brasil começa com 9 desde
  // 2016. Sem esta checagem, um fixo digitado com um dígito a mais passaria.
  if (digits.length === 11 && digits[2] !== '9') {
    return err({ kind: 'celular-sem-nove', digits });
  }

  return ok(`+55${digits}` as PhoneNumber);
}

/** `+5511987654321` → `(11) 98765-4321`. */
export function formatPhone(value: PhoneNumber): string {
  const digits = value.slice(3);
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const middle = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
  const last = rest.length === 9 ? rest.slice(5) : rest.slice(4);
  return `(${ddd}) ${middle}-${last}`;
}

/** `+5511987654321` → `(11) 98•••-4321`. Mesmo motivo do CPF mascarado. */
export function maskPhone(value: PhoneNumber): string {
  const formatted = formatPhone(value);
  return formatted.replace(/(\d{2})\d{2,3}-/, '$1•••-');
}
