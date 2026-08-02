'use client';

import { useActionState } from 'react';

import { Button } from '@/shared/ui/primitives/button';
import { Field, Input } from '@/shared/ui/primitives/field';

/**
 * Formulário de entrada.
 *
 * Componente de cliente pelo mínimo necessário: `useActionState` para mostrar o
 * erro e o estado "entrando" sem recarregar a página. A ação em si é de
 * servidor — nenhuma linha de verificação de senha atravessa a rede.
 *
 * Duas escolhas de acessibilidade que não são óbvias:
 *
 * - O erro é **um só**, acima do botão, e não por campo. Dizer "usuário não
 *   encontrado" seria confirmar quais contas existem; e como a resposta do
 *   servidor é deliberadamente indistinta, mostrá-la por campo seria mentira.
 * - `autoComplete` correto nos dois campos, para o gerenciador de senhas do
 *   iPhone preencher. Sem isso ela digitaria a senha na tela pequena toda vez —
 *   e senha digitada com pressa vira senha curta.
 */

export type LoginState = {
  readonly erro: string | null;
};

export const ESTADO_INICIAL: LoginState = { erro: null };

export type LoginFormProps = {
  readonly action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  readonly destino: string;
};

export function LoginForm({ action, destino }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="destino" value={destino} />

      <Field label="E-mail ou usuário">
        {(ids) => (
          <Input
            {...ids}
            name="identificador"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            enterKeyHint="next"
          />
        )}
      </Field>

      <Field label="Senha">
        {(ids) => (
          <Input
            {...ids}
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            enterKeyHint="go"
          />
        )}
      </Field>

      {state.erro !== null && (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--aurea-danger)] bg-[var(--aurea-surface)] px-3.5 py-3 text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
        >
          {state.erro}
        </p>
      )}

      <Button type="submit" size="lg" block loading={pending}>
        Entrar
      </Button>
    </form>
  );
}
