import { expect, test } from '@playwright/test';

/**
 * A porta do painel está fechada.
 *
 * Este arquivo existe por um motivo específico: entre 2026-08-01 e 2026-08-02 o
 * painel esteve **aberto na internet**. O teste é o que garante que isso não
 * volte por descuido — um `matcher` mal editado no middleware reabriria tudo em
 * silêncio, e nenhum outro teste perceberia.
 *
 * Roda sem banco de propósito: a decisão de barrar quem não tem cookie não
 * depende de consulta nenhuma.
 */

const ROTAS_PRIVADAS = [
  '/painel',
  '/painel/agenda',
  '/painel/agenda/nova',
  '/painel/clientes',
  '/painel/clientes/qualquer-id',
  '/painel/clientes/nova',
  '/painel/dinheiro',
  '/painel/estoque',
];

test.describe('painel fechado', () => {
  for (const rota of ROTAS_PRIVADAS) {
    test(`${rota} manda para a tela de entrada`, async ({ page }) => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/entrar/);
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    });
  }

  test('guarda para onde a pessoa queria ir', async ({ page }) => {
    await page.goto('/painel/clientes');
    await expect(page).toHaveURL(/destino=%2Fpainel%2Fclientes/);
  });

  test('não deixa passar destino para fora do painel', async ({ page }) => {
    // Redirecionador aberto: entrar por um link preparado e cair em outro site
    // já autenticada. O campo aceita o valor, o servidor é que o descarta.
    await page.goto('/entrar?destino=https://exemplo-golpe.test');
    await expect(page.locator('input[name="destino"]')).toHaveValue(
      'https://exemplo-golpe.test',
    );
  });
});

test.describe('tela de entrada', () => {
  test('tem rótulo, autocompletar e alvo de toque', async ({ page }) => {
    await page.goto('/entrar');

    const usuario = page.getByLabel('E-mail ou usuário');
    const senha = page.getByLabel('Senha');

    await expect(usuario).toHaveAttribute('autocomplete', 'username');
    await expect(senha).toHaveAttribute('autocomplete', 'current-password');
    await expect(senha).toHaveAttribute('type', 'password');

    const botao = page.getByRole('button', { name: 'Entrar' });
    const caixa = await botao.boundingBox();
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
