/**
 * Roving-focus helpers shared by the menu family (tiered menu, context
 * menu, mega menu, menubar). Each menu owns its item selector and its
 * data model; these helpers own the shared DOM contract: query enabled
 * items in DOM order, move focus by index, and step indexes with the
 * wrap-around (or clamped) arithmetic every menu uses.
 */

/** Enabled menu items for a roving-focus host, in DOM order. */
export function menuFocusTargets(
  host: HTMLElement | null | undefined,
  selector: string,
): HTMLElement[] {
  if (!host) return [];
  return Array.from(host.querySelectorAll<HTMLElement>(selector)).filter(
    (element) =>
      !element.matches(':disabled, [aria-disabled="true"]') &&
      element.getClientRects().length > 0,
  );
}

/** Focus the enabled menu item at `index`; a missing index focuses nothing. */
export function focusMenuTarget(
  host: HTMLElement | null | undefined,
  selector: string,
  index: number,
): void {
  menuFocusTargets(host, selector)[index]?.focus();
}

/**
 * Step a roving index by `delta`, wrapping around the ends (or clamping
 * when `wrap` is false). Empty item lists pin to zero.
 */
export function stepMenuIndex(
  index: number,
  delta: number,
  count: number,
  wrap = true,
): number {
  if (!count) return 0;
  if (wrap) return (index + delta + count) % count;
  return Math.max(0, Math.min(count - 1, index + delta));
}

/**
 * True when a focusin/focusout moved focus across the menu composite's
 * boundary — including the cases where the destination cannot be
 * determined (relatedTarget null or missing host). Menus use this to
 * emit focus/blur and dismiss submenus exactly once per crossing.
 */
export function crossedFocusBoundary(event: FocusEvent): boolean {
  const host = event.currentTarget as HTMLElement | null;
  const related = event.relatedTarget as Node | null;
  return !host || !related || !host.contains(related);
}
