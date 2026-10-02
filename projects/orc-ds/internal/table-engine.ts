import { computed, Signal } from '@angular/core';

/**
 * Shared table engine.
 *
 * One signal-based data pipeline backs both surviving table contracts: the
 * generic typed table (`orc-table`, generic projection with dot-path field
 * resolution) and the record-based data table (`orc-data-table`, lightweight
 * `Record<string, unknown>` rows with direct property lookup). The public
 * contracts stay separate by design — see docs/quality/table-contract-audit.md
 * — while their filter, sort and paging state machines run through this
 * engine. Nothing here is a public component API.
 */

export type TableEngineSortDirection = 'asc' | 'desc' | 'none';

export type TableEngineFieldResolver<T> = (row: T, field: string) => unknown;

/**
 * Resolve a configured field for cells, sorting, filtering and IDs, falling
 * back to dot-path traversal for nested fields. The generic table contract.
 */
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

/**
 * Resolve a row cell by direct property lookup only. The record-based data
 * table contract: dotted keys match literal properties, never nested paths.
 */
export function tableProperty(row: unknown, key: string): unknown {
  if (row === null || typeof row !== 'object') return undefined;
  return (row as Record<string, unknown>)[key];
}

/** A positive integer, or the fallback when the value is not usable. */
export function positiveTableInteger(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? Math.floor(number) : fallback;
}

/** A zero-based page offset, or 0 when the value is not usable. */
export function tableOffset(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

/** Page count for a total, never below one so a page always exists. */
export function tablePageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/** Clamp a zero-based page into the valid page range. */
export function tableClampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(0, page), pageCount - 1);
}

/** The displayed window of a sorted result for one page. */
export function tablePageSlice<T>(
  rows: readonly T[],
  first: number,
  pageSize: number,
): T[] {
  return rows.slice(first, first + pageSize);
}

/** Trim a naming input and fall back when it is blank; `null` means unset. */
export function tableTrimmedLabel(
  value: string | null | undefined,
  fallback: string | null,
): string | null {
  return value?.trim() || fallback;
}

/**
 * One row's global-filter match: case-insensitive containment across the
 * candidate fields, resolved per contract. Blank fields fall back to the
 * row's own keys.
 */
export function tableRowMatchesFilter<T>(
  row: T,
  query: string,
  locale: string | undefined,
  fields: readonly string[],
  resolve: TableEngineFieldResolver<T>,
): boolean {
  return (fields.length ? fields : Object.keys((row ?? {}) as object)).some(
    (field) =>
      String(resolve(row, field) ?? '')
        .toLocaleLowerCase(locale)
        .includes(query),
  );
}

/** Filter rows against a prepared (trimmed, lowercased) query. */
export function tableFilterRows<T>(
  rows: readonly T[],
  query: string,
  locale: string | undefined,
  fieldsOf: (row: T) => readonly string[],
  resolve: TableEngineFieldResolver<T>,
): T[] {
  return rows.filter((row) =>
    tableRowMatchesFilter(row, query, locale, fieldsOf(row), resolve),
  );
}

/**
 * Type-aware comparator for the generic contract: strings through the locale
 * collator, numbers and dates natively, everything else through its string
 * form, with missing values sorting after present ones in both directions.
 */
export function tableValueComparator(
  collator: Intl.Collator,
): (a: unknown, b: unknown) => number {
  return (a, b) => {
    if (a === b) return 0;
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    if (typeof a === 'string' && typeof b === 'string') {
      return collator.compare(a, b);
    }
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    return collator.compare(String(a), String(b));
  };
}

/**
 * Text comparator for the record contract: both cells go through their
 * string form and numeric-aware base collation.
 */
export function tableTextComparator(
  locale?: string,
): (a: unknown, b: unknown) => number {
  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: 'base',
  });
  return (a, b) => collator.compare(String(a ?? ''), String(b ?? ''));
}

