import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  contentChildren,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent, CheckboxChangeEvent } from '@ciag/orchestra/checkbox';
import { PaginatorComponent } from '@ciag/orchestra/paginator';
import { SkeletonComponent } from '@ciag/orchestra/skeleton';
import { ColumnDirective } from './table-column.directive';
import {
  SortDirection,
  TableSortEvent,
  TableColumnConfig,
} from './table.types';

interface TablePageChangeEvent { page: number; pageSize: number; startIndex: number; }

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

  /** Configuração direta de colunas (alternativa ao uso de <orc-column>) */
  readonly columnsConfig = input<TableColumnConfig[] | undefined>(undefined);

  /** Propriedade identificadora única de cada linha (padrão: 'id') */
  readonly rowKey = input<string>('id');

  // ── Seleção de Linhas ─────────────────────────────────────
  /** Habilita seleção de linhas com checkbox na primeira coluna */
  readonly selectable = input(false, { transform: booleanAttribute });

  /** Linhas selecionadas (Two-Way Binding) */
  readonly selectedRows = model<T[]>([]);

  /** Evento emitido quando a seleção muda */
  readonly selectionChange = output<T[]>();
  readonly rowSelect = output<{ data: T }>();
  readonly rowUnselect = output<{ data: T }>();

  // ── Ordenação ─────────────────────────────────────────────
  /** Chave da coluna ordenada atualmente */
  readonly sortColumn = model<string>('');

  /** Direção da ordenação atual: 'asc' | 'desc' | 'none' */
  readonly sortDirection = model<SortDirection>('none');

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
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Filter');
  readonly filter = model('');
  readonly globalFilterFields = input<string[]>([]);
  readonly onFilter = output<{ value: string }>();

  // ── Estados de Carregamento e Vazio ───────────────────────
  /** Exibe estado de carregamento com Skeletons */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Quantidade de linhas skeleton a renderizar durante loading */
  readonly loadingRowsCount = input<number>(5);

  /** Título principal do estado vazio */
  readonly emptyTitle = input<string>('Nenhum dado encontrado');

  /** Mensagem descritiva do estado vazio */
  readonly emptyMessage = input<string>('Não há registros para serem exibidos no momento.');

  // ── Paginação Integrada ────────────────────────────────────
  /** Habilita rodapé com PaginatorComponent integrado */
  readonly paginated = input(false, { transform: booleanAttribute });

  /** Quantidade de itens por página (Two-Way Binding) */
  readonly pageSize = model<number>(5);

  /** Página atual (1-indexed, Two-Way Binding) */
  readonly currentPage = model<number>(1);

  /** Total de itens para paginação do lado do servidor (se omitido, usa data().length) */
  readonly totalItems = input<number | undefined>(undefined);

  /** Opções de tamanho de página */
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();

  // ── Evento de Clique na Linha ─────────────────────────────
  readonly rowClick = output<T>();

  // ── Diretivas Filhas (<orc-column>) ───────────────────────
  readonly declaredColumns = contentChildren(ColumnDirective);

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveTotalItems = computed(() => {
    const custom = this.totalItems();
    return custom !== undefined ? custom : this.data().length;
  });

  /** Dados ordenados localmente */
  readonly filteredData = computed(() => {
    const query = this.filter().trim().toLocaleLowerCase();
    if (!query) return this.data();
    const fields = this.globalFilterFields();
    return this.data().filter(row => (fields.length ? fields : Object.keys((row as any) || {})).some(key => String((row as any)?.[key] ?? '').toLocaleLowerCase().includes(query)));
  });

  readonly sortedData = computed(() => {
    const raw = [...this.filteredData()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

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
    if (!this.paginated()) {
      return sorted;
    }
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.pageSize());
    const start = (page - 1) * size;
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
    const id = this.getRowId(row);
    return selected.some(item => this.getRowId(item) === id);
  }

  toggleRowSelect(row: any, event: CheckboxChangeEvent | boolean): void {
    const checked = typeof event === 'boolean' ? event : event.checked;
    const current = [...this.selectedRows()];
    const id = this.getRowId(row);
    const index = current.findIndex(item => this.getRowId(item) === id);

    if (checked && index === -1) {
      current.push(row);
    } else if (!checked && index !== -1) {
      current.splice(index, 1);
    }

    this.selectedRows.set(current);
    this.selectionChange.emit(current);
    (checked ? this.rowSelect : this.rowUnselect).emit({ data: row });
  }

  toggleSelectAll(event: CheckboxChangeEvent | boolean): void {
    const checked = typeof event === 'boolean' ? event : event.checked;
    const currentDisplay = this.displayData();
    let currentSelected = [...this.selectedRows()];

    if (checked) {
      currentDisplay.forEach(row => {
        if (!this.isRowSelected(row, currentSelected)) {
          currentSelected.push(row);
        }
      });
    } else {
      const displayIds = new Set(currentDisplay.map(r => this.getRowId(r)));
      currentSelected = currentSelected.filter(item => !displayIds.has(this.getRowId(item)));
    }

    this.selectedRows.set(currentSelected);
    this.selectionChange.emit(currentSelected);
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
    this.sortChange.emit({ column: columnKey, direction: newDirection });
    this.onSort.emit({ column: columnKey, direction: newDirection });
  }

  applyFilter(value: string): void { this.filter.set(value); this.onFilter.emit({ value }); }
  handlePageChange(event: TablePageChangeEvent): void { const first = Math.max(0, event.startIndex - 1); const rows = event.pageSize; const page = event.page; this.currentPage.set(page); this.pageSize.set(rows); const payload = { first, rows }; this.onPage.emit(payload); if (this.lazy()) this.onLazyLoad.emit(payload); }

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
}
