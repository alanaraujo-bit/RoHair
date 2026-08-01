import { describe, expect, it } from 'vitest';

import { cpf, formatCpf, maskCpf, normalizeCpf } from './cpf';
import {
  add,
  compare,
  isNegative,
  money,
  moneyOf,
  percentOff,
  subtract,
  sum,
  times,
  ZERO,
} from './money';
import { formatPhone, maskPhone, phoneNumber } from './phone';
import { addQuantity, formatQuantity, quantityOf, subtractQuantity } from './quantity';
import { all, andThen, err, isErr, isOk, map, ok, unwrap } from './result';
import {
  businessDay,
  contains,
  duration,
  durationOf,
  formatDuration,
  overlaps,
  rangeFrom,
  rangeMinutes,
  timeRange,
} from './time';

/**
 * Testes do shared kernel.
 *
 * Rodam na suíte `domain`, em Node puro, sem DOM e sem banco. É esta suíte que
 * precisa terminar em menos de dois segundos, porque é a que roda dezenas de
 * vezes por hora enquanto se escreve regra de negócio.
 *
 * Vários casos aqui não são hipotéticos: vêm das invariantes numeradas em
 * 08-MODELO-DE-DOMINIO.md e dos cinco cenários de 10-CENARIOS.md.
 */

describe('Result', () => {
  it('distingue sucesso de erro pelo tipo', () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isErr(err('x'))).toBe(true);
  });

  it('map só toca o sucesso', () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
    expect(map(err('falha'), (n: number) => n * 3)).toEqual(err('falha'));
  });

  it('andThen encadeia sem aninhar', () => {
    const parse = (text: string) =>
      text === 'ok' ? ok(text.length) : err('texto inválido');

    expect(andThen(ok('ok'), parse)).toEqual(ok(2));
    expect(andThen(ok('nao'), parse)).toEqual(err('texto inválido'));
  });

  it('all para no primeiro erro', () => {
    expect(all([ok(1), ok(2)])).toEqual(ok([1, 2]));
    expect(all([ok(1), err('primeiro'), err('segundo')])).toEqual(err('primeiro'));
  });

  it('unwrap lança quando o resultado é erro', () => {
    expect(() => unwrap(err({ kind: 'qualquer' }))).toThrow(/Result inesperado/);
  });
});

describe('Money', () => {
  it('rejeita centavos fracionados', () => {
    // A defesa que impede alguém de passar reais onde se espera centavos
    expect(isErr(money(12.5))).toBe(true);
  });

  it('rejeita valores absurdos', () => {
    expect(isErr(money(99_999_999_999))).toBe(true);
  });

  it('soma e subtrai sem erro de ponto flutuante', () => {
    // 0.1 + 0.2 em reais daria 0.30000000000000004. Em centavos, dá 30.
    const total = add(moneyOf(10), moneyOf(20));
    expect(total).toBe(30);
    expect(subtract(moneyOf(22000), moneyOf(7360))).toBe(14640);
  });

  it('soma uma lista partindo de zero', () => {
    expect(sum([moneyOf(22000), moneyOf(0), moneyOf(4000)])).toBe(26000);
    expect(sum([])).toBe(ZERO);
  });

  it('multiplica só por quantidade inteira', () => {
    expect(unwrap(times(moneyOf(4000), 3))).toBe(12000);
    expect(isErr(times(moneyOf(4000), 1.5))).toBe(true);
  });

  it('arredonda o desconto para baixo, a favor da cliente', () => {
    // 10% de R$ 22,05 seriam 220,5 centavos. Para baixo: 220.
    expect(unwrap(percentOff(moneyOf(2205), 10))).toBe(2205 - 220);
    expect(isErr(percentOff(moneyOf(1000), 120))).toBe(true);
  });

  it('nunca deixa o desconto ultrapassar o valor', () => {
    expect(unwrap(percentOff(moneyOf(1), 100))).toBe(0);
  });

  it('reconhece valor negativo — cortesia gera prejuízo, e isso é verdade', () => {
    expect(isNegative(subtract(ZERO, moneyOf(7360)))).toBe(true);
  });

  it('compara para ordenação', () => {
    expect(compare(moneyOf(1), moneyOf(2))).toBe(-1);
    expect(compare(moneyOf(2), moneyOf(2))).toBe(0);
    expect(compare(moneyOf(3), moneyOf(2))).toBe(1);
  });
});

