'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';

import {
  UNIDADES,
  type ProdutoDoEstoque,
  type ResumoDoMes,
  type Unidade,
} from '@/features/painel/application/painel-queries';
import { IconBottle } from '@/shared/ui/icons/domain-icons';
import { Button } from '@/shared/ui/primitives/button';
import { Field, Input, Select } from '@/shared/ui/primitives/field';
import { Card, EmptyState } from '@/shared/ui/primitives/surface';
import { Sheet } from '@/shared/ui/primitives/sheet';
import { MoneyText } from '@/shared/ui/primitives/money-display';

import {
  comprarProdutoAction,
  criarProdutoAction,
  type AcaoEstoqueState,
} from './actions';

const UNIDADE_ROTULO: Record<Unidade, string> = {
  FRASCO: 'Frasco',
  APLICACAO: 'Aplicação',
  ML: 'ml',
  G: 'g',
  KIT: 'Kit',
  AMPOLA: 'Ampola',
};

const ESTADO_INICIAL: AcaoEstoqueState = { ok: false, erro: null };

/**
 * Estoque — o alerta da tela Hoje finalmente tem para onde levar.
 *
 * 🗣️ O número que importa é o de **atendimentos restantes**, nunca a
 * quantidade: o problema dela não é o número no frasco, é ser surpreendida.
 * \"Acaba em ~10 dias\" permite comprar planejado; \"estoque baixo\" só avisa
 * que já é tarde.
 */
