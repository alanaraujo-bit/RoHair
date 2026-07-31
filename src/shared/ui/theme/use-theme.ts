'use client';

import { useCallback, useSyncExternalStore } from 'react';

import {
  getServerSnapshot,
  getSnapshot,
  setPreference,
  subscribe,
} from './theme-store';
import type { ThemePreference } from './theme.constants';

/**
 * Acesso ao tema a partir de componentes.
 *
 * `preference` é o que a pessoa escolheu; `resolved` é o que está na tela.
 * Manter os dois separados é o que permite a opção "seguir o sistema" continuar
 * reagindo quando o aparelho troca de tema sozinho ao anoitecer.
 */
export function useTheme() {
  const { preference, resolved } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved]);

  return { preference, resolved, setTheme, toggle };
}
