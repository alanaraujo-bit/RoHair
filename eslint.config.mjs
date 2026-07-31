import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

/**
 * A regra de dependência entre camadas é imposta AQUI, não na revisão de código.
 *
 * Documentação em docs/02-ARQUITETURA.md (DEC-004). Em resumo:
 *
 *   app            → pode tudo (é a camada de composição)
 *   presentation   → application, domain, shared, core
 *   application    → domain, core
 *   infrastructure → application, domain, core
 *   domain         → NADA (é isto que permite testar sem banco)
 *   shared / core  → jamais importam features
 *
 * Uma feature não importa outra feature. Comunicação entre domínios acontece por
 * use case explícito ou por evento — nunca por atalho.
 */
const layers = defineConfig({
  files: ['src/**/*.{ts,tsx}'],
  plugins: { boundaries },
  settings: {
    'boundaries/include': ['src/**/*'],
    // `partialMatch: false` é obrigatório aqui: no modo padrão o plugin casa o padrão
    // contra a PASTA do elemento, e todo arquivo cairia como desconhecido — a
    // regra passaria a existir sem nunca acusar nada, que é pior do que não ter.
    'boundaries/elements': [
      { type: 'app', partialMatch: false, pattern: 'src/app' },
      {
        type: 'domain',
        partialMatch: false,
        pattern: 'src/features/*/domain',
        capture: ['feature'],
      },
      {
        type: 'application',
        partialMatch: false,
        pattern: 'src/features/*/application',
        capture: ['feature'],
      },
      {
        type: 'infrastructure',
        partialMatch: false,
        pattern: 'src/features/*/infrastructure',
        capture: ['feature'],
      },
      {
        type: 'presentation',
        partialMatch: false,
        pattern: 'src/features/*/presentation',
        capture: ['feature'],
      },
      { type: 'shared', partialMatch: false, pattern: 'src/shared' },
      { type: 'core', partialMatch: false, pattern: 'src/core' },
    ],
  },
  rules: {
    'boundaries/no-unknown-dependencies': 'error',
    'boundaries/no-private': 'off',
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        policies: [
          {
            from: [{ type: 'app' }],
            allow: [
              { type: 'app' },
              { type: 'presentation' },
              { type: 'application' },
              { type: 'shared' },
              { type: 'core' },
            ],
          },
          {
            from: [{ type: 'presentation' }],
            allow: [
              { type: 'presentation', captured: { feature: '{{from.feature}}' } },
              { type: 'application', captured: { feature: '{{from.feature}}' } },
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'shared' },
              { type: 'core' },
            ],
          },
          {
            from: [{ type: 'application' }],
            allow: [
              { type: 'application', captured: { feature: '{{from.feature}}' } },
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'core' },
            ],
          },
          {
            from: [{ type: 'infrastructure' }],
            allow: [
              { type: 'infrastructure', captured: { feature: '{{from.feature}}' } },
              { type: 'application', captured: { feature: '{{from.feature}}' } },
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'core' },
            ],
          },
          // O domínio não importa nada além de si mesmo. É inegociável:
          // é o que garante regra de negócio testável em milissegundos.
          {
            from: [{ type: 'domain' }],
            allow: [{ type: 'domain', captured: { feature: '{{from.feature}}' } }],
          },
          {
            from: [{ type: 'shared' }],
            allow: [{ type: 'shared' }, { type: 'core' }],
          },
          { from: [{ type: 'core' }], allow: [{ type: 'core' }] },
        ],
      },
    ],
  },
});

/** Prisma só existe em infrastructure. Nenhuma exceção. */
const persistence = defineConfig({
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/features/*/infrastructure/**/*', 'src/core/db/**/*'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@prisma/client',
            message:
              'Prisma só pode ser importado em infrastructure/ ou core/db. Use um repositório.',
          },
        ],
        patterns: [
          {
            group: ['@/core/db/*'],
            message:
              'Acesso direto ao banco fora de infrastructure/. Use um repositório.',
          },
        ],
      },
    ],
  },
});

const typescript = defineConfig({
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  layers,
  persistence,
  typescript,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
