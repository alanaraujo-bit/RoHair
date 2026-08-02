'use client';

import { useRef, useTransition } from 'react';
import Link from 'next/link';

import { Button, buttonClasses } from '@/shared/ui/primitives/button';
import { Card } from '@/shared/ui/primitives/surface';
import { Timer } from '@/shared/ui/primitives/timer';
import { formatMoney } from '@/shared/utils/format-money';

/**
 * A tela mais importante do produto — 🗣️ mãos ocupadas, alvos grandes.
 *
 * Três decisões que vêm dos wireframes e do domínio:
 *
 * 1. **O cronômetro não guarda tempo.** Ele recebe o acumulado do banco e anima
 *    a partir do intervalo aberto. Fechar o app aqui não perde um segundo, e
 *    fechar o app aqui é o caso normal.
 * 2. **Produtos chegam pré-marcados** pelo que aquele serviço costuma usar. Ela
 *    desmarca o que não usou — confirmar é mais rápido que escolher, e é o que
 *    dá baixa de estoque correta sem exigir disciplina.
 * 3. **Cada mudança salva sozinha.** Não há botão "salvar": um atendimento
 *    interrompido no meio não pode depender de ela ter lembrado de confirmar.
 */

export type ProdutoDaTela = {
  readonly id: string;
  readonly nome: string;
  readonly detalhe: string;
  readonly marcado: boolean;
};

export type ItemDaTela = {
  readonly id: string;
  readonly nome: string;
  readonly precoCents: number;
};

export function WorkPanel({
  elapsedMs,
  runningSince,
  emPausa,
  produtos,
  itens,
  totalCents,
  alternarPausa,
  salvarProdutos,
  checkoutHref,
}: {
  readonly elapsedMs: number;
  readonly runningSince: string | null;
  readonly emPausa: boolean;
  readonly produtos: readonly ProdutoDaTela[];
  readonly itens: readonly ItemDaTela[];
  readonly totalCents: number;
  readonly alternarPausa: () => Promise<void>;
  readonly salvarProdutos: (formData: FormData) => Promise<void>;
  readonly checkoutHref: string;
}) {
  const [pendente, startTransition] = useTransition();
  const produtosRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <Card tone="raised" className="flex flex-col items-center gap-4 py-6">
        <Timer
          elapsedMs={elapsedMs}
          runningSince={runningSince ? new Date(runningSince) : undefined}
          status={emPausa ? 'paused' : 'running'}
        />

        <Button
          variant="secondary"
          size="lg"
          loading={pendente}
          onClick={() => startTransition(async () => alternarPausa())}
        >
          {emPausa ? 'Retomar' : 'Pausar'}
        </Button>
      </Card>

      <section className="flex flex-col gap-2">
        <Titulo>Produtos</Titulo>

        <form
          ref={produtosRef}
          action={salvarProdutos}
          className="flex flex-col gap-2"
          aria-label="Produtos usados neste atendimento"
        >
          {produtos.map((produto) => (
            <Card key={produto.id} tone="quiet">
              <label className="flex min-h-[var(--size-touch)] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="produto"
                  value={produto.id}
                  defaultChecked={produto.marcado}
                  onChange={() => produtosRef.current?.requestSubmit()}
                  className="h-5 w-5 shrink-0 accent-[var(--aurea-action)]"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium text-[var(--aurea-ink)]">
                    {produto.nome}
                  </span>
                  <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                    {produto.detalhe}
                  </span>
                </span>
              </label>
            </Card>
          ))}
        </form>

        <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
          Marcados pelo que costuma ser usado neste serviço. Desmarque o que não usou —
          é isso que dá a baixa certa no estoque.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <Titulo>Serviços</Titulo>
        <ul className="flex flex-col gap-2">
          {itens.map((item) => (
            <li key={item.id}>
              <Card className="flex items-center justify-between gap-3">
                <span className="font-medium text-[var(--aurea-ink)]">{item.nome}</span>
                <span className="text-[var(--aurea-ink-muted)] tabular-nums">
                  {formatMoney(item.precoCents)}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/*
        Link e não ação de servidor: ir para o checkout não muda nada no banco,
        e uma ida a mais ao servidor aqui seria latência sem contrapartida.
      */}
      <Link href={checkoutHref} className={buttonClasses({ size: 'lg', block: true })}>
        Finalizar · {formatMoney(totalCents)}
      </Link>
    </div>
  );
}

function Titulo({ children }: { readonly children: React.ReactNode }) {
  return (
    <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
      {children}
    </h2>
  );
}
