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
