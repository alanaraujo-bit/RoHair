import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client';

/**
 * Cliente Prisma.
 *
 * Este é o **único** lugar do sistema que instancia o Prisma. O lint impede
 * `@prisma/client` e `@/core/db/*` fora de `infrastructure/` — o resto do
 * código conversa com repositórios, nunca com o ORM.
 *
 * Prisma 7 exige um driver adapter. `PrismaPg` conecta pelo `pg`, com pool
 * próprio, o que é o caminho certo para o Railway: o proxy TCP não gosta de
 * conexão nova por requisição.
 *
 * O singleton em `globalThis` existe por causa do hot reload do Next: sem ele,
 * cada recarga do módulo abriria um pool novo e o banco esgotaria as conexões
 * em minutos de desenvolvimento.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function prisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Falha alto e cedo. Um cliente sem URL só erraria na primeira consulta,
    // muito longe da causa.
    throw new Error('DATABASE_URL ausente: não é possível criar o cliente Prisma.');
  }

  const client = createPrismaClient(connectionString);
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}
