/**
 * Catálogo semente — o conhecimento de domínio que o produto traz pronto.
 *
 * É a DEC-013 em forma de dado: o RoHair **chega sabendo o domínio da beleza**,
 * e a profissional marca o que faz em vez de digitar tudo do zero. Nenhuma tela
 * de configuração começa vazia.
 *
 * 🗣️ A ordem não é alfabética de propósito. Progressiva, nutrição, escova e
 * corte de pontas vêm primeiro porque é o que a Rosiele faz — e é uma aposta
 * razoável para autônoma de cabelo em geral. Quatro toques e o catálogo está
 * pronto.
 *
 * Este arquivo é dado, não código: vive fora de `src/` porque alimenta tanto o
 * seed de desenvolvimento quanto o onboarding da Fase 7.
 */

export type SeedService = {
  readonly slug: string;
  readonly name: string;
  readonly group: string;
  /** Exige anamnese e teste de mecha antes de começar (INV-16). */
  readonly isChemical: boolean;
  readonly durationMin: number;
  /** Sugestão inicial em centavos. Ela ajusta; o sistema depois aprende o real. */
  readonly priceCents: number;
  /** Vem marcado no onboarding. */
  readonly suggested: boolean;
};

export const SEED_SERVICES: readonly SeedService[] = [
  // Alisamento
  {
    slug: 'progressiva',
    name: 'Progressiva',
    group: 'Alisamento',
    isChemical: true,
    durationMin: 150,
    priceCents: 20000,
    suggested: true,
  },
  {
    slug: 'retoque-raiz',
    name: 'Retoque de raiz',
    group: 'Alisamento',
    isChemical: true,
    durationMin: 90,
    priceCents: 12000,
    suggested: false,
  },
  {
    slug: 'selagem',
    name: 'Selagem',
    group: 'Alisamento',
    isChemical: true,
    durationMin: 120,
    priceCents: 15000,
    suggested: false,
  },
  {
    slug: 'botox-capilar',
    name: 'Botox capilar',
    group: 'Alisamento',
    isChemical: true,
    durationMin: 90,
    priceCents: 12000,
    suggested: false,
  },
  {
    slug: 'relaxamento',
    name: 'Relaxamento',
    group: 'Alisamento',
    isChemical: true,
    durationMin: 120,
    priceCents: 15000,
    suggested: false,
  },

  // Tratamento — 🗣️ ela diz "nutrição", não "hidratação"
  {
    slug: 'nutricao',
    name: 'Nutrição',
    group: 'Tratamento',
    isChemical: false,
    durationMin: 40,
    priceCents: 5000,
    suggested: true,
  },
  {
    slug: 'hidratacao',
    name: 'Hidratação',
    group: 'Tratamento',
    isChemical: false,
    durationMin: 40,
    priceCents: 5000,
    suggested: false,
  },
  {
    slug: 'reconstrucao',
    name: 'Reconstrução',
    group: 'Tratamento',
    isChemical: false,
    durationMin: 50,
    priceCents: 6000,
    suggested: false,
  },

  // Modelagem
  {
    slug: 'escova',
    name: 'Escova',
    group: 'Modelagem',
    isChemical: false,
    durationMin: 40,
    priceCents: 4000,
    suggested: true,
  },
  {
    slug: 'escova-modelada',
    name: 'Escova modelada',
    group: 'Modelagem',
    isChemical: false,
    durationMin: 50,
    priceCents: 5000,
    suggested: false,
  },
  {
    slug: 'escova-babyliss',
    name: 'Escova com babyliss',
    group: 'Modelagem',
    isChemical: false,
    durationMin: 60,
    priceCents: 6000,
    suggested: false,
  },
  {
    slug: 'penteado',
    name: 'Penteado',
    group: 'Modelagem',
    isChemical: false,
    durationMin: 60,
    priceCents: 8000,
    suggested: false,
  },

  // Corte — 🗣️ "as pontas sempre cortamos na maioria das vezes"
  {
    slug: 'corte-pontas',
    name: 'Corte de pontas',
    group: 'Corte',
    isChemical: false,
    durationMin: 15,
    priceCents: 0,
    suggested: true,
  },
  {
    slug: 'corte',
    name: 'Corte',
    group: 'Corte',
    isChemical: false,
    durationMin: 40,
    priceCents: 5000,
    suggested: false,
  },

  // Cor
  {
    slug: 'coloracao',
    name: 'Coloração',
    group: 'Cor',
    isChemical: true,
    durationMin: 90,
    priceCents: 12000,
    suggested: false,
  },
  {
    slug: 'retoque-cor',
    name: 'Retoque de cor',
    group: 'Cor',
    isChemical: true,
    durationMin: 60,
    priceCents: 8000,
    suggested: false,
  },
  {
    slug: 'mechas',
    name: 'Mechas',
    group: 'Cor',
    isChemical: true,
    durationMin: 180,
    priceCents: 25000,
    suggested: false,
  },
  {
    slug: 'matizacao',
    name: 'Matização',
    group: 'Cor',
    isChemical: true,
    durationMin: 40,
    priceCents: 5000,
    suggested: false,
  },
];

