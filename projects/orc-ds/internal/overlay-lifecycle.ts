import { createModalIsolation, OverlayLayer } from './modal-isolation';
import { overlayContains } from './overlay-attachment';

interface OwnedOverlayLayer extends OverlayLayer {
  parent?: OwnedOverlayLayer;
  onParentClose?: () => void;
}

/** Document-scoped ownership lets nested overlays cooperate without global application state. */
interface DocumentState {
  layers: OwnedOverlayLayer[];
  isolation: ReturnType<typeof createModalIsolation>;
  locks: number;
  overflow: string;
  overflowPriority: string;
}

const documents = new WeakMap<Document, DocumentState>();

function stateFor(document: Document): DocumentState {
  let state = documents.get(document);
  if (!state) {
    state = {
      layers: [],
      locks: 0,
      overflow: '',
      overflowPriority: '',
      isolation: createModalIsolation(
        document,
        () => documents.get(document)?.layers ?? [],
      ),
    };
    documents.set(document, state);
  }
  return state;
}

export function registerOverlay(
  element: HTMLElement,
  options: {
    interactive?: boolean;
    anchor?: HTMLElement;
    onParentClose?: () => void;
  } = {},
): () => void {
  const state = stateFor(element.ownerDocument);
  const layer: OwnedOverlayLayer = {
    element,
    interactive: options.interactive !== false,
    parent: state.layers
      .slice()
      .reverse()
      .find(
        (candidate) =>
          candidate.interactive &&
          (overlayContains(candidate.element, options.anchor ?? element) ||
            overlayContains(candidate.element, element)),
      ),
    onParentClose: options.onParentClose,
  };
  state.layers.push(layer);
  state.isolation.refresh();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const descendants = state.layers.filter((candidate) => {
      for (let parent = candidate.parent; parent; parent = parent.parent)
        if (parent === layer) return true;
      return false;
    });
    state.layers = state.layers.filter(
      (candidate) => candidate !== layer && !descendants.includes(candidate),
    );
    // Close deepest children first. Each child can safely release its own registration.
    for (const child of descendants.reverse()) child.onParentClose?.();
    state.isolation.refresh();
  };
}

export function isTopOverlay(element: HTMLElement): boolean {
  const layers = stateFor(element.ownerDocument).layers.filter(
    (layer) => layer.interactive && layer.element.isConnected,
  );
  return layers.length === 0 || layers[layers.length - 1].element === element;
}

export function isolateModalBackground(
  element: HTMLElement,
  additionalRoots: readonly HTMLElement[] = [],
): () => void {
  return stateFor(element.ownerDocument).isolation.register(
    element,
    additionalRoots,
  );
}

/** Each caller receives an idempotent release function that preserves consumer inline styles. */
export function lockDocumentScroll(document: Document): () => void {
  const body = document.body;
  if (!body) return () => {};
  const state = stateFor(document);
  if (state.locks++ === 0) {
    state.overflow = body.style.getPropertyValue('overflow');
    state.overflowPriority = body.style.getPropertyPriority('overflow');
    body.style.setProperty('overflow', 'hidden');
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--state.locks === 0) {
      if (state.overflow)
        body.style.setProperty(
          'overflow',
          state.overflow,
          state.overflowPriority,
        );
      else body.style.removeProperty('overflow');
    }
  };
}

export function eventIsInside(
  event: Event,
  roots: readonly (HTMLElement | null | undefined)[],
): boolean {
  const path = event.composedPath?.() ?? [];
  return roots.some(
    (root) =>
      root &&
      (path.includes(root) ||
        (event.target != null && root.contains(event.target as Node))),
  );
}

/**
 * Capture phase also observes interactions inside consumers that stop bubbling events.
 *
 * Pointer-gesture triage: overlays opened from focus (combobox,
 * autocomplete) arm these listeners in the middle of a pointer gesture.
 * Once the detached backdrop paints, the release lands on it and the
 * closing `click` retargets to the nearest common ancestor of the press and
 * release targets — the native modal dialog, or the body. That completion
 * click is part of the gesture that OPENED the overlay, never an outside
 * dismissal, so a click is triaged by the press that started it: an
 * unobserved pointer press (detail > 0) is ignored, an observed press
 * inside the roots keeps the interaction, and keyboard- or
 * programmatic-generated activations (detail 0) keep the plain semantics.
 */
export function listenForOutsideInteraction(
  document: Document,
  roots: () => readonly (HTMLElement | null | undefined)[],
  onOutside: (event: MouseEvent) => void,
): () => void {
  let observedPointerDown = false;
  let pointerDownInside = false;
  const listener = (event: Event) => {
    if (event.type === 'pointerdown') {
      observedPointerDown = true;
      pointerDownInside = eventIsInside(event, roots());
      if (!pointerDownInside) onOutside(event as MouseEvent);
      return;
    }
    if (observedPointerDown) {
      if (!pointerDownInside && !eventIsInside(event, roots()))
        onOutside(event as MouseEvent);
      return;
    }
    const detail = (event as MouseEvent).detail;
    if (
      (detail === 0 || detail === undefined) &&
      !eventIsInside(event, roots())
    )
      onOutside(event as MouseEvent);
  };
  document.addEventListener('pointerdown', listener, true);
  document.addEventListener('click', listener, true);
  return () => {
    document.removeEventListener('pointerdown', listener, true);
    document.removeEventListener('click', listener, true);
  };
}

function isAvailableFocusTarget(element: HTMLElement): boolean {
  return (
    !element.matches(':disabled, [aria-disabled="true"]') &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
    element.getClientRects().length > 0 &&
    element.ownerDocument.defaultView?.getComputedStyle(element).visibility !==
      'hidden'
  );
}

export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex], [contenteditable="true"]',
    ),
  ).filter(
    (element) => element.tabIndex >= 0 && isAvailableFocusTarget(element),
  );
}

export function focusInitialElement(container: HTMLElement): void {
  const preferred = Array.from(
    container.querySelectorAll<HTMLElement>('[autofocus], [cdkFocusInitial]'),
  ).find(
    (element) =>
      (element.tabIndex >= 0 || element.hasAttribute('tabindex')) &&
      isAvailableFocusTarget(element),
  );
  (preferred ?? focusableElements(container)[0] ?? container).focus({
    preventScroll: true,
  });
}

export function trapTabKey(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab' || event.defaultPrevented || !isTopOverlay(container))
    return;
  const elements = focusableElements(container);
  const first = elements[0];
  const last = elements[elements.length - 1];
  const active = container.ownerDocument.activeElement;
  if (!first) {
    event.preventDefault();
    container.focus({ preventScroll: true });
  } else if (
    event.shiftKey &&
    (active === first || !elements.includes(active as HTMLElement))
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (active === last || !elements.includes(active as HTMLElement))
  ) {
    event.preventDefault();
    first.focus();
  }
}
