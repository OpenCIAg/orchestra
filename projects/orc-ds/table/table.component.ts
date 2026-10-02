import {
  Component,
  forwardRef,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  contentChildren,
  contentChild,
  booleanAttribute,
  ElementRef,
  inject,
  linkedSignal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CheckboxComponent,
  CheckboxChangeEvent,
} from '@ciag/orchestra/checkbox';
import { PaginatorComponent } from '@ciag/orchestra/paginator';
import { SkeletonComponent } from '@ciag/orchestra/skeleton';
import { ColumnDirective } from './table-column.directive';
import {
  SortDirection,
  TableSortEvent,
  TableColumnConfig,
} from './table.types';
import {
  TableFooterDirective,
  TableRowExpansionDirective,
} from './table-slots.directive';
import {
  CellDefDirective,
  HeaderCellDefDirective,
} from './table-cell-def.directive';
import { isTableControlEvent } from './table-data';
import {
  createTableEnginePipeline,
  nextTableSortDirection,
  positiveTableInteger,
  tableField,
  tableOffset,
  tableTrimmedLabel,
  tableValueComparator,
  TableEnginePipeline,
} from '@ciag/orchestra/internal';
import { buildTableCsv } from './table-csv';
import { tableDeepSelectionKey } from './table-selection';

interface TableColumnView {
  key(): string;
  header(): string;
  sortable(): boolean;
  width(): string;
  align(): 'left' | 'center' | 'right';
  cellTemplate(): CellDefDirective | undefined;
  headerTemplate(): HeaderCellDefDirective | undefined;
}

interface TablePageChangeEvent {
  page: number;
  pageSize: number;
  startIndex: number;
}

