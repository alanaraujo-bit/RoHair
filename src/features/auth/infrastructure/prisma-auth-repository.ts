import { prisma } from '@/core/db/client';

import type {
  AttemptRepository,
  AuditRecorder,
  SessionRepository,
  StaffCredentialsRepository,
} from '../application/ports';

/**
 * Adapters de persistência da autenticação.
 *
 * Uma observação que vale para o arquivo inteiro: nenhuma consulta daqui recebe
 * `organizationId`. É o único lugar do sistema onde isso é correto — a
 * organização é justamente o que o login **descobre**. Todo o resto do produto
 * parte de uma sessão que já sabe a resposta.
 */

export const staffCredentialsRepository: StaffCredentialsRepository = {
  async findByIdentifier(identifier) {
    const user = await prisma().user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        passwordHash: true,
        memberships: { select: { role: true } },
      },
    });

    if (user === null) return null;

    // Conta sem papel nenhum não entra. O papel é o que define o que ela pode
    // fazer; sem nenhum, "entrar" não teria significado definido — e a falha
    // segura é negar, nunca supor um padrão.
    if (user.memberships.length === 0) return null;

    return {
      userId: user.id,
      organizationId: user.organizationId,
      name: user.name,
      passwordHash: user.passwordHash,
      roles: user.memberships.map((m) => m.role),
    };
  },
};

export const sessionRepository: SessionRepository = {
  async create({ userId, tokenHash, expiresAt }) {
    await prisma().session.create({ data: { userId, tokenHash, expiresAt } });
  },
};

export const attemptRepository: AttemptRepository = {
  async stateOf(bucket, windowSeconds, now) {
    const desde = new Date(now.getTime() - windowSeconds * 1000);

    const [failures, ultima] = await Promise.all([
      prisma().loginAttempt.count({
        where: { bucket, succeeded: false, createdAt: { gte: desde } },
      }),
      prisma().loginAttempt.findFirst({
        where: { bucket, succeeded: false, createdAt: { gte: desde } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return { failures, lastFailureAt: ultima?.createdAt ?? null };
  },

  async record(bucket, succeeded) {
    await prisma().loginAttempt.create({ data: { bucket, succeeded } });
  },

  async clear(bucket) {
    await prisma().loginAttempt.deleteMany({ where: { bucket } });
  },
};

export const auditRecorder: AuditRecorder = {
  async record(input) {
    await prisma().auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ?? undefined,
      },
    });
  },
};