export type SeedProduct = {
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly brand: string | null;
  /** 🗣️ Frasco primeiro: ninguém pensa em mililitro no meio do atendimento. */
  readonly unit: 'FRASCO' | 'APLICACAO' | 'ML' | 'G' | 'KIT' | 'AMPOLA';
  /** Quantas aplicações saem de uma unidade, tipicamente. */
  readonly yieldPerUnit: number | null;
};

export const SEED_PRODUTOS: readonly SeedProduct[] = [
  {
    slug: 'progressiva',
    name: 'Progressiva',
    category: 'Alisamento',
    brand: 'Let Me Be',
    unit: 'FRASCO',
    yieldPerUnit: 8,
  },
  {
    slug: 'nutricao',
    name: 'Máscara de nutrição',
    category: 'Tratamento',
    brand: 'Wella',
    unit: 'FRASCO',
    yieldPerUnit: 12,
  },
  {
    slug: 'shampoo-antirresiduo',
    name: 'Shampoo antirresíduo',
    category: 'Lavagem',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 20,
  },
  {
    slug: 'shampoo',
    name: 'Shampoo',
    category: 'Lavagem',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 25,
  },
  {
    slug: 'condicionador',
    name: 'Condicionador',
    category: 'Lavagem',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 25,
  },
  {
    slug: 'protetor-termico',
    name: 'Protetor térmico',
    category: 'Finalização',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 30,
  },
  {
    slug: 'leave-in',
    name: 'Leave-in',
    category: 'Finalização',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 30,
  },
  {
    slug: 'oxidante',
    name: 'Oxidante',
    category: 'Cor',
    brand: null,
    unit: 'FRASCO',
    yieldPerUnit: 10,
  },
  {
    slug: 'po-descolorante',
    name: 'Pó descolorante',
    category: 'Cor',
    brand: null,
    unit: 'G',
    yieldPerUnit: null,
  },
];

/** Categorias de despesa. Aparecem prontas no financeiro (Fase 10). */
export const SEED_CATEGORIAS_DESPESA: readonly string[] = [
  'Produto',
  'Aluguel',
  'Energia',
  'Transporte',
  'Equipamento',
  'Marketing',
  'Impostos',
];

/**
 * Intervalo de retorno recomendado, em dias, por serviço e curvatura.
 *
 * 🗣️ *"Progressiva damos uma pausa de três meses ou antes dependendo da
 * curvatura pra fazer de novo, e sempre fica nesse loop."*
 *
 * Isso torna o "hora de voltar" uma **regra de negócio**, não uma estimativa
 * estatística — funciona desde a primeira cliente, sem histórico acumulado.
 */
export const SEED_RETORNO_DIAS: Readonly<
  Record<string, Readonly<Record<string, number>>>
> = {
  progressiva: { LISO: 100, ONDULADO: 90, CACHEADO: 75, CRESPO: 60 },
  'retoque-raiz': { LISO: 60, ONDULADO: 55, CACHEADO: 45, CRESPO: 40 },
  nutricao: { LISO: 30, ONDULADO: 30, CACHEADO: 21, CRESPO: 21 },
  escova: { LISO: 10, ONDULADO: 10, CACHEADO: 7, CRESPO: 7 },
  'corte-pontas': { LISO: 90, ONDULADO: 90, CACHEADO: 90, CRESPO: 90 },
};
