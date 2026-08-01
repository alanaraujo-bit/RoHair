import type { PrismaClient } from '@/core/db/generated/client';
import { err, ok, type Result } from '@/core/kernel/result';

import type {
  ClientRecord,
  ClientRepository,
  NewClient,
  RepositoryError,
} from '../application/client-repository';

/**
 * Adapter Prisma do repositório de fichas.
 *
 * Este é o único tipo de arquivo autorizado a conhecer Prisma — o lint bloqueia
 * o import em qualquer outro lugar. Trocar de ORM significa reescrever este
 * arquivo, e nada mais.
 */

/** `P2002` é a violação de unicidade do Prisma — aqui, o índice parcial de CPF. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createPrismaClientRepository(db: PrismaClient): ClientRepository {
  return {
    async findByCpfHash(organizationId, cpfHash) {
      return db.client.findFirst({
        where: { organizationId, cpfHash, deletedAt: null, mergedIntoId: null },
      });
    },

    async findMergeCandidates(organizationId, criteria) {
      return db.client.findMany({
        where: {
          organizationId,
          deletedAt: null,
          mergedIntoId: null,
          OR: [
            // Telefone é o sinal forte; o nome sozinho traz homônimas, e é por
            // isso que a decisão final é sempre humana.
            criteria.phone ? { phone: criteria.phone } : {},
            { name: { contains: criteria.name, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'asc' },
      });
    },

    async create(input: NewClient): Promise<Result<ClientRecord, RepositoryError>> {
      try {
        const created = await db.client.create({
          data: {
            organizationId: input.organizationId,
            name: input.name,
            cpfHash: input.cpf?.hash ?? null,
            cpfEncrypted: input.cpf?.encrypted ?? null,
            birthDate: input.birthDate ?? null,
            phone: input.phone ?? null,
            origin: input.origin ?? 'CREATED_BY_STAFF',
          },
        });
        return ok(created);
      } catch (error) {
        // A duplicata de CPF não é falha técnica: é um caso de negócio previsto
        // — a cliente já existe — e vira `Result`, não exceção.
        if (isUniqueViolation(error)) return err({ kind: 'cpf-duplicado' });
        return err({ kind: 'falha-de-persistencia', cause: describe(error) });
      }
    },

    async merge(winnerId, loserId): Promise<Result<ClientRecord, RepositoryError>> {
      try {
        /**
         * Transação única. A fusão move histórico entre fichas; pela metade,
         * ela deixaria atendimentos órfãos apontando para uma ficha marcada
         * como fundida — pior que não ter fundido.
         *
         * O `AuditLog` registra qual venceu, porque a escolha é humana e
         * reversível (GAP-03).
         */
        const winner = await db.$transaction(async (tx) => {
          const loser = await tx.client.findUniqueOrThrow({ where: { id: loserId } });

          await tx.attendance.updateMany({
            where: { clientId: loserId },
            data: { clientId: winnerId },
          });
          await tx.appointment.updateMany({
            where: { clientId: loserId },
            data: { clientId: winnerId },
          });
          await tx.clientPhoto.updateMany({
            where: { clientId: loserId },
            data: { clientId: winnerId },
          });
          await tx.clientNote.updateMany({
            where: { clientId: loserId },
            data: { clientId: winnerId },
          });

          // INV-20 — a conta perdedora é REVOGADA, nunca apagada. Uma escolha
          // automática errada trancaria a cliente fora do próprio histórico.
          await tx.clientAccount.updateMany({
            where: { clientId: loserId },
            data: { status: 'REVOKED' },
          });

          await tx.client.update({
            where: { id: loserId },
            data: { mergedIntoId: winnerId, origin: 'MERGED' },
          });

          await tx.auditLog.create({
            data: {
              organizationId: loser.organizationId,
              actorType: 'USER',
              action: 'CLIENT_MERGE',
              targetType: 'Client',
              targetId: winnerId,
              metadata: { loserId, loserName: loser.name },
            },
          });

          return tx.client.update({
            where: { id: winnerId },
            data: { origin: 'CONFIRMED' },
          });
        });

        return ok(winner);
      } catch (error) {
        return err({ kind: 'falha-de-persistencia', cause: describe(error) });
      }
    },
  };
}
