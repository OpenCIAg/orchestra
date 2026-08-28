import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  contentChildren,
  contentChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent, CheckboxChangeEvent } from '@ciag/orchestra/checkbox';
import { PaginatorComponent } from '@ciag/orchestra/paginator';
import { SkeletonComponent } from '@ciag/orchestra/skeleton';
import { ColumnDirective } from './table-column.directive';
import { CellDefDirective, HeaderCellDefDirective } from './table-cell-def.directive';
import {
  SortDirection,
  TableSortEvent,
  TableColumnConfig,
} from './table.types';
import { TableFooterDirective, TableRowExpansionDirective } from './table-slots.directive';

interface TablePageChangeEvent { page: number; pageSize: number; startIndex: number; }

interface TableColumnView {
  key: string;
  header: string;
  sortable: boolean;
  width: string;
  align: 'left' | 'center' | 'right';
  cellTemplate?: CellDefDirective;
  headerTemplate?: HeaderCellDefDirective;
}

@Component({
  selector: 'orc-table',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
    PaginatorComponent,
    SkeletonComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T = any> {
  // ── Inputs de Dados e Configuração ────────────────────────
  /** Dados a serem exibidos na tabela */
  readonly data = input<T[]>([]);
  readonly value = input<T[] | undefined>(undefined);
  readonly frozenColumns = input<any[] | undefined>(undefined);
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
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly tableStyleClass = input('');
  readonly tableStyle = input<Record<string, string | number> | undefined>(undefined);
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly showGridlines = input(false, { transform: booleanAttribute });
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly responsiveLayout = input('scroll');
  readonly breakpoint = input('960px');
  readonly autoLayout = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly scrollDirection = input<'vertical' | 'horizontal' | 'both'>('vertical');
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(undefined);
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  readonly customSort = input(false, { transform: booleanAttribute });
  readonly showInitialSortBadge = input(true, { transform: booleanAttribute });
  readonly exportFilename = input('download');
  readonly csvSeparator = input(',');
  readonly exportHeader = input<string | undefined>(undefined);
  readonly stateKey = input<string | undefined>(undefined);
  readonly stateStorage = input<'session' | 'local'>('session');
  readonly editMode = input<'cell' | 'row'>('row');
  readonly rowExpandMode = input<'multiple' | 'single'>('multiple');
  readonly groupRowsBy = input<any>(undefined);
  readonly rowGroupMode = input<'subheader' | 'rowspan' | undefined>(undefined);
  readonly rowTrackBy = input<((index: number, row: T) => unknown) | undefined>(undefined);
  readonly contextMenuSelection = model<T | null>(null);
  readonly contextMenuSelectionMode = input<'separate' | 'joint'>('separate');
  readonly filters = input<Record<string, unknown>>({});
  /** Consumer owns fetching, filtering and paging; the table only emits queries. */
  readonly serverDriven = input(false, { transform: booleanAttribute });
  readonly queryChange = output<import('./table.types').TableQuery>();
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
  readonly emptyTitle = input<string | undefined>(undefined);

  /** Mensagem descritiva do estado vazio */
  readonly emptyMessage = input<string | undefined>(undefined);

  // ── Paginação Integrada ────────────────────────────────────
  /** Habilita rodapé com PaginatorComponent integrado */
  readonly paginated = input(false, { transform: booleanAttribute });
  readonly paginator = input(false, { alias: 'paginator', transform: booleanAttribute });

  /** Quantidade de itens por página (Two-Way Binding) */
  readonly pageSize = model<number>(5);
  readonly rowsInput = input<number | undefined>(undefined, { alias: 'rows' });
  readonly first = model(0, { alias: 'first' });

  /** Página atual (1-indexed, Two-Way Binding) */
  readonly currentPage = model<number>(1);

  /** Total de itens para paginação do lado do servidor (se omitido, usa data().length) */
  readonly totalItems = input<number | undefined>(undefined);
  readonly totalRecords = input<number | undefined>(undefined, { alias: 'totalRecords' });

  /** Opções de tamanho de página */
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined, { alias: 'rowsPerPageOptions' });
  readonly pageLinks = input(5);
  readonly alwaysShowPaginator = input(true, { transform: booleanAttribute });
  readonly paginatorPosition = input<'top' | 'bottom' | 'both'>('bottom');
  readonly paginatorStyleClass = input('');
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showCurrentPageReport = input(false, { transform: booleanAttribute });
  readonly showJumpToPageDropdown = input(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input(false, { transform: booleanAttribute });
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(true, { transform: booleanAttribute });
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly selectionPageOnly = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string | undefined>(undefined);
  readonly rowSelectable = input<((row: { data: T; index: number }) => boolean) | undefined>(undefined);
  readonly paginatorDropdownAppendTo = input<unknown>(undefined);
  readonly paginatorDropdownScrollHeight = input('400px');
  readonly virtualScrollDelay = input(0);
  readonly contextMenu = input<unknown>(undefined);
  readonly defaultSortOrder = input(1);
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly resetPageOnSort = input(true, { transform: booleanAttribute });
  readonly compareSelectionBy = input<'equals' | 'deepEquals'>('equals');
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly showLoader = input(true, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();
  readonly onRowExpand = output<{ data: T }>();
  readonly onRowCollapse = output<{ data: T }>();
  readonly onContextMenuSelect = output<{ data: T; originalEvent: Event }>();
  readonly onColResize = output<unknown>();
  readonly onColReorder = output<unknown>();
  readonly onRowReorder = output<unknown>();
  readonly onEditInit = output<unknown>();
  readonly onEditComplete = output<unknown>();
  readonly onEditCancel = output<unknown>();
  readonly onHeaderCheckboxToggle = output<unknown>();
  readonly onStateSave = output<unknown>();
  readonly onStateRestore = output<unknown>();
  readonly sortFunction = output<unknown>();

  // ── Evento de Clique na Linha ─────────────────────────────
  readonly rowClick = output<T>();

  // ── Diretivas Filhas (<orc-column>) ───────────────────────
  readonly declaredColumns = contentChildren(ColumnDirective);
  readonly footerTemplate = contentChild(TableFooterDirective);
  readonly rowExpansionTemplate = contentChild(TableRowExpansionDirective);
  readonly expandedRows = model<T[]>([]);
  readonly effectiveData = computed(() => this.value() ?? this.data());
  readonly effectivePageSize = computed(() => this.rowsInput() ?? this.pageSize());
  readonly effectiveRowsPerPageOptions = computed(() => this.rowsPerPageOptions() ?? this.pageSizeOptions());
  readonly effectivePaginated = computed(() => this.paginated() || this.paginator());
  readonly selectionEnabled = computed(() => this.selectable() || !!this.selectionMode());
  readonly effectiveColumns = computed<TableColumnView[]>(() => {
    const configured = this.columnsConfig();
    if (configured?.length) {
      return configured.map((column) => ({
        key: column.key,
        header: column.header,
        sortable: Boolean(column.sortable),
        width: column.width ?? '',
        align: column.align ?? 'left',
      }));
    }

    return this.declaredColumns().map((column) => ({
      key: column.key(),
      header: column.header(),
      sortable: column.sortable(),
      width: column.width(),
      align: column.align(),
      cellTemplate: column.cellTemplate(),
      headerTemplate: column.headerTemplate(),
    }));
  });

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveTotalItems = computed(() => {
    const custom = this.totalRecords() ?? this.totalItems();
    return custom !== undefined ? custom : this.effectiveData().length;
  });

  /** Dados ordenados localmente */
  readonly filteredData = computed(() => {
    if (this.serverDriven()) return this.effectiveData();
    const query = this.filter().trim().toLocaleLowerCase();
    if (!query) return this.effectiveData();
    const fields = this.globalFilterFields();
    return this.effectiveData().filter(row => (fields.length ? fields : Object.keys((row as any) || {})).some(key => String((row as any)?.[key] ?? '').toLocaleLowerCase().includes(query)));
  });

  readonly sortedData = computed(() => {
    if (this.serverDriven()) return this.filteredData();
    const raw = [...this.filteredData()];
    const col = this.sortField() || this.sortColumn();
    const dir = this.sortOrder() < 0 ? 'desc' : this.sortDirection();

    if (!col || dir === 'none') {
      return raw;
    }

    return raw.sort((a: any, b: any) => {
      const valA = a?.[col];
      const valB = b?.[col];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        comparison = valA < valB ? -1 : 1;
      }

      return dir === 'asc' ? comparison : -comparison;
    });
  });

  /** Dados exibidos na página atual */
  readonly displayData = computed(() => {
    const sorted = this.sortedData();
    if (this.serverDriven() || !this.effectivePaginated()) {
      return sorted;
    }
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.effectivePageSize());
    const start = this.first() || (page - 1) * size;
    return sorted.slice(start, start + size);
  });

  /** Verifica se todas as linhas da página atual estão selecionadas */
  readonly isAllSelected = computed(() => {
    const current = this.displayData();
    if (current.length === 0) return false;
    const selected = this.selectedRows();
    return current.every(row => this.isRowSelected(row, selected));
  });

  /** Verifica se parte das linhas está selecionada (estado indeterminado) */
  readonly isSomeSelected = computed(() => {
    const current = this.displayData();
    if (current.length === 0) return false;
    const selected = this.selectedRows();
    const selectedCount = current.filter(row => this.isRowSelected(row, selected)).length;
    return selectedCount > 0 && selectedCount < current.length;
  });

  // ── Métodos de Ação ───────────────────────────────────────
  getRowId(row: any): any {
    const key = this.rowKey();
    return row?.[key] !== undefined ? row[key] : row;
  }

  isRowSelected(row: any, selected = this.selectedRows()): boolean {
    return selected.some(item => this.sameRow(item, row));
  }

  private sameRow(left: T, right: T): boolean {
    if (this.compareSelectionBy() === 'deepEquals') {
      try { return JSON.stringify(left) === JSON.stringify(right); } catch { return left === right; }
    }
    const key = this.dataKey() || this.rowKey();
    const leftId = (left as any)?.[key] ?? this.getRowId(left); const rightId = (right as any)?.[key] ?? this.getRowId(right);
    return leftId === rightId;
  }

  toggleRowSelect(row: any, event: CheckboxChangeEvent | boolean): void {
    const checked = typeof event === 'boolean' ? event : event.checked;
    const rowIndex = this.displayData().indexOf(row);
    if (this.rowSelectable() && !this.rowSelectable()!({ data: row, index: rowIndex })) return;
    const current = [...this.selectedRows()];
    const index = current.findIndex(item => this.sameRow(item, row));

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
    const checked = typeof event === 'boolean' ? event : event.checked;
    const currentDisplay = this.selectionPageOnly() ? this.displayData() : this.sortedData();
    let currentSelected = [...this.selectedRows()];

    if (checked) {
      currentDisplay.forEach((row, index) => {
        if (this.rowSelectable() && !this.rowSelectable()!({ data: row, index })) return;
        if (!this.isRowSelected(row, currentSelected)) {
          if (this.selectionMode() === 'single') currentSelected.splice(0, currentSelected.length);
          currentSelected.push(row);
        }
      });
    } else {
      currentSelected = currentSelected.filter(item => !currentDisplay.some(row => this.sameRow(item, row)));
    }

    this.selectedRows.set(currentSelected);
    this.selectionChange.emit(currentSelected);
    this.selectAllChange.emit({ checked, data: currentSelected });
    this.onHeaderCheckboxToggle.emit({ checked, data: currentSelected });
  }

  handleSort(columnKey: string, isSortable?: boolean): void {
    if (!isSortable) return;

    let newDirection: SortDirection = 'asc';
    if (this.sortColumn() === columnKey) {
      const currentDir = this.sortDirection();
      if (currentDir === 'asc') newDirection = 'desc';
      else if (currentDir === 'desc') newDirection = 'none';
      else newDirection = 'asc';
    }

    this.sortColumn.set(newDirection === 'none' ? '' : columnKey);
    this.sortDirection.set(newDirection);
    this.sortField.set(newDirection === 'none' ? '' : columnKey);
    this.sortOrder.set(newDirection === 'asc' ? 1 : newDirection === 'desc' ? -1 : 0);
    const event = { column: columnKey, direction: newDirection };
    this.sortChange.emit(event);
    this.onSort.emit(event);
    this.sortFunction.emit(event);
    if (this.resetPageOnSort()) { this.currentPage.set(1); this.first.set(0); }
    this.emitQuery();
  }

  applyFilter(value: string): void {
    this.filter.set(value);
    this.currentPage.set(1);
    this.first.set(0);
    this.onFilter.emit({ value });
    this.emitQuery();
  }
  handlePageChange(event: TablePageChangeEvent): void { const first = Math.max(0, event.startIndex - 1); const rows = event.pageSize; const page = event.page; this.currentPage.set(page); this.pageSize.set(rows); this.first.set(first); const payload = { first, rows }; this.onPage.emit(payload); if (this.lazy() || this.serverDriven()) this.onLazyLoad.emit(payload); this.emitQuery(); }

  toggleRowExpansion(row: T): void { const expanded = this.expandedRows(); const exists = expanded.some(item => this.sameRow(item, row)); this.expandedRows.set(exists ? expanded.filter(item => !this.sameRow(item, row)) : [...expanded, row]); (exists ? this.onRowCollapse : this.onRowExpand).emit({ data: row }); }
  isExpanded(row: T): boolean { return this.expandedRows().some(item => this.sameRow(item, row)); }
  private emitQuery(): void { if (!this.serverDriven()) return; this.queryChange.emit({ first: this.first(), rows: this.effectivePageSize(), sort: this.sortColumn() ? { column: this.sortColumn(), direction: this.sortDirection() } : undefined, filter: this.filter() || undefined, filters: this.filters() }); }

  handleRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  getAriaSort(columnKey: string, isSortable?: boolean): 'ascending' | 'descending' | 'none' | null {
    if (!isSortable) return null;
    if (this.sortColumn() !== columnKey) return 'none';
    const dir = this.sortDirection();
    if (dir === 'asc') return 'ascending';
    if (dir === 'desc') return 'descending';
    return 'none';
  }

  getCellValue(row: any, key: string): any {
    return row?.[key] ?? '';
  }

  getSkeletonArray(): number[] {
    return Array.from({ length: this.loadingRowsCount() }, (_, i) => i);
  }

  reset(): void {
    this.filter.set(''); this.sortColumn.set(''); this.sortField.set(''); this.sortDirection.set('none'); this.sortOrder.set(0);
    this.currentPage.set(1); this.first.set(0); this.selectedRows.set([]); this.selectionChange.emit([]);
  }

  exportCSV(options?: { selectionOnly?: boolean }): void {
    if (typeof document === 'undefined') return;
    const rows = options?.selectionOnly ? this.selectedRows() : this.effectiveData();
    const columns = this.effectiveColumns().map(column => ({ key: column.key, header: column.header }));
    const header = this.exportHeader() ?? columns.map(column => column.header).join(this.csvSeparator());
    const escape = (value: unknown): string => {
      const text = String(value ?? '');
      return /["\n\r,;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const body = rows.map(row => columns.map(column => escape(this.getCellValue(row, column.key))).join(this.csvSeparator())).join('\n');
    const blob = new Blob([`${header}${body ? `\n${body}` : ''}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${this.exportFilename()}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }
}
