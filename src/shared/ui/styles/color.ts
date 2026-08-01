/**
 * Conversão de cor e cálculo de contraste.
 *
 * Existe para que o contraste do Áurea seja **provado por cálculo**, não
 * conferido a olho. É a razão de a paleta ter sido escrita em OKLCH: a
 * luminância ali é perceptualmente uniforme, então dá para gerar escalas e
 * verificar conformidade sem tentativa e erro.
 *
 * O caminho é OKLCH → OKLab → sRGB linear → luminância relativa da WCAG.
 * Matrizes de Björn Ottosson (oklab, 2020).
 */

export type Rgb = { readonly r: number; readonly g: number; readonly b: number };

/** Cor OKLCH. `l` de 0 a 1, `c` em torno de 0–0.4, `h` em graus. */
export type Oklch = {
  readonly l: number;
  readonly c: number;
  readonly h: number;
  readonly alpha: number;
};

const OKLCH_PATTERN =
  /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)/i;

/**
 * Lê `oklch(66% 0.13 12)` ou `oklch(66% 0.13 12 / 0.14)`.
 *
 * Devolve `null` em vez de lançar: o chamador é um teste que precisa dizer
 * *qual* token está malformado, e uma exceção aqui perderia essa informação.
 */
export function parseOklch(value: string): Oklch | null {
  const match = OKLCH_PATTERN.exec(value);
  if (!match) return null;

  const [, l, c, h, alpha] = match;
  if (l === undefined || c === undefined || h === undefined) return null;

  return {
    l: Number(l) / 100,
    c: Number(c),
    h: Number(h),
    alpha: alpha === undefined ? 1 : Number(alpha),
  };
}

/**
 * OKLCH para sRGB linear.
 *
 * Os valores podem cair fora de [0,1] quando a cor não existe no gamute sRGB.
 * Aqui são cortados, e não mapeados para o gamute: para medir contraste o corte
 * é o que o navegador faz de qualquer forma ao pintar.
 */
export function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const lCube = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCube = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCube = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: clamp01(4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube),
    g: clamp01(-1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube),
    b: clamp01(-0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube),
  };
}

/** Luminância relativa da WCAG 2.x, a partir de sRGB **linear**. */
export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

/**
 * Razão de contraste entre duas cores opacas. Vai de 1 (idênticas) a 21.
 *
 * WCAG 2.2 AA pede **4.5** para texto normal, **3.0** para texto grande
 * (≥ 24px, ou ≥ 18.66px em negrito) e **3.0** para componentes de interface.
 */
export function contrastRatio(a: Oklch, b: Oklch): number {
  const la = relativeLuminance(oklchToLinearRgb(a));
  const lb = relativeLuminance(oklchToLinearRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Compõe uma cor translúcida sobre um fundo opaco.
 *
 * Necessário porque vários tons do Áurea são aplicados com opacidade — o fundo
 * de um `Badge` de sucesso, por exemplo. Medir o contraste da cor pura mentiria
 * sobre o que aparece na tela.
 *
 * A mistura acontece em espaço **linear**, que é onde ela é fisicamente
 * correta; misturar em sRGB com gama escureceria o resultado.
 */
export function flatten(foreground: Oklch, background: Oklch): Rgb {
  const fg = oklchToLinearRgb(foreground);
  const bg = oklchToLinearRgb(background);
  const alpha = foreground.alpha;

  return {
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
  };
}

/** Contraste entre uma cor já composta e uma cor OKLCH. */
export function contrastWithRgb(rgb: Rgb, other: Oklch): number {
  const la = relativeLuminance(rgb);
  const lb = relativeLuminance(oklchToLinearRgb(other));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
