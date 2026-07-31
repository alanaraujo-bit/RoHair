/** Preferência de tema. `system` delega ao sistema operacional. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Tema efetivamente aplicado ao documento. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'rohair:theme';

export const THEME_ATTRIBUTE = 'data-theme';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === 'string' &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}
