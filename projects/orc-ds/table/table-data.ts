/** Resolve a configured field consistently for cells, sorting, filtering and IDs. */
export function tableField(row: unknown, field: string): unknown {
  if (row === null || typeof row !== 'object') return undefined;
  const record = row as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, field)) return record[field];
  return field
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value !== null && typeof value === 'object'
          ? (value as Record<string, unknown>)[key]
          : undefined,
      row,
    );
}

export function positiveTableInteger(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? Math.floor(number) : fallback;
}

export function tableOffset(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

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
