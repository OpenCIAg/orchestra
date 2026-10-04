/** Nested interactive controls keep their own click and keyboard activation. */
const tableInteractiveRoles = new Set([
  'button',
  'checkbox',
  'combobox',
  'gridcell',
  'link',
  'listbox',
  'menuitem',
  'option',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
]);

export function isTableControlEvent(event: Event): boolean {
  const currentTarget = event.currentTarget;
  const ownerDocument =
    (currentTarget as { ownerDocument?: Document | null } | null)
      ?.ownerDocument ??
    (event.target as { ownerDocument?: Document | null } | null)
      ?.ownerDocument ??
    (typeof document !== 'undefined' ? document : null);
  const ElementConstructor = ownerDocument?.defaultView?.Element;
  const isElement = (candidate: unknown): candidate is Element =>
    !!ElementConstructor && candidate instanceof ElementConstructor;
  const path =
    typeof event.composedPath === 'function' ? event.composedPath() : [];
  const candidates = path.length
    ? path
    : isElement(event.target)
      ? [event.target]
      : [];

  for (const candidate of candidates) {
    if (candidate === currentTarget) break;
    if (!isElement(candidate)) continue;
    const role = candidate.getAttribute('role')?.toLowerCase();
    const tabIndex = candidate.getAttribute('tabindex');
    const focusable =
      tabIndex !== null &&
      Number.isInteger(Number(tabIndex)) &&
      Number(tabIndex) >= 0;
    if (
      candidate.matches(
        'button, a[href], input, select, textarea, summary, [contenteditable]:not([contenteditable="false"])',
      ) ||
      tableInteractiveRoles.has(role ?? '') ||
      focusable
    ) {
      return true;
    }
  }
  return false;
}
