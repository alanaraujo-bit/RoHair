/**
 * Formatação de dinheiro a partir de centavos.
 *
 * Recebe `Int` em centavos e nunca `number` em reais — ponto flutuante em
 * dinheiro é bug garantido, e a fronteira onde o valor vira texto é o único
 * lugar do sistema em que a divisão por 100 é permitida.
 *
 * O value object `Money` do domínio chega na Fase 3 e vai usar estas funções
 * para se apresentar; até lá elas servem à camada visual.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const BRL_WHOLE = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `24500` → `"R$ 245,00"` */
export function formatMoney(cents: number): string {
  return BRL.format(cents / 100);
}

/** `24500` → `"R$ 245"`. Para números grandes de painel, onde os centavos são ruído. */
export function formatMoneyWhole(cents: number): string {
  return BRL_WHOLE.format(cents / 100);
}

/**
 * Separa o valor em partes, para que a tela possa dar pesos tipográficos
 * diferentes ao símbolo, aos reais e aos centavos.
 *
 * `18640` → `{ symbol: 'R$', whole: '186', cents: '40', negative: false }`
 */
export function splitMoney(cents: number): {
  readonly symbol: string;
  readonly whole: string;
  readonly cents: string;
  readonly negative: boolean;
} {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = new Intl.NumberFormat('pt-BR').format(Math.trunc(abs / 100));
  const rest = (abs % 100).toString().padStart(2, '0');

  return { symbol: 'R$', whole, cents: rest, negative };
}
