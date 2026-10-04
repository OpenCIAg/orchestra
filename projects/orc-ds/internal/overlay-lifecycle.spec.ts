import { listenForOutsideInteraction } from './overlay-lifecycle';

/**
 * The outside-interaction listener arms itself the moment an overlay opens.
 * Overlays that open from focus (combobox, autocomplete) arm mid-gesture —
 * between the pointerdown on the trigger and the pointerup that completes
 * it. Once the detached backdrop paints, the pointerup lands on it and the
 * closing `click` retargets to the nearest common ancestor of the two
 * targets (the native modal dialog, or the body). That completion click is
 * the gesture that opened the overlay, never an outside dismissal.
 */
describe('listenForOutsideInteraction pointer-gesture triage', () => {
  let root: HTMLDivElement;
  const cleanups: (() => void)[] = [];

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => {
    cleanups.reverse().forEach((release) => release());
    cleanups.length = 0;
    root.remove();
  });

  function listen(roots: HTMLElement[], onOutside: (event: Event) => void) {
    const release = listenForOutsideInteraction(document, () => roots, onOutside);
    cleanups.push(release);
    return release;
  }

  it('ignores the completion click of a gesture that armed it mid-flight', () => {
    const onOutside = jasmine.createSpy('onOutside');
    listen([root], onOutside);

    // The listener was armed between pointerdown and pointerup, so it never
    // observed the pointerdown of this gesture; the click retargeted to a
    // common ancestor outside the roots (detail 1: a real pointer click).
    document.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1 }),
    );
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('honors a genuine gesture it observed from pointerdown to click', () => {
    const onOutside = jasmine.createSpy('onOutside');
    listen([root], onOutside);

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onOutside).toHaveBeenCalledTimes(2);
  });

  it('honors keyboard- and programmatic-generated clicks (detail 0)', () => {
    const onOutside = jasmine.createSpy('onOutside');
    listen([root], onOutside);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('keeps a click whose pointerdown started inside the roots', () => {
    const onOutside = jasmine.createSpy('onOutside');
    listen([root], onOutside);

    // Drag-release: the press began on the picker, the release landed
    // outside it, so the click retargets to a common ancestor outside.
    root.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1 }),
    );
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('dismisses on an observed outside pointerdown before its click', () => {
    const onOutside = jasmine.createSpy('onOutside');
    listen([root], onOutside);

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(onOutside).toHaveBeenCalledTimes(1);
  });
});
