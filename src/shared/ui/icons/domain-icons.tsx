import { IconShell, type IconProps } from './icon';

/**
 * Ícones do domínio da beleza.
 *
 * Cada um existe porque uma tela dos wireframes (docs/12-WIREFRAMES.md) pede.
 * Não há ícone "para o caso de precisar" — ícone sem uso vira dívida visual.
 *
 * Grade e traço definidos em `icon.tsx`.
 */

/** Secador — representa a escova e a modelagem. */
export function IconDryer(props: IconProps) {
  return (
    <IconShell {...props}>
      {/* Corpo: cilindro inclinado, boca larga à esquerda */}
      <path d="M3.6 8.2a3.4 3.4 0 0 1 3.4-3.4h6.1c1.6 0 2.9 1.5 2.9 3.4s-1.3 3.4-2.9 3.4H7a3.4 3.4 0 0 1-3.4-3.4Z" />
      {/* Bocal traseiro */}
      <path d="M16 6.6l3.4-1.4v6l-3.4-1.4" />
      {/* Cabo, saindo em diagonal para não ficar simétrico demais */}
      <path d="M8.9 11.6l-1.2 4.6" />
      <path d="M6.6 16.2h3.9l-.7 3.2H7.3l-.7-3.2Z" />
    </IconShell>
  );
}

/** Mecha de cabelo — usada em teste de mecha e em curvatura. */
export function IconStrand(props: IconProps) {
  return (
    <IconShell {...props}>
      {/* Três fios com ondulações diferentes: uniformidade aqui pareceria cabo */}
      <path d="M8 3.5c-1.9 2.4-1.9 4 0 6.4s1.9 4 0 6.4-1.9 3 0 4.2" />
      <path d="M12 3.5c-2.1 2.6-2.1 4.4 0 7s2.1 4.4 0 7 -1.6 2.5-.4 3" />
      <path d="M16 3.5c-1.9 2.4-1.9 4 0 6.4s1.9 4 0 6.4-1.9 3 0 4.2" />
    </IconShell>
  );
}

/** Frasco de produto — progressiva, máscara, qualquer insumo com tampa. */
export function IconBottle(props: IconProps) {
  return (
    <IconShell {...props}>
      {/* Tampa */}
      <path d="M9.8 2.8h4.4v2.6H9.8z" />
      {/* Gargalo curto, ombro caindo para o corpo */}
      <path d="M10.6 5.4v1.7c0 .6-.3 1.1-.8 1.5A4 4 0 0 0 8 11.8v6.6a2.6 2.6 0 0 0 2.6 2.6h2.8a2.6 2.6 0 0 0 2.6-2.6v-6.6a4 4 0 0 0-1.8-3.2c-.5-.4-.8-.9-.8-1.5V5.4" />
      {/* Faixa do rótulo: é o que faz ler como frasco e não como lâmpada */}
      <path d="M8 13.4h8" />
    </IconShell>
  );
}

/** Tesoura — corte e corte de pontas. */
export function IconScissors(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="6.3" cy="17.7" r="2.3" />
      <circle cx="17.7" cy="17.7" r="2.3" />
      <path d="M8 16.1 17.4 3.6" />
      <path d="M16 16.1 6.6 3.6" />
    </IconShell>
  );
}

/** Gota — hidratação, nutrição, cuidado em casa. */
export function IconDrop(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 3.2c3.1 3.6 5.4 6.5 5.4 9.3a5.4 5.4 0 0 1-10.8 0c0-2.8 2.3-5.7 5.4-9.3Z" />
      {/* Reflexo interno: dá volume sem preencher */}
      <path d="M9.6 13.4a2.6 2.6 0 0 0 1.7 2.5" />
    </IconShell>
  );
}

/** Escova redonda — modelagem e finalização. */
export function IconBrush(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M14.9 3.6a4.3 4.3 0 1 1-6.1 6.1 4.3 4.3 0 0 1 6.1-6.1Z" />
      {/* Cerdas: quatro traços curtos saindo da cabeça */}
      <path d="M11.9 2.2v1.6M6.9 6.6H5.3M17.6 6.6h1.6M11.9 12.6v-1.6" />
      {/* Cabo */}
      <path d="M8.8 9.7 4.1 19.4" />
    </IconShell>
  );
}

