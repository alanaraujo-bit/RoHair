import { err, ok, type Result } from './result';

/**
 * Quantidade de produto, com unidade.
 *
 * 🗣️ A Roziele pensa em **frasco** e em **aplicação**, não em mililitro:
 * *"esse frasco dá umas oito escovas"*. O produto fala a língua dela, e a
 * conversão acontece por dentro (09-CONFIGURACAO.md, § 2).
 *
 * Guardado em **milésimos** da unidade, em inteiro, pelo mesmo motivo de
 * `Money`: meio frasco é `500`, e 1/3 de frasco é `333` — nunca `0.3333...`
 * acumulando erro a cada baixa de estoque.
 */

export const UNITS = ['frasco', 'aplicacao', 'ml', 'g', 'kit', 'ampola'] as const;

export type Unit = (typeof UNITS)[number];

declare const QUANTITY: unique symbol;

export type Quantity = {
  /** Milésimos da unidade. `1500` = 1,5 frasco. */
  readonly milli: number;
  readonly unit: Unit;
  readonly [QUANTITY]?: 'Quantity';
};

export type QuantityError =
  | { readonly kind: 'nao-inteiro'; readonly value: number }
  | { readonly kind: 'unidade-diferente'; readonly a: Unit; readonly b: Unit };

export function quantity(milli: number, unit: Unit): Result<Quantity, QuantityError> {
  if (!Number.isInteger(milli)) return err({ kind: 'nao-inteiro', value: milli });
  // Negativo é permitido: estoque pode ficar negativo quando a realidade física
  // vai além do registro, e o produto prefere a verdade ao registro bonito
  // (08-MODELO-DE-DOMINIO.md, § 4.7).
  return ok({ milli, unit });
}

export function quantityOf(whole: number, unit: Unit): Quantity {
  const result = quantity(Math.round(whole * 1000), unit);
  if (!result.ok) throw new Error(`Quantity inválida: ${whole} ${unit}`);
  return result.value;
}

/**
 * Soma duas quantidades. Falha se as unidades diferirem.
 *
 * Não existe conversão automática entre frasco e ml aqui: a taxa depende do
 * produto — um frasco de progressiva não tem o mesmo volume que um de
 * matizador. Converter é responsabilidade do cadastro do produto, que conhece o
 * próprio tamanho.
 */
export function addQuantity(a: Quantity, b: Quantity): Result<Quantity, QuantityError> {
  if (a.unit !== b.unit)
    return err({ kind: 'unidade-diferente', a: a.unit, b: b.unit });
  return ok({ milli: a.milli + b.milli, unit: a.unit });
}

export function subtractQuantity(
  a: Quantity,
  b: Quantity,
): Result<Quantity, QuantityError> {
  if (a.unit !== b.unit)
    return err({ kind: 'unidade-diferente', a: a.unit, b: b.unit });
  return ok({ milli: a.milli - b.milli, unit: a.unit });
}

export function isEmpty(value: Quantity): boolean {
  return value.milli <= 0;
}

const UNIT_LABEL: Record<Unit, { one: string; many: string }> = {
  frasco: { one: 'frasco', many: 'frascos' },
  aplicacao: { one: 'aplicação', many: 'aplicações' },
  ml: { one: 'ml', many: 'ml' },
  g: { one: 'g', many: 'g' },
  kit: { one: 'kit', many: 'kits' },
  ampola: { one: 'ampola', many: 'ampolas' },
};

/** `{ milli: 1500, unit: 'frasco' }` → `"1,5 frasco"`. */
export function formatQuantity(value: Quantity): string {
  const whole = value.milli / 1000;
  const label = UNIT_LABEL[value.unit];
  const text = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(
    whole,
  );
  return `${text} ${Math.abs(whole) === 1 ? label.one : label.many}`;
}
