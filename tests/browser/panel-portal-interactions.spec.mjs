import { expect, test } from '@playwright/test';

/**
 * Panel-portal contract (cross-interaction matrix, overflow dimension):
 * a list-picker option panel renders detached from the page flow, so an
 * ancestor with `overflow: hidden` can never clip it. The panel must
 * overlay the clip boundary and keep its options hit-testable, and the
 * detached rendering must survive a native modal parent (the pane stays
 * interactive inside the dialog and Escape closes the panel, not the
 * dialog).
 */

const CLIP_TARGETS = [
  {
    page: '/components/multi-select',
    host: 'orc-multi-select',
    trigger: 'button[role="combobox"]',
    panel: '.p-multiselect-panel',
    option: 'li[role="option"]',
    optionLabel: 'Angular',
    stateValue: 'angular',
    stateProbe: /values = /,
  },
  {
    page: '/components/combobox',
    host: 'orc-combobox',
    trigger: 'input[role="combobox"]',
    panel: '.p-autocomplete-panel',
    option: 'li[role="option"]',
    optionLabel: 'React',
    stateValue: 'react',
    stateProbe: /value = /,
    // The demo's query mirrors its preselected value; clearing it opens the
    // panel (focus + input) and renders the full option list. No extra
    // click: the transparent backdrop would cover the input afterwards.
    open: async (host, trigger) => {
      await trigger.fill('');
    },
  },
  {
    page: '/components/tree-select',
    host: 'orc-tree-select',
    trigger: 'button.trigger',
    panel: '[role="tree"]',
    option: '[role="treeitem"] button.item',
    optionLabel: 'Pacotes',
    stateValue: 'packages',
    stateProbe: /value = /,
    open: async (host, trigger, panel) => {
      await trigger.click();
      // The leaf sits under the collapsed demo root; the expand control
      // renders in the detached panel.
      await panel.locator('button.expand').first().click();
    },
  },
];

/** Wrap the picker host in an `overflow: hidden` box that clips everything but the trigger row. */
async function clipHost(page, target) {
  await page.evaluate((selector) => {
    const host = document.querySelector(selector);
    host.closest('.example')?.setAttribute('data-panel-portal-example', '');
    const clipper = document.createElement('div');
    clipper.setAttribute('data-panel-portal-clipper', '');
    clipper.style.overflow = 'hidden';
    clipper.style.position = 'relative';
    clipper.style.width = '320px';
    clipper.style.height = '56px';
    host.parentNode.insertBefore(clipper, host);
    clipper.appendChild(host);
  }, target.host);
  return page.locator('[data-panel-portal-clipper]');
}

/**
 * The visible height of an element once every clipping ancestor has been
 * intersected with its box. A fully clipped panel measures zero even
 * though getBoundingClientRect still reports its layout size.
 */
const visibleHeight = (locator) =>
  locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    let visible = { top: box.top, bottom: box.bottom };
    for (
      let ancestor = element.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      const overflow = getComputedStyle(ancestor).overflow;
      if (overflow !== 'hidden' && overflow !== 'auto' && overflow !== 'scroll')
        continue;
      const clip = ancestor.getBoundingClientRect();
      visible = {
        top: Math.max(visible.top, clip.top),
        bottom: Math.min(visible.bottom, clip.bottom),
      };
    }
    return Math.max(0, visible.bottom - visible.top);
  });

for (const target of CLIP_TARGETS) {
  test(`${target.page}: panel overlays an overflow-hidden ancestor instead of being clipped`, async ({
    page,
  }) => {
    await page.goto(target.page);

    const host = page.locator(target.host).first();
    await host.scrollIntoViewIfNeeded();
    const clipper = await clipHost(page, target);
    const trigger = host.locator(target.trigger);
    const panel = page.locator(target.panel);

    await expect(panel).toHaveCount(0);
    if (target.open) await target.open(host, trigger, panel);
    else await trigger.click();
    await expect(panel).toBeVisible();

    // The panel extends past the clip boundary…
    const clipBox = await clipper.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(panelBox.y + panelBox.height).toBeGreaterThan(
      clipBox.y + clipBox.height,
    );

    // …and is actually painted there: a fully clipped panel has zero
    // visible height once the clipper's box is intersected away.
    const paintedHeight = await visibleHeight(panel);
    expect(paintedHeight).toBeGreaterThan(40);

    // The overlayed option stays hit-testable through the clip boundary.
    await panel.locator(target.option, { hasText: target.optionLabel }).click();
    await expect(
      page
        .locator('[data-panel-portal-example]')
        .locator('code')
        .filter({ hasText: target.stateProbe }),
    ).toContainText(target.stateValue);
  });
}

test('multi-select panel opens and dismisses inside a native modal dialog', async ({
  page,
}) => {
  await page.goto('/components/multi-select');

  const host = page.locator('orc-multi-select').first();
  await host.scrollIntoViewIfNeeded();
  await page.evaluate((selector) => {
    const picked = document.querySelector(selector);
    picked.closest('.example')?.setAttribute('data-panel-portal-example', '');
    const dialog = document.createElement('dialog');
    dialog.setAttribute('data-panel-portal-dialog', '');
    dialog.style.width = '480px';
    dialog.style.height = '360px';
    document.body.appendChild(dialog);
    dialog.appendChild(picked);
    dialog.showModal();
  }, 'orc-multi-select');

  const dialog = page.locator('dialog[data-panel-portal-dialog]');
  await expect(dialog).toBeVisible();

  const trigger = host.locator('button[role="combobox"]');
  const panel = page.locator('.p-multiselect-panel');
  await trigger.click();
  await expect(panel).toBeVisible();

  // The pane remains interactive inside the native modal.
  await panel.locator('li[role="option"]', { hasText: 'Angular' }).click();
  await expect(
    page
      .locator('[data-panel-portal-example] code')
      .filter({ hasText: /values = / }),
  ).toContainText('angular');

  // Escape dismisses the panel; preventDefault keeps the dialog open.
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(dialog).toBeVisible();
});
