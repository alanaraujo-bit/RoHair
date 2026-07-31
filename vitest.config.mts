import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Duas suítes separadas, de propósito.
 *
 * `domain` roda em Node puro: sem DOM, sem banco, sem framework. É essa suíte
 * que precisa terminar em menos de dois segundos, porque é a que será executada
 * dezenas de vezes por hora enquanto se escreve regra de negócio.
 *
 * `ui` roda em jsdom e é naturalmente mais lenta. Misturar as duas puniria a
 * primeira pela lentidão da segunda.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'domain',
          environment: 'node',
          include: [
            'src/features/*/domain/**/*.test.ts',
            'src/features/*/application/**/*.test.ts',
            'src/core/**/*.test.ts',
            'src/shared/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.tsx'],
        },
      },
    ],
  },
});