describe('Cpf — INV-02', () => {
  // Válidos gerados pelo algoritmo oficial
  const VALID = ['52998224725', '11144477735'];

  it.each(VALID)('aceita o CPF válido %s', (value) => {
    expect(isOk(cpf(value))).toBe(true);
  });

  it('aceita formatado e normaliza', () => {
    expect(unwrap(cpf('529.982.247-25'))).toBe('52998224725');
    expect(normalizeCpf(' 529.982.247-25 ')).toBe('52998224725');
  });

  it('rejeita tamanho errado', () => {
    expect(cpf('1234567890')).toEqual(err({ kind: 'tamanho-invalido', digits: 10 }));
  });

  it('rejeita sequências de dígitos iguais', () => {
    // Passariam na conta dos verificadores; são rejeitadas explicitamente
    for (const value of ['00000000000', '11111111111', '99999999999']) {
      expect(cpf(value)).toEqual(err({ kind: 'todos-iguais' }));
    }
  });

  it('rejeita dígito verificador inválido', () => {
    expect(cpf('52998224724')).toEqual(err({ kind: 'digito-verificador-invalido' }));
  });

  it('formata e mascara para exibição', () => {
    const value = unwrap(cpf('52998224725'));
    expect(formatCpf(value)).toBe('529.982.247-25');
    expect(maskCpf(value)).toBe('529.•••.•••-25');
  });
});

describe('Duration', () => {
  it('rejeita zero, negativo e fracionado', () => {
    expect(isErr(duration(0))).toBe(true);
    expect(isErr(duration(-30))).toBe(true);
    expect(isErr(duration(2.5))).toBe(true);
  });

  it('rejeita duração maior que um dia', () => {
    expect(isErr(duration(24 * 60 + 1))).toBe(true);
  });

  it('formata como a profissional fala', () => {
    expect(formatDuration(durationOf(40))).toBe('40min');
    expect(formatDuration(durationOf(120))).toBe('2h');
    expect(formatDuration(durationOf(155))).toBe('2h35');
    expect(formatDuration(durationOf(185))).toBe('3h05');
  });
});

describe('TimeRange', () => {
  const at = (iso: string) => new Date(iso);

  it('rejeita fim antes ou igual ao início', () => {
    expect(
      isErr(timeRange(at('2026-11-06T12:00:00Z'), at('2026-11-06T11:00:00Z'))),
    ).toBe(true);
    expect(
      isErr(timeRange(at('2026-11-06T12:00:00Z'), at('2026-11-06T12:00:00Z'))),
    ).toBe(true);
  });

  it('rejeita data inválida', () => {
    expect(isErr(timeRange(new Date('nada'), at('2026-11-06T12:00:00Z')))).toBe(true);
  });

  it('constrói a partir de início e duração', () => {
    const range = rangeFrom(at('2026-11-06T12:00:00Z'), durationOf(155));
    expect(range.end.toISOString()).toBe('2026-11-06T14:35:00.000Z');
    expect(rangeMinutes(range)).toBe(155);
  });

  describe('sobreposição — INV-01', () => {
    const nove = rangeFrom(at('2026-11-06T09:00:00Z'), durationOf(60));

    it('detecta sobreposição parcial nos dois sentidos', () => {
      const meio = rangeFrom(at('2026-11-06T09:30:00Z'), durationOf(60));
      expect(overlaps(nove, meio)).toBe(true);
      expect(overlaps(meio, nove)).toBe(true);
    });

    it('detecta contenção total', () => {
      const dentro = rangeFrom(at('2026-11-06T09:15:00Z'), durationOf(15));
      expect(overlaps(nove, dentro)).toBe(true);
      expect(overlaps(dentro, nove)).toBe(true);
    });

    it('NÃO considera conflito quando um termina onde o outro começa', () => {
      // Sem isto, agendar de hora em hora seria impossível. É a mesma semântica
      // `[)` do tstzrange na constraint EXCLUDE do banco.
      const dez = rangeFrom(at('2026-11-06T10:00:00Z'), durationOf(60));
      expect(overlaps(nove, dez)).toBe(false);
      expect(overlaps(dez, nove)).toBe(false);
    });

    it('não considera conflito quando há folga entre os dois', () => {
      const tarde = rangeFrom(at('2026-11-06T16:00:00Z'), durationOf(60));
      expect(overlaps(nove, tarde)).toBe(false);
    });
  });

  it('contains usa o mesmo limite semiaberto', () => {
    const range = rangeFrom(at('2026-11-06T09:00:00Z'), durationOf(60));
    expect(contains(range, at('2026-11-06T09:00:00Z'))).toBe(true);
    expect(contains(range, at('2026-11-06T09:59:59Z'))).toBe(true);
    expect(contains(range, at('2026-11-06T10:00:00Z'))).toBe(false);
  });
});

