import {
  elapsedMs,
  openEntries,
  totalCost,
  totalPrice,
  type AttendanceStatus,
} from '../domain/attendance';
import type { AttendanceScreen } from './attendance-repository';

/**
 * O atendimento já mastigado para a tela.
 *
 * Existe porque a regra de camadas — imposta pelo lint, não pela boa vontade —
 * proíbe `app` de importar `domain`. A proibição parece burocrática até se
 * lembrar do que ela evita: a página calculando `preço − custo` por conta
 * própria e chegando a um número diferente do que o painel mostra.
 *
 * **Nenhum número é calculado na tela.** O que ela recebe já vem resolvido, e
 * vem de uma função só — a mesma para o checkout, para o resumo e para o que
 * vier depois.
 */

export type ItemView = {
  readonly id: string;
  readonly nome: string;
  readonly precoCents: number;
};

export type ProdutoView = {
  readonly id: string;
  readonly nome: string;
  readonly detalhe: string;
  readonly marcado: boolean;
};

export type ServicoView = {
  readonly id: string;
  readonly nome: string;
  readonly precoCents: number;
  readonly duracaoMin: number;
  readonly quimico: boolean;
};

export type AtendimentoView = {
  readonly id: string;
  readonly status: AttendanceStatus;
  readonly clienteId: string;
  readonly clienteNome: string;
  readonly titulo: string;
  readonly encerrado: boolean;
  readonly cortesia: boolean;
  readonly reprovadoNoTeste: boolean;
  readonly temAnamnese: boolean;

  readonly catalogo: readonly ServicoView[];
  readonly produtos: readonly ProdutoView[];
  readonly itens: readonly ItemView[];

  readonly totalCents: number;
  readonly custoCents: number;
  readonly sobrouCents: number;

  readonly decorridoMs: number;
  readonly minutos: number;
  /** ISO do intervalo aberto; `null` quando está pausado. */
  readonly correndoDesde: string | null;
  readonly emPausa: boolean;

  readonly sugestao: {
    readonly hasChemistry: boolean;
    readonly previousProduct: string | null;
    /** Já no formato `yyyy-mm-dd` que o campo de data espera. */
    readonly lastStraightenedAt: string | null;
    readonly source: string | null;
  };
};

export function montarView(screen: AttendanceScreen, agora: Date): AtendimentoView {
  const { attendance } = screen;

  const marcados = new Set(attendance.productUsages.map((uso) => uso.productId));
  const itensDeTopo = attendance.items.filter((item) => item.parentId === null);

  const receita = attendance.courtesy ? 0 : totalPrice(attendance.items);
  const custo = totalCost(attendance.productUsages);
  const decorrido = elapsedMs(attendance.timeEntries, agora);
  const abertos = openEntries(attendance.timeEntries);

  return {
    id: attendance.id,
    status: attendance.status,
    clienteId: screen.clientId,
    clienteNome: screen.clientName,
    titulo: itensDeTopo.map((item) => item.name).join(' + ') || 'Atendimento',
    encerrado:
      attendance.status === 'FINALIZADO' ||
      attendance.status === 'ENCERRADO_SEM_SERVICO',
    cortesia: attendance.courtesy,
    reprovadoNoTeste: attendance.assessment?.strandTestResult === 'FAILED',
    temAnamnese: attendance.assessment !== null,

    catalogo: screen.catalog.map((servico) => ({
      id: servico.id,
      nome: servico.name,
      precoCents: servico.priceCents,
      duracaoMin: servico.durationMin,
      quimico: servico.isChemical,
    })),

    produtos: screen.products.map((produto) => ({
      id: produto.id,
      nome: produto.name,
      detalhe: produto.brand ?? produto.unit.toLowerCase(),
      marcado: marcados.has(produto.id),
    })),

    itens: itensDeTopo.map((item) => ({
      id: item.id,
      nome: item.name,
      precoCents: item.unitPriceCents,
    })),

    totalCents: receita,
    custoCents: custo,
    sobrouCents: receita - custo,

    decorridoMs: decorrido,
    minutos: Math.round(decorrido / 60_000),
    correndoDesde: abertos[0]?.startedAt.toISOString() ?? null,
    emPausa: abertos.length === 0,

    sugestao: {
      hasChemistry: screen.suggestion.hasChemistry,
      previousProduct: screen.suggestion.previousProduct,
      lastStraightenedAt:
        screen.suggestion.lastStraightenedAt?.toISOString().slice(0, 10) ?? null,
      source: screen.suggestion.source,
    },
  };
}

/** `185` → `"3h05"` · `40` → `"40min"`. */
export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas === 0 ? `${resto}min` : `${horas}h${String(resto).padStart(2, '0')}`;
}
