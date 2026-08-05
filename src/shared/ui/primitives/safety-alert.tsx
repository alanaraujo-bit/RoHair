import { IconShieldAlert, IconShieldCheck } from '@/shared/ui/icons/domain-icons';
import { cn } from '@/shared/utils/cn';

/**
 * Alerta de química.
 *
 * Tem peso visual próprio, distinto de qualquer aviso comum, porque não é aviso
 * comum: sobrepor química incompatível — guanidina sob amônia, por exemplo —
 * pode literalmente partir o fio da cliente.
 *
 * 🗣️ A Roziele abre todo atendimento perguntando o que a cliente já fez e
 * testando uma mecha. Este componente é a versão em tela dessa pergunta, e por
 * isso aparece **no topo da ficha**, acima de qualquer métrica
 * (docs/12-WIREFRAMES.md, tela 6).
 *
 * Não usa `role="alert"`: o conteúdo já está na tela quando ela abre, e
 * `alert` é para o que aparece depois. Um cabeçalho semântico serve melhor.
 */

type SafetyLevel = 'chemistry' | 'clear';

export function SafetyAlert({
  level,
  title,
  detail,
  className,
}: {
  readonly level: SafetyLevel;
  readonly title: string;
  readonly detail?: string;
  readonly className?: string;
}) {
  const isChemistry = level === 'chemistry';

  return (
    <section
      aria-labelledby={undefined}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-lg)] p-3.5',
        // Faixa lateral em vez de fundo saturado: sinaliza gravidade sem
        // gritar, e sobrevive aos dois temas sem virar bloco de cor chapada.
        'border-l-[3px]',
        isChemistry
          ? 'border-l-[var(--aurea-warning)] bg-[var(--aurea-warning)]/10'
          : 'border-l-[var(--aurea-success)] bg-[var(--aurea-success)]/8',
        className,
      )}
    >
      <span
        className={cn(
          'mt-px',
          isChemistry ? 'text-[var(--aurea-warning)]' : 'text-[var(--aurea-success)]',
        )}
      >
        {isChemistry ? (
          <IconShieldAlert size={22} label="Atenção" />
        ) : (
          <IconShieldCheck size={22} label="Sem química registrada" />
        )}
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[length:var(--text-2xs)] font-semibold tracking-[0.09em] text-[var(--aurea-ink-muted)] uppercase">
          {isChemistry ? 'Química' : 'Sem química'}
        </p>
        <p className="text-[length:var(--text-base)] font-medium text-[var(--aurea-ink)]">
          {title}
        </p>
        {detail && (
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            {detail}
          </p>
        )}
      </div>
    </section>
  );
}
