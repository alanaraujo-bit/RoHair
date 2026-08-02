/**
 * Duração da sessão da equipe.
 *
 * Fica em `core` e não no domínio da autenticação porque três camadas precisam
 * concordar sobre o mesmo número: o middleware (validade do cookie), a
 * infraestrutura (validade da linha no banco) e o caso de uso (validade que
 * nasce no login). Duplicar "trinta dias" em três lugares é como o cookie
 * morreria antes da sessão — ou o contrário, que é pior.
 *
 * Trinta dias, renovados a cada uso. A profissional abre o app entre um
 * atendimento e outro, com as mãos ocupadas e às vezes com luva — pedir senha
 * toda semana faria o produto ser fechado, não protegido. A segurança real aqui
 * vem de poder **revogar** a sessão na hora (token opaco), não de expirá-la
 * cedo.
 *
 * A renovação só acontece depois de um terço da vida gasta. Renovar a cada
 * requisição seria uma escrita no banco por página aberta.
 */

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const RENEW_AFTER_SECONDS = SESSION_TTL_SECONDS / 3;

export function sessionExpiryFrom(now: Date): Date {
  return new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
}

export function shouldRenewSession(expiresAt: Date, now: Date): boolean {
  const remainingSeconds = (expiresAt.getTime() - now.getTime()) / 1000;
  return remainingSeconds < SESSION_TTL_SECONDS - RENEW_AFTER_SECONDS;
}

export function isSessionExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() <= now.getTime();
}
