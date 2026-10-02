import { expect, test } from '@playwright/test';

async function clickBackdrop(page, dialog) {
  await expect(dialog).toBeVisible();
  // The top-left viewport corner stays outside the centered dialog container,
  // including at the fixed viewport used by this suite.
  await page.mouse.click(2, 2);
}

test('DateTime picker dismisses after clicking outside its popup', async ({
  page,
}) => {
  await page.goto('/components/date-picker');

  const input = page.getByLabel('Agendamento');
  const panel = page.locator('.orc-date-picker__panel');
  await input.click();
  await expect(panel).toBeVisible();

  await page.getByText('Data e hora', { exact: true }).click();
  await expect(panel).toBeHidden();
});

test('button icon and label keep the intended 8px rendered gap', async ({
  page,
}) => {
  await page.goto('/components/button');
  await page.getByRole('button', { name: 'Ícone à Esquerda' }).click();

  const button = page
    .locator('.preview-panel')
    .getByRole('button', { name: 'Confirmar Ação' });
  await expect(button).toBeVisible();
  await expect(button.locator('.orc-button__icon--left svg')).toBeVisible();

  const renderedGap = await button.evaluate((element) => {
    const icon = element.querySelector('.orc-button__icon--left');
    const label = element.querySelector('.orc-button__text');
    if (!icon || !label) return null;

    return (
      label.getBoundingClientRect().left - icon.getBoundingClientRect().right
    );
  });

  expect(renderedGap).toBeCloseTo(8, 1);
});

test('tooltip documentation example appears on hover and cleans up on exit', async ({
  page,
}) => {
  await page.goto('/components/tooltip');

  const trigger = page.getByRole('button', {
    name: 'Passe o mouse aqui (Tooltip)',
  });
  const tooltip = page.getByRole('tooltip', { name: 'Tooltip interativo' });
  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-describedby', /orc-tooltip-/);

  await page.mouse.move(2, 2);
  await expect(tooltip).toBeHidden();
  await expect(trigger).not.toHaveAttribute('aria-describedby', /orc-tooltip-/);
});

test('declarative modal applies default Escape and backdrop dismissal', async ({
  page,
}) => {
  await page.goto('/components/modal');

  const dialog = page.getByRole('dialog', { name: 'Excluir repositório?' });
  await page
    .getByRole('button', { name: 'Modal Declarativo (Padrão)' })
    .click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page
    .getByRole('button', { name: 'Modal Declarativo (Padrão)' })
    .click();
  await expect(dialog).toBeVisible();
  await clickBackdrop(page, dialog);
  await expect(dialog).toBeHidden();
});

test('declarative modal enters, traps, and restores keyboard focus', async ({
  page,
}) => {
  await page.goto('/components/modal');

  const opener = page.getByRole('button', {
    name: 'Modal Declarativo (Padrão)',
  });
  const dialog = page.getByRole('dialog', { name: 'Excluir repositório?' });
  await opener.click();
  await expect(dialog).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        element.contains(element.ownerDocument.activeElement),
      ),
    )
    .toBe(true);

  const firstControl = dialog.getByRole('button').first();
  const lastControl = dialog.getByRole('button').last();
  await firstControl.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(lastControl).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstControl).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('Image preview opens accessibly and returns focus after Escape', async ({
  page,
}) => {
  await page.goto('/components/image');

  const trigger = page.getByRole('button', {
    name: 'Open image preview: Composição abstrata azul do Orchestra',
  });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Image preview' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('group', { name: 'Image preview controls' }),
  ).toBeVisible();
  const zoomOut = dialog.getByRole('button', { name: 'Zoom out' });
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in' });
  await expect(zoomOut).toBeEnabled();
  await zoomOut.click();
  await zoomOut.click();
  await expect(zoomOut).toBeDisabled();
  await expect(zoomIn).toBeEnabled();
  await zoomIn.click();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Galleria fullscreen contains focus and restores it after Escape', async ({
  page,
}) => {
  await page.goto('/components/galleria');

  const opener = page.getByRole('button', { name: 'Abrir tela cheia' });
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'Galeria de paisagens' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  const close = dialog.getByRole('button', { name: 'Fechar galeria' });
  await expect(close).toBeFocused();

  const lastControl = dialog.getByRole('button').last();
  await lastControl.focus();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('required declarative modal ignores Escape and backdrop dismissal', async ({
  page,
}) => {
  await page.goto('/components/modal');

  const dialog = page.getByRole('dialog', { name: 'Atualização Crítica' });
  await page
    .getByRole('button', { name: 'Obrigatório (Sem fechar ao clicar fora)' })
    .click();
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await clickBackdrop(page, dialog);
  await expect(dialog).toBeVisible();
});
