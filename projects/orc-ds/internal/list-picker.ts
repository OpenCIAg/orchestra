import { TemplateRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayConfig, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  listenForOutsideInteraction,
  registerOverlay,
} from './overlay-lifecycle';

/**
 * Shared list-picker interaction core.
 *
 * One engine backs the surviving list-picker contracts — select (projected
 * and data modes), dropdown (menu and form modes), combobox, multi-select,
 * listbox and list — while every public component keeps its documented
 * contract. The deliberate divergences recorded in
 * docs/quality/library-scope-decisions.md are parameters of this engine,
 * not accidents to unify away: dropdown stays a flat action menu, select
 * keeps its dual projected/data modes and emits a single initial lazy
 * range, and listbox keeps its row-wise filter semantics (and its
 * no-interactive-descendants rule). Nothing here is a public component API.
 */

/**
 * Read a direct property of an option object; primitives read as
 * `undefined` so fallbacks apply uniformly. The select, multi-select and
 * listbox field contract.
 */
export function listPickerReadField(option: unknown, field: string): unknown {
  return option !== null && typeof option === 'object'
    ? (option as Record<string, unknown>)[field]
    : undefined;
}

/**
 * Read a (possibly dotted) property path of an option. The dropdown field
 * contract: `optionLabel="title.text"` resolves nested paths.
 */
export function listPickerReadFieldPath(
  option: unknown,
  path: string,
): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value !== null && typeof value === 'object'
          ? (value as Record<string, unknown>)[key]
          : undefined,
      option,
    );
}

export type ListPickerFieldReader = (option: unknown, field: string) => unknown;

/** The option's selection value: the configured field, else `value`, else the option itself. */
export function listPickerOptionValue(
  option: unknown,
  optionValue: string | undefined,
  read: ListPickerFieldReader = listPickerReadField,
): unknown {
  return optionValue
    ? read(option, optionValue)
    : (read(option, 'value') ?? option);
}

/** The option's display label: the configured field, else `label`, else the option itself. */
export function listPickerOptionLabel(
  option: unknown,
  optionLabel: string | undefined,
  read: ListPickerFieldReader = listPickerReadField,
): string {
  return String(
    optionLabel
      ? (read(option, optionLabel) ?? '')
      : (read(option, 'label') ?? option ?? ''),
  );
}

/**
 * Whether an option is disabled: a predicate rule wins, then the configured
 * field, then the option's own `disabled` property.
 */
export function listPickerOptionDisabled(
  option: unknown,
  optionDisabled: string | ((option: any) => boolean) | null | undefined,
  read: ListPickerFieldReader = listPickerReadField,
): boolean {
  if (typeof optionDisabled === 'function') return optionDisabled(option);
  return Boolean(
    optionDisabled ? read(option, optionDisabled) : read(option, 'disabled'),
  );
}

/**
 * Value identity across CVA writes and option candidates. The families
 * disagree deliberately about how `dataKey` applies:
 * - `extract` (select): extract each side's key when the side is an object
 *   holding it, primitives compare as themselves;
 * - `both-sides` (multi-select): compare by key only when BOTH sides resolve
 *   to a defined key, else strict equality;
 * - `objects` (listbox): compare by key only when BOTH sides are objects.
 */
export type ListPickerEquality = (left: unknown, right: unknown) => boolean;

export function listPickerEquality(
  dataKey: string | undefined,
  mode: 'extract' | 'both-sides' | 'objects',
): ListPickerEquality {
  if (!dataKey) return (left, right) => left === right;
  const forKey = (value: unknown): unknown =>
    value !== null && typeof value === 'object' && dataKey in (value as object)
      ? (value as Record<string, unknown>)[dataKey]
      : value;
  switch (mode) {
    case 'extract':
      return (left, right) => forKey(left) === forKey(right);
    case 'both-sides':
      return (left, right) => {
        const keyOf = (value: unknown): unknown =>
          value !== null && typeof value === 'object'
            ? (value as Record<string, unknown>)[dataKey]
            : undefined;
        const leftKey = keyOf(left);
        const rightKey = keyOf(right);
        if (leftKey !== undefined && rightKey !== undefined) {
          return leftKey === rightKey;
        }
        return left === right;
      };
    case 'objects':
      return (left, right) =>
        left !== null &&
        right !== null &&
        typeof left === 'object' &&
        typeof right === 'object'
          ? (left as Record<string, unknown>)[dataKey] ===
            (right as Record<string, unknown>)[dataKey]
          : left === right;
  }
}

/** The declared filter match modes shared by the picker family. */
export type ListPickerMatchMode =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | string;

/** Lowercase both sides under the configured locale before matching. */
function listPickerNormalized(value: unknown, locale: string | undefined): string {
  return String(value ?? '').toLocaleLowerCase(locale || undefined);
}

/** Numeric comparison backing the `lt`/`lte`/`gt`/`gte` modes; both sides must be numeric. */
function listPickerNumericMatch(
  value: unknown,
  term: string,
  compare: (left: number, right: number) => boolean,
): boolean {
  const numericValue = Number(value);
  const numericTerm = Number(term);
  return (
    Number.isFinite(numericValue) &&
    Number.isFinite(numericTerm) &&
    compare(numericValue, numericTerm)
  );
}

