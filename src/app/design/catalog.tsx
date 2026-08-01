'use client';

import { useState, useSyncExternalStore } from 'react';

import * as Icons from '@/shared/ui/icons/domain-icons';
import { Button } from '@/shared/ui/primitives/button';
import { SegmentedControl, Switch } from '@/shared/ui/primitives/controls';
import { DecisionGate } from '@/shared/ui/primitives/decision-gate';
import { Field, Input, Textarea } from '@/shared/ui/primitives/field';
import { MoneyFigure, MoneyText } from '@/shared/ui/primitives/money-display';
import { PhotoCompare } from '@/shared/ui/primitives/photo-compare';
import { SafetyAlert } from '@/shared/ui/primitives/safety-alert';
import { SeedPicker, type SeedGroup } from '@/shared/ui/primitives/seed-picker';
import { Sheet } from '@/shared/ui/primitives/sheet';
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  Skeleton,
} from '@/shared/ui/primitives/surface';
import { Timer } from '@/shared/ui/primitives/timer';

/**
 * Catálogo vivo do Áurea.
 *
 * Cliente por inteiro porque quase todo primitivo tem estado — e o valor deste
 * catálogo está em poder **mexer** neles, não em vê-los parados.
 */

const ICONS = [
  ['Secador', Icons.IconDryer],
  ['Mecha', Icons.IconStrand],
  ['Frasco', Icons.IconBottle],
  ['Tesoura', Icons.IconScissors],
  ['Gota', Icons.IconDrop],
  ['Escova', Icons.IconBrush],
  ['Espelho', Icons.IconMirror],
  ['Ampulheta', Icons.IconHourglass],
  ['Agenda', Icons.IconCalendar],
  ['Dinheiro', Icons.IconMoney],
  ['Seguro', Icons.IconShieldCheck],
  ['Alerta', Icons.IconShieldAlert],
  ['Câmera', Icons.IconCamera],
  ['Retorno', Icons.IconReturn],
] as const;

const SEED_GROUPS: readonly SeedGroup[] = [
  {
    label: 'Alisamento',
    options: [
      { id: 'progressiva', label: 'Progressiva', detail: 'cerca de 2h30' },
      { id: 'retoque', label: 'Retoque de raiz', detail: 'cerca de 1h30' },
      { id: 'selagem', label: 'Selagem' },
    ],
  },
  {
    label: 'Tratamento',
    options: [
      { id: 'nutricao', label: 'Nutrição', detail: 'cerca de 40min' },
      { id: 'hidratacao', label: 'Hidratação' },
      { id: 'reconstrucao', label: 'Reconstrução' },
    ],
  },
  {
    label: 'Corte',
    options: [
      { id: 'pontas', label: 'Corte de pontas', detail: 'cerca de 15min' },
      { id: 'corte', label: 'Corte' },
    ],
  },
];

/** Imagens de exemplo em SVG embutido: o catálogo não depende de rede. */
const BEFORE = swatch('#8c7a6b', 'antes');
const AFTER = swatch('#c98f9c', 'depois');

function swatch(color: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="${color}"/><text x="200" y="260" font-family="serif" font-size="34" fill="rgba(255,255,255,.85)" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * O instante em que a página montou no navegador — `null` no servidor.
 *
 * Os cronômetros do catálogo precisam de um ponto de partida real, e ler o
 * relógio durante a renderização quebraria duas coisas: a pureza que o lint do
 * React cobra, e a hidratação, porque servidor e navegador leriam instantes
 * diferentes.
 *
 * `useSyncExternalStore` com `getServerSnapshot` devolvendo `null` é a
 * ferramenta certa — a mesma escolha, pelo mesmo motivo, que a store de tema
 * fez em `shared/ui/theme/theme-store.ts`. A assinatura vazia é intencional:
 * este valor nunca muda depois de definido.
 */
let clientMountedAt: Date | null = null;
const NEVER_CHANGES = () => () => {};

function useClientNow(): Date | null {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => (clientMountedAt ??= new Date()),
    () => null,
  );
}

