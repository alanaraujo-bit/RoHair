import {
  isThemePreference,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './theme.constants';

/**
 * Estado do tema como store externa.
 *
 * A alternativa óbvia — ler o localStorage dentro de um `useEffect` e chamar
 * `setState` — provoca renderização em cascata e é sinalizada pelo lint do
 * React com razão. `useSyncExternalStore` existe exatamente para este caso: uma
 * fonte de verdade que vive fora do React (localStorage + preferência do
 * sistema) e que precisa de um valor estável durante a hidratação.
 *
 * Ganho concreto: quando o iPhone troca para o modo escuro ao anoitecer, todos
 * os componentes inscritos reagem sem que ninguém precise re-renderizar a árvore
 * inteira.
 */

export type ThemeState = {
  readonly preference: ThemePreference;
  readonly resolved: ResolvedTheme;
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

const SERVER_STATE: ThemeState = { preference: 'system', resolved: 'light' };

let snapshot: ThemeState = SERVER_STATE;
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    // Modo privativo pode bloquear o storage — seguir a preferência do sistema
    return 'system';
  }
}

function resolvePreference(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * Recalcula o estado e só troca a referência quando algo realmente mudou.
 * `useSyncExternalStore` compara por identidade: devolver um objeto novo a cada
 * chamada causaria renderização infinita.
 */
function refresh(): void {
  const preference = readPreference();
  const resolved = resolvePreference(preference);

  if (snapshot.preference !== preference || snapshot.resolved !== resolved) {
    snapshot = { preference, resolved };
  }

  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    // Primeira inscrição: sincroniza com o que o script inline já aplicou
    refresh();
  }

  listeners.add(listener);

  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', refresh);
  // Outra aba trocou o tema — manter as duas coerentes
  window.addEventListener('storage', refresh);

  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', refresh);
    window.removeEventListener('storage', refresh);
  };
}

export function getSnapshot(): ThemeState {
  return snapshot;
}

/** Durante a renderização no servidor não há preferência conhecida. */
export function getServerSnapshot(): ThemeState {
  return SERVER_STATE;
}

export function setPreference(preference: ThemePreference): void {
  const root = document.documentElement;

  if (preference === 'system') {
    root.removeAttribute(THEME_ATTRIBUTE);
  } else {
    root.setAttribute(THEME_ATTRIBUTE, preference);
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A troca vale para esta sessão mesmo sem persistência
  }

  refresh();
}
