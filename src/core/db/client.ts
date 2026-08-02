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
 * **O singleton vale também em produção**, e isso não é descuido: a versão
 * anterior deste arquivo só guardava o cliente fora de produção, pensando em
 * hot reload. Em função serverless o efeito foi o oposto do pretendido — cada
 * invocação abria um pool novo, as conexões se acumulavam e o Postgres passou a
 * responder `too many clients already` **em produção**, no meio de um
 * atendimento. O escopo de módulo sobrevive entre invocações de uma mesma
 * instância; é exatamente aí que o pool deve viver.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Poucas conexões por instância, liberadas rápido.
 *
 * Um pool grande não ajuda: cada instância atende uma requisição por vez, e o
 * que multiplica conexão é a quantidade de instâncias, não o tamanho do pool.
 * Teto baixo e ociosidade curta é o que mantém a soma dentro do limite do
 * Railway quando a Vercel resolve abrir vinte instâncias.
 */
const POOL = { max: 3, idleTimeoutMillis: 10_000 } as const;

export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, ...POOL }),
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
  globalForPrisma.prisma = client;
  return client;
}
