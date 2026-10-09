import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';
import { filterTreeNodes } from '@ciag/orchestra/internal';
import type { HierarchyNode } from '@ciag/orchestra/tree';

type FlatHierarchyNode<T> = { node: HierarchyNode<T>; level: number };

export interface TreeTableColumn {
  /** A dotted path into the node's `data` object. */
  key: string;
  header: string;
  /** Data columns are sortable by default. Set false for display-only columns. */
  sortable?: boolean;
}

export interface TreeTableSortEvent {
  originalEvent: Event;
  field: string;
  order: 1 | -1;
}

@Component({
  selector: 'orc-tree-table',
  standalone: true,
  templateUrl: './tree-table.component.html',
  styles: [ORC_SHARED_VARS],
  styleUrl: './tree-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id() || null',
  },
})
export class TreeTableComponent<T = Record<string, unknown>> implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private static nextSelectionId = 0;
  readonly selectionName = `orc-tree-table-selection-${++TreeTableComponent.nextSelectionId}`;
  readonly focusedRow = signal<HierarchyNode<T> | null>(null);
  readonly id = input<string | undefined>(undefined);
  readonly selectionMode = input<'single' | 'multiple' | 'checkbox'>(
    'multiple',
  );
  readonly propagateSelectionUp = input(false, { transform: booleanAttribute });
  readonly propagateSelectionDown = input(false, {
    transform: booleanAttribute,
  });
  readonly value = input<HierarchyNode<T>[]>([]);
  readonly columns = input<TreeTableColumn[]>([]);
  /** @deprecated Compatibility input only; frozen columns are not rendered. */
  readonly frozenColumns = input<TreeTableColumn[] | undefined>(undefined);
  /** @deprecated Compatibility input only; frozen columns are not rendered. */
  readonly frozenWidth = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly treeColumnHeader = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterLabel = input('Filter');
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly rowsPerPageLabel = input('Top-level items per page');
  readonly paginatorAriaLabel = input('Tree table pagination');
  readonly firstPageLabel = input('First page');
  readonly previousPageLabel = input('Previous page');
  readonly nextPageLabel = input('Next page');
  readonly lastPageLabel = input('Last page');
  readonly loading = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; loading icons are not rendered. */
  readonly loadingIcon = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; no loader element is rendered. */
  readonly showLoader = input(true, { transform: booleanAttribute });
  readonly expandAriaLabel = input<string | undefined>(undefined);
  readonly collapseAriaLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly tableStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly tableStyleClass = input('');
  readonly autoLayout = input(false, { transform: booleanAttribute });
  /** Partial contract: only the initial lazy request is emitted. */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(true, { transform: booleanAttribute });
  /** Enables local paging over the top-level tree nodes; each page keeps descendants with their parent. */
  readonly paginator = input(false, { transform: booleanAttribute });
  /** Number of top-level nodes per local page. Also supplies the initial lazy-load row count. */
  readonly rows = model<number | undefined>(undefined);
  readonly first = model(0);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined);
  /** @deprecated Compatibility input only; numbered page links are not rendered. */
  readonly pageLinks = input(5);
  /** @deprecated Compatibility input only; `paginator` controls visibility. */
  readonly alwaysShowPaginator = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; the local paginator is rendered below the rows. */
  readonly paginatorPosition = input<'top' | 'bottom' | 'both'>('bottom');
  /** @deprecated Compatibility input only; style customization belongs on the component. */
  readonly paginatorStyleClass = input('');
  /** Formats the local paginator report using first, last, totalRecords, currentPage and totalPages placeholders. */
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; the local page report is always shown. */
  readonly showCurrentPageReport = input(false, {
    transform: booleanAttribute,
  });
  /** @deprecated Compatibility input only; paginator controls are not rendered. */
  readonly showJumpToPageDropdown = input(false, {
    transform: booleanAttribute,
  });
  /** @deprecated Compatibility input only; paginator controls are not rendered. */
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; paginator controls are not rendered. */
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly defaultSortOrder = input<1 | -1>(1);
  /** @deprecated Compatibility input only; multiple sort fields are not implemented. */
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly resetPageOnSort = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; custom comparison callbacks are not supported. */
  readonly customSort = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; row identity uses node keys directly. */
  readonly dataKey = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; selection does not inspect modifier keys. */
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; selection comparison uses node keys. */
  readonly compareSelectionBy = input<'equals' | 'deepEquals' | string>(
    'equals',
  );
  /** @deprecated Compatibility input only; context-menu integration is not provided. */
  readonly contextMenuSelection = input<HierarchyNode<T> | null>(null);
  /** @deprecated Compatibility input only; context-menu integration is not provided. */
  readonly contextMenuSelectionMode = input<'separate' | 'joint'>('separate');
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly scrollHeight = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollDelay = input(250);
  /** @deprecated Compatibility input only; column resizing is not implemented. */
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; column reordering is not implemented. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; column resizing is not implemented. */
  readonly columnResizeMode = input('fit');
  readonly showGridlines = input(false, { transform: booleanAttribute });
  readonly globalFilterFields = input<string[]>([]);
  /** @deprecated Compatibility input only; filtering is synchronous. */
  readonly filterDelay = input(300);
  readonly filterMode = input('lenient');
  readonly filterLocale = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; paginator labels are configured explicitly. */
  readonly paginatorLocale = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly sortField = model<string | undefined>(undefined);
  readonly sortOrder = model<1 | -1>(1);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly selected = model<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<HierarchyNode<T>>();
  readonly nodeUnselect = output<HierarchyNode<T>>();
  readonly nodeExpand = output<HierarchyNode<T>>();
  readonly nodeCollapse = output<HierarchyNode<T>>();
  readonly onNodeSelect = output<HierarchyNode<T>>();
  readonly onNodeUnselect = output<HierarchyNode<T>>();
  readonly selectionChange = output<ReadonlySet<string>>();
  /** @deprecated Compatibility output; context-menu selection is not implemented. */
  readonly contextMenuSelectionChange = output<HierarchyNode<T>>();
  /** @deprecated Compatibility output; context-menu selection is not implemented. */
  readonly onContextMenuSelect = output<{
    data: HierarchyNode<T>;
    originalEvent: Event;
  }>();
  readonly rowExpand = output<HierarchyNode<T>>();
  readonly rowCollapse = output<HierarchyNode<T>>();
  readonly onFilter = output<{ value: string }>();
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onSort = output<TreeTableSortEvent>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();
  /** @deprecated Compatibility output; header checkbox controls are not rendered. */
  readonly onHeaderCheckboxToggle = output<{ checked: boolean }>();
  /** @deprecated Compatibility output; column resizing is not implemented. */
  readonly onColResize = output<unknown>();
  /** @deprecated Compatibility output; column reordering is not implemented. */
  readonly onColReorder = output<unknown>();
  readonly visibleNodes = computed<FlatHierarchyNode<T>[]>(() => {
    const result: FlatHierarchyNode<T>[] = [];
    const visit = (nodes: HierarchyNode<T>[], level: number): void => {
      for (const node of nodes) {
        result.push({ node, level });
        if (node.children?.length && this.expanded().has(node.key))
          visit(node.children, level + 1);
      }
    };
    visit(this.value(), 1);
    return result;
  });
  readonly nodeByKey = computed(() => {
    const nodes = new Map<string, HierarchyNode<T>>();
    const visit = (items: HierarchyNode<T>[]): void => {
      for (const node of items) {
        nodes.set(node.key, node);
        visit(node.children ?? []);
      }
    };
    visit(this.value());
    return nodes;
  });
  readonly filteredRoots = computed(() => {
    const term = this.filterValue().trim();
    if (!term) return this.value();

    const fields = [
      'label',
      ...this.globalFilterFields().map((field) =>
        field === 'label' || field.startsWith('data.')
          ? field
          : `data.${field}`,
      ),
    ];
    const included = new Set(
      filterTreeNodes(
        this.value(),
        term,
        fields,
        this.filterMode(),
        this.filterLocale(),
      ).map(({ node }) => node.key),
    );
    const retainMatches = (nodes: HierarchyNode<T>[]): HierarchyNode<T>[] =>
      nodes.flatMap((node) => {
        if (!included.has(node.key)) return [];
        const children = retainMatches(node.children ?? []);
        return [node.children ? { ...node, children } : node];
      });
    return retainMatches(this.value());
  });
  readonly sortedRoots = computed(() =>
    this.sortTree(this.filteredRoots(), this.sortField()),
  );
  readonly totalRoots = computed(() => this.sortedRoots().length);
  readonly pageSize = computed(() => this.normalizedPageSize(this.rows()));
  readonly effectiveFirst = computed(() =>
    this.paginator()
      ? this.clampFirst(this.first(), this.totalRoots(), this.pageSize())
      : Math.max(0, Math.floor(Number(this.first()) || 0)),
  );
  readonly pageRoots = computed(() =>
    this.paginator()
      ? this.sortedRoots().slice(
          this.effectiveFirst(),
          this.effectiveFirst() + this.pageSize(),
        )
      : this.sortedRoots(),
  );
  readonly pageSizeOptions = computed(() =>
    [...new Set([...(this.rowsPerPageOptions() ?? []), this.pageSize()])]
      .map((value) => Math.floor(Number(value)))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((left, right) => left - right),
  );
  readonly displayNodes = computed(() => {
    const result: FlatHierarchyNode<T>[] = [];
    const showAllDescendants = !!this.filterValue().trim();
    const visit = (nodes: HierarchyNode<T>[], level: number): void => {
      for (const node of nodes) {
        result.push({ node, level });
        if (
          node.children?.length &&
          (showAllDescendants || this.expanded().has(node.key))
        ) {
          visit(node.children, level + 1);
        }
      }
    };
    visit(this.pageRoots(), 1);
    return result;
  });
  private readonly clampFirstEffect = effect(() => {
    const current = this.first();
    const bounded = this.effectiveFirst();
    if (this.paginator() && current !== bounded) {
      untracked(() => this.first.set(bounded));
    }
  });
  sortAriaValue(field: string): 'ascending' | 'descending' | null {
    if (this.sortField() !== field) return null;
    return this.sortOrder() === -1 ? 'descending' : 'ascending';
  }
  sortIndicator(field: string): string {
    if (this.sortField() !== field) return '↕';
    return this.sortOrder() === -1 ? '↓' : '↑';
  }
  sortButtonLabel(column: TreeTableColumn): string {
    const direction =
      this.sortField() === column.key
        ? this.sortOrder() === -1
          ? 'ascending'
          : 'descending'
        : this.defaultSortOrder() === -1
          ? 'descending'
          : 'ascending';
    return `Sort by ${column.header}, ${direction}`;
  }
  toggleSort(field: string, originalEvent: Event): void {
    const order: 1 | -1 =
      this.sortField() === field
        ? this.sortOrder() === -1
          ? 1
          : -1
        : this.defaultSortOrder();
    this.sortField.set(field);
    this.sortOrder.set(order);
    if (this.paginator() && this.resetPageOnSort()) this.first.set(0);
    this.onSort.emit({ originalEvent, field, order });
  }
  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue.set(value);
    if (this.paginator()) this.first.set(0);
    this.onFilter.emit({ value });
  }
  pageReport(): string {
    const total = this.totalRoots();
    const first = total === 0 ? 0 : this.effectiveFirst() + 1;
    const last = Math.min(this.effectiveFirst() + this.pageSize(), total);
    const currentPage =
      total === 0 ? 0 : Math.floor(this.effectiveFirst() / this.pageSize()) + 1;
    const totalPages = Math.ceil(total / this.pageSize());
    const values: Record<string, number> = {
      first,
      last,
      totalRecords: total,
      currentPage,
      totalPages,
    };
    const template = this.currentPageReportTemplate();
    return template
      ? template.replace(
          /\{(first|last|totalRecords|currentPage|totalPages)\}/g,
          (_match, key: string) => String(values[key]),
        )
      : `${first}–${last} of ${total}`;
  }
  onRowsPerPageChange(event: Event): void {
    const selected = Number((event.target as HTMLSelectElement).value);
    this.setPage(0, selected);
  }
  goToFirstPage(): void {
    this.setPage(0, this.pageSize());
  }
  goToPreviousPage(): void {
    this.setPage(this.effectiveFirst() - this.pageSize(), this.pageSize());
  }
  goToNextPage(): void {
    this.setPage(this.effectiveFirst() + this.pageSize(), this.pageSize());
  }
  goToLastPage(): void {
    this.setPage(this.totalRoots() - 1, this.pageSize());
  }
  private setPage(first: number, rows: number): void {
    const pageSize = this.normalizedPageSize(rows);
    const nextFirst = this.clampFirst(first, this.totalRoots(), pageSize);
    this.rows.set(pageSize);
    this.first.set(nextFirst);
    this.onPage.emit({ first: nextFirst, rows: pageSize });
  }
  private normalizedPageSize(value: number | undefined): number {
    const numeric = Math.floor(Number(value));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 10;
  }
  private clampFirst(first: number, total: number, rows: number): number {
    const requested = Math.max(0, Math.floor(Number(first) || 0));
    const lastPageFirst = total > 0 ? Math.floor((total - 1) / rows) * rows : 0;
    return Math.min(requested, lastPageFirst);
  }
  private sortTree(
    nodes: HierarchyNode<T>[],
    field: string | undefined,
  ): HierarchyNode<T>[] {
    if (!field) return nodes;
    let collator: Intl.Collator;
    try {
      collator = new Intl.Collator(this.filterLocale() || undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    } catch {
      collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    }
    const direction = this.sortOrder() === -1 ? -1 : 1;
    const valueAt = (node: HierarchyNode<T>): unknown =>
      field === 'label'
        ? node.label
        : this.dataValue(
            node,
            field.startsWith('data.') ? field.slice(5) : field,
          );
    return nodes
      .map((node, index) => ({ node, index, value: valueAt(node) }))
      .sort((left, right) => {
        const a = left.value;
        const b = right.value;
        if (a == null || a === '')
          return b == null || b === '' ? left.index - right.index : 1;
        if (b == null || b === '') return -1;
        let comparison: number;
        if (typeof a === 'number' && typeof b === 'number') {
          comparison = a === b ? 0 : a < b ? -1 : 1;
        } else if (typeof a === 'boolean' && typeof b === 'boolean') {
          comparison = Number(a) - Number(b);
        } else {
          comparison = collator.compare(String(a), String(b));
        }
        return comparison === 0
          ? left.index - right.index
          : comparison * direction;
      })
      .map(({ node }) =>
        node.children
          ? { ...node, children: this.sortTree(node.children, field) }
          : node,
      );
  }
  private dataValue(node: HierarchyNode<T>, path: string): unknown {
    let value: unknown = node.data;
    for (const segment of path.split('.')) {
      if (value === null || typeof value !== 'object') return undefined;
      value = (value as Record<string, unknown>)[segment];
    }
    return value;
  }
  ngOnInit(): void {
    if (this.lazy() && this.lazyLoadOnInit())
      this.onLazyLoad.emit({
        first: this.first(),
        rows: this.rows() ?? this.value().length,
      });
  }
  rowTabIndex(item: FlatHierarchyNode<T>): 0 | -1 {
    const rows = this.displayNodes();
    const focused = this.focusedRow();
    const focusedIsNavigable =
      !!focused &&
      rows.some(
        (row) =>
          row.node.key === focused.key && this.isKeyboardNavigable(row.node),
      );
    const active = focusedIsNavigable
      ? rows.find((row) => row.node.key === focused?.key)?.node
      : rows.find((row) => this.isKeyboardNavigable(row.node))?.node;
    return item.node.key === active?.key ? 0 : -1;
  }
  private isKeyboardNavigable(node: HierarchyNode<T>): boolean {
    return (
      (!!node.children?.length && !this.filterValue().trim()) || !node.disabled
    );
  }
  isExpandedForView(item: FlatHierarchyNode<T>): boolean {
    if (this.expanded().has(item.node.key)) return true;
    if (!this.filterValue().trim()) return false;
    const visible = this.displayNodes();
    const index = visible.findIndex(
      (candidate) => candidate.node.key === item.node.key,
    );
    return (
      index >= 0 &&
      visible
        .slice(index + 1)
        .some((candidate) => candidate.level > visible[index].level)
    );
  }
  toggle(item: FlatHierarchyNode<T>): void {
    const node = this.nodeByKey().get(item.node.key) ?? item.node;
    if (!node.children?.length || this.filterValue().trim()) return;
    this.expanded.update((current) => {
      const next = new Set(current);
      const open = next.has(node.key);
      if (open) next.delete(node.key);
      else next.add(node.key);
      (open ? this.nodeCollapse : this.nodeExpand).emit(node);
      (open ? this.rowCollapse : this.rowExpand).emit(node);
      return next;
    });
  }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      !target ||
      target !== target.closest('tbody tr[role="row"]') ||
      target.closest(
        'input, button, textarea, select, [contenteditable="true"]',
      )
    )
      return;

    const rows = Array.from(
      this.host.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ) as HTMLElement[];
    const getComputedStyle =
      this.host.nativeElement.ownerDocument.defaultView?.getComputedStyle;
    const rowIsVisible = (row: HTMLElement): boolean =>
      !row.hidden &&
      !row.closest('[hidden]') &&
      (!getComputedStyle ||
        getComputedStyle.call(
          this.host.nativeElement.ownerDocument.defaultView,
          row,
        ).display !== 'none') &&
      (!getComputedStyle ||
        getComputedStyle.call(
          this.host.nativeElement.ownerDocument.defaultView,
          row,
        ).visibility !== 'hidden');
    const navigableRows = rows.filter((row) => {
      if (!rowIsVisible(row)) return false;
      const item = this.displayNodes()[rows.indexOf(row)];
      return !!item && this.isKeyboardNavigable(item.node);
    });
    const currentRow = target.closest(
      'tbody tr[role="row"]',
    ) as HTMLElement | null;
    const current = navigableRows.indexOf(currentRow as HTMLElement);
    if (current < 0) return;
    const item = this.displayNodes()[rows.indexOf(currentRow as HTMLElement)];
    if (!item) return;

    if (event.key === 'ArrowRight' && item.node.children?.length) {
      event.preventDefault();
      if (!this.isExpandedForView(item)) this.toggle(item);
    } else if (
      event.key === 'ArrowLeft' &&
      item.node.children?.length &&
      !this.filterValue().trim() &&
      this.expanded().has(item.node.key)
    ) {
      event.preventDefault();
      this.toggle(item);
    } else if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      const delta =
        event.key === 'ArrowDown'
          ? 1
          : event.key === 'ArrowUp'
            ? -1
            : event.key === 'Home'
              ? -current
              : navigableRows.length - 1 - current;
      const next = Math.max(
        0,
        Math.min(navigableRows.length - 1, current + delta),
      );
      navigableRows[next].focus();
    }
  }
  select(item: FlatHierarchyNode<T>, checked: boolean): void {
    const node = this.nodeByKey().get(item.node.key) ?? item.node;
    if (node.disabled) return;
    const next = new Set(this.selected());
    if (this.selectionMode() === 'single') {
      next.clear();
      if (checked) next.add(node.key);
    } else {
      const affected = this.propagateSelectionDown()
        ? this.descendantKeys(node)
        : [node.key];
      affected.forEach((key) => (checked ? next.add(key) : next.delete(key)));
      if (this.propagateSelectionUp()) this.normalizeParentSelection(next);
    }
    this.selected.set(next);
    this.selectionChange.emit(next);
    const output = checked ? this.nodeSelect : this.nodeUnselect;
    const alias = checked ? this.onNodeSelect : this.onNodeUnselect;
    output.emit(node);
    alias.emit(node);
  }
  private descendantKeys(node: HierarchyNode<T>): string[] {
    return [
      ...(node.disabled ? [] : [node.key]),
      ...(node.children || []).flatMap((child) => this.descendantKeys(child)),
    ];
  }
  private normalizeParentSelection(selection: Set<string>): void {
    const visit = (nodes: HierarchyNode<T>[]): void => {
      nodes.forEach((node) => {
        if (node.children?.length) visit(node.children);
        if (node.disabled) {
          selection.delete(node.key);
          return;
        }
        if (!node.children?.length) return;
        const selectable = node.children.filter((child) => !child.disabled);
        if (
          selectable.length &&
          selectable.every((child) => selection.has(child.key))
        )
          selection.add(node.key);
        else selection.delete(node.key);
      });
    };
    visit(this.value());
  }
  cellValue(node: HierarchyNode<T>, key: string): unknown {
    return (
      this.dataValue(node, key.startsWith('data.') ? key.slice(5) : key) ?? ''
    );
  }
}
