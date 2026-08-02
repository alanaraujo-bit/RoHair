import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

/**
 * A regra de dependência entre camadas é imposta AQUI, não na revisão de código.
 *
 * Documentação em docs/02-ARQUITETURA.md (DEC-004). Em resumo:
 *
 *   app            → pode tudo, INCLUSIVE infrastructure (raiz de composição)
 *   presentation   → application, domain, shared, core, kernel
 *   application    → domain, core, kernel
 *   infrastructure → application, domain, core, kernel
 *   domain         → só o próprio domínio e o KERNEL
 *   kernel         → NADA (é isto que permite testar sem banco)
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
      // O proxy é raiz de composição como qualquer rota: o Next exige que ele
      // fique exatamente aqui, ao lado de `app/`. Sem esta entrada ele cairia
      // como elemento desconhecido e todo import dele viraria erro.
      { type: 'app', partialMatch: false, pattern: 'src/proxy.ts' },
      // O kernel vem ANTES de `core` porque o casamento é por ordem: se `core`
      // viesse primeiro, `src/core/kernel` cairia nele e a regra abaixo — a
      // única que o domínio pode importar — nunca se aplicaria.
      { type: 'kernel', partialMatch: false, pattern: 'src/core/kernel' },
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
          /**
           * `app` é a RAIZ DE COMPOSIÇÃO, e por isso é a única camada que
           * enxerga `infrastructure`.
           *
           * Alguém precisa escolher qual adapter concreto entra no lugar de
           * cada porta, e esse alguém é sempre a borda: é o padrão de
           * composition root. Se `application` pudesse fazer isso, a inversão
           * de dependência não existiria de fato — o caso de uso passaria a
           * conhecer Prisma por tabela interposta.
           */
          {
            from: [{ type: 'app' }],
            allow: [
              { type: 'app' },
              { type: 'presentation' },
              { type: 'application' },
              { type: 'infrastructure' },
              { type: 'shared' },
              { type: 'core' },
              { type: 'kernel' },
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
              { type: 'kernel' },
            ],
          },
          {
            from: [{ type: 'application' }],
            allow: [
              { type: 'application', captured: { feature: '{{from.feature}}' } },
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'core' },
              { type: 'kernel' },
            ],
          },
          {
            from: [{ type: 'infrastructure' }],
            allow: [
              { type: 'infrastructure', captured: { feature: '{{from.feature}}' } },
              { type: 'application', captured: { feature: '{{from.feature}}' } },
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'core' },
              { type: 'kernel' },
            ],
          },
          /**
           * O domínio importa a si mesmo e o **shared kernel**, nada mais.
           *
           * O kernel (`core/kernel`) guarda os value objects que valem em todo
           * o negócio — Money, Cpf, TimeRange. Sem ele, `Money` teria de ser
           * duplicado em cada feature, e dinheiro duplicado é dinheiro que
           * diverge. O kernel não importa nada, nem `core`: é ele que mantém a
           * promessa de domínio testável sem banco e sem framework.
           *
           * Ver ADR-0003.
           */
          {
            from: [{ type: 'domain' }],
            allow: [
              { type: 'domain', captured: { feature: '{{from.feature}}' } },
              { type: 'kernel' },
            ],
          },
          {
            from: [{ type: 'shared' }],
            allow: [{ type: 'shared' }, { type: 'core' }, { type: 'kernel' }],
          },
          { from: [{ type: 'core' }], allow: [{ type: 'core' }, { type: 'kernel' }] },
          // O kernel é folha. Se ele puder importar `core`, alguém vai colocar
          // acesso a banco dentro de um value object dentro de um mês.
          { from: [{ type: 'kernel' }], allow: [{ type: 'kernel' }] },
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
    // Cliente gerado pelo Prisma: não é código nosso e não passa nas nossas
    // regras (usa `any` internamente). Lintá-lo seria ruído garantido.
    'src/core/db/generated/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