/** Sort a copy of the rows; inactive state returns the input untouched. */
export function tableSortRows<T>(
  rows: readonly T[],
  field: string,
  direction: TableEngineSortDirection,
  resolve: TableEngineFieldResolver<T>,
  compare: (a: unknown, b: unknown) => number,
): T[] {
  if (!field || direction === 'none') return rows as T[];
  const sorted = rows.slice();
  sorted.sort((a, b) => {
    const valueA = resolve(a, field);
    const valueB = resolve(b, field);
    if (valueA === valueB) return 0;
    if (valueA === null || valueA === undefined) return 1;
    if (valueB === null || valueB === undefined) return -1;
    const comparison = compare(valueA, valueB);
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

/**
 * The header-click sort cycle. A new column starts from the configured
 * default direction; an active column either walks asc → desc → none → asc
 * (`cycleThroughNone`, the generic tri-state contract) or flips asc ↔ desc
 * (the record contract).
 */
export function nextTableSortDirection(
  current: TableEngineSortDirection,
  sameColumn: boolean,
  options: { defaultDescending?: boolean; cycleThroughNone?: boolean } = {},
): TableEngineSortDirection {
  if (!sameColumn) return options.defaultDescending ? 'desc' : 'asc';
  if (current === 'asc') return 'desc';
  if (current === 'desc') return options.cycleThroughNone ? 'none' : 'asc';
  return 'asc';
}

/**
 * Stable identity for rows without a usable key value. A WeakMap keeps the
 * identity attached to the row object without serializing mutable row
 * contents or retaining rows after the table no longer references them.
 */
export class TableRowIdentityMap {
  private readonly identities = new WeakMap<object, string>();
  private nextIdentity = 0;

  constructor(private readonly prefix: string) {}

  identity(row: object): string {
    const existing = this.identities.get(row);
    if (existing) return existing;
    const identity = `\u0000${this.prefix}:${++this.nextIdentity}`;
    this.identities.set(row, identity);
    return identity;
  }
}

/**
 * The source → filter → sort → page pipeline both table contracts render
 * from. Every stage signal stays exported on the component so remote modes,
 * custom sorting and unpaginated displays reuse the same machine.
 */
export interface TableEnginePipelineConfig<T> {
  data: () => T[];
  /** Compatibility collection; it wins over `data` when bound. */
  value?: () => T[] | undefined;
  /** Server-owned data bypasses local filtering, sorting and slicing. */
  remote?: () => boolean;
  query?: () => string;
  locale?: () => string | undefined;
  /** Configured filter fields; rows fall back to their own keys. */
  fields?: () => readonly string[];
  resolve: TableEngineFieldResolver<T>;
  sort?: () => { field: string; direction: TableEngineSortDirection };
  /** Consumer-owned sorting skips the local sort stage entirely. */
  customSort?: () => boolean;
  compare?: (a: unknown, b: unknown) => number;
  paginated?: () => boolean;
  first?: () => number;
  pageSize?: () => number;
}

export interface TableEnginePipeline<T> {
  readonly source: Signal<T[]>;
  readonly filtered: Signal<T[]>;
  readonly sorted: Signal<T[]>;
  readonly display: Signal<T[]>;
}

export function createTableEnginePipeline<T>(
  config: TableEnginePipelineConfig<T>,
): TableEnginePipeline<T> {
  const source = computed(() => config.value?.() ?? config.data());
  const fieldsOf = (row: T): readonly string[] => {
    const configured = config.fields?.() ?? [];
    return configured.length ? configured : Object.keys((row ?? {}) as object);
  };
  const filtered = computed(() => {
    if (config.remote?.()) return source();
    const query = (config.query?.() ?? '')
      .trim()
      .toLocaleLowerCase(config.locale?.());
    if (!query) return source();
    return tableFilterRows(
      source(),
      query,
      config.locale?.(),
      fieldsOf,
      config.resolve,
    );
  });
  const sorted = computed(() => {
    if (config.remote?.() || config.customSort?.()) return filtered();
    const state = config.sort?.();
    if (!state || !state.field || state.direction === 'none') return filtered();
    return tableSortRows(
      filtered(),
      state.field,
      state.direction,
      config.resolve,
      config.compare ?? tableTextComparator(config.locale?.()),
    );
  });
  const display = computed(() => {
    if (config.remote?.() || !config.paginated?.()) return sorted();
    return tablePageSlice(
      sorted(),
      config.first?.() ?? 0,
      config.pageSize?.() ?? Number.MAX_SAFE_INTEGER,
    );
  });
  return { source, filtered, sorted, display };
}
