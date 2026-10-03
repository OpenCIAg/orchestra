import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  Input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  createTableEnginePipeline,
  nextTableSortDirection,
  normalizeSize,
  tableClampPage,
  tableOffset,
  tablePageCount,
  tableProperty,
  tableSortRows,
  tableTextComparator,
  tableTrimmedLabel,
  TableRowIdentityMap,
  TableEnginePipeline,
  SizeInput,
} from '@ciag/orchestra/internal';
import { P2_SHARED_STYLES } from './p2-shared';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'orc-data-table',
  standalone: true,
  template: `
    <div
      class="orc-p2-data-table"
      [class]="'orc-p2-data-table ' + styleClass()"
      [class.row-hover]="rowHover()"
      [class.striped]="stripedRows()"
      [class.gridlines]="showGridlines()"
      [class.small]="resolvedSize() === 'sm'"
      [class.large]="resolvedSize() === 'lg'"
      [attr.aria-busy]="loading()"
    >
      @if (filterable()) {
        <input
          class="global-filter"
          [value]="filter()"
          [attr.placeholder]="filterPlaceholder()?.trim() || null"
          (input)="setFilter($any($event.target).value)"
          [attr.aria-label]="effectiveFilterAriaLabel()"
        />
      }
      <table
        [class]="'orc-p2-data-table__table ' + tableStyleClass()"
        [attr.aria-label]="effectiveTableAriaLabel()"
      >
        @if (effectiveLabel()) {
          <caption class="sr-only">
            {{
              effectiveLabel()
            }}
          </caption>
        }
        <thead>
          <tr>
            @if (selectionEnabled() && selectionMode() !== 'single') {
              <th scope="col">
                <input
                  type="checkbox"
                  [checked]="allSelected()"
                  [indeterminate]="someSelected()"
                  [attr.aria-label]="effectiveSelectAllAriaLabel()"
                  (change)="toggleAll($any($event.target).checked)"
                />
              </th>
            }
            @for (column of columns(); track column.key) {
              <th
                scope="col"
                [attr.aria-sort]="ariaSort(column.key)"
                [class.sortable]="column.sortable"
              >
                @if (column.sortable) {
                  <button
                    class="sort-button"
                    type="button"
                    (click)="sortBy(column)"
                  >
                    {{ column.header }}
                  </button>
                } @else {
                  {{ column.header }}
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading() && loadingMessage()) {
            <tr>
              <td
                class="empty"
                [attr.colspan]="
                  columns().length +
                  (selectionEnabled() && selectionMode() !== 'single' ? 1 : 0)
                "
              >
                {{ loadingMessage() }}
              </td>
            </tr>
          } @else if (!loading() && !filteredRows().length && emptyText()) {
            <tr>
              <td
                class="empty"
                [attr.colspan]="
                  columns().length +
                  (selectionEnabled() && selectionMode() !== 'single' ? 1 : 0)
                "
              >
                {{ emptyText() }}
              </td>
            </tr>
          } @else if (!loading()) {
            @for (row of pageRows(); track getRowId(row)) {
              <tr
                [class.selected]="isSelected(row)"
                tabindex="0"
                (click)="rowClick.emit(row)"
                (keydown)="onRowKeydown($event, row)"
                (mouseenter)="rowHover() && onRowHover.emit(row)"
              >
                @if (selectionEnabled()) {
                  <td (click)="$event.stopPropagation()">
                    <input
                      [type]="
                        selectionMode() === 'single' ? 'radio' : 'checkbox'
                      "
                      [attr.name]="
                        selectionMode() === 'single' ? selectionName : null
                      "
                      [checked]="isSelected(row)"
                      [attr.aria-label]="
                        effectiveRowAriaLabel()
                          ? effectiveRowAriaLabel() + ' ' + getRowId(row)
                          : 'Select row ' +
                            (getCell(row, dataKey() || rowKey()) ||
                              getRowId(row))
                      "
                      (change)="toggleRow(row, $any($event.target).checked)"
                    />
                  </td>
                }
                @for (column of columns(); track column.key) {
                  <td>{{ getCell(row, column.key) }}</td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
      @if (paginator() && pageCount() > 1) {
        <nav
          class="paginator"
          [attr.aria-label]="effectivePaginatorAriaLabel()"
        >
          <button
            type="button"
            [attr.aria-label]="effectivePreviousPageAriaLabel()"
            [disabled]="currentPage() === 0"
            (click)="goToPage(currentPage() - 1)"
          >
            ‹</button
          ><span aria-live="polite"
            >{{ currentPage() + 1 }} / {{ pageCount() }}</span
          ><button
            type="button"
            [attr.aria-label]="effectiveNextPageAriaLabel()"
            [disabled]="currentPage() + 1 >= pageCount()"
            (click)="goToPage(currentPage() + 1)"
          >
            ›
          </button>
        </nav>
      }
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-data-table { width: 100%; overflow: auto; border: 1px solid var(--orc-component-border); border-radius: .75rem; background: var(--orc-component-surface); } .global-filter { width: min(20rem, 100%); margin: .6rem; padding: .5rem .7rem; border: 1px solid var(--orc-component-border-strong); border-radius: .4rem; } table { width: 100%; border-collapse: collapse; color: var(--orc-component-text); } th, td { padding: .7rem .8rem; border-bottom: 1px solid var(--orc-component-border); text-align: left; } th { background: var(--orc-component-surface-subtle); font-size: .8rem; } .sort-button { border: 0; padding: 0; background: transparent; color: inherit; font: inherit; font-weight: inherit; text-align: inherit; cursor: pointer; } .sort-button:focus-visible, tbody tr:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: -2px; } .orc-p2-data-table tbody tr[tabindex="0"] { cursor: pointer; } tr.selected { background: var(--orc-component-interactive-soft); } .empty { padding: 2rem; text-align: center; color: var(--orc-component-text-muted); } .paginator { display:flex; align-items:center; justify-content:flex-end; gap:.6rem; padding:.5rem .7rem; } .paginator button { min-width:2rem; border:1px solid var(--orc-component-border-strong); border-radius:.35rem; background:var(--orc-component-surface); } .orc-p2-data-table.striped tbody tr:nth-child(even) { background: var(--orc-component-surface-subtle); } .orc-p2-data-table.row-hover tbody tr:hover { background: var(--orc-component-interactive-soft); cursor: pointer; } .orc-p2-data-table.gridlines th, .orc-p2-data-table.gridlines td { border-inline-end: 1px solid var(--orc-component-border); } .orc-p2-data-table.small th, .orc-p2-data-table.small td { padding: .4rem .55rem; font-size: .8rem; } .orc-p2-data-table.large th, .orc-p2-data-table.large td { padding: .9rem 1rem; } .orc-p2-data-table tbody tr.selected { background: var(--orc-component-interactive-soft); } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnInit {
  private static nextSelectionId = 0;
  readonly selectionName = `orc-data-table-selection-${++DataTableComponent.nextSelectionId}`;
  readonly data = input<Record<string, unknown>[]>([]);
  readonly value = input<Record<string, unknown>[] | undefined>(undefined);
  readonly columns = input<DataTableColumn[]>([]);
  readonly rowKey = input('id');
  readonly dataKey = input<string | undefined>(undefined);
  readonly first = model(0);
  readonly rowsInput = input<number | undefined>(undefined, { alias: 'rows' });
  readonly totalRecords = input<number | undefined>(undefined);
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(false, { transform: booleanAttribute });
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly showGridlines = input(false, { transform: booleanAttribute });
  /**
   * Visual size on the canonical `sm | md | lg` scale (`md` renders as the
   * default middle size). Deprecated legacy values (removed at the 23.0.0
   * gate): `small` → `sm`, `large` → `lg`.
   */
  readonly size = input<SizeInput>(undefined);
  /** Canonical form of the public `size` input (legacy aliases resolved). */
  readonly resolvedSize = computed(() => normalizeSize(this.size()));
  /** @deprecated Compatibility input; sorting is currently single-field only. */
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly selectionMode = input<'single' | 'multiple' | undefined>(undefined);
  /** @deprecated Compatibility input; row selection does not require modifier keys. */
  readonly metaKeySelection = input(false, { transform: booleanAttribute });
  readonly sortField = model<string>('');
  readonly sortOrder = model<number>(0);
  readonly styleClass = input('');
  readonly tableStyleClass = input('');
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly selectAllAriaLabel = input<string | undefined>(undefined);
  readonly rowAriaLabel = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly paginatorAriaLabel = input<string | undefined>(undefined);
  readonly previousPageAriaLabel = input<string | undefined>(undefined);
  readonly nextPageAriaLabel = input<string | undefined>(undefined);
  readonly filter = model('');
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly pageSize = input(10);
  readonly page = model(0);
  readonly selected = model<Record<string, unknown>[]>([]);
  readonly effectiveLabel = computed(() =>
    tableTrimmedLabel(this.label(), null),
  );
  readonly effectiveAriaLabel = computed(() =>
    tableTrimmedLabel(this.ariaLabel(), 'Data table'),
  );
  readonly effectiveTableAriaLabel = computed(() =>
    this.effectiveLabel() ? null : this.effectiveAriaLabel(),
  );
  readonly effectiveFilterAriaLabel = computed(() =>
    tableTrimmedLabel(this.filterAriaLabel(), 'Filter table'),
  );
  readonly effectiveSelectAllAriaLabel = computed(() =>
    tableTrimmedLabel(this.selectAllAriaLabel(), 'Select all rows'),
  );
  readonly effectiveRowAriaLabel = computed(() =>
    tableTrimmedLabel(this.rowAriaLabel(), null),
  );
  readonly effectivePaginatorAriaLabel = computed(() =>
    tableTrimmedLabel(this.paginatorAriaLabel(), 'Pagination'),
  );
  readonly effectivePreviousPageAriaLabel = computed(() =>
    tableTrimmedLabel(this.previousPageAriaLabel(), 'Previous page'),
  );
  readonly effectiveNextPageAriaLabel = computed(() =>
    tableTrimmedLabel(this.nextPageAriaLabel(), 'Next page'),
  );
  @Input('selection') set selectionAlias(value: Record<string, unknown>[]) {
    this.selected.set(value ?? []);
  }
  readonly sortKey = signal('');
  readonly sortDirection = signal<'ascending' | 'descending'>('ascending');
  readonly selectionEnabled = computed(
    () => this.selectable() || !!this.selectionMode(),
  );
  readonly rowClick = output<Record<string, unknown>>();
  readonly selectionChange = output<Record<string, unknown>[]>();
  readonly sortChange = output<{
    key: string;
    direction: 'ascending' | 'descending';
  }>();
  readonly onSort = output<{
    key: string;
    direction: 'ascending' | 'descending';
  }>();
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();
  readonly rowSelect = output<Record<string, unknown>>();
  readonly rowUnselect = output<Record<string, unknown>>();
  readonly onRowHover = output<Record<string, unknown>>();
  readonly onFilter = output<{ value: string }>();
  readonly onHeaderCheckboxToggle = output<{ checked: boolean }>();

  private readonly rowComparator = tableTextComparator();
  /**
   * The shared table engine runs the filter → sort → page pipeline for this
   * table; the record contract resolves cells by direct property lookup and
   * sorts through numeric-aware text collation.
   */
  private readonly engine: TableEnginePipeline<Record<string, unknown>> =
    createTableEnginePipeline<Record<string, unknown>>({
      data: () => this.data(),
      value: () => this.value(),
      query: () => this.filter(),
      fields: () => [],
      resolve: tableProperty,
      sort: () => ({
        field: this.sortField() || this.sortKey(),
        direction:
          this.sortOrder() < 0 || this.sortDirection() === 'descending'
            ? 'desc'
            : 'asc',
      }),
      compare: this.rowComparator,
      paginated: () => !!this.paginator() && !this.lazy(),
      first: () => this.currentPage() * this.effectivePageSize(),
      pageSize: () => this.effectivePageSize(),
    });
  /**
   * Rows without a configured key still need a stable identity for
   * Angular's `@for` tracking and for selection membership; the shared
   * identity map keeps it attached to the row object.
   */
  private readonly rowIdentities = new TableRowIdentityMap(
    'orc-data-table-row',
  );
  private lastSyncedFirst = 0;
  private lastSyncedPage = 0;
  private lastSyncedPageSize = 10;
  private paginationSyncInitialized = false;

  constructor() {
    effect(() => {
      const rawFirst = Number(this.first());
      const first = tableOffset(rawFirst);
      if (rawFirst !== first) this.first.set(first);
      const rawPage = Number(this.page());
      const page = this.currentPage();
      if (rawPage !== page) this.page.set(page);
      const size = this.effectivePageSize();
      if (!this.paginationSyncInitialized) {
        this.paginationSyncInitialized = true;
        if (first !== page * size) {
          if (first > 0 || page === 0) this.page.set(Math.floor(first / size));
          else this.first.set(page * size);
        }
      } else {
        const firstChanged = first !== this.lastSyncedFirst;
        const pageChanged = page !== this.lastSyncedPage;
        const sizeChanged = size !== this.lastSyncedPageSize;
        if (firstChanged && !pageChanged)
          this.page.set(Math.floor(first / size));
        else if (pageChanged && !firstChanged) this.first.set(page * size);
        else if (sizeChanged && !firstChanged && !pageChanged)
          this.first.set(page * size);
        else if (firstChanged && pageChanged && first !== page * size)
          this.page.set(Math.floor(first / size));
      }
      this.lastSyncedFirst = Math.max(0, this.first());
      this.lastSyncedPage = Math.max(0, Math.floor(this.page()));
      this.lastSyncedPageSize = size;
    });
  }

  ngOnInit(): void {
    if (this.lazy() && this.lazyLoadOnInit())
      this.onLazyLoad.emit({
        first: this.first(),
        rows: this.effectivePageSize(),
      });
  }

  onRowKeydown(event: KeyboardEvent, row: Record<string, unknown>): void {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.rowClick.emit(row);
  }

  /** Sorted source rows; the record contract sorts before filtering. */
  readonly rows = computed(() =>
    tableSortRows(
      this.engine.source(),
      this.sortField() || this.sortKey(),
      this.sortOrder() < 0 || this.sortDirection() === 'descending'
        ? 'desc'
        : 'asc',
      tableProperty,
      this.rowComparator,
    ),
  );
  readonly filteredRows = this.engine.sorted;
  readonly effectivePageSize = computed(() => {
    const configured = Number(this.rowsInput() ?? this.pageSize());
    return Number.isFinite(configured)
      ? Math.max(1, Math.floor(configured))
      : 10;
  });
  readonly pageCount = computed(() =>
    tablePageCount(this.effectiveTotalRecords(), this.effectivePageSize()),
  );
  readonly currentPage = computed(() =>
    tableClampPage(tableOffset(this.page()), this.pageCount()),
  );
  readonly pageRows = this.engine.display;
  ariaSort(key: string): 'ascending' | 'descending' | null {
    if ((this.sortField() || this.sortKey()) !== key) return null;
    return this.sortOrder() < 0 || this.sortDirection() === 'descending'
      ? 'descending'
      : 'ascending';
  }
  effectiveTotalRecords(): number {
    const total = this.lazy()
      ? (this.totalRecords() ?? this.filteredRows().length)
      : this.filteredRows().length;
    return Number.isFinite(total)
      ? Math.max(0, total)
      : this.filteredRows().length;
  }
  readonly allSelected = computed(
    () =>
      !!this.pageRows().length &&
      this.pageRows().every((row) => this.isSelected(row)),
  );
  readonly someSelected = computed(
    () =>
      this.pageRows().some((row) => this.isSelected(row)) &&
      !this.allSelected(),
  );

  getRowId(row: Record<string, unknown>): string {
    const value = tableProperty(row, this.dataKey() || this.rowKey());
    if (value !== null && value !== undefined) return String(value);
    return this.rowIdentities.identity(row);
  }
  getCell(row: Record<string, unknown>, key: string): unknown {
    return tableProperty(row, key) ?? '';
  }
  isSelected(row: Record<string, unknown>): boolean {
    return this.selected().some(
      (item) => this.getRowId(item) === this.getRowId(row),
    );
  }
  setFilter(value: string): void {
    this.filter.set(value);
    this.page.set(0);
    this.first.set(0);
    this.onFilter.emit({ value });
  }
  toggleRow(row: Record<string, unknown>, checked: boolean): void {
    const previous = this.selected();
    const next =
      this.selectionMode() === 'single'
        ? []
        : previous.filter((item) => this.getRowId(item) !== this.getRowId(row));
    if (checked) next.push(row);
    this.selected.set(next);
    this.selectionChange.emit(next);
    for (const item of previous) {
      if (
        !next.some(
          (selected) => this.getRowId(selected) === this.getRowId(item),
        )
      )
        this.rowUnselect.emit(item);
    }
    if (checked) this.rowSelect.emit(row);
  }
  toggleAll(checked: boolean): void {
    const current = this.selected().filter(
      (row) =>
        !this.pageRows().some(
          (pageRow) => this.getRowId(pageRow) === this.getRowId(row),
        ),
    );
    const next = checked ? [...current, ...this.pageRows()] : current;
    this.selected.set(next);
    this.selectionChange.emit(next);
    this.onHeaderCheckboxToggle.emit({ checked });
  }
  sortBy(column: DataTableColumn): void {
    if (!column.sortable) return;
    const activeSortKey = this.sortField() || this.sortKey();
    const currentDirection: 'asc' | 'desc' =
      this.sortOrder() < 0 || this.sortDirection() === 'descending'
        ? 'desc'
        : 'asc';
    const ascending =
      nextTableSortDirection(currentDirection, activeSortKey === column.key, {
        cycleThroughNone: false,
      }) === 'asc';
    this.sortKey.set(column.key);
    this.sortField.set(column.key);
    this.sortOrder.set(ascending ? 1 : -1);
    this.sortDirection.set(ascending ? 'ascending' : 'descending');
    if (this.paginator()) {
      this.page.set(0);
      this.first.set(0);
    }
    const event: { key: string; direction: 'ascending' | 'descending' } = {
      key: column.key,
      direction: ascending ? 'ascending' : 'descending',
    };
    this.sortChange.emit(event);
    this.onSort.emit(event);
  }
  goToPage(page: number): void {
    const size = this.effectivePageSize();
    const next = tableClampPage(tableOffset(page), this.pageCount());
    this.page.set(next);
    this.first.set(next * size);
    this.onPage.emit({ first: this.first(), rows: size });
    if (this.lazy()) this.onLazyLoad.emit({ first: this.first(), rows: size });
  }
}