/**
 * One searchable value against the query. The value-level machine shared by
 * select, multi-select and dropdown (whose mode is always `contains`).
 */
export function listPickerValueMatchesFilter(
  value: unknown,
  term: string,
  matchMode: ListPickerMatchMode,
  locale?: string,
): boolean {
  const normalized = listPickerNormalized(value, locale);
  const query = listPickerNormalized(term, locale);
  switch (matchMode) {
    case 'startsWith':
      return normalized.startsWith(query);
    case 'endsWith':
      return normalized.endsWith(query);
    case 'equals':
      return normalized === query;
    case 'notEquals':
      return normalized !== query;
    case 'in':
      return query
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .includes(normalized);
    case 'lt':
      return listPickerNumericMatch(value, term, (l, r) => l < r);
    case 'lte':
      return listPickerNumericMatch(value, term, (l, r) => l <= r);
    case 'gt':
      return listPickerNumericMatch(value, term, (l, r) => l > r);
    case 'gte':
      return listPickerNumericMatch(value, term, (l, r) => l >= r);
    default:
      return normalized.includes(query);
  }
}

/**
 * One option's searchable values against the query. The row-level machine
 * is the listbox contract: `notEquals` matches only when NO value equals
 * the query (`some` would flip true on any differing field) and `in`
 * matches options whose field is itself a list containing the query.
 * Numeric modes consider only finite, non-empty values.
 */
export function listPickerRowMatchesFilter(
  values: readonly unknown[],
  term: string,
  matchMode: ListPickerMatchMode,
  locale?: string,
): boolean {
  const query = listPickerNormalized(term, locale);
  switch (matchMode) {
    case 'notEquals':
      return values.every(
        (value) => listPickerNormalized(value, locale) !== query,
      );
    case 'in':
      return values.some(
        (value) =>
          Array.isArray(value) &&
          value.some(
            (item) => listPickerNormalized(item, locale) === query,
          ),
      );
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      return values.some((value) =>
        value == null || value === ''
          ? false
          : listPickerNumericMatch(
              value,
              term,
              (left, right) =>
                matchMode === 'lt'
                  ? left < right
                  : matchMode === 'lte'
                    ? left <= right
                    : matchMode === 'gt'
                      ? left > right
                      : left >= right,
            ),
      );
    default:
      return values.some((value) =>
        listPickerValueMatchesFilter(value, term, matchMode, locale),
      );
  }
}

/**
 * The configured filter fields, falling back to the comma-separated
 * `filterBy` list. Shared resolution order: `filterFields` wins, else the
 * trimmed non-empty `filterBy` entries, else `undefined` (family default).
 */
export function listPickerFilterFields(
  filterFields: readonly string[] | undefined,
  filterBy: string | undefined,
): string[] | undefined {
  if (filterFields?.length) return [...filterFields];
  if (!filterBy) return undefined;
  const fields = filterBy
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
  return fields.length ? fields : undefined;
}

/**
 * Stringified values of an option's filter fields. Empty (no configured
 * fields) so the family falls back to its own searchable defaults — for
 * select/multi-select the missing fields stringify to `''`, which the
 * numeric modes read as `0` (their pinned contract); listbox feeds raw
 * values to the row machine instead.
 */
export function listPickerFieldValues(
  option: unknown,
  fields: readonly string[] | undefined,
  read: ListPickerFieldReader = listPickerReadField,
): string[] {
  return fields?.length
    ? fields.map((field) => String(read(option, field) ?? ''))
    : [];
}

/**
 * Enabled option indexes in display order — the roving space keyboard
 * navigation moves through.
 */
export function listPickerEnabledIndexes(
  count: number,
  isDisabled: (index: number) => boolean,
): number[] {
  const indexes: number[] = [];
  for (let index = 0; index < count; index += 1) {
    if (!isDisabled(index)) indexes.push(index);
  }
  return indexes;
}

/** The first enabled index, or −1 when every option is disabled. */
export function listPickerFirstEnabled(
  count: number,
  isDisabled: (index: number) => boolean,
): number {
  return listPickerEnabledIndexes(count, isDisabled)[0] ?? -1;
}

/**
 * Move the active index over enabled options. With no active option the
 * first step lands on the first (ArrowDown) or last (ArrowUp) enabled
 * entry; otherwise it wraps around the enabled ends, or clamps when
 * `clamp` is set (the combobox contract). Returns null when no option is
 * enabled — callers decide what that means for their active index.
 */
export function stepListPickerActive(
  currentIndex: number,
  delta: 1 | -1,
  enabled: readonly number[],
  clamp = false,
): number | null {
  if (!enabled.length) return null;
  const position = enabled.indexOf(currentIndex);
  if (position < 0) {
    return delta > 0 ? enabled[0] : enabled[enabled.length - 1];
  }
  if (clamp) {
    return enabled[Math.max(0, Math.min(enabled.length - 1, position + delta))];
  }
  return enabled[(position + delta + enabled.length) % enabled.length];
}

