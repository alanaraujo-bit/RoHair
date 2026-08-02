import { existsSync, readFileSync } from 'node:fs';

/**
 * Lê o `.env.local` sem `dotenv`.
 *
 * Doze linhas contra mais uma dependência. Estava dentro do `prisma.config.ts`
 * e saiu de lá quando o segundo script de linha de comando precisou da mesma
 * coisa — script que descobre a falta da `DATABASE_URL` só ao conectar é script
 * que falha longe da causa.
 */
export function loadEnvLocal(): void {
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
