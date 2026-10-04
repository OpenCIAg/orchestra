export interface OverlayLayer {
  element: HTMLElement;
  interactive: boolean;
}

interface ModalScope {
  element: HTMLElement;
  additionalRoots: readonly HTMLElement[];
}

/** Follow the rendered ancestry, including slotted content and shadow roots. */
function parentOf(node: Node): Node | null {
  if ('assignedSlot' in node && node.assignedSlot)
    return node.assignedSlot as HTMLSlotElement;
  if (node.parentNode) return node.parentNode;
  return node.nodeType === 11 && 'host' in node
    ? (node as ShadowRoot).host
    : null;
}

function contains(root: Node, child: Node): boolean {
  for (let node: Node | null = child; node; node = parentOf(node))
    if (node === root) return true;
  return false;
}

/** Own only the background branches outside the current modal and its later overlays. */
export function createModalIsolation(
  document: Document,
  getLayers: () => readonly OverlayLayer[],
) {
  let scopes: ModalScope[] = [];
  const managed = new Map<Element, string | null>();
  let observer: MutationObserver | undefined;

  function restore(element: Element, original: string | null): void {
    // Preserve a consumer's distinct attribute value if it changed while open.
    if (
      element.getAttribute('inert') !== '' &&
      element.getAttribute('inert') !== original
    )
      return;
    if (original === null) element.removeAttribute('inert');
    else element.setAttribute('inert', original);
  }

  function refresh(): void {
    const scope = scopes.filter((item) => item.element.isConnected).at(-1);
    const desired = new Set<Element>();
    if (scope && document.body) {
      const layers = getLayers();
      let index = layers.length - 1;
      while (index >= 0 && layers[index].element !== scope.element) index--;
      const later =
        index < 0 ? [] : layers.slice(index + 1).map((layer) => layer.element);
      const roots = [scope.element, ...scope.additionalRoots, ...later].filter(
        (element) => element.isConnected,
      );
      const shadowRoots = new Map<Element, ShadowRoot>();
      for (const root of roots) {
        for (let node: Node | null = root; node; node = parentOf(node)) {
          if (node.nodeType === 11 && 'host' in node) {
            const shadow = node as ShadowRoot;
            shadowRoots.set(shadow.host, shadow);
          }
        }
      }
      const visit = (container: ParentNode): void => {
        for (const child of Array.from(container.children)) {
          if (roots.some((root) => contains(root, child))) continue;
          if (roots.some((root) => contains(child, root))) {
            visit(child);
            const shadow = shadowRoots.get(child);
            if (shadow) visit(shadow);
          } else if (!child.matches('script, style, link, meta, template'))
            desired.add(child);
        }
      };
      visit(document.body);
      for (const shadow of shadowRoots.values())
        observer?.observe(shadow, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['inert'],
        });
    }

    if (!scopes.length) {
      observer?.disconnect();
      observer = undefined;
    }
    for (const [element, original] of managed) {
      if (!desired.has(element)) {
        restore(element, original);
        managed.delete(element);
      }
    }
    for (const element of desired) {
      if (!managed.has(element))
        managed.set(element, element.getAttribute('inert'));
      if (!element.hasAttribute('inert')) element.setAttribute('inert', '');
    }
  }

  function register(
    element: HTMLElement,
    additionalRoots: readonly HTMLElement[] = [],
  ): () => void {
    const scope = { element, additionalRoots };
    scopes.push(scope);
    const MutationObserverConstructor = document.defaultView?.MutationObserver;
    if (!observer && document.body && MutationObserverConstructor) {
      observer = new MutationObserverConstructor(refresh);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['inert'],
      });
    }
    refresh();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      scopes = scopes.filter((item) => item !== scope);
      refresh();
    };
  }

  return { register, refresh };
}