@Component({
  selector: 'orc-table',
  standalone: true,
  imports: [
    CommonModule,
    forwardRef(() => CheckboxComponent),
    forwardRef(() => PaginatorComponent),
    forwardRef(() => SkeletonComponent),
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T = any> implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // ── Inputs de Dados e Configuração ────────────────────────
  /** Dados a serem exibidos na tabela */
  readonly data = input<T[]>([]);
  readonly value = input<T[] | undefined>(undefined);
  /** @deprecated Frozen columns are retained for compatibility; this table has no frozen-pane renderer. */
  readonly frozenColumns = input<any[] | undefined>(undefined);
  /** @deprecated Frozen values are retained for compatibility; this table renders one data collection. */
  readonly frozenValue = input<T[] | undefined>(undefined);

  /** Configuração direta de colunas (alternativa ao uso de <orc-column>) */
  readonly columnsConfig = input<TableColumnConfig[] | undefined>(undefined);

  /** Propriedade identificadora única de cada linha (padrão: 'id') */
  readonly rowKey = input<string>('id');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly selectAllAriaLabel = input<string | undefined>(undefined);
  readonly rowAriaLabel = input<string | undefined>(undefined);

  // ── Seleção de Linhas ─────────────────────────────────────
  /** Habilita seleção de linhas com checkbox na primeira coluna */
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<'single' | 'multiple' | undefined>(undefined);

  /** Linhas selecionadas (Two-Way Binding) */
  readonly selectedRows = model<T[]>([]);

  /** Evento emitido quando a seleção muda */
  readonly selectionChange = output<T[]>();
  readonly rowSelect = output<{ data: T }>();
  readonly rowUnselect = output<{ data: T }>();
  readonly onRowSelect = output<{ data: T }>();
  readonly onRowUnselect = output<{ data: T }>();
  readonly selectAllChange = output<{ checked: boolean; data: T[] }>();

  // ── Ordenação ─────────────────────────────────────────────
  /** Chave da coluna ordenada atualmente */
  readonly sortColumn = model<string>('');

  /** Direção da ordenação atual: 'asc' | 'desc' | 'none' */
  readonly sortDirection = model<SortDirection>('none');
  readonly sortField = model<string>('', { alias: 'sortField' });
  readonly sortOrder = model<number>(0, { alias: 'sortOrder' });
  readonly sorting = linkedSignal({
    source: () => ({
      column: this.sortColumn(),
      direction: this.sortDirection(),
      field: this.sortField(),
      order: this.sortOrder(),
    }),
    computation: (source, previous): TableSortEvent => {
      const useAlias = previous
        ? source.field !== previous.source.field ||
          source.order !== previous.source.order
        : !!source.field || source.order !== 0;
      return useAlias
        ? {
            column: source.field,
            direction:
              source.order > 0 ? 'asc' : source.order < 0 ? 'desc' : 'none',
          }
        : { column: source.column, direction: source.direction };
    },
  });

  /** Evento emitido quando o usuário clica para ordenar uma coluna */
  readonly sortChange = output<TableSortEvent>();
  readonly onSort = output<TableSortEvent>();

  // ── Estilos e Variantes Visuais (Figma Spec) ───────────────
  /** Linhas zebradas alternadas */
  readonly striped = input(false, { transform: booleanAttribute });

  /** Bordas ao redor da tabela e células */
  readonly bordered = input(true, { transform: booleanAttribute });

  /** Realce visual no hover sobre as linhas */
  readonly hoverable = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly tableStyleClass = input('');
  readonly tableStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly showGridlines = input(false, { transform: booleanAttribute });
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly size = input<'small' | 'large' | undefined>(undefined);
  /** @deprecated Responsive stack rendering is not implemented; the table remains in scroll layout. */
  readonly responsiveLayout = input('scroll');
  /** @deprecated Responsive breakpoint switching is not implemented. */
  readonly breakpoint = input('960px');
  /** @deprecated Table layout is fixed by the component stylesheet. */
  readonly autoLayout = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
  /** @deprecated Only the wrapper's existing horizontal overflow behavior is supported. */
  readonly scrollDirection = input<'vertical' | 'horizontal' | 'both'>(
    'vertical',
  );
  readonly scrollHeight = input<string | undefined>(undefined);
  /** @deprecated Virtual row-window rendering is not implemented. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Virtual row-window rendering is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  /** @deprecated Virtual row-window rendering is not implemented. */
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  /** @deprecated Column resize handles and outputs are not implemented. */
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  /** @deprecated Column drag reorder is not implemented. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  readonly customSort = input(false, { transform: booleanAttribute });
  readonly showInitialSortBadge = input(true, { transform: booleanAttribute });
  readonly exportFilename = input('download');
  readonly csvSeparator = input(',');
  readonly exportHeader = input<string | undefined>(undefined);
  /** @deprecated Table state persistence is not implemented. */
  readonly stateKey = input<string | undefined>(undefined);
  /** @deprecated Table state persistence is not implemented. */
  readonly stateStorage = input<'session' | 'local'>('session');
  /** @deprecated Row/cell editing templates and actions are not implemented. */
  readonly editMode = input<'cell' | 'row'>('row');
  readonly rowExpandMode = input<'multiple' | 'single'>('multiple');
  /** @deprecated Row grouping is not implemented. */
  readonly groupRowsBy = input<any>(undefined);
  /** @deprecated Row grouping is not implemented. */
  readonly rowGroupMode = input<'subheader' | 'rowspan' | undefined>(undefined);
  readonly rowTrackBy = input<((index: number, row: T) => unknown) | undefined>(
    undefined,
  );
  /** @deprecated Context-menu integration has no internal update path. */
  readonly contextMenuSelection = model<T | null>(null);
  /** @deprecated Context-menu integration is not implemented. */
  readonly contextMenuSelectionMode = input<'separate' | 'joint'>('separate');
  readonly filters = input<Record<string, unknown>>({});
  /** Consumer owns fetching, filtering and paging; the table only emits queries. */
  readonly serverDriven = input(false, { transform: booleanAttribute });
  readonly queryChange = output<import('./table.types').TableQuery>();
  /** @deprecated Filtering is applied synchronously; delayed filtering is not implemented. */
  readonly filterDelay = input(300);
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly filter = model('');
  readonly globalFilterFields = input<string[]>([]);
  readonly onFilter = output<{ value: string }>();

  // ── Estados de Carregamento e Vazio ───────────────────────
  /** Exibe estado de carregamento com Skeletons */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Quantidade de linhas skeleton a renderizar durante loading */
  readonly loadingRowsCount = input<number>(5);

  /** Título principal do estado vazio */
  readonly emptyTitle = input<string | undefined>('Nenhum dado encontrado');

  /** Mensagem descritiva do estado vazio */
  readonly emptyMessage = input<string | undefined>(undefined);

  // ── Paginação Integrada ────────────────────────────────────
  /** Habilita rodapé com PaginatorComponent integrado */
  readonly paginated = input(false, { transform: booleanAttribute });
  readonly paginator = input(false, {
    alias: 'paginator',
    transform: booleanAttribute,
  });

  /** Quantidade de itens por página (Two-Way Binding) */
  readonly pageSize = model<number>(5);
  readonly rowsInput = input<number | undefined>(undefined, { alias: 'rows' });
  readonly first = model(0, { alias: 'first' });

  /** Página atual (1-indexed, Two-Way Binding) */
  readonly currentPage = model<number>(1);

  /** Total de itens para paginação do lado do servidor (se omitido, usa data().length) */
  readonly totalItems = input<number | undefined>(undefined);
  readonly totalRecords = input<number | undefined>(undefined, {
    alias: 'totalRecords',
  });

  /** Opções de tamanho de página */
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined, {
    alias: 'rowsPerPageOptions',
  });
  readonly pageLinks = input(5);
  readonly alwaysShowPaginator = input(true, { transform: booleanAttribute });
  readonly paginatorPosition = input<'top' | 'bottom' | 'both'>('bottom');
  readonly paginatorStyleClass = input('');
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showCurrentPageReport = input(false, {
    transform: booleanAttribute,
  });
  readonly showJumpToPageDropdown = input(false, {
    transform: booleanAttribute,
  });
  readonly showJumpToPageInput = input(false, { transform: booleanAttribute });
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(true, { transform: booleanAttribute });
  /** @deprecated Selection does not require modifier-key gestures. */
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly selectionPageOnly = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string | undefined>(undefined);
  readonly rowSelectable = input<
    ((row: { data: T; index: number }) => boolean) | undefined
  >(undefined);
  /** @deprecated The integrated paginator does not portal its option menu. */
  readonly paginatorDropdownAppendTo = input<unknown>(undefined);
  /** @deprecated The integrated paginator does not expose a dropdown scroll-height hook. */
  readonly paginatorDropdownScrollHeight = input('400px');
  /** @deprecated Virtual scrolling is not implemented. */
  readonly virtualScrollDelay = input(0);
  /** @deprecated Context-menu integration is not implemented. */
  readonly contextMenu = input<unknown>(undefined);
  readonly defaultSortOrder = input(1);
  /** @deprecated Only one active sort field is implemented. */
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly resetPageOnSort = input(true, { transform: booleanAttribute });
  readonly compareSelectionBy = input<'equals' | 'deepEquals'>('equals');
  /** @deprecated Loading uses the fixed Skeleton renderer; custom icons are not implemented. */
  readonly loadingIcon = input<string | undefined>(undefined);
  /** @deprecated Loading always renders the fixed Skeleton renderer. */
  readonly showLoader = input(true, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();
  readonly onRowExpand = output<{ data: T }>();
  readonly onRowCollapse = output<{ data: T }>();
  /** @deprecated Context-menu integration has no emission path in this table. */
  readonly onContextMenuSelect = output<{ data: T; originalEvent: Event }>();
  /** @deprecated Column resize handles and events are not implemented. */
  readonly onColResize = output<unknown>();
  /** @deprecated Column drag reorder and events are not implemented. */
  readonly onColReorder = output<unknown>();
  /** @deprecated Row drag reorder and events are not implemented. */
  readonly onRowReorder = output<unknown>();
  /** @deprecated Row/cell editing and lifecycle events are not implemented. */
  readonly onEditInit = output<unknown>();
  /** @deprecated Row/cell editing and lifecycle events are not implemented. */
  readonly onEditComplete = output<unknown>();
  /** @deprecated Row/cell editing and lifecycle events are not implemented. */
  readonly onEditCancel = output<unknown>();
  readonly onHeaderCheckboxToggle = output<unknown>();
  /** @deprecated State persistence has no save lifecycle in this table. */
  readonly onStateSave = output<unknown>();
  /** @deprecated State persistence has no restore lifecycle in this table. */
  readonly onStateRestore = output<unknown>();
  readonly sortFunction = output<unknown>();

  // ── Evento de Clique na Linha ─────────────────────────────
  readonly rowClick = output<T>();

  // ── Diretivas Filhas (<orc-column>) ───────────────────────
  readonly declaredColumns = contentChildren(ColumnDirective);
  readonly footerTemplate = contentChild(TableFooterDirective);
  readonly rowExpansionTemplate = contentChild(TableRowExpansionDirective);
  readonly expandedRows = model<T[]>([]);
  /**
   * The shared table engine runs the source → filter → sort → page pipeline
   * for this table; the generic contract resolves fields by dot path.
   */
  private readonly engine: TableEnginePipeline<T> =
    createTableEnginePipeline<T>({
      data: () => this.data(),
      value: () => this.value(),
      remote: () => this.remoteData(),
      query: () => this.filter(),
      locale: () => this.filterLocale(),
      fields: () => {
        const configured = this.globalFilterFields();
        return configured.length
          ? configured
          : this.effectiveColumns().map((column) => column.key());
      },
      resolve: tableField,
      sort: () => {
        const state = this.sorting();
        return { field: state.column, direction: state.direction };
      },
      customSort: () => this.customSort(),
      compare: (a, b) => this.rowComparator()(a, b),
      paginated: () => this.effectivePaginated(),
      first: () => this.displayFirst(),
      pageSize: () => this.effectivePageSize(),
    });
  readonly effectiveData = this.engine.source;
  readonly effectivePageSize = linkedSignal({
    source: () => ({ rows: this.rowsInput(), size: this.pageSize() }),
    computation: (source, previous): number =>
      positiveTableInteger(
        previous &&
          source.rows === previous.source.rows &&
          source.size !== previous.source.size
          ? source.size
          : (source.rows ?? source.size),
        5,
      ),
  });
  private readonly requestedFirst = linkedSignal({
    source: () => ({
      first: this.first(),
      page: this.currentPage(),
      size: this.effectivePageSize(),
    }),
    computation: (source, previous): number => {
      if (previous && source.first !== previous.source.first)
        return tableOffset(source.first);
      if (!previous && source.first) return tableOffset(source.first);
      return (positiveTableInteger(source.page, 1) - 1) * source.size;
    },
  });
  readonly remoteData = computed(() => this.serverDriven() || this.lazy());
  readonly effectiveRowsPerPageOptions = computed(
    () => this.rowsPerPageOptions() ?? this.pageSizeOptions(),
  );
  readonly effectivePaginated = computed(
    () => this.paginated() || this.paginator(),
  );
  readonly effectiveFilterPlaceholder = computed(() =>
    tableTrimmedLabel(this.filterPlaceholder(), null),
  );
  readonly effectiveFilterAriaLabel = computed(() =>
    tableTrimmedLabel(this.filterAriaLabel(), 'Filter rows'),
  );
  readonly effectiveSelectAllAriaLabel = computed(() =>
    tableTrimmedLabel(this.selectAllAriaLabel(), 'Select all rows'),
  );
  readonly effectiveRowAriaLabel = computed(() =>
    tableTrimmedLabel(this.rowAriaLabel(), null),
  );
  readonly effectiveAriaLabel = computed(() =>
    tableTrimmedLabel(this.ariaLabel(), 'Data table'),
  );
  readonly selectionEnabled = computed(
    () => this.selectable() || !!this.selectionMode(),
  );
  /** Uses projected columns when present, otherwise adapts the direct config API. */
  readonly effectiveColumns = computed<readonly TableColumnView[]>(() => {
    const declared = this.declaredColumns();
    if (declared.length || !this.columnsConfig()) return declared;
    return (this.columnsConfig() ?? []).map((config) => ({
      key: () => config.key,
      header: () => config.header,
      sortable: () => !!config.sortable,
      width: () => config.width ?? '',
      align: () => config.align ?? 'left',
      cellTemplate: () => undefined,
      headerTemplate: () => undefined,
    }));
  });

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveTotalItems = computed(() => {
    const custom = this.totalRecords() ?? this.totalItems();
    return this.remoteData() && custom !== undefined
      ? tableOffset(custom)
      : this.filteredData().length;
  });

  readonly filteredData = this.engine.filtered;

  private readonly collator = computed(
    () =>
      new Intl.Collator(this.filterLocale(), {
        numeric: true,
        sensitivity: 'base',
      }),
  );

  private readonly rowComparator = computed(() =>
    tableValueComparator(this.collator()),
  );

  readonly sortedData = this.engine.sorted;

  readonly displayFirst = computed(() =>
    this.remoteData()
      ? this.requestedFirst()
      : Math.min(
          this.requestedFirst(),
          Math.floor(
            Math.max(0, this.sortedData().length - 1) /
              this.effectivePageSize(),
          ) * this.effectivePageSize(),
        ),
  );
  readonly displayedPage = computed(
    () => Math.floor(this.displayFirst() / this.effectivePageSize()) + 1,
  );

  /** Dados exibidos na página atual */
  readonly displayData = this.engine.display;

  readonly selectableRows = computed(() =>
    (this.selectionPageOnly() ? this.displayData() : this.sortedData()).filter(
      (row, index) =>
        this.isRowSelectable(
          row,
          this.selectionPageOnly() || this.remoteData()
            ? this.displayRowIndex(index)
            : index,
        ),
    ),
  );
  private readonly selectedKeys = computed(
    () => new Set(this.selectedRows().map((row) => this.selectionKey(row))),
  );

  /** Verifica se todas as linhas da página atual estão selecionadas */
  readonly isAllSelected = computed(() => {
    const current = this.selectableRows();
    if (current.length === 0) return false;
    return current.every((row) => this.isRowSelected(row));
  });

  /** Verifica se parte das linhas está selecionada (estado indeterminado) */
  readonly isSomeSelected = computed(() => {
    const current = this.selectableRows();
    if (current.length === 0) return false;
    const selectedCount = current.filter((row) =>
      this.isRowSelected(row),
    ).length;
    return selectedCount > 0 && selectedCount < current.length;
  });

  // ── Métodos de Ação ───────────────────────────────────────
  getRowId(row: any): any {
    return tableField(row, this.dataKey() || this.rowKey()) ?? row;
  }

  trackRow(index: number, row: T): unknown {
    return this.rowTrackBy()?.(index, row) ?? this.getRowId(row);
  }

  isRowSelected(row: T, selected?: T[]): boolean {
    return selected
      ? selected.some((item) => this.sameRow(item, row))
      : this.selectedKeys().has(this.selectionKey(row));
  }

  private selectionKey(row: T): unknown {
    if (this.compareSelectionBy() === 'deepEquals') {
      return tableDeepSelectionKey(row);
    }
    return this.getRowId(row);
  }

  private sameRow(left: T, right: T): boolean {
    return this.selectionKey(left) === this.selectionKey(right);
  }

  isRowSelectable(row: T, index: number): boolean {
    return this.rowSelectable()?.({ data: row, index }) ?? true;
  }

  displayRowIndex(index: number): number {
    return (
      (this.effectivePaginated() || this.remoteData()
        ? this.displayFirst()
        : 0) + index
    );
  }

  toggleRowSelect(row: any, event: CheckboxChangeEvent | boolean): void {
    const checked = typeof event === 'boolean' ? event : event.checked;
    const rowIndex = this.displayRowIndex(this.displayData().indexOf(row));
    if (
      this.rowSelectable() &&
      !this.rowSelectable()!({ data: row, index: rowIndex })
    )
      return;
    const current = [...this.selectedRows()];
    const index = current.findIndex((item) => this.sameRow(item, row));
    if (checked === (index !== -1)) return;

    if (checked && index === -1) {
      if (this.selectionMode() === 'single') current.splice(0, current.length);
      current.push(row);
    } else if (!checked && index !== -1) {
      current.splice(index, 1);
    }

    this.selectedRows.set(current);
    this.selectionChange.emit(current);
    (checked ? this.rowSelect : this.rowUnselect).emit({ data: row });
    (checked ? this.onRowSelect : this.onRowUnselect).emit({ data: row });
  }

  toggleSelectAll(event: CheckboxChangeEvent | boolean): void {
    if (this.selectionMode() === 'single') return;
    const checked = typeof event === 'boolean' ? event : event.checked;
    const currentDisplay = this.selectableRows();
    let currentSelected = [...this.selectedRows()];

    if (checked) {
      const keys = new Set(
        currentSelected.map((row) => this.selectionKey(row)),
      );
      currentDisplay.forEach((row) => {
        const key = this.selectionKey(row);
        if (!keys.has(key)) {
          currentSelected.push(row);
          keys.add(key);
        }
      });
    } else {
      const keys = new Set(currentDisplay.map((row) => this.selectionKey(row)));
      currentSelected = currentSelected.filter(
        (item) => !keys.has(this.selectionKey(item)),
      );
    }

    this.selectedRows.set(currentSelected);
    this.selectionChange.emit(currentSelected);
    this.selectAllChange.emit({ checked, data: currentSelected });
    this.onHeaderCheckboxToggle.emit({ checked, data: currentSelected });
  }

  handleSort(
    columnKey: string,
    isSortable?: boolean,
    originalEvent?: Event,
  ): void {
    if (!isSortable || (originalEvent && isTableControlEvent(originalEvent)))
      return;

    const current = this.sorting();
    const newDirection: SortDirection = nextTableSortDirection(
      current.direction,
      current.column === columnKey,
      {
        defaultDescending: this.defaultSortOrder() < 0,
        cycleThroughNone: true,
      },
    );

    this.sortColumn.set(newDirection === 'none' ? '' : columnKey);
    this.sortDirection.set(newDirection);
    this.sortField.set(newDirection === 'none' ? '' : columnKey);
    this.sortOrder.set(
      newDirection === 'asc' ? 1 : newDirection === 'desc' ? -1 : 0,
    );
    const event = { column: columnKey, direction: newDirection };
    this.sorting.set(event);
    this.sortChange.emit(event);
    this.onSort.emit(event);
    if (this.customSort()) this.sortFunction.emit(event);
    if (this.resetPageOnSort()) {
      this.currentPage.set(1);
      this.first.set(0);
      this.requestedFirst.set(0);
    }
    this.emitQuery();
  }

  ngOnInit(): void {
    if (this.lazyLoadOnInit()) this.emitQuery();
  }

  applyFilter(value: string): void {
    this.filter.set(value);
    this.currentPage.set(1);
    this.first.set(0);
    this.requestedFirst.set(0);
    this.onFilter.emit({ value });
    this.emitQuery();
  }

  handlePageChange(event: TablePageChangeEvent): void {
    const first = tableOffset(event.startIndex - 1);
    const rows = positiveTableInteger(event.pageSize, this.effectivePageSize());
    this.currentPage.set(positiveTableInteger(event.page, 1));
    this.pageSize.set(rows);
    this.effectivePageSize.set(rows);
    this.first.set(first);
    this.requestedFirst.set(first);
    this.onPage.emit({ first, rows });
    this.emitQuery();
  }

  toggleRowExpansion(row: T): void {
    const expanded = this.expandedRows();
    const exists = expanded.some((item) => this.sameRow(item, row));
    if (exists) {
      this.expandedRows.set(
        expanded.filter((item) => !this.sameRow(item, row)),
      );
      this.onRowCollapse.emit({ data: row });
      return;
    }

    if (this.rowExpandMode() === 'single') {
      const collapsed = expanded.filter((item) => !this.sameRow(item, row));
      this.expandedRows.set([row]);
      collapsed.forEach((item) => this.onRowCollapse.emit({ data: item }));
    } else {
      this.expandedRows.set([...expanded, row]);
    }
    this.onRowExpand.emit({ data: row });
  }
  isExpanded(row: T): boolean {
    return this.expandedRows().some((item) => this.sameRow(item, row));
  }
  private emitQuery(): void {
    if (!this.remoteData()) return;
    const page = {
      first: this.requestedFirst(),
      rows: this.effectivePageSize(),
    };
    this.onLazyLoad.emit(page);
    this.queryChange.emit({
      ...page,
      sort:
        this.sorting().column && this.sorting().direction !== 'none'
          ? this.sorting()
          : undefined,
      filter: this.filter() || undefined,
      filters: this.filters(),
    });
  }

  handleRowClick(row: T, event?: Event): void {
    if (event && isTableControlEvent(event)) return;
    this.rowClick.emit(row);
  }

  onRowKeydown(row: T, event: KeyboardEvent): void {
    if (
      (event.key !== 'Enter' && event.key !== ' ') ||
      isTableControlEvent(event)
    )
      return;
    event.preventDefault();
    this.handleRowClick(row);
  }

  onHeaderKeydown(column: TableColumnView, event: KeyboardEvent): void {
    if (
      !column.sortable() ||
      (event.key !== 'Enter' && event.key !== ' ') ||
      isTableControlEvent(event)
    )
      return;
    event.preventDefault();
    this.handleSort(column.key(), true);
  }

  getAriaSort(
    columnKey: string,
    isSortable?: boolean,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!isSortable) return null;
    if (this.sorting().column !== columnKey) return 'none';
    const dir = this.sorting().direction;
    if (dir === 'asc') return 'ascending';
    if (dir === 'desc') return 'descending';
    return 'none';
  }

  getCellValue(row: any, key: string): any {
    return tableField(row, key) ?? '';
  }

  getSkeletonArray(): number[] {
    return Array.from(
      { length: Math.max(0, this.loadingRowsCount()) },
      (_, i) => i,
    );
  }

  reset(): void {
    this.filter.set('');
    this.sortColumn.set('');
    this.sortField.set('');
    this.sortDirection.set('none');
    this.sortOrder.set(0);
    this.sorting.set({ column: '', direction: 'none' });
    this.currentPage.set(1);
    this.first.set(0);
    this.selectedRows.set([]);
    this.selectionChange.emit([]);
    this.requestedFirst.set(0);
  }

  exportCSV(options?: { selectionOnly?: boolean }): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;
    const rows = options?.selectionOnly
      ? this.selectedRows()
      : this.effectiveData();
    const columns = this.effectiveColumns().map((column) => ({
      key: column.key(),
      header: column.header(),
    }));
    const csv = buildTableCsv(
      rows,
      columns,
      this.csvSeparator(),
      this.exportHeader(),
      (row, key) => this.getCellValue(row, key),
    );
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    });
    const link = ownerDocument.createElement('a');
    const objectUrl = ownerWindow.URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `${this.exportFilename()}.csv`;
    try {
      link.click();
    } finally {
      ownerWindow.URL.revokeObjectURL(objectUrl);
      link.remove();
    }
  }
}
