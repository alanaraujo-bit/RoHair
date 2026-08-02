import type { ThrottleState } from '../domain/throttle';

/**
 * Portas da autenticação.
 *
 * Existem para que o caso de uso — a parte com a regra de segurança dentro —
 * seja testável sem banco, sem rede e sem Argon2. É essa possibilidade que faz
 * os testes de "senha errada não vira sessão" rodarem em milissegundos, e por
 * isso rodarem sempre.
 */

export type StaffCredentials = {
  readonly userId: string;
  readonly organizationId: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly roles: readonly string[];
};

export type StaffCredentialsRepository = {
  /** `null` quando não existe, está apagada, ou não tem papel nenhum. */
  findByIdentifier(identifier: string): Promise<StaffCredentials | null>;
};

export type SessionRepository = {
  create(input: {
    readonly userId: string;
    readonly tokenHash: string;
    readonly expiresAt: Date;
  }): Promise<void>;
};

export type AttemptRepository = {
  /** Estado do balde dentro da janela pedida. */
  stateOf(bucket: string, windowSeconds: number, now: Date): Promise<ThrottleState>;
  record(bucket: string, succeeded: boolean): Promise<void>;
  /** Apaga o histórico do balde. Chamado no acerto, para não punir quem lembrou. */
  clear(bucket: string): Promise<void>;
};

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
  /**
   * Hash contra o qual verificar quando a conta não existe, para que os dois
   * caminhos custem o mesmo tempo. Precisa vir do adapter: um valor escrito à
   * mão no código pode não ser um hash válido — e um `verify` que lança em vez
   * de devolver `false` denunciaria a conta inexistente pelo erro.
   */
  discardHash(): Promise<string>;
};

export type AuditRecorder = {
  record(input: {
    readonly organizationId: string;
    readonly actorType: string;
    readonly actorId: string | null;
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string | null;
    readonly metadata?: Record<string, string | number | boolean | null>;
  }): Promise<void>;
};

export type Clock = { now(): Date };

export const systemClock: Clock = { now: () => new Date() };
