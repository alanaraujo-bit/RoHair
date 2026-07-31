import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './theme.constants';

/**
 * Aplica o tema salvo ANTES da primeira pintura.
 *
 * Sem isto, o navegador pinta o tema padrão e troca em seguida — o "flash"
 * branco que denuncia na hora que aquilo é um site, não um aplicativo.
 * Precisa ser síncrono e inline; não há alternativa em React para isso.
 */
export function ThemeScript() {
  const script = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});if(p==='light'||p==='dark'){document.documentElement.setAttribute(${JSON.stringify(
    THEME_ATTRIBUTE,
  )},p)}}catch(e){}})()`;

  return (
    <script
      // Conteúdo estático definido em tempo de build — nenhuma entrada de usuário
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
