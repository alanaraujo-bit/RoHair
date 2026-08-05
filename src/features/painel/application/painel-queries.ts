/**
 * Formas de leitura do painel.
 *
 * Tipos que a tela consome. A implementação Prisma vive em `infrastructure/`;
 * aqui só existe o formato do que a tela precisa, já resolvido — a tela não
 * calcula lucro nem decide o que mostrar.
 */

export type ResumoDoDia = {
  readonly sobrouCents: number;
  readonly entrouCents: number;
  readonly custoCents: number;
};

export type ItemDaAgenda = {
  readonly id: string;
  readonly hora: string;
  readonly clienteId: string;
  readonly clienteNome: string;
  readonly servico: string;
  readonly duracaoMin: number;
  readonly nova: boolean;
  readonly confirmado: boolean;
};

export type AlertaDoDia = {
  readonly id: string;
  readonly tipo: 'estoque' | 'retorno';
  readonly titulo: string;
  readonly detalhe: string;
  readonly href: string;
};

export type ClienteDaLista = {
  readonly id: string;
  readonly nome: string;
  readonly ultimoServico: string | null;
  readonly ultimaVisitaDias: number | null;
  readonly retornoVencido: boolean;
  readonly temConta: boolean;
  readonly nova: boolean;
};

export type VisitaDaFicha = {
  readonly id: string;
  readonly data: Date;
  readonly servicos: string;
  readonly duracaoMin: number | null;
  readonly valorCents: number;
};

export type FichaDaCliente = {
  readonly id: string;
  readonly nome: string;
  readonly telefone: string | null;
  readonly curvatura: string | null;
  readonly temConta: boolean;
  readonly quimica: {
    readonly produto: string | null;
    readonly quando: Date | null;
  } | null;
  readonly totalVisitas: number;
  readonly totalGastoCents: number;
  readonly duracaoMediaMin: number | null;
  readonly visitas: readonly VisitaDaFicha[];
};

/* ------------------------------------------------------------- Estoque */

export type ProdutoDoEstoque = {
  readonly id: string;
  readonly name: string;
  readonly brand: string | null;
  readonly unit: string;
  readonly unitCostCents: number;
  readonly saldo: string;
  readonly aplicacoes: number;
  readonly critico: boolean;
  readonly zerado: boolean;
};

/* ----------------------------------------------------------- Financeiro */

/**
 * O mês inteiro, já resolvido para a tela — nunca a tela subtrai.
 *
 * `produto` são as compras do mês (movimentos PURCHASE), separado de
 * `despesas` porque a Roziele compra produto e paga conta, e as duas coisas
 * saem de bolsos diferentes na cabeça dela — e do DEC-018.
 */
export type ResumoDoMes = {
  readonly sobrouCents: number;
  readonly entrouCents: number;
  readonly produtoCents: number;
  readonly despesasCents: number;
  readonly atendimentos: number;
  readonly custoPorAtendimentoCents: number;
};

export type TransacaoDoMes = {
  readonly id: string;
  readonly kind: 'RECEITA' | 'DESPESA';
  readonly category: string;
  readonly amountCents: number;
  readonly description: string | null;
  readonly businessDay: Date;
  readonly origem:
    | {
        readonly type: 'atendimento';
        readonly clientId: string;
        readonly clientName: string;
      }
    | { readonly type: 'manual' };
};

export type FiadoAberto = {
  readonly paymentId: string;
  readonly attendanceId: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly amountCents: number;
  readonly data: Date;
  readonly servico: string;
};

/* ----------------------------------------------------------- Agendamento */

export type OpcoesParaAgendar = {
  readonly clients: readonly { readonly id: string; readonly name: string }[];
  readonly services: readonly {
    readonly id: string;
    readonly name: string;
    readonly durationMin: number;
    readonly priceCents: number;
  }[];
};

/* ----------------------------------------------------------- Resultado */

/** Forma comum das escritas do painel: erro em português ou sucesso. */
export type EscritaResultado =
  | { readonly ok: true; readonly id?: string }
  | { readonly ok: false; readonly erro: string };

/** Unidades de produto, espelho do enum do banco para a borda validar. */
export const UNIDADES = ['FRASCO', 'APLICACAO', 'ML', 'G', 'KIT', 'AMPOLA'] as const;
export type Unidade = (typeof UNIDADES)[number];

/** Curvatura, espelho do enum do banco para a borda validar. */
export const CURVATURAS = ['LISO', 'ONDULADO', 'CACHEADO', 'CRESPO'] as const;
export type Curvatura = (typeof CURVATURAS)[number];