/**
 * Step the active index from wherever it is, wrapping and skipping
 * disabled options (the select data contract). A no-op when nothing is
 * enabled.
 */
export function listPickerSkipDisabled(
  currentIndex: number,
  delta: 1 | -1,
  count: number,
  isDisabled: (index: number) => boolean,
): number {
  if (!count) return currentIndex;
  let next = currentIndex;
  do {
    next = (next + delta + count) % count;
  } while (isDisabled(next));
  return next;
}

/**
 * The validated active option: the raw index only when it points at an
 * enabled option, else −1 (the combobox/listbox `activeOptionIndex`).
 */
export function listPickerActiveIndex(
  activeIndex: number,
  count: number,
  isDisabled: (index: number) => boolean,
): number {
  const inRange = activeIndex >= 0 && activeIndex < count;
  return inRange && !isDisabled(activeIndex) ? activeIndex : -1;
}

/** `aria-activedescendant` id for the active option, or null when none. */
export function listPickerActiveId(
  listboxId: string,
  index: number,
): string | null {
  return index >= 0 ? `${listboxId}-option-${index}` : null;
}

/**
 * The multiple-selection toggle. Returns the next array and whether the
 * candidate was added, or null when the selection limit blocks the add
 * (the multi-select contract: a blocked add is a silent no-op).
 */
export interface ListPickerToggle<T> {
  next: T[];
  added: boolean;
}

export function toggleListPickerValue<T>(
  current: readonly T[],
  candidate: T,
  equality: ListPickerEquality,
  limit?: number,
): ListPickerToggle<T> | null {
  const next = [...current];
  const index = next.findIndex((item) => equality(item, candidate));
  if (index >= 0) {
    next.splice(index, 1);
    return { next, added: false };
  }
  if (limit !== undefined && next.length >= limit) return null;
  next.push(candidate);
  return { next, added: true };
}

/**
 * The shared overlay open/close lifecycle for the detached pickers
 * (select, dropdown): transparent backdrop, reposition scroll strategy,
 * escape/backdrop/outside dismissal, overlay-layer registration and a
 * single idempotent dispose. Positioning, focus management and the
 * close-time emits stay with each family. Parent-layer closes surface
 * through `onParentClose`, distinct from escape's restore-focus contract.
 */
export interface ListPickerOverlayHandle {
  readonly overlayElement: HTMLElement | null;
  /** Tear down registrations and the overlay; safe to call twice. */
  dispose(): void;
}

export interface ListPickerOverlayConfig {
  anchor: HTMLElement;
  content: TemplateRef<unknown>;
  viewContainerRef: ViewContainerRef;
  overlay: Overlay;
  documentRef: Document;
  positionStrategy: (anchor: HTMLElement) => PositionStrategy;
  minWidth?: number;
  /** Applied as the layer z-index when set (select's autoZIndex math). */
  zIndex?: number;
  /** Escape on the overlay; preventDefault/stopPropagation already applied. */
  onEscape?: () => void;
  onBackdrop?: () => void;
  /** A parent overlay layer closed; families close without restoring focus. */
  onParentClose?: () => void;
  /** Interactions outside `targets`; select passes its composite-blur triage. */
  targets: () => HTMLElement[];
  onOutside?: (event: Event) => void;
  /** Runs after attach (families focus their filter/first item here). */
  onAttached?: (overlayElement: HTMLElement) => void;
}

export function attachListPickerOverlay(
  config: ListPickerOverlayConfig,
): ListPickerOverlayHandle | null {
  const portal = new TemplatePortal(config.content, config.viewContainerRef);
  const overlayConfig = new OverlayConfig({
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-transparent-backdrop',
    positionStrategy: config.positionStrategy(config.anchor),
    ...(config.minWidth !== undefined ? { minWidth: config.minWidth } : {}),
    scrollStrategy: config.overlay.scrollStrategies.reposition(),
  });
  const overlayRef = config.overlay.create(overlayConfig);
  if (config.zIndex !== undefined) {
    overlayRef.hostElement.style.zIndex = String(config.zIndex);
  }
  const backdropSubscription = overlayRef
    .backdropClick()
    .subscribe(() => config.onBackdrop?.());
  const keydownSubscription = overlayRef
    .keydownEvents()
    .subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        config.onEscape?.();
        event.stopPropagation();
      }
    });
  overlayRef.attach(portal);
  const layerCleanup = registerOverlay(overlayRef.overlayElement, {
    anchor: config.anchor,
    onParentClose: () => config.onParentClose?.(),
  });
  const outsideCleanup = listenForOutsideInteraction(
    config.documentRef,
    config.targets,
    (event) => config.onOutside?.(event),
  );
  config.onAttached?.(overlayRef.overlayElement);
  let disposed = false;
  return {
    get overlayElement(): HTMLElement | null {
      return disposed ? null : overlayRef.overlayElement;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      outsideCleanup();
      layerCleanup();
      backdropSubscription.unsubscribe();
      keydownSubscription.unsubscribe();
      overlayRef.dispose();
    },
  };
}
