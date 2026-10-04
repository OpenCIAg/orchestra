/**
 * Makes programmatic focus deterministic in browser tests whose tab is not
 * foregrounded. Chromium may update activeElement without firing DOM focus
 * events when the page has lost window focus; components still need to receive
 * the same focus transition a foregrounded browser would deliver.
 */
export function focusElement(element: HTMLElement): void {
  const document = element.ownerDocument;
  const previous = document.activeElement;
  const isAlreadyActive = previous === element;
  const observed = new Map<string, Set<EventTarget>>();
  const types = ['blur', 'focusout', 'focus', 'focusin'];
  const observe = (event: Event) => {
    const targets = observed.get(event.type);
    if (targets) targets.add(event.target as EventTarget);
  };
  for (const type of types) {
    observed.set(type, new Set());
    document.addEventListener(type, observe, true);
  }

  element.focus();

  for (const type of types) document.removeEventListener(type, observe, true);
  if (isAlreadyActive) return;
  const dispatchMissing = (
    target: HTMLElement,
    type: 'blur' | 'focusout' | 'focus' | 'focusin',
    relatedTarget: Element | null,
  ) => {
    if (!observed.get(type)?.has(target)) {
      target.dispatchEvent(
        new FocusEvent(type, {
          bubbles: type === 'focusin' || type === 'focusout',
          relatedTarget,
        }),
      );
    }
  };

  if (previous instanceof HTMLElement && previous !== element) {
    dispatchMissing(previous, 'blur', element);
    dispatchMissing(previous, 'focusout', element);
  }
  dispatchMissing(
    element,
    'focus',
    previous instanceof Element ? previous : null,
  );
  dispatchMissing(
    element,
    'focusin',
    previous instanceof Element ? previous : null,
  );
}

/**
 * Delivers the browser blur transition when a headless, unfocused page suppresses
 * it. Call only when the test intends this element to lose focus.
 */
export function blurElement(
  element: HTMLElement,
  relatedTarget: Element | null = null,
): void {
  const document = element.ownerDocument;
  const observed = new Set<string>();
  const observe = (event: Event) => {
    if (event.target === element) observed.add(event.type);
  };
  document.addEventListener('blur', observe, true);
  document.addEventListener('focusout', observe, true);
  element.blur();
  document.removeEventListener('blur', observe, true);
  document.removeEventListener('focusout', observe, true);

  if (!observed.has('blur'))
    element.dispatchEvent(new FocusEvent('blur', { relatedTarget }));
  if (!observed.has('focusout'))
    element.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget }),
    );
}
