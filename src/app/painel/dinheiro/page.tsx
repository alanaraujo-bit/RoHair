import type { Metadata } from 'next';
import Link from 'next/link';

import {
  businessDay,
  DEFAULT_TIME_ZONE as FUSO,
  monthBounds,
} from '@/core/kernel/time';
import type { TransacaoDoMes } from '@/features/painel/application/painel-queries';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import {
  fiadosAbertos,
  resumoDoMes,
  transacoesDoMes,
} from '@/features/painel/infrastructure/painel-repository';
import { Badge, Card } from '@/shared/ui/primitives/surface';
import { MoneyFigure, MoneyText } from '@/shared/ui/primitives/money-display';
import { formatMoney } from '@/shared/utils/format-money';
import { SEED_CATEGORIAS_DESPESA } from '../../../../prisma/seed-catalog';

import { DinheiroForm } from './dinheiro-form';

export const metadata: Metadata = { title: 'Dinheiro · RoHair' };
export const dynamic = 'force-dynamic';

/**
 * Dinheiro — a frase dela no tamanho do mês.
 *
 * Mesma hierarquia da tela Hoje: **sobrou grande, entrou pequeno.** Entrou é o
 * dinheiro recebido (DEC-018), produto é a compra de insumos do mês e despesas
 * são as contas lançadas à mão. O fiado aparece aqui como \"A receber\", porque
 * é este o lugar onde ele entra no caixa.
 */
export default async function DinheiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { organizationId } = await requireStaffSession();

  const hoje = businessDay(new Date(), FUSO);
  const partesHoje = hoje.split('-').map((parte) => Number(parte));
  const anoAtual = partesHoje[0] ?? 0;
  const mesAtual = partesHoje[1] ?? 0;

  const parametro = (await searchParams).mes;
  const valido = parametro !== undefined && /^\d{4}-(0[1-9]|1[0-2])$/.test(parametro);

  let ano = anoAtual;
  let mes = mesAtual;
  if (valido && parametro !== undefined) {
    const partes = parametro.split('-').map((parte) => Number(parte));
    ano = partes[0] ?? anoAtual;
    mes = partes[1] ?? mesAtual;
  }

  const bounds = monthBounds(ano, mes);
  const anterior = mes === 1 ? { ano: ano - 1, mes: 12 } : { ano: ano, mes: mes - 1 };

  const [resumo, resumoAnterior, transacoes, fiados] = await Promise.all([
    resumoDoMes(organizationId, bounds),
    resumoDoMes(organizationId, monthBounds(anterior.ano, anterior.mes)),
    transacoesDoMes(organizationId, bounds),
    fiadosAbertos(organizationId),
  ]);

  const rotuloMes = capitalizar(
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      new Date(Date.UTC(ano, mes - 1, 1)),
    ),
  );
  const rotuloAnterior = capitalizar(
    new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(Date.UTC(anterior.ano, anterior.mes - 1))),
  );

  const mesAnteriorParam = `${anterior.ano}-${String(anterior.mes).padStart(2, '0')}`;
  const proximo = mes === 12 ? { ano: ano + 1, mes: 1 } : { ano: ano, mes: mes + 1 };
  const mesProximoParam = `${proximo.ano}-${String(proximo.mes).padStart(2, '0')}`;

  const diferenca = resumo.sobrouCents - resumoAnterior.sobrouCents;
  const fraseComparacao =
    resumoAnterior.entrouCents === 0 && resumo.entrouCents === 0
      ? 'Este é o primeiro mês com movimento.'
      : `Em ${rotuloAnterior} sobrou ${formatMoney(resumoAnterior.sobrouCents)}. ${
          diferenca >= 0
            ? `Você está ${formatMoney(diferenca)} melhor.`
            : `Você está ${formatMoney(-diferenca)} pior.`
        }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/painel/dinheiro?mes=${mesAnteriorParam}`}
          aria-label="Mês anterior"
          className="flex h-[var(--size-touch)] w-10 items-center justify-center text-[length:var(--text-xl)] text-[var(--aurea-ink-muted)] transition-colors hover:text-[var(--aurea-ink)]"
        >
          ‹
        </Link>
        <h1 className="text-center font-display text-[length:var(--text-xl)] text-[var(--aurea-ink)]">
          {rotuloMes}
        </h1>
        <Link
          href={`/painel/dinheiro?mes=${mesProximoParam}`}
          aria-label="Próximo mês"
          className="flex h-[var(--size-touch)] w-10 items-center justify-center text-[length:var(--text-xl)] text-[var(--aurea-ink-muted)] transition-colors hover:text-[var(--aurea-ink)]"
        >
          ›
        </Link>
      </div>

      <Card tone="raised">
        <MoneyFigure
          label={`Sobrou em ${rotuloMes}`}
          netCents={resumo.sobrouCents}
          grossCents={resumo.entrouCents}
          costCents={resumo.produtoCents}
        />
      </Card>

      <Card tone="quiet" className="flex flex-col gap-2">
        <Linha rotulo="Entrou" cents={resumo.entrouCents} />
        <Linha
          rotulo="Produto"
          cents={-resumo.produtoCents}
          muted={resumo.produtoCents === 0}
        />
        <Linha
          rotulo="Outras despesas"
          cents={-resumo.despesasCents}
          muted={resumo.despesasCents === 0}
        />
        <p className="pt-1 text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
          {resumo.atendimentos}{' '}
          {resumo.atendimentos === 1 ? 'atendimento' : 'atendimentos'} · custo médio de
          produto {formatMoney(resumo.custoPorAtendimentoCents)} por atendimento
        </p>
      </Card>

      <Card tone="quiet">
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink)]">
          {fraseComparacao}
        </p>
      </Card>

      <DinheiroForm fiados={fiados} categoriasDespesa={SEED_CATEGORIAS_DESPESA} />

      <section className="flex flex-col gap-2">
        <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
          Movimentações
        </h2>

        {transacoes.length === 0 ? (
          <Card tone="quiet">
            <p className="text-center text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
              Nenhum movimento neste mês ainda.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {transacoes.map((transacao) => (
              <li key={transacao.id}>
                <Movimentacao transacao={transacao} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Linha({
  rotulo,
  cents,
  muted = false,
}: {
  readonly rotulo: string;
  readonly cents: number;
  readonly muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--aurea-ink)]">{rotulo}</span>
      <MoneyText cents={cents} muted={muted} />
    </div>
  );
}

function Movimentacao({ transacao }: { readonly transacao: TransacaoDoMes }) {
  const corpo = (
    <Card className="flex items-center gap-2">
      <Badge tone={transacao.kind === 'RECEITA' ? 'success' : 'warning'}>
        {transacao.kind === 'RECEITA' ? 'entrada' : 'saída'}
      </Badge>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-[var(--aurea-ink)]">
          {transacao.description ?? transacao.category}
        </span>
        <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          {formatarData(transacao.businessDay)}
          {transacao.origem.type === 'atendimento'
            ? ` · ${transacao.origem.clientName}`
            : ''}
        </span>
      </span>
      <MoneyText
        cents={
          transacao.kind === 'RECEITA' ? transacao.amountCents : -transacao.amountCents
        }
      />
    </Card>
  );

  if (transacao.origem.type === 'atendimento') {
    return (
      <Link
        href={`/painel/clientes/${transacao.origem.clientId}`}
        className="block transition-opacity hover:opacity-80"
      >
        {corpo}
      </Link>
    );
  }

  return corpo;
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(data);
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
