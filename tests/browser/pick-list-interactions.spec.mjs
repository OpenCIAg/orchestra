import { expect, test } from '@playwright/test';

test('PickList stacks its panes and keeps transfer controls reachable on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/components/pick-list');

  const pickList = page.locator('orc-pick-list .orc-pick-list');
  const sourcePane = pickList.locator('.list-pane').nth(0);
  const targetPane = pickList.locator('.list-pane').nth(1);
  const actions = pickList.getByRole('group', { name: 'Transfer actions' });
  await expect(pickList).toHaveClass(/orc-pick-list--compact/);

  const sourceBox = await sourcePane.boundingBox();
  const targetBox = await targetPane.boundingBox();
  expect(sourceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  expect(targetBox.y).toBeGreaterThan(sourceBox.y + sourceBox.height);

  const buttons = actions.getByRole('button');
  await expect(buttons).toHaveCount(4);
  const buttonBoxes = await buttons.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()),
  );
  expect(Math.max(...buttonBoxes.map((box) => box.y))).toBeLessThanOrEqual(
    Math.min(...buttonBoxes.map((box) => box.y + box.height)) + 1,
  );
  await expect(buttons.nth(0)).toContainText('↓');

  const sourceDataTable = sourcePane.getByRole('option', {
    name: 'Data Table',
  });
  await expect(sourceDataTable).toHaveAttribute('draggable', 'true');
  await sourceDataTable.evaluate((source) => {
    const pickList = source.closest('.orc-pick-list');
    const target = pickList?.querySelector(
      '.list-pane:last-child [role="option"]',
    );
    if (!target) throw new Error('PickList target option was not rendered');
    const dataTransfer = new DataTransfer();
    source.dispatchEvent(
      new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    target.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(
    targetPane.getByRole('option', { name: 'Data Table' }),
  ).toBeVisible();

  await sourcePane.getByRole('option', { name: 'Calendar' }).click();
  await actions
    .getByRole('button', { name: 'Mover selecionado para selecionados' })
    .click();
  await expect(
    targetPane.getByRole('option', { name: 'Calendar' }),
  ).toBeVisible();
});
