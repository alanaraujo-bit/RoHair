'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Cronômetro do atendimento.
 *
 * Duas coisas o distinguem de um cronômetro comum, e as duas vêm do domínio:
 *
 * 1. **Ele não guarda o tempo.** Recebe `elapsedMs` já calculado a partir dos
 *    intervalos gravados no banco e, quando está correndo, apenas anima a
 *    contagem a partir de `runningSince`. Guardar o tempo em estado de
 *    componente perderia tudo ao fechar o app — e fechar o app no meio do
 *    atendimento é o caso normal, não o excepcional.
 *
 * 2. 🗣️ **Ele sabe do tempo de pausa.** Enquanto o produto age, as mãos dela
 *    estão livres — é a janela real de uso do aplicativo. Mostrar "volta em
 *    14:05" é mais útil do que mostrar quanto falta, porque ela olha o relógio,
 *    não o contador.
 */

export type TimerStatus = 'running' | 'paused' | 'finished';

export function Timer({
  elapsedMs,
  runningSince,
  status,
  resumeAt,
  className,
}: {
  /** Total já acumulado nos intervalos fechados. */
  readonly elapsedMs: number;
  /** Início do intervalo aberto, se houver. Só usado quando `status` é `running`. */
  readonly runningSince?: Date;
  readonly status: TimerStatus;
  /** 🗣️ Quando o produto termina de agir. Mostrado durante a pausa. */
  readonly resumeAt?: Date;
  readonly className?: string;
}) {
  const live = useLiveElapsed(
    elapsedMs,
    status === 'running' ? runningSince : undefined,
  );

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      {/*
        `role="timer"` com `aria-live="off"`: anunciar a cada segundo tornaria o
        leitor de tela inutilizável. Quem precisar do valor consulta o elemento.
      */}
      <p
        role="timer"
        aria-live="off"
        aria-label={`Tempo de atendimento: ${spokenDuration(live)}`}
        className={cn(
          'font-display text-[length:var(--text-3xl)] leading-none font-medium',
          'tracking-[-0.02em] tabular-nums',
          status === 'paused'
            ? 'text-[var(--aurea-ink-muted)]'
            : 'text-[var(--aurea-ink)]',
        )}
      >
        <span aria-hidden="true">{formatClock(live)}</span>
      </p>

      <StatusLine status={status} resumeAt={resumeAt} />
    </div>
  );
}

function StatusLine({
  status,
  resumeAt,
}: {
  readonly status: TimerStatus;
  readonly resumeAt?: Date;
}) {
  if (status === 'finished') {
    return (
      <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-subtle)]">
        concluído
      </p>
    );
  }

  if (status === 'paused') {
    return (
      <p className="text-center text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
        em pausa · produto agindo
        {resumeAt && (
          <>
            <br />
            <span className="font-medium text-[var(--aurea-rose-strong)]">
              volta em {formatTimeOfDay(resumeAt)}
            </span>
          </>
        )}
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[var(--aurea-rose)] motion-safe:animate-pulse"
      />
      em andamento
    </p>
  );
}

/**
 * Recalcula a cada segundo a partir do relógio, nunca somando 1000ms.
 *
 * Acumular incrementos derrapa: o navegador estrangula timers em aba de fundo, e
 * o erro nunca é recuperado. Derivar de `Date.now()` sempre volta certo depois
 * de qualquer suspensão — inclusive a do iPhone bloqueado no bolso.
 */
function useLiveElapsed(baseMs: number, runningSince: Date | undefined): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!runningSince) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [runningSince]);

  if (!runningSince) return baseMs;
  return baseMs + Math.max(0, now - runningSince.getTime());
}

function parts(ms: number): { h: number; m: number; s: number } {
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function formatClock(ms: number): string {
  const { h, m, s } = parts(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Versão falada, para o leitor de tela: "1 hora e 12 minutos". */
function spokenDuration(ms: number): string {
  const { h, m } = parts(ms);
  const hours = h > 0 ? `${h} ${h === 1 ? 'hora' : 'horas'}` : '';
  const minutes = `${m} ${m === 1 ? 'minuto' : 'minutos'}`;
  return hours ? `${hours} e ${minutes}` : minutes;
}

function formatTimeOfDay(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
