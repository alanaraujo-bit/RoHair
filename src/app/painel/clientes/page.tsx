import type { Metadata } from 'next';
import Link from 'next/link';

import { requireStaffSession } from '@/features/auth/infrastructure/session-context';
import { listaDeClientes } from '@/features/painel/infrastructure/painel-repository';
import { Badge, Card } from '@/shared/ui/primitives/surface';

export const metadata: Metadata = { title: 'Clientes · RoHair' };
export const dynamic = 'force-dynamic';

/**
 * Lista de clientes.
 *
 * Ordenada por **quem precisa de ação**, nunca alfabética: lista alfabética é
 * banco de dados, esta é lista de trabalho. Quem passou do retorno vem primeiro,
 * sob um cabeçalho próprio.
 */
export default async function ClientesPage() {
  const { organizationId } = await requireStaffSession();

  const clientes = await listaDeClientes(organizationId);
  const precisamVoltar = clientes.filter((c) => c.retornoVencido);
  const demais = clientes.filter((c) => !c.retornoVencido);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[length:var(--text-2xl)] text-[var(--aurea-ink)]">
        Clientes
      </h1>

      {precisamVoltar.length > 0 && (
        <Grupo titulo="Precisam voltar" clientes={precisamVoltar} destaque />
      )}

      <Grupo titulo={`Todas · ${clientes.length}`} clientes={demais} />
    </div>
  );
}

function Grupo({
  titulo,
  clientes,
  destaque = false,
}: {
  titulo: string;
  clientes: readonly Awaited<ReturnType<typeof listaDeClientes>>[number][];
  destaque?: boolean;
}) {
  if (clientes.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-subtle)] uppercase">
        {titulo}
      </h2>
      <ul className="flex flex-col gap-2">
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <Link href={`/painel/clientes/${cliente.id}`} className="block">
              <Card className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={
                    destaque
                      ? 'h-2 w-2 shrink-0 rounded-full bg-[var(--aurea-warning)]'
                      : 'h-2 w-2 shrink-0 rounded-full bg-[var(--aurea-border-strong)]'
                  }
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-[var(--aurea-ink)]">
                      {cliente.nome}
                    </span>
                    {cliente.nova && <Badge tone="rose">nova</Badge>}
                    {cliente.temConta && <Badge tone="neutral">app</Badge>}
                  </span>
                  <span className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
                    {descreverUltimaVisita(cliente)}
                  </span>
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function descreverUltimaVisita(
  cliente: Awaited<ReturnType<typeof listaDeClientes>>[number],
): string {
  if (cliente.ultimaVisitaDias === null) return 'nunca veio';

  const servico = cliente.ultimoServico ? `${cliente.ultimoServico} · ` : '';
  const dias = cliente.ultimaVisitaDias;

  if (dias === 0) return `${servico}hoje`;
  if (dias === 1) return `${servico}ontem`;
  if (dias < 30) return `${servico}há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  return `${servico}há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}
