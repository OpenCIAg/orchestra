import { overlayAttachmentTarget } from './overlay-attachment';
import { positionOverlayPanel } from './overlay-position';

/**
 * Attach an already-rendered popup without losing its Angular view ownership.
 * Native popovers escape clipping while retaining inherited styles and dialog
 * ancestry. The fallback portals to the document (or owning native dialog).
 * Consumers constrain their content with the available-width/height variables.
 */
export function attachAnchoredPopup(
  anchor: HTMLElement,
  panel: HTMLElement,
  appendTo?: unknown,
): () => void {
  const document = anchor.ownerDocument;
  const view = document.defaultView;
  const parent = panel.parentElement;
  if (!view || !parent || !panel.isConnected) return () => {};

  const nextSibling = panel.nextSibling;
  const native = typeof panel.showPopover === 'function';
  const target = overlayAttachmentTarget(
    anchor,
    appendTo,
    native ? parent : document.body,
  );
  const properties = [
    'position',
    'inset',
    'left',
    'top',
    'margin',
    '--orc-popup-available-width',
    '--orc-popup-available-height',
  ];
  const original = properties.map((name) => ({
    name,
    value: panel.style.getPropertyValue(name),
    priority: panel.style.getPropertyPriority(name),
  }));
  if (target !== parent) target.appendChild(panel);
  // A document-level portal is positioned in viewport coordinates. Keeping it
  // fixed avoids translating through the scrolling body (whose offset origin
  // differs across browsers and can be affected by document scrolling).
  const viewportAttached = native || target === document.body;
  panel.style.position = viewportAttached ? 'fixed' : 'absolute';
  panel.style.inset = 'auto';
  panel.style.margin = '0';
  if (native) {
    panel.setAttribute('popover', 'manual');
    panel.showPopover();
  }

  let frame = 0;
  let disposed = false;
  const position = () => {
    frame = 0;
    if (disposed || !panel.isConnected || !anchor.isConnected) return;
    const viewport = view.visualViewport;
    const width = Math.min(
      viewport?.width ?? view.innerWidth,
      document.documentElement.clientWidth || view.innerWidth,
    );
    const height = viewport?.height ?? view.innerHeight;
    const offsetLeft = viewport?.offsetLeft ?? 0;
    const offsetTop = viewport?.offsetTop ?? 0;
    const rect = anchor.getBoundingClientRect();
    const availableHeight = Math.max(
      rect.top - offsetTop - 16,
      height - (rect.bottom - offsetTop) - 16,
    );
    panel.style.setProperty(
      '--orc-popup-available-width',
      `${Math.max(0, width - 16)}px`,
    );
    panel.style.setProperty(
      '--orc-popup-available-height',
      `${Math.max(0, Math.min(height - 16, availableHeight))}px`,
    );
    const result = positionOverlayPanel(
      {
        left: rect.left - offsetLeft,
        right: rect.right - offsetLeft,
        top: rect.top - offsetTop,
        bottom: rect.bottom - offsetTop,
        width: rect.width,
        height: rect.height,
      },
      panel.getBoundingClientRect(),
      { width, height },
      'bottom',
      'start',
      view.getComputedStyle(anchor).direction === 'rtl',
    );
    let left = result.left + offsetLeft;
    let top = result.top + offsetTop;
    if (!native && target === document.body) {
      left += offsetLeft;
      top += offsetTop;
    } else if (!native) {
      const offsetParent = panel.offsetParent as HTMLElement | null;
      if (
        offsetParent &&
        view.getComputedStyle(offsetParent).position !== 'static'
      ) {
        const bounds = offsetParent.getBoundingClientRect();
        left += offsetParent.scrollLeft - bounds.left - offsetParent.clientLeft;
        top += offsetParent.scrollTop - bounds.top - offsetParent.clientTop;
      } else {
        left += view.scrollX;
        top += view.scrollY;
      }
    }
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  };
  const schedule = () => {
    if (!disposed && !frame) frame = view.requestAnimationFrame(position);
  };
  position();
  const ResizeObserverConstructor = view.ResizeObserver;
  const observer = ResizeObserverConstructor
    ? new ResizeObserverConstructor(schedule)
    : null;
  observer?.observe(anchor);
  observer?.observe(panel);
  view.addEventListener('resize', schedule);
  document.addEventListener('scroll', schedule, true);
  view.visualViewport?.addEventListener('resize', schedule);
  view.visualViewport?.addEventListener('scroll', schedule);

  return () => {
    disposed = true;
    if (frame) view.cancelAnimationFrame(frame);
    observer?.disconnect();
    view.removeEventListener('resize', schedule);
    document.removeEventListener('scroll', schedule, true);
    view.visualViewport?.removeEventListener('resize', schedule);
    view.visualViewport?.removeEventListener('scroll', schedule);
    if (native) {
      if (panel.isConnected && panel.matches(':popover-open'))
        panel.hidePopover();
      panel.removeAttribute('popover');
    }
    for (const { name, value, priority } of original) {
      if (value) panel.style.setProperty(name, value, priority);
      else panel.style.removeProperty(name);
    }
    if (target !== parent && panel.isConnected) {
      if (parent.isConnected)
        parent.insertBefore(
          panel,
          nextSibling?.parentNode === parent ? nextSibling : null,
        );
      else panel.remove();
    }
  };
}
