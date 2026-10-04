import {
  isTopOverlay,
  listenForOutsideInteraction,
  registerOverlay,
} from './overlay-lifecycle';

/**
 * The shared open/close lifecycle for the in-place pickers (multi-select,
 * combobox, tree-select — the `@if (open())` panels that render in place
 * instead of through a CDK overlay).
 *
 * One seam packages what `attachListPickerOverlay` packages for the
 * detached pickers, adapted to in-place rendering: participation in the
 * overlay-layer registry (`registerOverlay`, so parent-overlay closes
 * cascade and Escape arbitration sees the panel), topmost-aware Escape and
 * outside-interaction dismissal, and a single idempotent dispose. The
 * close-time contracts — event emits, filter resets, focus restore, touched
 * marking — stay with each component through the callbacks.
 *
 * Attachment is synchronous on the caller's open path and binds to
 * `host.ownerDocument` (the realm the component actually renders in, even
 * when adopted into an iframe), so dismissal works without waiting for a
 * change-detection cycle. The panel is resolved lazily at event time: while
 * the panel is not yet rendered, any outside interaction dismisses — the
 * host alone cannot be the click target of an inside interaction.
 */

export interface InPlaceOverlayConfig {
  /** The always-rendered trigger host; interactions inside it keep the panel open. */
  host: HTMLElement;
  /**
   * The panel element, or a resolver for it. A resolver lets the component
   * attach before the panel's render cycle has placed the element.
   */
  panel: HTMLElement | (() => HTMLElement | null);
  /** Defaults to `host.ownerDocument` — almost always the right realm. */
  documentRef?: Document;
  /**
   * Escape reached the document while this panel is the topmost layer. The
   * event is already default-prevented (so a native-dialog parent does not
   * also treat it as its own dismissal).
   */
  onEscape?: () => void;
  /** A pointer interaction landed outside host and panel while topmost. */
  onOutside?: (event: MouseEvent) => void;
  /** A parent overlay layer closed and this panel must close with it. */
  onParentClose?: () => void;
}

export interface InPlaceOverlayHandle {
  /** Release the registrations; safe to call twice. */
  dispose(): void;
}

export function attachInPlaceOverlay(
  config: InPlaceOverlayConfig,
): InPlaceOverlayHandle {
  const resolvePanel = (): HTMLElement | null =>
    typeof config.panel === 'function' ? config.panel() : config.panel;
  const documentRef = config.documentRef ?? config.host.ownerDocument;
  const layerCleanup = registerOverlay(config.host, {
    anchor: config.host,
    onParentClose: () => config.onParentClose?.(),
  });
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.key !== 'Escape') return;
    if (!isTopOverlay(config.host)) return;
    event.preventDefault();
    config.onEscape?.();
  };
  documentRef.addEventListener('keydown', keydown);
  const outsideCleanup = listenForOutsideInteraction(
    documentRef,
    () => {
      const panel = resolvePanel();
      return panel ? [config.host, panel] : [config.host];
    },
    (event) => {
      if (isTopOverlay(config.host)) config.onOutside?.(event);
    },
  );
  let disposed = false;
  return {
    dispose(): void {
      if (disposed) return;
      disposed = true;
      documentRef.removeEventListener('keydown', keydown);
      outsideCleanup();
      layerCleanup();
    },
  };
}
