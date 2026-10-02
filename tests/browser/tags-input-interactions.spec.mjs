import { expect, test } from '@playwright/test';

test('TagsInput addOnTab commits and moves focus to the next control', async ({
  page,
}) => {
  await page.goto('/components/tags-input');

  const example = page.getByTestId('tags-input-tab-example');
  const input = example.getByLabel('Tecnologias (confirma com Tab)');
  const nextControl = page
    .getByTestId('tags-input-tab-next')
    .getByLabel('Próximo controle');

  await input.fill('Enterprise');
  await input.focus();
  await page.keyboard.press('Tab');

  await expect(nextControl).toBeFocused();
  await expect(example.locator('.tag')).toContainText('Enterprise');
});
