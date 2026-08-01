import { Button } from './button';
import { cn } from '@/shared/utils/cn';

/**
 * Portão de decisão — o teste de mecha.
 *
 * 🗣️ *"Inicio fazendo teste de mecha pra ver se o cabelo suporta o produto."*
 *
 * A decisão de desenho que importa aqui: **as duas saídas têm o mesmo peso
 * visual**. Reprovar não é erro, é o desfecho seguro — e provavelmente o
 * momento em que a profissional mais protege a cliente.
 *
 * Se "Não passou" fosse vermelho ou secundário, o produto estaria ensinando a
 * evitá-lo. Um app que empurra a profissional para aplicar química em cabelo
 * que não aguenta é pior que nenhum app. Por isso a variante do lado negativo é
 * `secondary`, nunca `danger`.
 *
 * A ordem também é deliberada: aprovar primeiro por ser o caso frequente, mas
 * sem hierarquia de cor entre os dois.
 */

export function DecisionGate({
  question,
  hint,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  disabled = false,
  className,
}: {
  readonly question: string;
  readonly hint?: string;
  readonly approveLabel: string;
  readonly rejectLabel: string;
  readonly onApprove: () => void;
  readonly onReject: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={question}
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-lg)] p-4',
        'bg-[var(--aurea-canvas-subtle)]',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[length:var(--text-base)] font-medium text-[var(--aurea-ink)]">
          {question}
        </p>
        {hint && (
          <p className="text-[length:var(--text-sm)] text-[var(--aurea-ink-muted)]">
            {hint}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" size="lg" disabled={disabled} onClick={onApprove}>
          {approveLabel}
        </Button>
        <Button variant="secondary" size="lg" disabled={disabled} onClick={onReject}>
          {rejectLabel}
        </Button>
      </div>
    </div>
  );
}
