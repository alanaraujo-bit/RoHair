'use client';

import { useId } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Campo de formulário: rótulo, dica, erro e controle, amarrados.
 *
 * Existe como primitivo próprio porque a ligação entre os quatro é a parte que
 * mais se erra à mão. `Field` gera os ids, aponta `aria-describedby` para a
 * dica **e** para o erro, e marca `aria-invalid` — assim nenhuma tela precisa
 * lembrar de fazer isso, e o leitor de tela nunca fica sem contexto.
 *
 * A dica não some quando aparece o erro: os dois são anunciados juntos. Trocar
 * um pelo outro esconde a instrução justamente de quem acabou de errar.
 */

export type FieldProps = {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  /** Rótulo visível mas escondido do leitor? Não. Isto esconde só o visual. */
  readonly labelHidden?: boolean;
  readonly optional?: boolean;
  readonly className?: string;
  readonly children: (ids: FieldControlProps) => React.ReactNode;
};

/** O que o controle precisa receber para ficar acessível. */
export type FieldControlProps = {
  readonly id: string;
  readonly 'aria-describedby': string | undefined;
  readonly 'aria-invalid': true | undefined;
};

export function Field({
  label,
  hint,
  error,
  labelHidden = false,
  optional = false,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-[length:var(--text-sm)] font-medium text-[var(--aurea-ink)]',
          labelHidden && 'sr-only',
        )}
      >
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-[var(--aurea-ink-subtle)]">
            opcional
          </span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}

      {hint && (
        <p
          id={hintId}
          className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]"
        >
          {hint}
        </p>
      )}

      {/*
        `role="alert"` faz o leitor de tela anunciar assim que o erro aparece,
        sem esperar o próximo foco. É a diferença entre descobrir o erro agora e
        descobrir depois de já ter tentado enviar de novo.
      */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[length:var(--text-xs)] font-medium text-[var(--aurea-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL_BASE = cn(
  'w-full bg-[var(--aurea-surface)] text-[var(--aurea-ink)]',
  'border border-[var(--aurea-border-strong)] rounded-[var(--radius-md)]',
  'px-3.5 py-3 min-h-[var(--size-touch)]',
  'placeholder:text-[var(--aurea-ink-subtle)]',
  'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
  'focus:border-[var(--aurea-rose)] focus:shadow-[0_0_0_3px_var(--aurea-glow)]',
  'aria-[invalid=true]:border-[var(--aurea-danger)]',
  'disabled:opacity-50',
);

export type InputProps = React.ComponentPropsWithoutRef<'input'>;

export function Input({ className, ...rest }: InputProps) {
  return <input className={cn(CONTROL_BASE, className)} {...rest} />;
}

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'>;

export function Textarea({ className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(CONTROL_BASE, 'resize-y', className)}
      {...rest}
    />
  );
}