export function EstoqueConteudo({
  produtos,
  resumo,
  categorias,
}: {
  readonly produtos: readonly ProdutoDoEstoque[];
  readonly resumo: ResumoDoMes;
  readonly categorias: readonly string[];
}) {
  const [comprando, setComprando] = useState<ProdutoDoEstoque | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);

  const criticos = produtos.filter((produto) => produto.critico);
  const demais = produtos.filter((produto) => !produto.critico);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
          Produtos
        </h1>
        <Button size="sm" onClick={() => setNovoAberto(true)}>
          + Novo
        </Button>
      </div>

      {produtos.length === 0 ? (
        <Card tone="quiet">
          <EmptyState
            icon={<IconBottle size={38} />}
            title="Nenhum produto ainda"
            description="Cadastre o primeiro para o estoque começar a avisar antes de acabar."
            action={
              <Button size="sm" onClick={() => setNovoAberto(true)}>
                Cadastrar produto
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
              Acabando
            </h2>

            {criticos.length === 0 ? (
              <Card tone="quiet">
                <p className="text-center text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                  Tudo em dia. Nenhum produto perto do fim.
                </p>
              </Card>
            ) : (
              <ul className="flex flex-col gap-2">
                {criticos.map((produto) => (
                  <li key={produto.id}>
                    <Card
                      tone="quiet"
                      className="flex items-center gap-3 border-l-[3px] border-l-[var(--aurea-warning)]"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium text-[var(--aurea-ink)]">
                          {produto.name}
                        </span>
                        <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                          {descreverSaldo(produto)}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setComprando(produto)}
                      >
                        Comprei
                      </Button>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
              Todos
            </h2>
            <ul className="flex flex-col gap-2">
              {demais.map((produto) => (
                <li key={produto.id}>
                  <Card className="flex items-center gap-3">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-[var(--aurea-ink)]">
                          {produto.name}
                        </span>
                        {produto.brand && (
                          <span className="truncate text-[length:var(--text-sm)] text-[var(--aurea-ink-subtle)]">
                            {produto.brand}
                          </span>
                        )}
                      </span>
                      <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                        {descreverSaldo(produto)}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setComprando(produto)}
                    >
                      Comprei
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Card tone="quiet" className="flex flex-col gap-2">
        <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
          No mês
        </h2>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--aurea-ink)]">Gasto em produto</span>
          <MoneyText cents={resumo.produtoCents} muted={resumo.produtoCents === 0} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--aurea-ink)]">Custo por atendimento</span>
          <MoneyText
            cents={resumo.custoPorAtendimentoCents}
            muted={resumo.custoPorAtendimentoCents === 0}
          />
        </div>
        <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
          O custo por atendimento é a média do produto usado nos {resumo.atendimentos}{' '}
          {resumo.atendimentos === 1 ? 'atendimento' : 'atendimentos'} do mês.
        </p>
      </Card>

      {/*
        A chave recria o formulário a cada abertura (e a cada produto): o
        `useActionState` guarda o último estado, e sem recriar o sucesso de uma
        compra fecharia o sheet seguinte no instante em que ele abrisse.
      */}
      <ComprarSheet
        key={comprando?.id ?? 'fechado'}
        produto={comprando}
        onClose={() => setComprando(null)}
      />
      <NovoProdutoSheet
        key={novoAberto ? 'aberto' : 'fechado'}
        aberto={novoAberto}
        onClose={() => setNovoAberto(false)}
        categorias={categorias}
      />
    </div>
  );
}

function descreverSaldo(produto: ProdutoDoEstoque): string {
  if (produto.zerado) return 'acabou';
  const atendimentos =
    produto.aplicacoes === 1 ? '1 atendimento' : `~${produto.aplicacoes} atendimentos`;
  return `${produto.saldo} ${produto.unit} · dá para ${atendimentos}`;
}

/* ------------------------------------------------------------- Comprar */

function ComprarSheet({
  produto,
  onClose,
}: {
  readonly produto: ProdutoDoEstoque | null;
  readonly onClose: () => void;
}) {
  const [estado, formAction, pending] = useActionState(
    comprarProdutoAction,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (estado.ok) onClose();
  }, [estado.ok, onClose]);

  return (
    <Sheet
      open={produto !== null}
      onClose={onClose}
      title={produto ? `Comprei ${produto.name}` : 'Comprei'}
      description="Registra a compra e soma no estoque. O custo passa a valer para os próximos atendimentos."
      footer={
        <Button type="submit" form="form-comprar" block loading={pending}>
          Registrar compra
        </Button>
      }
    >
      <form id="form-comprar" action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="productId" value={produto?.id ?? ''} />

        <Field
          label="Quantidade"
          hint="Em unidades — 1 frasco, 2 frascos…"
          error={estado.erro ?? undefined}
        >
          {(ids) => (
            <Input
              {...ids}
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              name="quantidade"
              defaultValue={1}
              required
            />
          )}
        </Field>

        <Field label="Custo por unidade (R$)">
          {(ids) => (
            <Input
              {...ids}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              name="custoReais"
              defaultValue={((produto?.unitCostCents ?? 0) / 100).toFixed(2)}
              required
            />
          )}
        </Field>
      </form>
    </Sheet>
  );
}

/* -------------------------------------------------------- Novo produto */

function NovoProdutoSheet({
  aberto,
  onClose,
  categorias,
}: {
  readonly aberto: boolean;
  readonly onClose: () => void;
  readonly categorias: readonly string[];
}) {
  const [estado, formAction, pending] = useActionState(
    criarProdutoAction,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (estado.ok) onClose();
  }, [estado.ok, onClose]);

  return (
    <Sheet
      open={aberto}
      onClose={onClose}
      title="Novo produto"
      description="Sugerimos a categoria e a unidade; ela ajusta."
      footer={
        <Button type="submit" form="form-novo-produto" block loading={pending}>
          Salvar produto
        </Button>
      }
    >
      <form id="form-novo-produto" action={formAction} className="flex flex-col gap-4">
        <Field label="Nome" error={estado.erro ?? undefined}>
          {(ids) => (
            <Input
              {...ids}
              name="nome"
              placeholder="Ex.: Máscara de nutrição"
              required
            />
          )}
        </Field>

        <Field label="Marca" optional>
          {(ids) => <Input {...ids} name="marca" placeholder="Ex.: Wella" />}
        </Field>

        <Field label="Categoria">
          {(ids) => (
            <>
              <Input
                {...ids}
                name="categoria"
                list="categorias-produto"
                placeholder="Ex.: Tratamento"
                required
              />
              <datalist id="categorias-produto">
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria} />
                ))}
              </datalist>
            </>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Unidade">
            {(ids) => (
              <Select {...ids} name="unidade" defaultValue="FRASCO">
                {UNIDADES.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {UNIDADE_ROTULO[unidade]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Custo (R$)" optional>
            {(ids) => (
              <Input
                {...ids}
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                name="custoReais"
                defaultValue="0.00"
                required
              />
            )}
          </Field>
        </div>

        <Field
          label="Rendimento"
          optional
          hint="Quantas aplicações saem de uma unidade — ex.: 8. Deixe vazio se não souber."
        >
          {(ids) => (
            <Input
              {...ids}
              type="text"
              inputMode="numeric"
              name="rendimento"
              placeholder="Ex.: 8"
            />
          )}
        </Field>
      </form>
    </Sheet>
  );
}
