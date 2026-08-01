import { expect, test } from '@playwright/test';

/**
 * Catálogo do Áurea — Fase 2.
 *
 * Não testa aparência, que é trabalho de olho humano. Testa o que precisa
 * continuar verdadeiro depois de qualquer refatoração: que a sobreposição
 * nativa se comporta como sobreposição, que o teclado alcança tudo e que os
 * alvos de toque não encolheram.
 */
test.describe('Áurea', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design');
  });

  test('o catálogo carrega com os primitivos na tela', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Áurea' })).toBeVisible();

    // Uma seção de cada família, para pegar erro de importação em qualquer uma
    for (const section of ['Dinheiro', 'Segurança', 'Cronômetro', 'Ícones']) {
      await expect(
        page.getByRole('heading', { level: 2, name: section }),
      ).toBeVisible();
    }
  });

  test('o valor em destaque é o que sobrou, não o que entrou', async ({ page }) => {
    // A decisão de produto mais importante do painel, travada por teste:
    // se alguém inverter a hierarquia, isto quebra.
    await expect(page.getByLabel(/Sobrou hoje: R\$\s?186,40/)).toBeVisible();
  });

  test('o painel é modal de verdade e fecha com Esc', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir painel' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    /**
     * A pseudo-classe `:modal` só casa com um `<dialog>` aberto por
     * `showModal()` — é a prova precisa de que o resto da página está inerte e
     * o foco está preso. Um overlay feito com `div` posicionado, ou um
     * `<dialog>` aberto pelo atributo `open`, falha aqui.
     *
     * Testar "o botão de fundo sumiu" não serviria: ele continua visível atrás
     * do backdrop, só que inalcançável.
     */
    const isModal = await page.evaluate(() => {
      const element = document.querySelector('dialog[open]');
      return element?.matches(':modal') ?? false;
    });
    expect(isModal, 'o painel precisa ser aberto com showModal()').toBe(true);

    const focusTrapped = await page.evaluate(() => {
      const element = document.querySelector('dialog[open]');
      const active = document.activeElement;
      return !!element && !!active && (element === active || element.contains(active));
    });
    expect(focusTrapped, 'o foco precisa entrar no painel').toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('o comparador de fotos é operável por teclado', async ({ page }) => {
    const slider = page.getByRole('slider', { name: /comparar antes e depois/i });

    await slider.focus();
    const before = await slider.inputValue();
    await page.keyboard.press('ArrowRight');

    expect(Number(await slider.inputValue())).toBeGreaterThan(Number(before));
  });

  test('a chave de configuração alterna pelo rótulo inteiro', async ({ page }) => {
    const control = page.getByRole('switch', { name: /solicitar horário/i });
    await expect(control).toBeChecked();

    /**
     * Clicar no `input` direto falha, e está certo: ele é `sr-only` e o texto
     * visível fica por cima. O alvo real é o rótulo inteiro — que é como a
     * profissional toca, com o polegar, sem mirar numa caixinha de 20px.
     */
    await page.getByText('Cliente pode solicitar horário').click();
    await expect(control).not.toBeChecked();
  });

  test('nenhum controle do catálogo é menor que o alvo mínimo', async ({ page }) => {
    // Escopado ao `main`: em desenvolvimento o Next injeta o próprio botão de
    // ferramentas, que não é nosso e mede 32px.
    const buttons = await page.getByRole('main').getByRole('button').all();
    expect(buttons.length).toBeGreaterThan(10);

    for (const button of buttons) {
      if (!(await button.isVisible())) continue;
      const box = await button.boundingBox();
      const name = (await button.innerText()).trim() || '(sem texto)';
      expect(box?.height ?? 0, `alvo menor que 44px: ${name}`).toBeGreaterThanOrEqual(
        44,
      );
    }
  });
});
