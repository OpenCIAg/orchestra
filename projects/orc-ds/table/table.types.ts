import { TemplateRef } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | 'none';

export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableSortEvent {
  column: string;
  direction: SortDirection;
}

export interface TableRowSelectEvent<T = any> {
  row: T;
  selected: boolean;
  selectedRows: T[];
}

export interface TableColumnConfig {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: ColumnAlign;
}

/** Controlled query emitted by `orc-table` in server-driven mode. */
export interface TableQuery {
  first: number;
  rows: number;
  sort?: { column: string; direction: SortDirection };
  filter?: string;
  filters: Record<string, unknown>;
}
