import { expect, test } from '@playwright/test';

test('PickList transfers an item through a desktop drag gesture', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/components/pick-list');

  const pickList = page.locator('orc-pick-list .orc-pick-list');
  const sourcePane = pickList.locator('.list-pane').nth(0);
  const targetPane = pickList.locator('.list-pane').nth(1);
  const sourceDataTable = sourcePane.getByRole('option', {
    name: 'Data Table',
  });
  await expect(sourceDataTable).toHaveAttribute('draggable', 'true');
  await sourceDataTable.dragTo(
    targetPane.getByRole('option', { name: 'Button' }),
  );

  await expect(
    targetPane.getByRole('option', { name: 'Data Table' }),
  ).toBeVisible();
  await expect(sourceDataTable).toHaveCount(0);
});
