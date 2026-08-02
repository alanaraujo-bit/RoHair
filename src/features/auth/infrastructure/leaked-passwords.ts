import { createHash } from 'node:crypto';

/**
 * Verificação contra listas de senhas vazadas (DEC-008), pelo Have I Been
 * Pwned.
 *
 * **A senha nunca sai daqui.** O protocolo é de k-anonimato: calcula-se o
 * SHA-1, enviam-se apenas os **cinco primeiros caracteres** do hash, e o
 * serviço devolve todos os sufixos que começam com aquele prefixo — algo entre
 * quinhentos e mil. A comparação acontece em memória, no nosso servidor. Quem
 * está do outro lado não descobre nem a senha, nem qual das mil era a nossa.
 *
 * SHA-1 aqui não é escolha de segurança: é o formato que a API usa. O hash que
 * protege a senha continua sendo Argon2id, em outro lugar.
 *
 * A resposta é `desconhecida` quando a rede falha. Quem chama decide o que
 * fazer — e a decisão certa quase nunca é bloquear a criação de conta porque um
 * serviço de terceiro está fora do ar.
 */

export type LeakVerdict = 'vazada' | 'inedita' | 'desconhecida';

const API = 'https://api.pwnedpasswords.com/range';
const TIMEOUT_MS = 3_000;

export async function checkLeakedPassword(password: string): Promise<LeakVerdict> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(`${API}/${prefix}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'Add-Padding': 'true' },
    });

    if (!response.ok) return 'desconhecida';

    const corpo = await response.text();
    for (const linha of corpo.split('\n')) {
      const [candidato, contagem] = linha.trim().split(':');
      // O cabeçalho `Add-Padding` faz a API devolver linhas falsas com contagem
      // zero, para o tamanho da resposta não denunciar nada. Elas não contam.
      if (candidato === suffix && contagem !== '0') return 'vazada';
    }

    return 'inedita';
  } catch {
    return 'desconhecida';
  }
}
