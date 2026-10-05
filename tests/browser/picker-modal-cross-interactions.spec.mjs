import { expect, test } from '@playwright/test';

/**
 * Cross-interaction matrix for the focus-opening pickers (combobox,
 * autocomplete): native modal dialogs, modal drawers, overflow clippers and
 * theme switches.
 *
 * These controls open their option panel from FOCUS, i.e. in the middle of
 * a pointer gesture. Once the detached backdrop paints, the release lands
 * on it and the closing click retargets to the nearest common ancestor of
 * press and release targets — the <dialog> element itself when inside a
 * native modal. Every probe therefore clicks with human timing — at least
 * one frame must be able to paint between press and release — which is
 * exactly the timing automated fast clicks miss and the acceptance pass
 * caught.
 *
 * The modal and drawer cells run against the temporary acceptance sandbox
 * (/testing/overlay-matrix) because they need a REAL orc-modal/orc-drawer
 * around the pickers; if that sandbox is ever removed, port them onto a
 * dedicated spec page. The clipper, theme and no-modal cells run against
 * the regular demo pages.
 */

const SANDBOX = '/testing/overlay-matrix';
const HUMAN_PRESS_MS = 140;

/** A press-release pair far enough apart for at least one painted frame. */
async function humanClick(page, locatorOrPoint) {
  let x;
  let y;
  if (locatorOrPoint.locator) {
    const box = await locatorOrPoint.boundingBox();
    x = box.x + box.width / 2;
    y = box.y + box.height / 2;
  } else {
    ({ x, y } = locatorOrPoint);
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(HUMAN_PRESS_MS);
  await page.mouse.up();
}

/**
 * Clear the demo query so the full option list renders, dismiss any panel
 * that opening/focusing auto-armed, and blur the input — the pointer-open
 * gesture under test must start cold, with the press itself moving focus.
 */
async function coldStart(page, input, panel) {
  await input.fill('');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
}

/** Whether the topmost element at a point belongs to the detached overlay. */
const hitTestInOverlay = (page, point) =>
  page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return element
      ? !!element.closest('.cdk-overlay-pane, .cdk-overlay-backdrop')
      : false;
  }, point);

/** The option's center clamped into the viewport (engines flip panels differently). */
const visibleOptionPoint = async (page, option) => {
  const viewport = page.viewportSize();
  const box = await option.boundingBox();
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  return {
    x: clamp(box.x + box.width / 2, 2, viewport.width - 2),
    y: clamp(box.y + box.height / 2, 2, viewport.height - 2),
  };
};

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

const PICKERS = {
  combobox: {
    page: '/components/combobox',
    host: 'orc-combobox',
    trigger: 'input[role="combobox"]',
    panel: '.p-autocomplete-panel',
    optionLabel: 'React',
    // The sandbox binds the same options to both pickers.
    sandboxOptionLabel: 'React',
    modalHost: 'orc-modal orc-combobox',
    drawerHost: 'orc-drawer orc-combobox',
  },
  autocomplete: {
    page: '/components/autocomplete',
    host: 'orc-autocomplete',
    trigger: 'input[role="combobox"]',
    panel: '.p-autocomplete-panel',
    optionLabel: 'Rio de Janeiro',
    sandboxOptionLabel: 'Vue',
    modalHost: 'orc-modal orc-autocomplete',
    drawerHost: 'orc-drawer orc-autocomplete',
  },
};

