/**
 * Bloqueio progressivo de tentativas de login.
 *
 * Função pura: recebe o que já aconteceu, devolve se a próxima tentativa pode
 * acontecer agora. Todo o resto — contar linhas, ler relógio — fica fora.
 *
 * O desenho evita os dois erros comuns. **Bloquear a conta** por N erros entrega
 * ao atacante um botão de negação de serviço contra a profissional: basta errar
 * de propósito para deixá-la de fora no dia de trabalho. **Não bloquear nada**
 * entrega a senha a quem tiver paciência. A saída é atraso que cresce
 * exponencialmente e **expira sozinho**: quem sabe a senha espera segundos; quem
 * está adivinhando some no crescimento.
 *
 * Dois baldes, com tetos diferentes:
 *
 * - **conta** — protege uma pessoa de força bruta dirigida
 * - **endereço** — protege todas as contas de varredura de senha comum, o
 *   ataque que o balde de conta não enxerga, porque distribui uma tentativa por
 *   usuário
 */

export type ThrottlePolicy = {
  /** Falhas toleradas na janela antes do primeiro atraso. */
  readonly freeAttempts: number;
  /** Janela de contagem. Falha mais velha que isto deixa de pesar. */
  readonly windowSeconds: number;
  /** Atraso após a primeira falha excedente. Dobra a cada falha seguinte. */
  readonly baseDelaySeconds: number;
  /** Teto do atraso. Sem ele, doze erros trancariam a conta por semanas. */
  readonly maxDelaySeconds: number;
};

export const ACCOUNT_POLICY: ThrottlePolicy = {
  freeAttempts: 5,
  windowSeconds: 30 * 60,
  baseDelaySeconds: 30,
  maxDelaySeconds: 15 * 60,
};

/**
 * Mais folgado de propósito: a casa da profissional pode ter NAT, e várias
 * pessoas da equipe podem sair pelo mesmo endereço.
 */
export const ADDRESS_POLICY: ThrottlePolicy = {
  freeAttempts: 30,
  windowSeconds: 30 * 60,
  baseDelaySeconds: 5,
  maxDelaySeconds: 10 * 60,
};

export type ThrottleState = {
  /** Falhas dentro da janela da política. */
  readonly failures: number;
  readonly lastFailureAt: Date | null;
};

export type ThrottleDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number };

export function evaluateThrottle(
  state: ThrottleState,
  policy: ThrottlePolicy,
  now: Date,
): ThrottleDecision {
  const excess = state.failures - policy.freeAttempts;
  if (excess <= 0 || state.lastFailureAt === null) return { allowed: true };

  const delaySeconds = Math.min(
    policy.baseDelaySeconds * 2 ** (excess - 1),
    policy.maxDelaySeconds,
  );

  const elapsedSeconds = (now.getTime() - state.lastFailureAt.getTime()) / 1000;
  const remaining = delaySeconds - elapsedSeconds;

  if (remaining <= 0) return { allowed: true };
  return { allowed: false, retryAfterSeconds: Math.ceil(remaining) };
}

/** "espere 45 segundos" · "espere 3 minutos" — nunca "espere 180 segundos". */
export function describeWait(seconds: number): string {
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes === 1 ? '' : 's'}`;
}
