import { defineConfig } from 'prisma/config';

import { loadEnvLocal } from './prisma/load-env';

/**
 * Configuração do Prisma 7.
 *
 * A partir da versão 7 a URL do banco sai do `schema.prisma` e vem para cá. A
 * mudança é boa para este projeto: o schema deixa de ter qualquer referência a
 * ambiente e passa a ser puramente estrutural, sem risco de alguém commitar uma
 * credencial junto com uma tabela.
 *
 * A leitura do `.env.local` mora em `prisma/load-env.ts`, porque os scripts de
 * semente e de bootstrap precisam exatamente da mesma coisa antes de conectar.
 */

loadEnvLocal();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Vazio é aceitável: `validate` e `generate` não tocam o banco. Só os
    // comandos que precisam de conexão é que vão reclamar, e aí é justo.
    url: process.env.DATABASE_URL ?? '',
  },
});
