import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('junta classes verdadeiras', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('descarta valores falsos sem deixar espaço sobrando', () => {
    const isActive = false;
    expect(cn('a', isActive && 'ativo', undefined, null, 'b')).toBe('a b');
  });

  it('retorna string vazia quando não há nada a aplicar', () => {
    expect(cn(undefined, false)).toBe('');
  });
});
