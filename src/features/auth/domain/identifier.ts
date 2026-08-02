/**
 * O que a pessoa digita no campo "e-mail ou usuário".
 *
 * Um campo só, não dois. DEC-008 permite entrar pelos dois, e obrigar a escolher
 * antes de digitar seria pedir que ela lembre de qual cadastrou — informação que
 * o sistema tem e ela não.
 *
 * A normalização é minúscula e sem espaços nas pontas. Minúscula em e-mail é
 * pacífica; em nome de usuário é decisão nossa, e a mesma normalização vale no
 * cadastro — senão "Rosiele" e "rosiele" viram duas contas.
 */

export type LoginIdentifier = {
  readonly value: string;
  readonly looksLikeEmail: boolean;
};

export function normalizeIdentifier(raw: string): LoginIdentifier {
  const value = raw.trim().toLowerCase();
  return { value, looksLikeEmail: value.includes('@') };
}