export function Catalog() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(['progressiva', 'nutricao', 'pontas']),
  );
  const [view, setView] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [request, setRequest] = useState(true);
  const [direct, setDirect] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gate, setGate] = useState<'idle' | 'passed' | 'failed'>('idle');

  const mountedAt = useClientNow();

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="Dinheiro"
        note="O número grande é sempre o que sobrou. O que entrou aparece pequeno — esconder seria desonesto, mas ele não é a manchete."
      >
        <Card tone="raised">
          <MoneyFigure
            label="Sobrou hoje"
            netCents={18640}
            grossCents={26000}
            costCents={7360}
          />
        </Card>
        <div className="flex items-center gap-4">
          <MoneyText cents={22000} />
          <MoneyText cents={0} muted />
          <MoneyText cents={-4150} />
        </div>
      </Section>

      <Section
        title="Segurança"
        note="O alerta de química fica no topo da ficha, acima de qualquer métrica. É dado de segurança, não histórico."
      >
        <SafetyAlert
          level="chemistry"
          title="Progressiva Let Me Be"
          detail="12 de agosto · há 3 meses"
        />
        <SafetyAlert level="clear" title="Nenhuma química registrada" />
      </Section>

      <Section
        title="Portão de decisão"
        note="As duas saídas têm o mesmo peso. Reprovar no teste de mecha é o desfecho seguro — pintá-lo de vermelho ensinaria a evitar o caminho certo."
      >
        <DecisionGate
          question="O cabelo aguentou o teste de mecha?"
          hint="Se não aguentou, o atendimento encerra sem o serviço."
          approveLabel="Passou"
          rejectLabel="Não passou"
          onApprove={() => setGate('passed')}
          onReject={() => setGate('failed')}
        />
        {gate !== 'idle' && (
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            {gate === 'passed'
              ? 'Segue para o atendimento.'
              : 'Encerrado sem serviço — o produto do teste vira gasto.'}
          </p>
        )}
      </Section>

      <Section
        title="Cronômetro"
        note="Sobrevive a fechar o app: o tempo vem do banco, não do componente."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <Timer
              elapsedMs={4360000}
              runningSince={mountedAt ?? undefined}
              status="running"
            />
          </Card>
          <Card>
            <Timer
              elapsedMs={4360000}
              status="paused"
              resumeAt={
                mountedAt ? new Date(mountedAt.getTime() + 1000 * 60 * 18) : undefined
              }
            />
          </Card>
          <Card>
            <Timer elapsedMs={11100000} status="finished" />
          </Card>
        </div>
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Agendar</Button>
          <Button variant="secondary">Depois</Button>
          <Button variant="quiet">Não passou</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Revogar acesso</Button>
          <Button disabled>Indisponível</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1600);
            }}
          >
            Finalizar
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">Grande</Button>
        </div>
      </Section>

      <Section title="Campos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da cliente">
            {(ids) => <Input placeholder="Como ela se chama" {...ids} />}
          </Field>
          <Field
            label="CPF"
            optional
            hint="Ajuda a encontrar a ficha se ela usar o app"
          >
            {(ids) => (
              <Input inputMode="numeric" placeholder="000.000.000-00" {...ids} />
            )}
          </Field>
          <Field label="Data de nascimento" error="Data inválida">
            {(ids) => <Input placeholder="dd/mm/aaaa" {...ids} />}
          </Field>
          <Field label="Observação">
            {(ids) => <Textarea placeholder="Não gosta de cheiro forte" {...ids} />}
          </Field>
        </div>
      </Section>

      <Section title="Superfícies e sinais">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutro</Badge>
          <Badge tone="rose">Nova</Badge>
          <Badge tone="gold">VIP</Badge>
          <Badge tone="success">Confirmado</Badge>
          <Badge tone="warning">Química</Badge>
          <Badge tone="danger">Faltou</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip selected>Progressiva</Chip>
          <Chip>Nutrição</Chip>
          <Chip>Escova</Chip>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>Cartão simples</Card>
          <Card tone="raised">Cartão elevado</Card>
          <Card tone="quiet">Cartão discreto</Card>
        </div>
        <Card>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
        <Card tone="quiet">
          <EmptyState
            icon={<Icons.IconCalendar size={40} />}
            title="Nenhum horário hoje"
            description="Aproveite para conferir quem está para voltar."
            action={<Button size="sm">Ver clientes</Button>}
          />
        </Card>
      </Section>

      <Section title="Controles">
        <SegmentedControl
          label="Visão da agenda"
          value={view}
          onChange={setView}
          segments={[
            { value: 'dia', label: 'Dia' },
            { value: 'semana', label: 'Semana' },
            { value: 'mes', label: 'Mês' },
          ]}
        />
        <Card>
          <div className="flex flex-col divide-y divide-[var(--aurea-border)]">
            <Switch
              checked={request}
              onChange={setRequest}
              label="Cliente pode solicitar horário"
              description="Você aprova antes de entrar na agenda"
            />
            <Switch
              checked={direct}
              onChange={setDirect}
              label="Cliente pode agendar direto"
              description="Entra na agenda sem passar por você"
            />
          </div>
        </Card>
      </Section>

      <Section
        title="Catálogo semente"
        note="Nenhuma tela de configuração começa vazia. Ela marca o que faz em vez de digitar do zero."
      >
        <Card>
          <SeedPicker
            groups={SEED_GROUPS}
            selected={selected}
            onToggle={toggle}
            footer={
              <Button variant="ghost" size="sm">
                + Não achei o que eu faço
              </Button>
            }
          />
        </Card>
      </Section>

      <Section
        title="Sobreposição"
        note="Sobre o <dialog> nativo: foco preso, Esc e fundo inerte sem dependência."
      >
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Abrir painel
        </Button>
        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Mesma pessoa?"
          description="Vieram duas fichas com o mesmo telefone."
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setSheetOpen(false)}>É a mesma</Button>
              <Button variant="secondary" onClick={() => setSheetOpen(false)}>
                São duas
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <Card tone="quiet">
              <p className="font-medium">Juliana Alves</p>
              <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                12 visitas desde 2024 · sem CPF
              </p>
            </Card>
            <Card tone="quiet">
              <p className="font-medium">Juliana Alves</p>
              <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                1 visita · veio do app · CPF 123.•••.•••-01
              </p>
            </Card>
          </div>
        </Sheet>
      </Section>

      <Section
        title="Antes e depois"
        note="O coração emocional do portal. Arraste, ou use as setas do teclado."
      >
        <div className="max-w-xs">
          <PhotoCompare
            beforeSrc={BEFORE}
            afterSrc={AFTER}
            beforeAlt="Cabelo antes do atendimento"
            afterAlt="Cabelo depois do atendimento"
          />
        </div>
      </Section>

      <Section
        title="Ícones"
        note="Desenhados para este domínio. Grade de 24, traço 1.5, só contorno."
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          {ICONS.map(([name, Icon]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] bg-[var(--aurea-canvas-subtle)] py-4 text-[var(--aurea-ink)]"
            >
              <Icon size={26} />
              <span className="text-[length:var(--text-2xs)] text-[var(--aurea-ink-subtle)]">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="flex flex-col gap-2">
          <p className="font-display text-[length:var(--text-3xl)] leading-tight">
            Display · Fraunces
          </p>
          <p className="text-[length:var(--text-xl)]">Título de seção</p>
          <p className="text-[length:var(--text-base)]">
            Corpo de texto em Inter, no tamanho em que a interface fala.
          </p>
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            Texto secundário
          </p>
          <p className="text-[length:var(--text-xs)] text-[var(--aurea-ink-subtle)]">
            Dica de campo e legenda
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  readonly title: string;
  readonly note?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b border-[var(--aurea-border)] pb-2">
        <h2 className="font-display text-[length:var(--text-xl)] text-[var(--aurea-ink)]">
          {title}
        </h2>
        {note && (
          <p className="max-w-prose text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            {note}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
