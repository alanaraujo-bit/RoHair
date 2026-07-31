import { expect, test } from '@playwright/test';

/**
 * Teste de fumaça da Fase 0.
 *
 * Não valida o produto — valida que a esteira funciona: a aplicação sobe, a
 * página renderiza, os tokens do tema respondem e a acessibilidade básica está
 * de pé. É o teste que precisa quebrar se alguém quebrar a fundação.
 */
test.describe('fundação', () => {
  test('a página inicial responde e se apresenta', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /fundação/i }),
    ).toBeVisible();

    await expect(page).toHaveTitle(/RoHair/);
  });

  test('a alternância de tema troca a identidade visual e persiste', async ({
    page,
  }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /tema/i });
    await expect(toggle).toBeVisible();

    const html = page.locator('html');
    await toggle.click();

    const chosen = await html.getAttribute('data-theme');
    expect(chosen).toMatch(/^(light|dark)$/);

    // A escolha precisa sobreviver ao recarregamento — sem isso, a tela pisca
    // no tema errado a cada abertura, que é exatamente o que denuncia um site
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', chosen ?? '');
  });

  test('o alvo de toque respeita o mínimo de acessibilidade', async ({ page }) => {
    await page.goto('/');

    const box = await page.getByRole('button', { name: /tema/i }).boundingBox();

    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
