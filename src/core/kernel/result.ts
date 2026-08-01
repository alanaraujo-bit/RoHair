/**
 * `Result<T, E>` — erro como valor.
 *
 * Regra do projeto: exceção só para o **inesperado** (banco fora do ar, bug).
 * Tudo que o negócio prevê — CPF inválido, horário ocupado, teste de mecha
 * reprovado — é resultado, não exceção.
 *
 * O ganho não é estilo: é que o compilador passa a cobrar o tratamento. Uma
 * função que devolve `Result` não deixa ninguém esquecer do caminho de erro,
 * enquanto `throw` é invisível na assinatura e some no `catch` genérico três
 * camadas acima.
 */

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/** Transforma o valor de sucesso; o erro passa intacto. */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/** Encadeia operações que também podem falhar, sem aninhar `if`. */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Junta vários resultados em um só, **parando no primeiro erro**.
 *
 * Usado onde a falha de uma parte invalida o todo — montar um atendimento a
 * partir de itens, por exemplo. Quando o objetivo é mostrar todos os erros de
 * um formulário de uma vez, esta função é a errada; o Zod faz aquilo melhor.
 */
export function all<T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return ok(values);
}

/**
 * Extrai o valor ou lança. **Só para teste e para o topo da aplicação**, onde
 * um erro que sobreviveu até ali é realmente inesperado.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw new Error(`Result inesperado: ${JSON.stringify(result.error)}`);
}
