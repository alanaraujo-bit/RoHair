import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  formatarDuracao,
  montarView,
  type AtendimentoView,
} from '@/features/attendance/application/attendance-view';
import { attendanceRepository } from '@/features/attendance/infrastructure/prisma-attendance-repository';
import { ActionForm } from '@/features/attendance/presentation/action-form';
import { AssessmentForm } from '@/features/attendance/presentation/assessment-form';
import { ServicePicker } from '@/features/attendance/presentation/service-picker';
import { WorkPanel } from '@/features/attendance/presentation/work-panel';
import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { buttonClasses } from '@/shared/ui/primitives/button';
import { SafetyAlert } from '@/shared/ui/primitives/safety-alert';
import { Badge, Card } from '@/shared/ui/primitives/surface';
import { formatMoney } from '@/shared/utils/format-money';

import {
  alternarPausaAction,
  comecarAction,
  encerrarSemServicoAction,
  escolherServicosAction,
  registrarAnamneseAction,
  salvarProdutosAction,
} from './actions';

export const metadata: Metadata = { title: 'Atendimento · RoHair' };
export const dynamic = 'force-dynamic';

/**
 * O atendimento — uma rota só, quatro momentos.
 *
 * Poderiam ser quatro telas com quatro endereços. Não são, porque a pergunta
 * que ela faz ao abrir o celular é sempre a mesma — "onde eu estou nesta
 * cliente?" — e a resposta é o estado do atendimento. Um endereço por momento
 * exigiria que ela soubesse em qual estava para digitar o certo; assim, o mesmo
 * link sempre leva ao lugar certo, inclusive depois de fechar o app no meio.
 */
export default async function AtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireStaffSession();

  const tela = await attendanceRepository.load(organizationId, id);
  if (tela === null) notFound();

  const view = montarView(tela, new Date());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Link
          href={`/painel/clientes/${view.clienteId}`}
          className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]"
        >
          ‹ {view.clienteNome}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
            {view.titulo}
          </h1>
          {view.encerrado && <Badge tone="neutral">encerrado</Badge>}
        </div>
      </div>

      <Corpo view={view} />
    </div>
  );
}

function Corpo({ view }: { readonly view: AtendimentoView }) {
  switch (view.status) {
    case 'ABERTO':
      return view.itens.length === 0 ? (
        <EscolhaDeServico view={view} />
      ) : (
        <Anamnese view={view} />
      );

    case 'AVALIACAO':
      return view.reprovadoNoTeste ? (
        <TesteReprovado view={view} />
      ) : (
        <RetomarInicio view={view} />
      );

    case 'EM_ANDAMENTO':
      return <EmAndamento view={view} />;

    case 'FINALIZADO':
    case 'ENCERRADO_SEM_SERVICO':
      return <Resumo view={view} />;
  }
}

function EscolhaDeServico({ view }: { readonly view: AtendimentoView }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
        O que vamos fazer hoje?
      </p>

      <ServicePicker
        servicos={view.catalogo}
        atendimentoId={view.id}
        action={escolherServicosAction}
      />
    </div>
  );
}

function Anamnese({ view }: { readonly view: AtendimentoView }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[length:var(--text-lg)] text-[var(--aurea-ink)]">
          Antes de começar
        </h2>
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          Confira o que mudou.
        </p>
      </div>

      <AssessmentForm
        atendimentoId={view.id}
        sugestao={view.sugestao}
        action={registrarAnamneseAction}
      />
    </div>
  );
}

/**
 * 🗣️ "O cabelo não aguentou."
 *
 * Tratada como **trabalho bem feito, não como falha**. Sem vermelho de erro,
 * sem "cancelar": o que se oferece é o desfecho seguro. E a tela é honesta
 * sobre o produto gasto no teste, que vira custo real sem virar cobrança.
 */
function TesteReprovado({ view }: { readonly view: AtendimentoView }) {
  return (
    <div className="flex flex-col gap-4">
      <SafetyAlert
        level="chemistry"
        title="O cabelo não aguentou"
        detail="Fazer química agora pode partir o fio. Encerrar aqui é o certo."
      />

      <Card tone="quiet">
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          O produto do teste entra como gasto ({formatMoney(view.custoCents)}). Nada
          será cobrado de {view.clienteNome}.
        </p>
      </Card>

      <ActionForm
        atendimentoId={view.id}
        rotulo="Encerrar sem o serviço"
        action={encerrarSemServicoAction}
      />
    </div>
  );
}

function RetomarInicio({ view }: { readonly view: AtendimentoView }) {
  return (
    <div className="flex flex-col gap-4">
      <Card tone="quiet">
        <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
          {view.temAnamnese
            ? 'A anamnese está registrada e o teste passou. Falta só começar.'
            : 'Falta só começar.'}
        </p>
      </Card>

      <ActionForm atendimentoId={view.id} rotulo="Começar" action={comecarAction} />
    </div>
  );
}

function EmAndamento({ view }: { readonly view: AtendimentoView }) {
  return (
    <WorkPanel
      elapsedMs={view.decorridoMs}
      runningSince={view.correndoDesde}
      emPausa={view.emPausa}
      produtos={view.produtos}
      itens={view.itens}
      totalCents={view.totalCents}
      alternarPausa={alternarPausaAction.bind(null, view.id, view.emPausa)}
      salvarProdutos={salvarProdutosAction.bind(null, view.id)}
      checkoutHref={`/painel/atendimento/${view.id}/checkout`}
    />
  );
}

function Resumo({ view }: { readonly view: AtendimentoView }) {
  return (
    <div className="flex flex-col gap-4">
      {view.status === 'ENCERRADO_SEM_SERVICO' ? (
        <SafetyAlert
          level="chemistry"
          title="Encerrado sem o serviço"
          detail="O teste de mecha reprovou. Foi a decisão certa."
        />
      ) : (
        <Card tone="raised" className="flex flex-col gap-1">
          <p className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
            {view.cortesia ? 'Cortesia' : 'Sobrou'}
          </p>
          <p className="font-display text-[length:var(--text-xl)] text-[var(--aurea-ink)] tabular-nums">
            {formatMoney(view.sobrouCents)}
          </p>
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            de {formatMoney(view.totalCents)} · produto {formatMoney(view.custoCents)} ·{' '}
            {formatarDuracao(view.minutos)}
          </p>
        </Card>
      )}

      <Link
        href="/painel"
        className={buttonClasses({ variant: 'secondary', size: 'lg', block: true })}
      >
        Voltar para hoje
      </Link>
    </div>
  );
}
