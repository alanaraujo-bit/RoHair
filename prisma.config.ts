import { existsSync, readFileSync } from 'node:fs';

import { defineConfig } from 'prisma/config';

/**
 * Configuração do Prisma 7.
 *
 * A partir da versão 7 a URL do banco sai do `schema.prisma` e vem para cá. A
 * mudança é boa para este projeto: o schema deixa de ter qualquer referência a
 * ambiente e passa a ser puramente estrutural, sem risco de alguém commitar uma
 * credencial junto com uma tabela.
 *
 * O `.env.local` é lido à mão, sem `dotenv`. São doze linhas contra mais uma
 * dependência — e é a única coisa que precisa acontecer antes do Prisma subir.
 */

function loadEnvLocal(): void {
  if (!existsSync('.env.local')) return;

  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (!key || rawValue === undefined) continue;
    // Variável real do ambiente sempre vence a do arquivo. É o que faz o CI se
    // comportar de forma previsível mesmo se alguém commitar um .env por engano.
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
  }
}

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
