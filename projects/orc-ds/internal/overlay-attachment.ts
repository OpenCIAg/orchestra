function parentElement(element: Element): Element | null {
  return (
    element.assignedSlot ??
    element.parentElement ??
    (element.getRootNode() as ShadowRoot).host ??
    null
  );
}

export function overlayContains(root: Element, child: Element): boolean {
  for (
    let current: Element | null = child;
    current;
    current = parentElement(current)
  )
    if (current === root) return true;
  return false;
}

/** Locate the native modal that owns an anchor, including anchors in shadow DOM. */
export function nativeModalFor(anchor: HTMLElement): HTMLDialogElement | null {
  let current: Element | null = anchor;
  while (current) {
    if (current.matches('dialog:modal')) return current as HTMLDialogElement;
    current = parentElement(current);
  }
  return null;
}

/** A popup must remain a descendant of its native modal to escape native inertness. */
export function overlayAttachmentTarget(
  anchor: HTMLElement,
  requested: unknown,
  fallback: HTMLElement = anchor,
): HTMLElement {
  const document = anchor.ownerDocument;
  const ownerHTMLElement = document.defaultView?.HTMLElement;
  let target = fallback;
  if (requested === 'body') target = document.body;
  else if (ownerHTMLElement && requested instanceof ownerHTMLElement)
    target = requested;
  else if (typeof requested === 'string' && requested !== 'self') {
    try {
      target = document.querySelector<HTMLElement>(requested) ?? fallback;
    } catch {
      // An invalid selector has the same fallback as a missing target.
    }
  }
  const modal = nativeModalFor(anchor);
  return modal && nativeModalFor(target) !== modal ? modal : target;
}
