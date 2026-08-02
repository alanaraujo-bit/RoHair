'use client';

import { useActionState, useRef } from 'react';

import { DecisionGate } from '@/shared/ui/primitives/decision-gate';
import { Field, Input } from '@/shared/ui/primitives/field';
import { Card } from '@/shared/ui/primitives/surface';

/**
 * Anamnese — 🗣️ as cinco perguntas que ela já faz, na ordem dela.
 *
 * **Pré-preenchida pelo histórico.** Para uma cliente conhecida, ela confere em
 * vez de digitar; para uma nova, vem vazia. Cada campo herdado diz de onde veio
 * — "do seu registro de 12 ago" — porque um valor que aparece sozinho, sem
 * origem, é um valor em que ninguém confia.
 *
 * O teste de mecha fecha a tela e é o único jeito de sair dela. Não há botão
 * "pular": em serviço químico, começar sem o teste é o que parte o fio.
 */

export type SugestaoDaAnamnese = {
  readonly hasChemistry: boolean;
  readonly previousProduct: string | null;
  readonly lastStraightenedAt: string | null;
  readonly source: string | null;
};

export function AssessmentForm({
  sugestao,
  atendimentoId,
  action,
}: {
  readonly sugestao: SugestaoDaAnamnese;
  readonly atendimentoId: string;
  readonly action: (state: string | null, formData: FormData) => Promise<string | null>;
}) {
  const [erro, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const testeRef = useRef<HTMLInputElement>(null);

  /**
   * O valor vai direto ao campo escondido, sem passar por estado do React: o
   * envio acontece no mesmo gesto, e esperar um novo render para só então
   * enviar é como o formulário iria com o valor anterior.
   */
  function decidir(resultado: 'PASSED' | 'FAILED') {
    if (testeRef.current) testeRef.current.value = resultado;
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="atendimentoId" value={atendimentoId} />
      <input ref={testeRef} type="hidden" name="teste" defaultValue="" />

      <Card tone="quiet" className="flex flex-col gap-4">
        <SimNao
          nome="quimica"
          pergunta="Já fez alisamento?"
          padrao={sugestao.hasChemistry}
          origem={sugestao.source}
        />

        <Field label="Qual produto?" optional>
          {(ids) => (
            <Input
              {...ids}
              name="produto"
              defaultValue={sugestao.previousProduct ?? ''}
              placeholder="não sei"
              autoCapitalize="words"
            />
          )}
        </Field>

        <Field
          label="Última vez que alisou?"
          optional
          hint={sugestao.source ? `do registro de ${sugestao.source}` : undefined}
        >
          {(ids) => (
            <Input
              {...ids}
              name="ultimoAlisamento"
              type="date"
              defaultValue={sugestao.lastStraightenedAt ?? ''}
            />
          )}
        </Field>

        <SimNao nome="quebrando" pergunta="Está quebrando?" padrao={false} />
        <SimNao nome="caindo" pergunta="Está caindo?" padrao={false} />
      </Card>

      {erro !== null && (
        <p
          role="alert"
          className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-danger)]"
        >
          {erro}
        </p>
      )}

      <DecisionGate
        question="Teste de mecha"
        hint="O cabelo aguentou o produto?"
        approveLabel="Passou"
        rejectLabel="Não passou"
        disabled={pending}
        onApprove={() => decidir('PASSED')}
        onReject={() => decidir('FAILED')}
      />
    </form>
  );
}

/**
 * Sim/Não como par de rádios de verdade.
 *
 * Nada de interruptor: interruptor tem um estado "padrão" implícito, e aqui
 * responder "não" é uma resposta dada, não a ausência de resposta.
 */
function SimNao({
  nome,
  pergunta,
  padrao,
  origem,
}: {
  readonly nome: string;
  readonly pergunta: string;
  readonly padrao: boolean;
  readonly origem?: string | null;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-[length:var(--text-sm)] font-medium text-[var(--aurea-ink)]">
        {pergunta}
      </legend>

      <div className="flex gap-2">
        {[
          { valor: 'sim', rotulo: 'Sim', marcado: padrao },
          { valor: 'nao', rotulo: 'Não', marcado: !padrao },
        ].map((opcao) => (
          <label
            key={opcao.valor}
            className="flex min-h-[var(--size-touch)] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--aurea-border-strong)] bg-[var(--aurea-surface)] px-3 has-[:checked]:border-[var(--aurea-rose)] has-[:checked]:bg-[var(--aurea-rose-soft)] has-[:checked]:font-medium"
          >
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              defaultChecked={opcao.marcado}
              className="h-4 w-4 accent-[var(--aurea-action)]"
            />
            <span className="text-[var(--aurea-ink)]">{opcao.rotulo}</span>
          </label>
        ))}
      </div>

      {origem && (
        <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
          do seu registro de {origem}
        </p>
      )}
    </fieldset>
  );
}
