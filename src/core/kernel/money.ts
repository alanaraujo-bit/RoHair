import { err, ok, type Result } from './result';

/**
 * Dinheiro, em centavos.
 *
 * Nunca ponto flutuante — `0.1 + 0.2 !== 0.3`, e num relatório mensal esse erro
 * vira centavos que não fecham. O DoD da Fase 10 exige que o mês bata ao
 * centavo com a soma dos atendimentos, e essa promessa começa aqui.
 *
 * O tipo é `branded`: um `number` cru não passa onde se espera `Money`. Sem
 * isso, nada impediria alguém de somar reais com centavos e o bug só apareceria
 * no fechamento do mês.
 */

declare const MONEY: unique symbol;

export type Money = number & { readonly [MONEY]: 'Money' };

export type MoneyError =
  | { readonly kind: 'nao-inteiro'; readonly value: number }
  | { readonly kind: 'fora-do-limite'; readonly value: number };

/**
 * Limite de segurança: `Number.MAX_SAFE_INTEGER` seria permissivo demais e
 * deixaria passar lixo vindo de uma entrada corrompida. Cem milhões de reais
 * cobre qualquer salão real com folga de várias ordens de grandeza.
 */
const MAX_CENTS = 10_000_000_000;

export function money(cents: number): Result<Money, MoneyError> {
  if (!Number.isInteger(cents)) return err({ kind: 'nao-inteiro', value: cents });
  if (Math.abs(cents) > MAX_CENTS) return err({ kind: 'fora-do-limite', value: cents });
  return ok(cents as Money);
}

/** Para constantes conhecidas em tempo de escrita. Lança se o valor for inválido. */
export function moneyOf(cents: number): Money {
  const result = money(cents);
  if (!result.ok) throw new Error(`Money inválido: ${cents}`);
  return result.value;
}

export const ZERO = 0 as Money;

export function add(a: Money, b: Money): Money {
  return (a + b) as Money;
}

export function subtract(a: Money, b: Money): Money {
  return (a - b) as Money;
}

/**
 * Multiplica por uma quantidade inteira. Não existe `multiply` por fração de
 * propósito: quantidade de serviço é inteira, e desconto percentual tem função
 * própria, com regra de arredondamento explícita.
 */
export function times(value: Money, quantity: number): Result<Money, MoneyError> {
  if (!Number.isInteger(quantity)) return err({ kind: 'nao-inteiro', value: quantity });
  return money(value * quantity);
}

/**
 * Desconto percentual, arredondado **para baixo** — a favor da cliente.
 *
 * Arredondamento em dinheiro precisa de uma direção declarada, ou o mesmo
 * cálculo dá resultados diferentes em lugares diferentes do código. Para baixo
 * também garante que o desconto nunca ultrapassa o valor original.
 */
export function percentOff(value: Money, percent: number): Result<Money, MoneyError> {
  if (percent < 0 || percent > 100)
    return err({ kind: 'fora-do-limite', value: percent });
  return money(value - Math.floor((value * percent) / 100));
}

export function sum(values: readonly Money[]): Money {
  return values.reduce<Money>((total, value) => add(total, value), ZERO);
}

export function isNegative(value: Money): boolean {
  return value < 0;
}

export function isZero(value: Money): boolean {
  return value === 0;
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
