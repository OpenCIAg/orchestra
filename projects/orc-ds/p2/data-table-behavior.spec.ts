import { TestBed } from '@angular/core/testing';
import { DataTableComponent as CompatibilityDataTableComponent } from './p2-data-components';
import { DataTableComponent as P2DataTableComponent } from './index';
import { DataTableComponent } from './p2-data-table-component';

describe('DataTable row identity', () => {
  it('preserves the class through focused, compatibility, and P2 barrel imports', () => {
    expect(CompatibilityDataTableComponent).toBe(DataTableComponent);
    expect(P2DataTableComponent).toBe(DataTableComponent);
  });

  const create = (
    data: Record<string, unknown>[],
    inputs: Record<string, unknown> = {},
  ) => {
    const fixture = TestBed.createComponent(DataTableComponent);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('columns', [
      { key: 'label', header: 'Label' },
    ]);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture;
  };

  it('keeps keyed identity through immutable updates and reordering', () => {
    const first = { id: 1, label: 'First' };
    const second = { id: 2, label: 'Second' };
    const fixture = create([first, second]);
    const table = fixture.componentInstance;
    const initialIds = new Map([
      [first.id, table.getRowId(first)],
      [second.id, table.getRowId(second)],
    ]);

    const updated = [
      { ...second, label: 'Second updated' },
      { ...first, label: 'First updated' },
    ];
    fixture.componentRef.setInput('data', updated);
    fixture.detectChanges();

    expect(table.getRowId(updated[0])).toBe(initialIds.get(second.id)!);
    expect(table.getRowId(updated[1])).toBe(initialIds.get(first.id)!);
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'tbody tr',
        ) as NodeListOf<HTMLTableRowElement>,
      ).map((row) => row.textContent?.trim()),
    ).toEqual(['Second updated', 'First updated']);
  });

  it('keeps object identity stable when a row has no key', () => {
    const row = { label: 'Before' };
    const fixture = create([row]);
    const table = fixture.componentInstance;
    const initialId = table.getRowId(row);

    row.label = 'After';
    expect(table.getRowId(row)).toBe(initialId);
    expect(table.getRowId({ label: 'After' })).not.toBe(initialId);
  });

  it('does not collide for twin rows with the same content or keyless reorder', () => {
    const first = { label: 'Twin' };
    const second = { label: 'Twin' };
    const fixture = create([first, second]);
    const table = fixture.componentInstance;
    const firstId = table.getRowId(first);
    const secondId = table.getRowId(second);

    expect(firstId).not.toBe(secondId);
    expect(table.getRowId(first)).toBe(firstId);
    expect(table.getRowId(second)).toBe(secondId);

    const beforeRows = Array.from(
      fixture.nativeElement.querySelectorAll(
        'tbody tr',
      ) as NodeListOf<HTMLTableRowElement>,
    );
    fixture.componentRef.setInput('data', [second, first]);
    fixture.detectChanges();
    const afterRows = Array.from(
      fixture.nativeElement.querySelectorAll(
        'tbody tr',
      ) as NodeListOf<HTMLTableRowElement>,
    );
    expect(table.getRowId(second)).toBe(secondId);
    expect(table.getRowId(first)).toBe(firstId);
    expect(afterRows[0]).toBe(beforeRows[1]);
    expect(afterRows[1]).toBe(beforeRows[0]);
  });

  it('preserves dataKey value semantics for immutable copies', () => {
    const row = { code: 'A', label: 'Original' };
    const fixture = create([row], { dataKey: 'code' });
    const table = fixture.componentInstance;

    expect(table.getRowId({ code: 'A', label: 'External copy' })).toBe(
      table.getRowId(row),
    );
  });

  it('renders single selection as an accessible radio group', () => {
    const first = { id: 1, label: 'First' };
    const second = { id: 2, label: 'Second' };
    const fixture = create([first, second], {
      selectionMode: 'single',
      selected: [first],
    });
    const table = fixture.componentInstance;

    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('tbody input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(radios).toHaveSize(2);
    expect(radios[0].name).toBe(radios[1].name);
    expect(radios[0].checked).toBeTrue();
    expect(radios[1].checked).toBeFalse();
    expect(radios[0].getAttribute('aria-label')).toBe('Select row 1');
    expect(fixture.nativeElement.querySelector('thead input')).toBeNull();

    const selectionChanges: Record<string, unknown>[][] = [];
    table.selectionChange.subscribe((selection) =>
      selectionChanges.push(selection),
    );
    radios[1].checked = true;
    radios[1].dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(table.selected()).toEqual([second]);
    expect(selectionChanges).toEqual([[second]]);
    expect(radios[0].checked).toBeFalse();
    expect(radios[1].checked).toBeTrue();
  });

  it('applies appearance options and emits row hover only when enabled', () => {
    const row = { id: 1, label: 'First' };
    const fixture = create([row], {
      rowHover: true,
      stripedRows: true,
      showGridlines: true,
      size: 'small',
      styleClass: 'consumer-table',
      tableStyleClass: 'consumer-table-inner',
    });
    const table = fixture.componentInstance;
    const hovered: Record<string, unknown>[] = [];
    table.onRowHover.subscribe((value) => hovered.push(value));
    const wrapper = fixture.nativeElement.querySelector(
      '.orc-p2-data-table',
    ) as HTMLElement;
    const innerTable = fixture.nativeElement.querySelector(
      'table',
    ) as HTMLTableElement;
    const tableRow = fixture.nativeElement.querySelector(
      'tbody tr',
    ) as HTMLTableRowElement;

    expect(wrapper.classList.contains('consumer-table')).toBeTrue();
    expect(wrapper.classList.contains('row-hover')).toBeTrue();
    expect(wrapper.classList.contains('striped')).toBeTrue();
    expect(wrapper.classList.contains('gridlines')).toBeTrue();
    expect(wrapper.classList.contains('small')).toBeTrue();
    expect(innerTable.classList.contains('consumer-table-inner')).toBeTrue();
    tableRow.dispatchEvent(new MouseEvent('mouseenter'));
    expect(hovered).toEqual([row]);

    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(wrapper.classList.contains('large')).toBeTrue();
    expect(wrapper.classList.contains('small')).toBeFalse();

    const defaultAppearance = create([row]);
    const defaultWrapper = defaultAppearance.nativeElement.querySelector(
      '.orc-p2-data-table',
    ) as HTMLElement;
    const defaultHover: Record<string, unknown>[] = [];
    defaultAppearance.componentInstance.onRowHover.subscribe((value) =>
      defaultHover.push(value),
    );
    expect(defaultWrapper.classList.contains('row-hover')).toBeFalse();
    expect(defaultWrapper.classList.contains('striped')).toBeFalse();
    expect(defaultWrapper.classList.contains('gridlines')).toBeFalse();
    expect(defaultWrapper.classList.contains('small')).toBeFalse();
    expect(defaultWrapper.classList.contains('large')).toBeFalse();
    expect(
      defaultAppearance.nativeElement.querySelector('.global-filter'),
    ).toBeNull();
    (
      defaultAppearance.nativeElement.querySelector(
        'tbody tr',
      ) as HTMLTableRowElement
    ).dispatchEvent(new MouseEvent('mouseenter'));
    expect(defaultHover).toEqual([]);
  });

  it('activates clickable rows with Enter and Space without hijacking nested controls', () => {
    const row = { id: 1, label: 'First' };
    const fixture = create([row], { selectionMode: 'multiple' });
    const table = fixture.componentInstance;
    const emitted: Record<string, unknown>[] = [];
    table.rowClick.subscribe((value) => emitted.push(value));
    const tableRow = fixture.nativeElement.querySelector(
      'tbody tr',
    ) as HTMLTableRowElement;

    expect(tableRow.tabIndex).toBe(0);
    expect(getComputedStyle(tableRow).cursor).toBe('pointer');
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    tableRow.dispatchEvent(enter);
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    tableRow.dispatchEvent(space);
    expect(enter.defaultPrevented).toBeTrue();
    expect(space.defaultPrevented).toBeTrue();
    expect(emitted).toEqual([row, row]);

    const checkbox = fixture.nativeElement.querySelector(
      'tbody input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(emitted).toEqual([row, row]);
  });

  it('shows the loading state and message while withholding data rows', () => {
    const fixture = create([{ id: 1, label: 'First' }], {
      loading: true,
      loadingMessage: 'Loading inventory',
    });
    const wrapper = fixture.nativeElement.querySelector(
      '.orc-p2-data-table',
    ) as HTMLElement;

    expect(wrapper.getAttribute('aria-busy')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('tbody .empty')?.textContent?.trim(),
    ).toBe('Loading inventory');
    expect(
      fixture.nativeElement.querySelector('tbody td:not(.empty)'),
    ).toBeNull();

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(wrapper.getAttribute('aria-busy')).toBe('false');
    expect(fixture.nativeElement.querySelector('tbody .empty')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('tbody tr')?.textContent,
    ).toContain('First');
  });

  it('uses selectable, custom rowKey, and direct pageSize inputs in the rendered controls', () => {
    const rows = [
      { sku: 'sku-A', label: 'Alpha' },
      { sku: 'sku-B', label: 'Beta' },
      { sku: 'sku-C', label: 'Gamma' },
    ];
    const fixture = create(rows, {
      selectable: true,
      rowKey: 'sku',
      rowAriaLabel: 'Choose product',
      paginator: true,
      pageSize: 2,
    });
    const table = fixture.componentInstance;
    const selectAll = fixture.nativeElement.querySelector(
      'thead input',
    ) as HTMLInputElement;
    const rowInputs = Array.from(
      fixture.nativeElement.querySelectorAll('tbody input'),
    ) as HTMLInputElement[];

    expect(selectAll.type).toBe('checkbox');
    expect(selectAll.getAttribute('aria-label')).toBe('Select all rows');
    expect(rowInputs).toHaveSize(2);
    expect(rowInputs[0].type).toBe('checkbox');
    expect(rowInputs[0].getAttribute('aria-label')).toBe(
      'Choose product sku-A',
    );
    expect(table.effectivePageSize()).toBe(2);
    expect(table.pageRows().map((row) => row['sku'])).toEqual([
      'sku-A',
      'sku-B',
    ]);

    const nextPage = fixture.nativeElement.querySelector(
      '.paginator button:last-child',
    ) as HTMLButtonElement;
    nextPage.click();
    fixture.detectChanges();

    expect(table.pageRows().map((row) => row['sku'])).toEqual(['sku-C']);
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveSize(1);
  });

  it('uses filtered local totals and does not reslice a lazy server page', () => {
    const local = create(
      [
        { id: 1, label: 'Needle one' },
        { id: 2, label: 'Needle two' },
        { id: 3, label: 'Other' },
      ],
      { paginator: true, rows: 2, totalRecords: 100, filterable: true },
    );
    const localTable = local.componentInstance;
    localTable.setFilter('needle');
    expect(localTable.effectiveTotalRecords()).toBe(2);
    expect(localTable.pageCount()).toBe(1);
    expect(localTable.pageRows().map((row) => row['id'])).toEqual([1, 2]);

    const lazy = create(
      [
        { id: 11, label: 'Loaded row one' },
        { id: 12, label: 'Loaded row two' },
      ],
      { paginator: true, lazy: true, rows: 10, totalRecords: 25 },
    );
    const lazyTable = lazy.componentInstance;
    lazyTable.page.set(1);
    lazy.detectChanges();
    expect(lazyTable.pageCount()).toBe(3);
    expect(lazyTable.pageRows().map((row) => row['id'])).toEqual([11, 12]);
    const requests: Array<{ first: number; rows: number }> = [];
    lazyTable.onLazyLoad.subscribe((event) => requests.push(event));
    lazyTable.goToPage(2);
    expect(requests).toEqual([{ first: 20, rows: 10 }]);
  });

  it('keeps the controlled first offset and page index synchronized', () => {
    const fixture = create(
      Array.from({ length: 6 }, (_, index) => ({
        id: index + 1,
        label: `Row ${index + 1}`,
      })),
      { paginator: true, rows: 2, first: 4 },
    );
    const table = fixture.componentInstance;

    expect(table.page()).toBe(2);
    expect(table.pageRows().map((row) => row['id'])).toEqual([5, 6]);

    table.page.set(1);
    fixture.detectChanges();
    expect(table.first()).toBe(2);
    expect(table.pageRows().map((row) => row['id'])).toEqual([3, 4]);
  });

  it('clamps the controlled page when local data shrinks', () => {
    const fixture = create(
      Array.from({ length: 6 }, (_, index) => ({
        id: index + 1,
        label: `Row ${index + 1}`,
      })),
      { paginator: true, rows: 2, page: 2 },
    );
    const table = fixture.componentInstance;
    expect(table.pageRows().map((row) => row['id'])).toEqual([5, 6]);

    fixture.componentRef.setInput('data', [{ id: 1, label: 'Only row' }]);
    fixture.detectChanges();

    expect(table.page()).toBe(0);
    expect(table.first()).toBe(0);
    expect(table.pageRows().map((row) => row['id'])).toEqual([1]);
    expect(fixture.nativeElement.querySelector('tbody .empty')).toBeNull();
  });

  it('normalizes malformed controlled pagination and names the paginator landmark', () => {
    const fixture = create(
      Array.from({ length: 4 }, (_, index) => ({
        id: index + 1,
        label: `Row ${index + 1}`,
      })),
      { paginator: true, rows: 2, page: 1.8, first: Number.NaN },
    );
    const table = fixture.componentInstance;
    fixture.detectChanges();

    expect(table.page()).toBe(1);
    expect(table.first()).toBe(2);
    expect(table.pageRows().map((row) => row['id'])).toEqual([3, 4]);
    expect(
      fixture.nativeElement
        .querySelector('nav.paginator')
        ?.getAttribute('aria-label'),
    ).toBe('Pagination');
  });

  it('shows empty text after filtering and gives the table a useful accessible name', () => {
    const fixture = create([{ id: 1, label: 'First' }], {
      filterable: true,
      emptyText: 'No matching rows',
      filter: 'First',
    });
    const table = fixture.componentInstance;
    const filter = fixture.nativeElement.querySelector(
      '.global-filter',
    ) as HTMLInputElement;
    const filterChanges: Array<{ value: string }> = [];
    table.onFilter.subscribe((event) => filterChanges.push(event));
    fixture.detectChanges();

    expect(filter.value).toBe('First');
    expect(table.filteredRows()).toEqual([{ id: 1, label: 'First' }]);

    filter.value = 'missing';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(table.filter()).toBe('missing');
    expect(filterChanges).toEqual([{ value: 'missing' }]);
    expect(
      fixture.nativeElement.querySelector('tbody .empty')?.textContent?.trim(),
    ).toBe('No matching rows');
    expect(
      fixture.nativeElement.querySelector('table')?.getAttribute('aria-label'),
    ).toBe('Data table');
    expect(fixture.nativeElement.querySelector('caption')).toBeNull();
    expect(fixture.nativeElement.querySelector('nav.paginator')).toBeNull();
    expect(fixture.nativeElement.querySelector('thead input')).toBeNull();
    expect(fixture.nativeElement.querySelector('tbody input')).toBeNull();
  });

  it('gives the global filter a fallback accessible name and preserves overrides', () => {
    const fixture = create([{ id: 1, label: 'First' }], { filterable: true });
    const filter = fixture.nativeElement.querySelector(
      '.global-filter',
    ) as HTMLInputElement;

    expect(filter.getAttribute('aria-label')).toBe('Filter table');

    fixture.componentRef.setInput('filterAriaLabel', '   ');
    fixture.detectChanges();

    expect(filter.getAttribute('aria-label')).toBe('Filter table');

    fixture.componentRef.setInput('filterAriaLabel', 'Filter components');
    fixture.detectChanges();

    expect(filter.getAttribute('aria-label')).toBe('Filter components');
  });

  it('trims blank table, selection, filter, and paginator labels to useful fallbacks', () => {
    const fixture = create(
      [
        { id: 1, label: 'First' },
        { id: 2, label: 'Second' },
      ],
      {
        label: '   ',
        ariaLabel: '   ',
        filterable: true,
        filterPlaceholder: '  Find records  ',
        filterAriaLabel: '   ',
        selectionMode: 'multiple',
        selectAllAriaLabel: '   ',
        rowAriaLabel: '   ',
        paginator: true,
        rows: 1,
        paginatorAriaLabel: '   ',
        previousPageAriaLabel: '   ',
        nextPageAriaLabel: '   ',
      },
    );
    const table = fixture.componentInstance;
    const nativeTable = fixture.nativeElement.querySelector(
      'table',
    ) as HTMLTableElement;
    const filter = fixture.nativeElement.querySelector(
      '.global-filter',
    ) as HTMLInputElement;
    const selectAll = fixture.nativeElement.querySelector(
      'thead input',
    ) as HTMLInputElement;
    const rowSelection = fixture.nativeElement.querySelector(
      'tbody input',
    ) as HTMLInputElement;
    const paginator = fixture.nativeElement.querySelector(
      'nav.paginator',
    ) as HTMLElement;
    const previous = paginator.querySelector('button') as HTMLButtonElement;
    const next = paginator.querySelectorAll('button')[1] as HTMLButtonElement;

    expect(nativeTable.getAttribute('aria-label')).toBe('Data table');
    expect(fixture.nativeElement.querySelector('caption')).toBeNull();
    expect(filter.placeholder).toBe('Find records');
    expect(filter.getAttribute('aria-label')).toBe('Filter table');
    expect(selectAll.getAttribute('aria-label')).toBe('Select all rows');
    expect(rowSelection.getAttribute('aria-label')).toBe('Select row 1');
    expect(paginator.getAttribute('aria-label')).toBe('Pagination');
    expect(previous.getAttribute('aria-label')).toBe('Previous page');
    expect(next.getAttribute('aria-label')).toBe('Next page');

    fixture.componentRef.setInput('ariaLabel', ' Inventory ');
    fixture.componentRef.setInput('selectAllAriaLabel', ' Select every row ');
    fixture.componentRef.setInput('rowAriaLabel', ' Choose record ');
    fixture.componentRef.setInput('paginatorAriaLabel', ' Page controls ');
    fixture.componentRef.setInput('previousPageAriaLabel', ' Back ');
    fixture.componentRef.setInput('nextPageAriaLabel', ' Forward ');
    fixture.detectChanges();

    expect(nativeTable.getAttribute('aria-label')).toBe('Inventory');
    expect(selectAll.getAttribute('aria-label')).toBe('Select every row');
    expect(rowSelection.getAttribute('aria-label')).toBe('Choose record 1');
    expect(paginator.getAttribute('aria-label')).toBe('Page controls');
    expect(previous.getAttribute('aria-label')).toBe('Back');
    expect(next.getAttribute('aria-label')).toBe('Forward');

    fixture.componentRef.setInput('label', ' Inventory records ');
    fixture.detectChanges();
    expect(nativeTable.getAttribute('aria-label')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('caption')?.textContent?.trim(),
    ).toBe('Inventory records');
    expect(table.effectiveLabel()).toBe('Inventory records');
  });

  it('announces replaced single selections and keeps sort and paging controls keyboard-operable', () => {
    const first = { id: 1, label: 'Alpha' };
    const second = { id: 2, label: 'Beta' };
    const fixture = create([first, second], {
      paginator: true,
      rows: 1,
      selectionMode: 'single',
      sortField: 'label',
      sortOrder: -1,
    });
    fixture.componentRef.setInput('columns', [
      { key: 'label', header: 'Label', sortable: true },
    ]);
    const table = fixture.componentInstance;
    const unselected: Record<string, unknown>[] = [];
    table.selected.set([first]);
    table.rowUnselect.subscribe((row) => unselected.push(row));
    table.toggleRow(second, true);
    fixture.detectChanges();

    expect(unselected).toEqual([first]);
    const header = fixture.nativeElement.querySelector(
      'th[aria-sort]',
    ) as HTMLTableCellElement;
    const sortButton = header.querySelector('button') as HTMLButtonElement;
    expect(sortButton.tagName).toBe('BUTTON');
    expect(header.getAttribute('aria-sort')).toBe('descending');
    sortButton.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('ascending');

    const previous = fixture.nativeElement.querySelector(
      '.paginator button',
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelectorAll(
      '.paginator button',
    )[1] as HTMLButtonElement;
    expect(previous.getAttribute('aria-label')).toBe('Previous page');
    expect(next.getAttribute('aria-label')).toBe('Next page');
  });

  it('filters across every record key, not only the configured columns', () => {
    const fixture = create(
      [
        { id: 1, label: 'Alpha', note: 'visible' },
        { id: 2, label: 'Beta', note: 'hidden' },
      ],
      { filterable: true },
    );
    fixture.componentRef.setInput('columns', [
      { key: 'label', header: 'Label' },
    ]);
    fixture.detectChanges();
    const table = fixture.componentInstance;
    expect(table.filteredRows().map((row) => row['id'])).toEqual([1, 2]);

    table.setFilter('hidden');
    expect(table.filteredRows().map((row) => row['id'])).toEqual([2]);

    table.setFilter('beta');
    expect(table.filteredRows().map((row) => row['id'])).toEqual([2]);
  });

  it('resolves record cells by direct property lookup without dot-path traversal', () => {
    const fixture = create([{ id: 1, 'a.b': 'literal', a: { b: 'nested' } }], {
      filterable: true,
    });
    fixture.componentRef.setInput('columns', [{ key: 'a.b', header: 'Path' }]);
    fixture.detectChanges();
    const table = fixture.componentInstance;

    expect(table.getCell({ 'a.b': 'literal', a: { b: 'nested' } }, 'a.b')).toBe(
      'literal',
    );
    expect(table.filteredRows()).toEqual([
      { id: 1, 'a.b': 'literal', a: { b: 'nested' } },
    ]);

    table.setFilter('nested');
    expect(table.filteredRows()).toEqual([]);
    table.setFilter('literal');
    expect(table.filteredRows()).toHaveSize(1);
  });

  it('sorts record values through numeric-aware text collation and empty-string fallbacks', () => {
    const fixture = create([
      { id: 1, size: 10 },
      { id: 2, size: 9 },
      { id: 3, size: undefined },
    ]);
    fixture.componentRef.setInput('columns', [
      { key: 'size', header: 'Size', sortable: true },
    ]);
    fixture.componentRef.setInput('sortField', 'size');
    fixture.componentRef.setInput('sortOrder', 1);
    fixture.detectChanges();
    const table = fixture.componentInstance;

    expect(table.rows().map((row) => row['id'])).toEqual([3, 2, 1]);
    expect(table.rows()[0]['size']).toBeUndefined();

    fixture.componentRef.setInput('sortOrder', -1);
    fixture.detectChanges();
    expect(table.rows().map((row) => row['id'])).toEqual([1, 2, 3]);
  });

  it('emits one lazy query on init and still filters and sorts a loaded lazy window', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    fixture.componentRef.setInput('data', [
      { id: 1, label: 'Keep' },
      { id: 2, label: 'Drop' },
    ]);
    fixture.componentRef.setInput('columns', [
      { key: 'label', header: 'Label' },
    ]);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('lazyLoadOnInit', true);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('totalRecords', 50);
    const table = fixture.componentInstance;
    const requests: Array<{ first: number; rows: number }> = [];
    table.onLazyLoad.subscribe((event) => requests.push(event));
    fixture.detectChanges();

    expect(requests).toEqual([{ first: 0, rows: 10 }]);
    expect(table.effectiveTotalRecords()).toBe(50);

    table.setFilter('keep');
    fixture.detectChanges();
    expect(table.filteredRows().map((row) => row['id'])).toEqual([1]);
    expect(table.pageRows().map((row) => row['id'])).toEqual([1]);
  });

  it('prefers dataKey over rowKey for row identity', () => {
    const fixture = create([{ sku: 'sku-A', code: 'code-1', label: 'First' }], {
      rowKey: 'sku',
      dataKey: 'code',
    });
    const table = fixture.componentInstance;
    expect(table.getRowId({ sku: 'sku-A', code: 'code-1' })).toBe('code-1');
  });

  it('renders the compatibility value collection over data when both are bound', () => {
    const fixture = create([{ id: 1, label: 'From data' }], {
      value: [{ id: 9, label: 'From value' }],
    });
    expect(
      fixture.nativeElement.querySelector('tbody tr')?.textContent?.trim(),
    ).toContain('From value');
  });

  it('toggles an initially ascending controlled sort to descending on click', () => {
    const fixture = create(
      [
        { id: 1, name: 'Beta' },
        { id: 2, name: 'Alpha' },
      ],
      { sortField: 'name', sortOrder: 1 },
    );
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name', sortable: true },
    ]);
    const table = fixture.componentInstance;
    const sortChanges: Array<{
      key: string;
      direction: 'ascending' | 'descending';
    }> = [];
    const sortEvents: Array<{
      key: string;
      direction: 'ascending' | 'descending';
    }> = [];
    table.sortChange.subscribe((event) => sortChanges.push(event));
    table.onSort.subscribe((event) => sortEvents.push(event));
    fixture.detectChanges();

    expect(table.rows().map((row) => row['name'])).toEqual(['Alpha', 'Beta']);
    const header = fixture.nativeElement.querySelector(
      'th[aria-sort]',
    ) as HTMLTableCellElement;
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    (header.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(table.sortOrder()).toBe(-1);
    expect(table.rows().map((row) => row['name'])).toEqual(['Beta', 'Alpha']);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(sortChanges).toEqual([{ key: 'name', direction: 'descending' }]);
    expect(sortEvents).toEqual([{ key: 'name', direction: 'descending' }]);
  });
});
