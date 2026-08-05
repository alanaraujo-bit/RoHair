'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';

import type { FiadoAberto } from '@/features/painel/application/painel-queries';
import { Button } from '@/shared/ui/primitives/button';
import { Field, Input, Select } from '@/shared/ui/primitives/field';
import { Card } from '@/shared/ui/primitives/surface';
import { MoneyText } from '@/shared/ui/primitives/money-display';
import { Sheet } from '@/shared/ui/primitives/sheet';

import {
  lancarDespesaAction,
  receberFiadoAction,
  type AcaoDinheiroState,
} from './actions';

const ESTADO_INICIAL: AcaoDinheiroState = { ok: false, erro: null };

/**
 * As duas ações do Financeiro que não podem esperar o fim do mês:
 *
 * - **Receber fiado** — o dinheiro que ela já tinha anotado no checkout como
 *   \"Depois\" (DEC-018) entra no caixa no dia em que chega na mão dela. É o
 *   único caminho para o \"sobrou\" não mentir.
 * - **Lançar despesa** — a conta de energia não espera o mês fechar; esquecer
 *   de lançar é como voltar a ser surpreendida no fim do mês.
 */
export function DinheiroForm({
  fiados,
  categoriasDespesa,
}: {
  readonly fiados: readonly FiadoAberto[];
  readonly categoriasDespesa: readonly string[];
}) {
  const [despesaAberta, setDespesaAberta] = useState(false);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
          A receber
        </h2>

        {fiados.length === 0 ? (
          <Card tone="quiet">
            <p className="text-center text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              Nenhum fiado em aberto.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {fiados.map((fiado) => (
              <li key={fiado.paymentId}>
                <Card className="flex items-center gap-3">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium text-[var(--aurea-ink)]">
                      {fiado.clientName}
                    </span>
                    <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                      {fiado.servico} · {formatarData(fiado.data)}
                    </span>
                  </span>
                  <MoneyText cents={fiado.amountCents} />
                  <ReceberFiadoBotao fiado={fiado} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button
        variant="secondary"
        size="md"
        block
        onClick={() => setDespesaAberta(true)}
      >
        Lançar despesa
      </Button>

      {/* A chave recria o formulário a cada abertura: o `useActionState` guarda
          o último estado, e sem recriar o sucesso de uma despesa fecharia o
          sheet seguinte no instante em que ele abrisse. */}
      <DespesaSheet
        key={despesaAberta ? 'aberto' : 'fechado'}
        aberto={despesaAberta}
        onClose={() => setDespesaAberta(false)}
        categoriasDespesa={categoriasDespesa}
      />
    </>
  );
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(data);
}

/* ------------------------------------------------------- Receber fiado */

function ReceberFiadoBotao({ fiado }: { readonly fiado: FiadoAberto }) {
  const [estado, formAction, pending] = useActionState(
    receberFiadoAction,
    ESTADO_INICIAL,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="paymentId" value={fiado.paymentId} />
      {estado.erro !== null && (
        <p className="text-[length:var(--text-xs)] text-[var(--aurea-danger)]">
          {estado.erro}
        </p>
      )}
      <Button type="submit" size="sm" variant="quiet" loading={pending}>
        Receber
      </Button>
    </form>
  );
}

/* ----------------------------------------------------- Lançar despesa */

function DespesaSheet({
  aberto,
  onClose,
  categoriasDespesa,
}: {
  readonly aberto: boolean;
  readonly onClose: () => void;
  readonly categoriasDespesa: readonly string[];
}) {
  const [estado, formAction, pending] = useActionState(
    lancarDespesaAction,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (estado.ok) onClose();
  }, [estado.ok, onClose]);

  return (
    <Sheet
      open={aberto}
      onClose={onClose}
      title="Lançar despesa"
      description="Sai do caixa hoje e entra no livro do mês."
      footer={
        <Button type="submit" form="form-despesa" block loading={pending}>
          Lançar
        </Button>
      }
    >
      <form id="form-despesa" action={formAction} className="flex flex-col gap-4">
        <Field label="Categoria">
          {(ids) => (
            <Select
              {...ids}
              name="categoria"
              defaultValue={categoriasDespesa[0]}
              required
            >
              {categoriasDespesa.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Valor (R$)" error={estado.erro ?? undefined}>
          {(ids) => (
            <Input
              {...ids}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              name="valorReais"
              placeholder="0,00"
              required
            />
          )}
        </Field>

        <Field label="Descrição" optional>
          {(ids) => (
            <Input {...ids} name="descricao" placeholder="Ex.: energia do salão" />
          )}
        </Field>

        {estado.erro !== null && (
          <p className="text-[length:var(--text-xs)] text-[var(--aurea-danger)]">
            {estado.erro}
          </p>
        )}
      </form>
    </Sheet>
  );
}
