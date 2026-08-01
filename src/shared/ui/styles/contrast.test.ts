import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { contrastRatio, parseOklch, type Oklch } from './color';

/**
 * Contraste do Áurea, verificado por cálculo nos dois temas.
 *
 * DoD da Fase 2: *"todo primitivo passa em contraste AA nos dois temas"*. Um
 * teste que checasse valores fixos escritos à mão não protegeria nada — quem
 * mudasse um token continuaria passando. Por isso este arquivo **lê o
 * `tokens.css` de verdade** e recalcula.
 *
 * Como os dois temas são extraídos: a primeira definição de cada `--aurea-*` é
 * o Porcelana; a redefinição dentro do bloco escuro é o Veludo. Não dependemos
 * de comentário nem de posição de chave.
 *
 * Limiares da WCAG 2.2:
 *   4.5  texto normal
 *   3.0  texto grande (≥ 24px) e componentes de interface
 */

const AA_TEXT = 4.5;
const AA_LARGE = 3;

const TOKENS_PATH = fileURLToPath(new URL('./tokens.css', import.meta.url));
const source = readFileSync(TOKENS_PATH, 'utf8');

type Palette = Readonly<Record<string, Oklch>>;

function readPalettes(css: string): { light: Palette; dark: Palette } {
  const light: Record<string, Oklch> = {};
  const dark: Record<string, Oklch> = {};

  const declaration = /--(aurea-[a-z-]+)\s*:\s*(oklch\([^)]*\))/gi;

  for (const match of css.matchAll(declaration)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;

    const color = parseOklch(value);
    expect(color, `token --${name} não pôde ser lido: ${value}`).not.toBeNull();
    if (!color) continue;

    // Primeira ocorrência é o tema claro; a segunda sobrescreve no escuro.
    if (name in light) dark[name] = color;
    else light[name] = color;
  }

  // O escuro herda o que não redefine, exatamente como a cascata faz.
  return { light, dark: { ...light, ...dark } };
}

const { light, dark } = readPalettes(source);

const THEMES = [
  { name: 'Porcelana (claro)', palette: light },
  { name: 'Veludo (escuro)', palette: dark },
] as const;

/** Pares que precisam passar, e o mínimo de cada um. */
const PAIRS = [
  // Texto sobre as superfícies onde ele de fato aparece
  { fg: 'aurea-ink', bg: 'aurea-canvas', min: AA_TEXT, why: 'corpo sobre o fundo' },
  { fg: 'aurea-ink', bg: 'aurea-surface', min: AA_TEXT, why: 'corpo sobre cartão' },
  {
    fg: 'aurea-ink',
    bg: 'aurea-canvas-subtle',
    min: AA_TEXT,
    why: 'corpo sobre bloco discreto',
  },
  { fg: 'aurea-ink-muted', bg: 'aurea-canvas', min: AA_TEXT, why: 'texto secundário' },
  {
    fg: 'aurea-ink-muted',
    bg: 'aurea-surface',
    min: AA_TEXT,
    why: 'texto secundário em cartão',
  },
  // `ink-subtle` é dica e legenda: texto pequeno, então AA cheio também
  { fg: 'aurea-ink-subtle', bg: 'aurea-canvas', min: AA_TEXT, why: 'dica de campo' },

  // Ações e estados
  // O par que sustenta o botão primário. É o teste mais importante do arquivo:
  // foi ele que provou que branco sobre o rosa do Veludo dava 2.17:1.
  { fg: 'aurea-on-action', bg: 'aurea-action', min: AA_TEXT, why: 'botão primário' },
  { fg: 'aurea-rose-strong', bg: 'aurea-rose-soft', min: AA_TEXT, why: 'botão quiet' },
  { fg: 'aurea-danger', bg: 'aurea-canvas', min: AA_TEXT, why: 'mensagem de erro' },
  { fg: 'aurea-danger', bg: 'aurea-surface', min: AA_TEXT, why: 'erro em cartão' },
  { fg: 'aurea-success', bg: 'aurea-canvas', min: AA_LARGE, why: 'sinal de sucesso' },

  // Componentes de interface: 3:1 basta, não é texto
  {
    fg: 'aurea-rose',
    bg: 'aurea-canvas',
    min: AA_LARGE,
    why: 'anel de foco e chave ligada',
  },
  {
    fg: 'aurea-border-strong',
    bg: 'aurea-surface',
    min: AA_LARGE,
    why: 'borda de campo',
  },
] as const;

describe('Contraste do Áurea', () => {
  it('lê os dois temas do tokens.css', () => {
    expect(Object.keys(light).length).toBeGreaterThan(10);
    // Se o bloco escuro sumir, os dois viram o mesmo objeto e o teste
    // continuaria "passando" sem testar nada. Esta asserção evita isso.
    expect(dark['aurea-canvas']).not.toEqual(light['aurea-canvas']);
  });

  describe.each(THEMES)('$name', ({ palette }) => {
    it.each(PAIRS)('$fg sobre $bg — $why', ({ fg, bg, min }) => {
      const foreground = palette[fg];
      const background = palette[bg];

      expect(foreground, `token --${fg} não existe`).toBeDefined();
      expect(background, `token --${bg} não existe`).toBeDefined();
      if (!foreground || !background) return;

      const ratio = contrastRatio(foreground, background);
      expect(
        Number(ratio.toFixed(2)),
        `${fg} sobre ${bg} deu ${ratio.toFixed(2)}:1, precisa de ${min}:1`,
      ).toBeGreaterThanOrEqual(min);
    });
  });

  describe.each(THEMES)('$name · armadilha do branco fixo', ({ name, palette }) => {
    /**
     * Guarda de regressão.
     *
     * A tentação de escrever `text-white` num botão rosa é permanente, e no
     * Veludo ela reprova: o rosa daquele tema é claro. Este teste documenta o
     * número para que ninguém "conserte" o `on-action` de volta para branco.
     */
    it('branco sobre --aurea-action só serve no Porcelana', () => {
      const action = palette['aurea-action'];
      expect(action).toBeDefined();
      if (!action) return;

      const white: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };
      const ratio = contrastRatio(white, action);

      if (name.startsWith('Porcelana')) {
        expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
      } else {
        // Falharia se usássemos branco — é por isso que `on-action` existe.
        expect(ratio).toBeLessThan(AA_LARGE);
      }
    });
  });
});