describe('businessDay — INV-18', () => {
  const SP = 'America/Sao_Paulo';

  it('resolve o dia no fuso da organização, não em UTC', () => {
    // 00:20 UTC de sábado ainda é 21:20 de sexta em São Paulo.
    expect(businessDay(new Date('2026-11-07T00:20:00Z'), SP)).toBe('2026-11-06');
  });

  it('o atendimento que atravessa a meia-noite local cai no dia da finalização', () => {
    // Cenário 5: começa 21h40 de sexta, termina 00h20 de sábado — hora local.
    const inicio = new Date('2026-11-07T00:40:00Z'); // 21:40 de sexta em SP
    const fim = new Date('2026-11-07T03:20:00Z'); // 00:20 de sábado em SP

    expect(businessDay(inicio, SP)).toBe('2026-11-06');
    expect(businessDay(fim, SP)).toBe('2026-11-07');

    // A invariante: vale o instante da FINALIZAÇÃO. Um só campo decide.
    expect(businessDay(fim, SP)).not.toBe(businessDay(inicio, SP));
  });
});

describe('Quantity', () => {
  it('guarda em milésimos para não acumular erro', () => {
    expect(quantityOf(1.5, 'frasco').milli).toBe(1500);
  });

  it('soma e subtrai dentro da mesma unidade', () => {
    const a = quantityOf(2, 'frasco');
    const b = quantityOf(0.5, 'frasco');
    expect(unwrap(addQuantity(a, b)).milli).toBe(2500);
    expect(unwrap(subtractQuantity(a, b)).milli).toBe(1500);
  });

  it('recusa somar unidades diferentes', () => {
    // Converter frasco em ml depende do produto; o kernel não adivinha
    const result = addQuantity(quantityOf(1, 'frasco'), quantityOf(200, 'ml'));
    expect(result).toEqual(err({ kind: 'unidade-diferente', a: 'frasco', b: 'ml' }));
  });

  it('permite estoque negativo — a realidade vence o registro', () => {
    const restante = unwrap(
      subtractQuantity(quantityOf(2, 'frasco'), quantityOf(3, 'frasco')),
    );
    expect(restante.milli).toBe(-1000);
  });

  it('formata na língua dela', () => {
    expect(formatQuantity(quantityOf(1, 'frasco'))).toBe('1 frasco');
    expect(formatQuantity(quantityOf(3, 'frasco'))).toBe('3 frascos');
    expect(formatQuantity(quantityOf(1.5, 'frasco'))).toBe('1,5 frascos');
    expect(formatQuantity(quantityOf(8, 'aplicacao'))).toBe('8 aplicações');
  });
});

describe('PhoneNumber — a segunda chave da fusão de fichas (D-07)', () => {
  it('normaliza formatos diferentes para o mesmo valor', () => {
    // É isto que faz a sugestão de fusão encontrar a duplicata
    const formas = [
      '(11) 98765-4321',
      '11987654321',
      '+55 11 98765-4321',
      '5511987654321',
      '011987654321',
    ];

    const normalizados = formas.map((forma) => unwrap(phoneNumber(forma)));
    expect(new Set(normalizados).size).toBe(1);
    expect(normalizados[0]).toBe('+5511987654321');
  });

  it('aceita fixo de dez dígitos', () => {
    expect(unwrap(phoneNumber('1133334444'))).toBe('+551133334444');
  });

  it('rejeita DDD inexistente', () => {
    expect(phoneNumber('(00) 98765-4321')).toEqual(
      err({ kind: 'ddd-invalido', ddd: '00' }),
    );
  });

  it('rejeita celular de 11 dígitos que não começa com 9', () => {
    expect(isErr(phoneNumber('11887654321'))).toBe(true);
  });

  it('rejeita tamanho impossível', () => {
    expect(isErr(phoneNumber('119876'))).toBe(true);
  });

  it('formata e mascara', () => {
    const celular = unwrap(phoneNumber('11987654321'));
    expect(formatPhone(celular)).toBe('(11) 98765-4321');
    expect(maskPhone(celular)).toBe('(11) 98•••-4321');

    const fixo = unwrap(phoneNumber('1133334444'));
    expect(formatPhone(fixo)).toBe('(11) 3333-4444');
  });
});
