import { type Cpf } from '@/core/kernel/cpf';
import { type PhoneNumber } from '@/core/kernel/phone';
import { type Result } from '@/core/kernel/result';

/**
 * Porta do repositório de fichas.
 *
 * Vive em `application` e não conhece Prisma nem SQL — é o que permite testar
 * um caso de uso com uma implementação em memória, em milissegundos.
 *
 * O ponto que esta interface protege: **o `Cpf` nunca chega até aqui em claro
 * para virar consulta**. Quem busca é o `cpfHash`, produzido por `CpfCrypto`.
 * Se a assinatura aceitasse `Cpf`, mais cedo ou mais tarde alguém escreveria
 * um `WHERE cpf = ...` e o documento apareceria em log de query.
 */

export type ClientRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly cpfHash: string | null;
  readonly cpfEncrypted: string | null;
  readonly birthDate: Date | null;
  readonly phone: string | null;
  readonly origin: 'CREATED_BY_STAFF' | 'SELF_REGISTERED' | 'CONFIRMED' | 'MERGED';
  readonly mergedIntoId: string | null;
};

export type NewClient = {
  readonly organizationId: string;
  readonly name: string;
  readonly cpf?: { readonly hash: string; readonly encrypted: string };
  readonly birthDate?: Date;
  readonly phone?: PhoneNumber;
  readonly origin?: ClientRecord['origin'];
};

export type RepositoryError =
  | { readonly kind: 'cpf-duplicado' }
  | { readonly kind: 'nao-encontrado'; readonly id: string }
  | { readonly kind: 'falha-de-persistencia'; readonly cause: string };

export type ClientRepository = {
  /** Busca pelo hash, nunca pelo CPF em claro (DEC-009). */
  readonly findByCpfHash: (
    organizationId: string,
    cpfHash: string,
  ) => Promise<ClientRecord | null>;

  /**
   * Candidatas a fusão para uma ficha autocadastrada (D-07).
   *
   * Devolve sugestões por nome e telefone — **nunca funde sozinho**. Casar
   * automaticamente por telefone exporia o histórico de uma pessoa para outra
   * quando o número tivesse sido reaproveitado.
   */
  readonly findMergeCandidates: (
    organizationId: string,
    criteria: { readonly name: string; readonly phone: PhoneNumber | null },
  ) => Promise<readonly ClientRecord[]>;

  readonly create: (input: NewClient) => Promise<Result<ClientRecord, RepositoryError>>;

  /** Fusão assistida: a perdedora aponta para a vencedora, nada é apagado. */
  readonly merge: (
    winnerId: string,
    loserId: string,
  ) => Promise<Result<ClientRecord, RepositoryError>>;
};

/** Só para deixar explícito que o tipo `Cpf` não entra em consulta. */
export type NeverQueryByCpf = (value: Cpf) => never;
