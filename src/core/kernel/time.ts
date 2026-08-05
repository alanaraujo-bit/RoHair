import { err, ok, type Result } from './result';

/**
 * Tempo: `Duration` e `TimeRange`.
 *
 * Toda data neste sistema é UTC. O fuso vive na organização e só entra na
 * borda, ao exibir — é o que mata a classe de bug "o faturamento do dia mudou
 * depois da meia-noite" (INV-18).
 */

/* -------------------------------------------------------------- Duration */

declare const DURATION: unique symbol;

/** Duração em minutos. Positiva, inteira. */
export type Duration = number & { readonly [DURATION]: 'Duration' };

export type DurationError =
  | { readonly kind: 'nao-inteiro'; readonly value: number }
  | { readonly kind: 'nao-positivo'; readonly value: number }
  | { readonly kind: 'longa-demais'; readonly value: number };

/** Um dia. Nenhum serviço de beleza dura mais que isso; acima é dado corrompido. */
const MAX_MINUTES = 24 * 60;

export function duration(minutes: number): Result<Duration, DurationError> {
  if (!Number.isInteger(minutes)) return err({ kind: 'nao-inteiro', value: minutes });
  if (minutes <= 0) return err({ kind: 'nao-positivo', value: minutes });
  if (minutes > MAX_MINUTES) return err({ kind: 'longa-demais', value: minutes });
  return ok(minutes as Duration);
}

export function durationOf(minutes: number): Duration {
  const result = duration(minutes);
  if (!result.ok) throw new Error(`Duration inválida: ${minutes}`);
  return result.value;
}

/** `155` → `"2h35"`. `40` → `"40min"`. */
export function formatDuration(value: Duration): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/* ------------------------------------------------------------- TimeRange */

export type TimeRange = {
  readonly start: Date;
  readonly end: Date;
};

export type TimeRangeError =
  | { readonly kind: 'data-invalida' }
  | { readonly kind: 'fim-antes-do-inicio'; readonly start: Date; readonly end: Date };

export function timeRange(start: Date, end: Date): Result<TimeRange, TimeRangeError> {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return err({ kind: 'data-invalida' });
  }
  // Fim igual ao início seria um intervalo de duração zero: não é agendamento
  // nem atendimento, é dado sem sentido que quebraria o cálculo de sobreposição.
  if (end.getTime() <= start.getTime()) {
    return err({ kind: 'fim-antes-do-inicio', start, end });
  }
  return ok({ start, end });
}

export function rangeFrom(start: Date, minutes: Duration): TimeRange {
  return { start, end: new Date(start.getTime() + minutes * 60_000) };
}

export function rangeMinutes(range: TimeRange): number {
  return Math.round((range.end.getTime() - range.start.getTime()) / 60_000);
}

/**
 * Dois intervalos se sobrepõem?
 *
 * Semântica **semiaberta** `[início, fim)`: um atendimento que termina às 10:00
 * e outro que começa às 10:00 **não** conflitam. Sem essa escolha, agendar de
 * hora em hora seria impossível.
 *
 * É a mesma semântica do `tstzrange` do Postgres com limites `[)`, que é como a
 * constraint `EXCLUDE USING gist` está declarada — as duas precisam concordar,
 * ou a interface diria uma coisa e o banco outra (INV-01).
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

export function contains(range: TimeRange, instant: Date): boolean {
  return (
    instant.getTime() >= range.start.getTime() &&
    instant.getTime() < range.end.getTime()
  );
}

/**
 * O dia a que um instante pertence, no fuso da organização, em `AAAA-MM-DD`.
 *
 * **INV-18.** Um atendimento que começa 21h40 de sexta e termina 00h20 de
 * sábado pertence ao dia da finalização. Sem uma função única que responda
 * isso, cada consulta escolheria um campo diferente e o relatório do dia mudaria
 * conforme quem pergunta.
 */
export function businessDay(instant: Date, timeZone: string): string {
  // `en-CA` produz exatamente `AAAA-MM-DD`, que ordena como texto e não depende
  // de montar a string à mão a partir das partes.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

/**
 * O fuso padrão de uma organização nova.
 *
 * O modelo guarda `timeZone` na organização; enquanto não existe tela de
 * configuração, é este o valor que toda a borda usa — repositório, páginas e
 * actions. Uma única constante em vez de um literal copiado por arquivo.
 */
export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Os limites de um mês, no formato em que `businessDay` é guardado.
 *
 * O livro-caixa guarda o dia de negócio como a meia-noite UTC da data
 * (`${dia}T00:00:00.000Z`). Por isso o filtro de mês é livre de fuso: basta
 * comparar a data de negócio com a meia-noite UTC do primeiro dia do mês e do
 * mês seguinte. O fuso só entrou na hora de **escolher** o dia (INV-18); na
 * hora de **consultar**, ele não precisa mais.
 */
export function monthBounds(
  year: number,
  month: number,
): {
  readonly start: Date;
  readonly end: Date;
} {
  // `Date.UTC(ano, 12, 1)` já vira janeiro do ano seguinte — o caso de
  // dezembro não precisa de caso especial.
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

/**
 * Converte hora de parede (data + hora no salão) para o instante UTC.
 *
 * O agendamento é guardado com `startsAt`/`endsAt` em UTC, mas quem digita
 * "quinta 14:00" pensa na hora do fuso da organização. O `Intl` sabe o
 * relógio de parede de cada fuso: a diferença entre o instante candidato e o
 * que esse fuso mostra nele é exatamente o deslocamento — incluindo DST, sem
 * tabela de offsets na mão.
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  // Os padrões de fallback existem por causa do `noUncheckedIndexedAccess`;
  // quem chama isto já validou o formato (AAAA-MM-DD e HH:MM).
  const [ano = 0, mes = 0, dia = 0] = date.split('-').map((parte) => Number(parte));
  const [hora = 0, minuto = 0] = time.split(':').map((parte) => Number(parte));

  const candidato = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));

  const formato = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const partes = Object.fromEntries(
    formato.formatToParts(candidato).map((parte) => [parte.type, parte.value]),
  );

  const mostrado = new Date(
    Date.UTC(
      Number(partes.year),
      Number(partes.month) - 1,
      Number(partes.day),
      Number(partes.hour),
      Number(partes.minute),
    ),
  );

  // O que o fuso mostra num instante é o próprio instante deslocado: somar a
  // diferença entre o candidato e o que o fuso mostra nele devolve o instante
  // em que o relógio de parede marca o horário pedido.
  return new Date(candidato.getTime() + (candidato.getTime() - mostrado.getTime()));
}