/** Espelho de mão — a ficha da cliente, o "quem é essa pessoa". */
export function IconMirror(props: IconProps) {
  return (
    <IconShell {...props}>
      <ellipse cx="12" cy="8.4" rx="5.6" ry="6.2" />
      <path d="M12 14.6v3.1" />
      <path d="M9.7 20.6h4.6a2.3 2.3 0 0 0-2.3-2.9 2.3 2.3 0 0 0-2.3 2.9Z" />
    </IconShell>
  );
}

/** Ampulheta — duração de serviço e tempo de pausa. */
export function IconHourglass(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M6.6 3.2h10.8" />
      <path d="M6.6 20.8h10.8" />
      <path d="M7.6 3.2v3.1c0 2 1.5 3.6 3.2 4.6.8.5.8 1.7 0 2.2-1.7 1-3.2 2.6-3.2 4.6v3.1" />
      <path d="M16.4 3.2v3.1c0 2-1.5 3.6-3.2 4.6-.8.5-.8 1.7 0 2.2 1.7 1 3.2 2.6 3.2 4.6v3.1" />
    </IconShell>
  );
}

/** Calendário com vaga — a agenda. "Vaga" é a palavra da Roziele. */
export function IconCalendar(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.6" />
      <path d="M3.4 9.8h17.2" />
      <path d="M8.2 3.4v3.4M15.8 3.4v3.4" />
      {/* O quadradinho vazio é a vaga: o espaço livre é o que ela procura */}
      <rect x="7.2" y="12.8" width="4" height="4" rx="1" />
    </IconShell>
  );
}

/** Cofrinho — dinheiro, o que sobrou. */
export function IconMoney(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="2.8" y="6.2" width="18.4" height="12.6" rx="2.8" />
      <circle cx="12" cy="12.5" r="2.9" />
      <path d="M6.4 10.2v4.6M17.6 10.2v4.6" />
    </IconShell>
  );
}

/** Casa — a tela Hoje, o ponto de partida do painel. */
export function IconHome(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M3.6 10.4 12 3.8l8.4 6.6" />
      <path d="M5.8 9.4V20h12.4V9.4" />
      <path d="M10 20v-5h4v5" />
    </IconShell>
  );
}

/** Escudo com verificação — o teste de mecha, o portão de segurança. */
export function IconShieldCheck(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 2.8 4.6 5.9v5.4c0 4.4 3.1 8.4 7.4 9.9 4.3-1.5 7.4-5.5 7.4-9.9V5.9L12 2.8Z" />
      <path d="m9 11.8 2.2 2.3 4-4.3" />
    </IconShell>
  );
}

/** Escudo com alerta — química incompatível. O dado mais crítico da ficha. */
export function IconShieldAlert(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 2.8 4.6 5.9v5.4c0 4.4 3.1 8.4 7.4 9.9 4.3-1.5 7.4-5.5 7.4-9.9V5.9L12 2.8Z" />
      <path d="M12 8.2v4.1" />
      <path d="M12 15.6h.01" />
    </IconShell>
  );
}

/** Câmera — antes e depois. */
export function IconCamera(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4.6 7.6h2.9l1.4-2.2h6.2l1.4 2.2h2.9a2.2 2.2 0 0 1 2.2 2.2v7.6a2.2 2.2 0 0 1-2.2 2.2H4.6a2.2 2.2 0 0 1-2.2-2.2V9.8a2.2 2.2 0 0 1 2.2-2.2Z" />
      <circle cx="12" cy="13.4" r="3.4" />
    </IconShell>
  );
}

/** Setas de retorno — o loop da progressiva, o "hora de voltar". */
export function IconReturn(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M20.2 12a8.2 8.2 0 1 1-2.9-6.3" />
      <path d="M20.6 4.2v4.6h-4.6" />
    </IconShell>
  );
}