for (const [name, target] of Object.entries(PICKERS)) {
  test(`${name} inside the modal: pointer-open keeps panel and modal open, selecting keeps the modal open`, async ({
    page,
  }) => {
    await page.goto(SANDBOX);
    await page.getByRole('button', { name: 'Abrir modal' }).click();
    const dialog = page.locator('orc-modal dialog');
    await expect(dialog).toBeVisible();

    const input = page.locator(`${target.modalHost} ${target.trigger}`);
    const panel = page.locator(target.panel);
    await coldStart(page, input, panel);
    await humanClick(page, input);
    await expect(panel).toBeVisible();
    // The click that opened the panel must never read as a modal backdrop
    // click: the gesture started on the input.
    await expect(dialog).toBeVisible();

    // The pane remains interactive inside the modal.
    const option = panel.locator('li[role="option"]', {
      hasText: target.sandboxOptionLabel,
    });
    const optionInOverlay = async () =>
      hitTestInOverlay(page, await visibleOptionPoint(page, option));
    await expect.poll(optionInOverlay).toBe(true);
    await option.click();
    await expect(dialog).toBeVisible();
    // The input reflects the selection through the query contract.
    await expect(input).toHaveValue(target.sandboxOptionLabel);
  });

  test(`${name} inside the modal: Escape dismisses the panel before the modal`, async ({
    page,
  }) => {
    await page.goto(SANDBOX);
    await page.getByRole('button', { name: 'Abrir modal' }).click();
    const dialog = page.locator('orc-modal dialog');
    await expect(dialog).toBeVisible();

    const input = page.locator(`${target.modalHost} ${target.trigger}`);
    const panel = page.locator(target.panel);
    await coldStart(page, input, panel);
    await humanClick(page, input);
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
    await expect(dialog).toBeVisible();

    // Second Escape closes the modal itself.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test(`${name} inside the modal: outside clicks dismiss the panel, then the modal`, async ({
    page,
  }) => {
    await page.goto(SANDBOX);
    await page.getByRole('button', { name: 'Abrir modal' }).click();
    const dialog = page.locator('orc-modal dialog');
    await expect(dialog).toBeVisible();

    const input = page.locator(`${target.modalHost} ${target.trigger}`);
    const panel = page.locator(target.panel);
    const outside = { x: 20, y: 20 };
    await coldStart(page, input, panel);
    await humanClick(page, input);
    await expect(panel).toBeVisible();

    // First outside click: the panel's own backdrop swallows the press and
    // dismisses the panel; the modal stays.
    await humanClick(page, outside);
    await expect(panel).not.toBeVisible();
    await expect(dialog).toBeVisible();

    // Second outside click reaches the modal mask itself.
    await humanClick(page, outside);
    await expect(dialog).not.toBeVisible();
  });

  test(`${name} inside the modal drawer: pointer-open keeps panel and drawer open`, async ({
    page,
  }) => {
    await page.goto(SANDBOX);
    // Open the modal first, then close it: the drawer is exercised in the
    // registry state right after a modal open/close cycle.
    await page.getByRole('button', { name: 'Abrir modal' }).click();
    const modal = page.locator('orc-modal dialog');
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    await page
      .locator('.drawer-section orc-button', { hasText: 'Abrir drawer' })
      .click();
    const drawer = page.locator('aside.orc-drawer');
    await expect(drawer).toBeVisible();

    const input = page.locator(`${target.drawerHost} ${target.trigger}`);
    const panel = page.locator(target.panel);
    await coldStart(page, input, panel);
    await humanClick(page, input);
    await expect(panel).toBeVisible();
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
    await expect(drawer).toBeVisible();
  });

  test(`${name} panel is not clipped by an overflow-hidden ancestor opened by pointer`, async ({
    page,
  }) => {
    await page.goto(target.page);
    const host = page.locator(target.host).first();
    await host.scrollIntoViewIfNeeded();
    await page.evaluate((selector) => {
      const picked = document.querySelector(selector);
      picked.closest('.example')?.setAttribute('data-cross-example', '');
      const clipper = document.createElement('div');
      clipper.setAttribute('data-cross-clipper', '');
      clipper.style.overflow = 'hidden';
      clipper.style.position = 'relative';
      clipper.style.width = '320px';
      clipper.style.height = '56px';
      picked.parentNode.insertBefore(clipper, picked);
      clipper.appendChild(picked);
    }, target.host);
    const clipper = page.locator('[data-cross-clipper]');

    const input = host.locator(target.trigger);
    const panel = page.locator(target.panel);
    await coldStart(page, input, panel);
    await humanClick(page, input);
    await expect(panel).toBeVisible();

    // The panel extends past the clip boundary and is actually painted
    // there (a clipped panel measures zero visible height).
    const clipBox = await clipper.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(panelBox.y + panelBox.height).toBeGreaterThan(
      clipBox.y + clipBox.height,
    );
    expect(await visibleHeight(panel)).toBeGreaterThan(40);

    const option = panel.locator('li[role="option"]', {
      hasText: target.optionLabel,
    });
    const optionInOverlay = async () =>
      hitTestInOverlay(page, await visibleOptionPoint(page, option));
    await expect.poll(optionInOverlay).toBe(true);
  });

  test(`${name} panel switches theme and stays readable when the app goes dark`, async ({
    page,
  }) => {
    await page.goto(target.page);
    const host = page.locator(target.host).first();
    await host.scrollIntoViewIfNeeded();

    const input = host.locator(target.trigger);
    const panel = page.locator(target.panel);

    const optionColors = async () =>
      panel.evaluate((element) => {
        const style = getComputedStyle(element);
        return { color: style.color, background: style.backgroundColor };
      });

    await humanClick(page, input);
    await expect(panel).toBeVisible();
    const light = await optionColors();
    expect(light.background).not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
    // Blur so the next press re-runs the focus-open contract.
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    });

    // Toggle the app theme the way ThemeService does, then reopen.
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await humanClick(page, input);
    await expect(panel).toBeVisible();
    const dark = await optionColors();
    expect(dark.background).not.toBe(light.background);
    expect(dark.background).not.toBe('rgba(0, 0, 0, 0)');
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
    });
  });
}

test('combobox opens by pointer without any modal and the panel stays open', async ({
  page,
}) => {
  await page.goto('/components/combobox');
  const host = page.locator('orc-combobox').first();
  await host.scrollIntoViewIfNeeded();
  const input = host.locator('input[role="combobox"]');
  const panel = page.locator('.p-autocomplete-panel');
  await humanClick(page, input);
  await expect(panel).toBeVisible();
});
