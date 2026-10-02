import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableComponent } from './table.component';
import { ColumnDirective } from './table-column.directive';
import {
  CellDefDirective,
  HeaderCellDefDirective,
} from './table-cell-def.directive';
import {
  TableFooterDirective,
  TableRowExpansionDirective,
} from './table-slots.directive';
import { isTableControlEvent } from './table-data';

interface Row {
  id: number;
  profile: { name: string };
  allowed?: boolean;
}
const rows: Row[] = [
  { id: 1, profile: { name: 'Zulu' }, allowed: true },
  { id: 2, profile: { name: 'Alpha' }, allowed: false },
  { id: 3, profile: { name: 'Beta' }, allowed: true },
  { id: 4, profile: { name: 'Delta' }, allowed: true },
  { id: 5, profile: { name: 'Echo' }, allowed: true },
  { id: 6, profile: { name: 'Foxtrot' }, allowed: true },
];
const columns = [{ key: 'profile.name', header: 'Name', sortable: true }];

@Component({
  imports: [
    TableComponent,
    ColumnDirective,
    CellDefDirective,
    HeaderCellDefDirective,
  ],
  template: `<orc-table [data]="data" selectable>
    <orc-column key="profile.name" header="Name" sortable>
      <ng-template orcHeaderCellDef
        ><input aria-label="Header search"
      /></ng-template>
      <ng-template orcCellDef let-row
        ><button type="button">Edit {{ row.profile.name }}</button>
        <div role="slider" tabindex="0" aria-label="Adjust value"></div
      ></ng-template>
    </orc-column>
  </orc-table>`,
})
class ControlsHost {
  data = rows;
}

@Component({
  imports: [
    TableComponent,
    ColumnDirective,
    TableFooterDirective,
    TableRowExpansionDirective,
  ],
  template: `<orc-table
    [data]="data"
    [columnsConfig]="columns"
    [rowExpandMode]="rowExpandMode"
    [(expandedRows)]="expandedRows"
  >
    <ng-template orcRowExpansion let-row let-index="index">
      <div class="expansion-content">{{ row.profile.name }} / {{ index }}</div>
    </ng-template>
    <ng-template orcTableFooter>
      <span class="aggregate-content">Total: {{ data.length }}</span>
    </ng-template>
  </orc-table>`,
})
class ExpansionHost {
  data = rows.slice(0, 3);
  columns = columns;
  rowExpandMode: 'multiple' | 'single' = 'multiple';
  expandedRows: Row[] = [];
}

describe('Table browser behavior', () => {
  let fixture: ComponentFixture<TableComponent<Row>>;
  const create = (inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(TableComponent<Row>);
    for (const [key, value] of Object.entries({
      data: rows,
      columnsConfig: columns,
      ...inputs,
    })) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture.componentInstance;
  };
  const cells = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll(
        'tbody .orc-table__cell-value',
      ) as NodeListOf<HTMLElement>,
    ).map((cell) => cell.textContent?.trim());
  const checkboxes = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll(
        'input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>,
    );
  const key = (element: HTMLElement, value: string) => {
    const event = new KeyboardEvent('keydown', {
      key: value,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event;
  };

  it('recognizes nested controls from a same-origin iframe realm', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe document unavailable');
    const row = frameDocument.createElement('div');
    const button = frameDocument.createElement('button');
    row.appendChild(button);
    frameDocument.body.appendChild(row);

    let controlEvent = false;
    row.addEventListener('click', (event) => {
      controlEvent = isTableControlEvent(event);
    });
    button.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        composed: true,
      }),
    );

    expect(controlEvent).toBeTrue();
    iframe.remove();
  });

  it('uses nested configured fields consistently for rendering, aliases, sorting and filtering', () => {
    const table = create({
      sortField: 'profile.name',
      sortOrder: 1,
      globalFilterFields: ['profile.name'],
    });
    expect(cells()).toEqual([
      'Alpha',
      'Beta',
      'Delta',
      'Echo',
      'Foxtrot',
      'Zulu',
    ]);
    const header = fixture.nativeElement.querySelector('th') as HTMLElement;
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    header.click();
    fixture.detectChanges();
    expect(cells()[0]).toBe('Zulu');
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(header.querySelector('path')?.getAttribute('d')).toBe(
      'M8 4v8M4 8l4 4 4-4',
    );
    fixture.componentRef.setInput('sortDirection', 'asc');
    fixture.detectChanges();
    expect(cells()[0]).toBe('Alpha');
    table.applyFilter('ALP');
    fixture.detectChanges();
    expect(cells()).toEqual(['Alpha']);
    expect(rows[0].profile.name).toBe('Zulu');
  });

  it('hides the initial sort badge without hiding an active sort indicator', () => {
    create({ showInitialSortBadge: false });
    const header = fixture.nativeElement.querySelector('th') as HTMLElement;
    expect(header.querySelector('.orc-table__sort-icon')).toBeNull();

    header.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(header.querySelector('.orc-table__sort-icon')).not.toBeNull();

    header.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(header.querySelector('.orc-table__sort-icon')).not.toBeNull();

    header.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('none');
    expect(header.querySelector('.orc-table__sort-icon')).toBeNull();
  });

  it('keeps row DOM identity during immutable updates through rowTrackBy', () => {
    create({
      rowKey: 'missing',
      rowTrackBy: (_index: number, row: Row) => row.id,
    });
    const before = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr'),
    );
    fixture.componentRef.setInput(
      'data',
      [...rows].reverse().map((row) => ({
        ...row,
        profile: { name: row.profile.name + ' updated' },
      })),
    );
    fixture.detectChanges();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('tbody tr')),
    ).toEqual(before.reverse());
    expect(cells()[0]).toBe('Foxtrot updated');
  });

  it('leaves custom sorting to the consumer and emits its callback only in custom mode', () => {
    const table = create();
    const custom = jasmine.createSpy('custom');
    const sortChange = jasmine.createSpy('sortChange');
    const onSort = jasmine.createSpy('onSort');
    table.sortFunction.subscribe(custom);
    table.sortChange.subscribe(sortChange);
    table.onSort.subscribe(onSort);
    const header = fixture.nativeElement.querySelector('th') as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(custom).not.toHaveBeenCalled();
    expect(sortChange).toHaveBeenCalledOnceWith({
      column: 'profile.name',
      direction: 'asc',
    });
    expect(onSort).toHaveBeenCalledOnceWith({
      column: 'profile.name',
      direction: 'asc',
    });
    fixture.componentRef.setInput('customSort', true);
    fixture.detectChanges();
    header.click();
    fixture.detectChanges();
    expect(custom).toHaveBeenCalledOnceWith({
      column: 'profile.name',
      direction: 'desc',
    });
    expect(sortChange).toHaveBeenCalledTimes(2);
    expect(onSort).toHaveBeenCalledTimes(2);
    expect(cells()).toEqual(rows.map((row) => row.profile.name));
  });

  it('resets a later local page after filtering and counts the matching rows', () => {
    const table = create({
      paginated: true,
      rows: 2,
      currentPage: 3,
      filterable: true,
      globalFilterFields: ['profile.name'],
    });
    const filter = jasmine.createSpy('filter');
    table.onFilter.subscribe(filter);
    expect(cells()).toEqual(['Echo', 'Foxtrot']);
    const input = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Filter rows');
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(filter).toHaveBeenCalledOnceWith({ value: 'a' });
    expect(cells()).toEqual(['Alpha', 'Beta']);
    expect(table.effectiveTotalItems()).toBe(3);
    expect(table.displayedPage()).toBe(1);
    const pager = fixture.debugElement.query(By.directive(PaginatorComponent))
      .componentInstance as PaginatorComponent;
    expect(pager.totalPages()).toBe(2);
  });

  it('clamps a local page when data shrinks and reconciles first and currentPage updates', () => {
    const table = create({ paginated: true, rows: 2, first: 4 });
    expect(cells()).toEqual(['Echo', 'Foxtrot']);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    expect(cells()).toEqual(['Beta', 'Delta']);
    fixture.componentRef.setInput('first', 0);
    fixture.detectChanges();
    expect(cells()).toEqual(['Zulu', 'Alpha']);
    fixture.componentRef.setInput('first', 4);
    fixture.detectChanges();
    fixture.componentRef.setInput('data', rows.slice(0, 3));
    fixture.detectChanges();
    expect(cells()).toEqual(['Beta']);
    expect(table.displayedPage()).toBe(2);
  });

  it('uses the paginator-selected size even with a rows alias, then honors later controlled updates', () => {
    const table = create({
      paginated: true,
      rows: 2,
      pageSizeOptions: [2, 3, 4],
    });
    const select = fixture.nativeElement.querySelector(
      'select',
    ) as HTMLSelectElement;
    select.value = '3';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(table.effectivePageSize()).toBe(3);
    expect(cells().length).toBe(3);
    fixture.componentRef.setInput('pageSize', 4);
    fixture.detectChanges();
    expect(cells().length).toBe(4);
    fixture.componentRef.setInput('rows', 2);
    fixture.detectChanges();
    // An unchanged parent binding is not a new controlled write in Angular.
    expect(cells().length).toBe(4);
    fixture.componentRef.setInput('rows', 3);
    fixture.detectChanges();
    expect(cells().length).toBe(3);
  });

  for (const remote of ['lazy', 'serverDriven']) {
    it(`preserves a ${remote} page and emits exactly one query per interaction`, () => {
      fixture = TestBed.createComponent(TableComponent<Row>);
      const table = fixture.componentInstance;
      const query = jasmine.createSpy('query');
      const lazy = jasmine.createSpy('lazy');
      table.queryChange.subscribe(query);
      table.onLazyLoad.subscribe(lazy);
      for (const [name, value] of Object.entries({
        data: rows.slice(0, 2),
        columnsConfig: columns,
        [remote]: true,
        paginated: true,
        rows: 2,
        first: 4,
        totalRecords: 20,
        filter: 'not present',
        sortField: 'profile.name',
        sortOrder: 1,
      }))
        fixture.componentRef.setInput(name, value);
      fixture.detectChanges();
      expect(cells()).toEqual(['Zulu', 'Alpha']);
      expect(query).toHaveBeenCalledOnceWith({
        first: 4,
        rows: 2,
        sort: { column: 'profile.name', direction: 'asc' },
        filter: 'not present',
        filters: {},
      });
      expect(lazy.calls.count()).toBe(1);
      table.handlePageChange({ page: 4, pageSize: 2, startIndex: 7 });
      fixture.detectChanges();
      expect(query.calls.mostRecent().args[0].first).toBe(6);
      expect(lazy.calls.count()).toBe(2);
      table.applyFilter('updated');
      fixture.detectChanges();
      expect(query.calls.mostRecent().args[0]).toEqual({
        first: 0,
        rows: 2,
        sort: { column: 'profile.name', direction: 'asc' },
        filter: 'updated',
        filters: {},
      });
      expect(lazy.calls.count()).toBe(3);
      expect(cells()).toEqual(['Zulu', 'Alpha']);
    });
  }

  it('honors lazyLoadOnInit and resets a server page on sorting', () => {
    fixture = TestBed.createComponent(TableComponent<Row>);
    const table = fixture.componentInstance;
    const query = jasmine.createSpy('query');
    table.queryChange.subscribe(query);
    for (const [name, value] of Object.entries({
      data: rows,
      columnsConfig: columns,
      lazy: true,
      lazyLoadOnInit: false,
      first: 10,
      rows: 5,
      totalRecords: 30,
    }))
      fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    expect(query).not.toHaveBeenCalled();
    (fixture.nativeElement.querySelector('th') as HTMLElement).click();
    fixture.detectChanges();
    expect(query).toHaveBeenCalledOnceWith({
      first: 0,
      rows: 5,
      sort: { column: 'profile.name', direction: 'asc' },
      filter: undefined,
      filters: {},
    });
  });

  it('bulk-selects only eligible filtered rows and matches header state to that scope', () => {
    const table = create({
      selectable: true,
      paginated: true,
      rows: 2,
      rowSelectable: ({ data }: { data: Row }) => !!data.allowed,
    });
    const selectAll = jasmine.createSpy('selectAll');
    const headerToggle = jasmine.createSpy('headerToggle');
    table.selectAllChange.subscribe(selectAll);
    table.onHeaderCheckboxToggle.subscribe(headerToggle);
    expect(checkboxes()[2].disabled).toBeTrue();
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows().map((row) => row.id)).toEqual([1, 3, 4, 5, 6]);
    expect(selectAll).toHaveBeenCalledOnceWith({
      checked: true,
      data: [rows[0], rows[2], rows[3], rows[4], rows[5]],
    });
    expect(headerToggle).toHaveBeenCalledOnceWith({
      checked: true,
      data: [rows[0], rows[2], rows[3], rows[4], rows[5]],
    });
    expect(checkboxes()[0].checked).toBeTrue();
    expect(checkboxes()[0].indeterminate).toBeFalse();
    table.applyFilter('Zulu');
    fixture.detectChanges();
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows().map((row) => row.id)).toEqual([3, 4, 5, 6]);
  });

  it('limits page-only bulk selection to displayed rows and preserves selections elsewhere', () => {
    const table = create({
      selectable: true,
      paginated: true,
      rows: 2,
      selectionPageOnly: true,
      rowSelectable: ({ data }: { data: Row }) => !!data.allowed,
    });
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[0]]);
    table.handlePageChange({ page: 2, pageSize: 2, startIndex: 3 });
    fixture.detectChanges();
    expect(checkboxes()[0].checked).toBeFalse();
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[0], rows[2], rows[3]]);
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[0]]);
  });

  it('has no bulk control in single-selection mode and emits only real row selection changes', () => {
    const table = create({ selectionMode: 'single' });
    const changed = jasmine.createSpy('changed');
    table.selectionChange.subscribe(changed);
    expect(fixture.nativeElement.querySelector('thead input')).toBeNull();
    checkboxes()[0].click();
    fixture.detectChanges();
    table.toggleRowSelect(rows[0], true);
    fixture.detectChanges();
    expect(changed.calls.count()).toBe(1);
    checkboxes()[1].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[1]]);
    table.toggleSelectAll(true);
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[1]]);
  });

  it('emits canonical and compatibility row selection outputs with stable payloads', () => {
    const table = create({ selectable: true });
    const rowSelect = jasmine.createSpy('rowSelect');
    const onRowSelect = jasmine.createSpy('onRowSelect');
    const rowUnselect = jasmine.createSpy('rowUnselect');
    const onRowUnselect = jasmine.createSpy('onRowUnselect');
    table.rowSelect.subscribe(rowSelect);
    table.onRowSelect.subscribe(onRowSelect);
    table.rowUnselect.subscribe(rowUnselect);
    table.onRowUnselect.subscribe(onRowUnselect);

    table.toggleRowSelect(rows[0], true);
    fixture.detectChanges();
    expect(rowSelect).toHaveBeenCalledOnceWith({ data: rows[0] });
    expect(onRowSelect).toHaveBeenCalledOnceWith({ data: rows[0] });

    table.toggleRowSelect(rows[0], false);
    fixture.detectChanges();
    expect(rowUnselect).toHaveBeenCalledOnceWith({ data: rows[0] });
    expect(onRowUnselect).toHaveBeenCalledOnceWith({ data: rows[0] });
  });

  it('emits supported model change outputs for internal transitions', () => {
    const table = create({ paginated: true, first: 2, currentPage: 2 });
    const selectedRows = jasmine.createSpy('selectedRows');
    const sortColumn = jasmine.createSpy('sortColumn');
    const sortDirection = jasmine.createSpy('sortDirection');
    const sortField = jasmine.createSpy('sortField');
    const sortOrder = jasmine.createSpy('sortOrder');
    const filter = jasmine.createSpy('filter');
    const pageSize = jasmine.createSpy('pageSize');
    const first = jasmine.createSpy('first');
    const currentPage = jasmine.createSpy('currentPage');
    const expandedRows = jasmine.createSpy('expandedRows');
    table.selectedRows.subscribe(selectedRows);
    table.sortColumn.subscribe(sortColumn);
    table.sortDirection.subscribe(sortDirection);
    table.sortField.subscribe(sortField);
    table.sortOrder.subscribe(sortOrder);
    table.filter.subscribe(filter);
    table.pageSize.subscribe(pageSize);
    table.first.subscribe(first);
    table.currentPage.subscribe(currentPage);
    table.expandedRows.subscribe(expandedRows);

    table.toggleRowSelect(rows[0], true);
    table.handleSort('profile.name', true);
    table.applyFilter('a');
    table.handlePageChange({ page: 3, pageSize: 3, startIndex: 7 });
    table.toggleRowExpansion(rows[0]);

    expect(selectedRows).toHaveBeenCalledOnceWith([rows[0]]);
    expect(sortColumn).toHaveBeenCalledOnceWith('profile.name');
    expect(sortDirection).toHaveBeenCalledOnceWith('asc');
    expect(sortField).toHaveBeenCalledOnceWith('profile.name');
    expect(sortOrder).toHaveBeenCalledOnceWith(1);
    expect(filter).toHaveBeenCalledOnceWith('a');
    expect(pageSize).toHaveBeenCalledOnceWith(3);
    expect(first).toHaveBeenCalledWith(0);
    expect(first).toHaveBeenCalledWith(6);
    expect(currentPage).toHaveBeenCalledWith(1);
    expect(currentPage).toHaveBeenCalledWith(3);
    expect(expandedRows).toHaveBeenCalledOnceWith([rows[0]]);
  });

  it('uses the same row index for disabled checkboxes and bulk selection after paging', () => {
    const table = create({
      selectable: true,
      paginated: true,
      rows: 2,
      currentPage: 2,
      selectionPageOnly: true,
      rowSelectable: ({ index }: { index: number }) => index === 2,
    });
    expect(checkboxes().map((input) => input.disabled)).toEqual([
      false,
      false,
      true,
    ]);
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([rows[2]]);
    expect(checkboxes()[0].checked).toBeTrue();
    checkboxes()[1].click();
    fixture.detectChanges();
    expect(table.selectedRows()).toEqual([]);
  });

  it('keeps top and bottom paginator controls synchronized and forwards report and visibility options', () => {
    const table = create({
      paginated: true,
      rows: 2,
      paginatorPosition: 'both',
      pageLinks: 1,
      showCurrentPageReport: true,
      currentPageReportTemplate: '{first}-{last} of {totalRecords}',
      showJumpToPageInput: true,
      showFirstLastIcon: true,
    });
    const page = jasmine.createSpy('page');
    table.onPage.subscribe(page);
    const pagers = Array.from(
      fixture.nativeElement.querySelectorAll(
        'orc-paginator',
      ) as NodeListOf<HTMLElement>,
    );
    expect(pagers.length).toBe(2);
    expect(
      pagers.map((pager) =>
        pager.querySelector('.orc-paginator__info')?.textContent?.trim(),
      ),
    ).toEqual(['1-2 of 6', '1-2 of 6']);
    expect(
      pagers.every(
        (pager) =>
          pager.querySelector('input[type="number"]') &&
          pager.querySelector('button[aria-label="Última página"]'),
      ),
    ).toBeTrue();
    expect(pagers[0].querySelectorAll('.orc-paginator__btn--page').length).toBe(
      1,
    );
    (
      pagers[0].querySelector(
        'button[aria-label="Próximo"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(page).toHaveBeenCalledOnceWith({ first: 2, rows: 2 });
    expect(cells()).toEqual(['Beta', 'Delta']);
    expect(
      pagers.map((pager) =>
        pager.querySelector('[aria-current="page"]')?.textContent?.trim(),
      ),
    ).toEqual(['2', '2']);
    fixture.componentRef.setInput('showPageLinks', false);
    fixture.detectChanges();
    expect(pagers[0].querySelector('.orc-paginator__btn--page')).toBeNull();
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
    expect(
      pagers[0].querySelector('.orc-paginator__info')?.textContent?.trim(),
    ).toBe('0-0 of 0');
    fixture.componentRef.setInput('alwaysShowPaginator', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('orc-paginator')).toBeNull();
  });

  it('keeps projected controls and checkboxes from activating rows or sorting headers', () => {
    const host = TestBed.createComponent(ControlsHost);
    host.detectChanges();
    const table = host.debugElement.query(By.directive(TableComponent))
      .componentInstance as TableComponent<Row>;
    const rowClick = jasmine.createSpy('rowClick');
    table.rowClick.subscribe(rowClick);
    const sort = jasmine.createSpy('sort');
    table.sortChange.subscribe(sort);
    const row = host.nativeElement.querySelector('tbody tr') as HTMLElement;
    for (const control of [
      row.querySelector('button')!,
      row.querySelector('input')!,
      host.nativeElement.querySelector(
        'thead input[aria-label="Header search"]',
      ),
    ]) {
      expect(key(control, ' ').defaultPrevented).toBeFalse();
      expect(key(control, 'Enter').defaultPrevented).toBeFalse();
      control.click();
    }
    expect(rowClick).not.toHaveBeenCalled();
    expect(sort).not.toHaveBeenCalled();
    expect(key(row, 'Enter').defaultPrevented).toBeTrue();
    expect(rowClick).toHaveBeenCalledOnceWith(rows[0]);
    expect(key(row, ' ').defaultPrevented).toBeTrue();
    expect(rowClick.calls.count()).toBe(2);
  });

  it('leaves projected focusable custom widgets in control of Enter and Space', () => {
    const host = TestBed.createComponent(ControlsHost);
    host.detectChanges();
    const table = host.debugElement.query(By.directive(TableComponent))
      .componentInstance as TableComponent<Row>;
    const rowClick = jasmine.createSpy('rowClick');
    table.rowClick.subscribe(rowClick);
    const widget = host.nativeElement.querySelector(
      '[role="slider"]',
    ) as HTMLElement;

    expect(key(widget, 'Enter').defaultPrevented).toBeFalse();
    expect(key(widget, ' ').defaultPrevented).toBeFalse();
    expect(rowClick).not.toHaveBeenCalled();
  });

  it('applies density, gridlines and a scroll height to the actual cells and region', () => {
    create({
      size: 'small',
      showGridlines: true,
      scrollable: true,
      scrollHeight: '120px',
      columnsConfig: [...columns, { key: 'id', header: 'ID' }],
    });
    const cell = fixture.nativeElement.querySelector('td') as HTMLElement;
    const smallPadding = parseFloat(getComputedStyle(cell).paddingTop);
    expect(getComputedStyle(cell).borderInlineEndWidth).toBe('1px');
    expect(
      (fixture.nativeElement.querySelector('[role="region"]') as HTMLElement)
        .style.maxHeight,
    ).toBe('120px');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(parseFloat(getComputedStyle(cell).paddingTop)).toBeGreaterThan(
      smallPadding,
    );
  });

  it('applies the container identity, consumer styles, and visual option aliases', () => {
    create({
      id: 'inventory-table',
      striped: true,
      bordered: false,
      hoverable: false,
      rowHover: true,
      stripedRows: true,
      styleClass: 'consumer-shell',
      style: { marginTop: '3px' },
      tableStyleClass: 'consumer-table',
      tableStyle: { minWidth: '480px' },
    });
    const shell = fixture.nativeElement.querySelector(
      '.orc-table-container',
    ) as HTMLElement;
    const table = fixture.nativeElement.querySelector(
      'table',
    ) as HTMLTableElement;

    expect(shell.id).toBe('inventory-table');
    expect(shell.classList.contains('consumer-shell')).toBeTrue();
    expect(shell.classList.contains('orc-table-container--striped')).toBeTrue();
    expect(
      shell.classList.contains('orc-table-container--hoverable'),
    ).toBeTrue();
    expect(
      shell.classList.contains('orc-table-container--bordered'),
    ).toBeFalse();
    expect(shell.style.marginTop).toBe('3px');
    expect(table.classList.contains('consumer-table')).toBeTrue();
    expect(table.style.minWidth).toBe('480px');
  });

  it('trims filter, select-all, and row label overrides before applying fallbacks', () => {
    create({
      filterable: true,
      filterPlaceholder: '  Find inventory  ',
      filterAriaLabel: '   ',
      selectable: true,
      selectAllAriaLabel: '   ',
      rowAriaLabel: '   ',
    });
    const filter = fixture.nativeElement.querySelector(
      '.orc-table__filter',
    ) as HTMLInputElement;
    const allRows = fixture.nativeElement.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    const rowChoice = fixture.nativeElement.querySelector(
      'tbody input[type="checkbox"]',
    ) as HTMLInputElement;
    const row = fixture.nativeElement.querySelector(
      'tbody tr',
    ) as HTMLTableRowElement;

    expect(filter.placeholder).toBe('Find inventory');
    expect(filter.getAttribute('aria-label')).toBe('Filter rows');
    expect(allRows.getAttribute('aria-label')).toBe('Select all rows');
    expect(rowChoice.getAttribute('aria-label')).toBe('Select row 1');
    expect(row.hasAttribute('aria-label')).toBeFalse();

    fixture.componentRef.setInput('filterAriaLabel', ' Search inventory ');
    fixture.componentRef.setInput('selectAllAriaLabel', ' Select every row ');
    fixture.componentRef.setInput('rowAriaLabel', ' Choose record ');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-label')).toBe('Search inventory');
    expect(allRows.getAttribute('aria-label')).toBe('Select every row');
    expect(rowChoice.getAttribute('aria-label')).toBe('Choose record 1');
    expect(row.getAttribute('aria-label')).toBe('Choose record 1');
  });

  it('renders the configured loading row count and a useful default empty state', () => {
    create({ data: [], loading: true, loadingRowsCount: 3 });
    const region = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    expect(region.getAttribute('aria-busy')).toBe('true');
    expect(
      fixture.nativeElement.querySelectorAll('tbody .orc-table__row--loading')
        .length,
    ).toBe(3);

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(region.getAttribute('aria-busy')).toBe('false');
    expect(
      fixture.nativeElement
        .querySelector('.orc-table__empty-title')
        ?.textContent?.trim(),
    ).toBe('Nenhum dado encontrado');

    fixture.componentRef.setInput('emptyTitle', 'No matching inventory');
    fixture.componentRef.setInput('emptyMessage', 'Change the search terms.');
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.orc-table__empty-title')
        ?.textContent?.trim(),
    ).toBe('No matching inventory');
    expect(
      fixture.nativeElement
        .querySelector('.orc-table__empty-desc')
        ?.textContent?.trim(),
    ).toBe('Change the search terms.');
  });

  it('uses the configured locale when matching filtered cell values', () => {
    const turkishRows = [
      { id: 1, profile: { name: 'Işık' } },
      { id: 2, profile: { name: 'İzmir' } },
    ];
    const table = create({
      data: turkishRows,
      filterable: true,
      filterLocale: 'tr',
      globalFilterFields: ['profile.name'],
    });

    table.applyFilter('ışık');
    fixture.detectChanges();
    expect(cells()).toEqual(['Işık']);
  });

  it('forwards row aliases, remote totals, paginator classes, options, and jump controls', () => {
    create({
      data: rows.slice(0, 2),
      serverDriven: true,
      lazyLoadOnInit: false,
      paginator: true,
      rows: 2,
      totalItems: 8,
      rowsPerPageOptions: [2, 4],
      paginatorStyleClass: 'inventory-pager',
      showJumpToPageDropdown: true,
    });
    const pager = fixture.nativeElement.querySelector(
      'orc-paginator',
    ) as HTMLElement;
    const pageSize = pager.querySelector(
      '.orc-paginator__page-size select',
    ) as HTMLSelectElement;
    const jump = pager.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;

    expect(
      pager.querySelector('nav')?.classList.contains('inventory-pager'),
    ).toBeTrue();
    expect(Array.from(pageSize.options).map((option) => option.value)).toEqual([
      '2',
      '4',
    ]);
    expect(jump).not.toBeNull();
    expect(jump.options.length).toBe(4);
  });

  it('honors initial sort models, default direction, and page reset policy', () => {
    create({
      sortColumn: 'profile.name',
      sortDirection: 'desc',
    });
    expect(cells()[0]).toBe('Zulu');

    fixture = TestBed.createComponent(TableComponent<Row>);
    for (const [name, value] of Object.entries({
      data: rows,
      columnsConfig: columns,
      paginated: true,
      rows: 2,
      currentPage: 2,
      defaultSortOrder: -1,
      resetPageOnSort: false,
    })) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('th') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sortDirection()).toBe('desc');
    expect(fixture.componentInstance.displayedPage()).toBe(2);

    fixture.componentRef.setInput('resetPageOnSort', true);
    (fixture.nativeElement.querySelector('th') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedPage()).toBe(1);
  });

  it('keeps the table region named when ariaLabel is whitespace-only', () => {
    create({ ariaLabel: ' \t\n' });
    const region = fixture.nativeElement.querySelector(
      '.orc-table-wrapper[role="region"]',
    ) as HTMLElement;
    expect(region.getAttribute('aria-label')).toBe('Data table');

    fixture.componentRef.setInput('ariaLabel', '  Customer records  ');
    fixture.detectChanges();
    expect(region.getAttribute('aria-label')).toBe('Customer records');
  });

  it('exports escaped headers and nested data with the selected separator', async () => {
    const tableRows = [
      {
        id: 7,
        profile: { name: 'Ada|Lovelace' },
        note: 'said "hello"\nthen left',
        empty: null,
      },
    ];
    const table = create({
      data: tableRows,
      columnsConfig: [
        { key: 'id', header: 'ID' },
        { key: 'profile.name', header: 'Name|Label' },
        { key: 'note', header: 'Note' },
        { key: 'empty', header: 'Empty' },
      ],
      csvSeparator: '|',
      exportFilename: 'records',
    });
    let csvBlob: Blob | undefined;
    const createUrl = spyOn(URL, 'createObjectURL').and.callFake(
      (value: Blob | MediaSource) => {
        csvBlob = value as Blob;
        return 'blob:table-test';
      },
    );
    const revokeUrl = spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    table.exportCSV();

    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalledOnceWith();
    expect(revokeUrl).toHaveBeenCalledOnceWith('blob:table-test');
    expect(csvBlob).toBeDefined();
    await expectAsync(csvBlob!.text()).toBeResolvedTo(
      'ID|"Name|Label"|Note|Empty\n7|"Ada|Lovelace"|"said ""hello""\nthen left"|',
    );
  });

  it('exports only selected rows and preserves a custom header line', async () => {
    const table = create({
      data: [
        { id: 1, profile: { name: 'first' } },
        { id: 2, profile: { name: 'second' } },
      ],
      columnsConfig: [{ key: 'profile.name', header: 'Name' }],
      exportHeader: 'Custom,Header',
    });
    table.selectedRows.set([table.effectiveData()[1]]);
    let csvBlob: Blob | undefined;
    spyOn(URL, 'createObjectURL').and.callFake((value: Blob | MediaSource) => {
      csvBlob = value as Blob;
      return 'blob:selection-test';
    });
    spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    table.exportCSV({ selectionOnly: true });

    await expectAsync(csvBlob!.text()).toBeResolvedTo('Custom,Header\nsecond');
  });

  it('produces an empty payload when rows exist without configured columns', async () => {
    const table = create({ data: [{ id: 1 }], columnsConfig: [] });
    let csvBlob: Blob | undefined;
    spyOn(URL, 'createObjectURL').and.callFake((value: Blob | MediaSource) => {
      csvBlob = value as Blob;
      return 'blob:empty-test';
    });
    spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    table.exportCSV();

    await expectAsync(csvBlob!.text()).toBeResolvedTo('');
  });

  it('escapes actual backslash, bracket and CRLF delimiters in Blob output', async () => {
    const cases = [
      {
        separator: '\\',
        header: 'Header\\Value',
        value: 'A\\B',
        expected: '"Header\\Value"\n"A\\B"',
      },
      {
        separator: '[]',
        header: 'Header[]Value',
        value: 'A[]B',
        expected: '"Header[]Value"\n"A[]B"',
      },
      {
        separator: ';',
        header: 'Header "quoted"\r\nline',
        value: 'A\r\nB',
        expected: '"Header ""quoted""\r\nline"\n"A\r\nB"',
      },
      {
        separator: ',',
        header: 'Empty',
        value: '',
        expected: 'Empty\n',
      },
    ];
    const blobs: Blob[] = [];
    spyOn(URL, 'createObjectURL').and.callFake((value: Blob | MediaSource) => {
      blobs.push(value as Blob);
      return `blob:case-${blobs.length}`;
    });
    spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    for (const testCase of cases) {
      const table = create({
        data: [{ id: 1, value: testCase.value }],
        columnsConfig: [{ key: 'value', header: testCase.header }],
        csvSeparator: testCase.separator,
      });
      table.exportCSV();
    }

    expect(click.calls.count()).toBe(cases.length);
    expect(blobs.length).toBe(cases.length);
    for (let index = 0; index < cases.length; index += 1) {
      await expectAsync(blobs[index].text()).toBeResolvedTo(
        cases[index].expected,
      );
    }
  });

  it('revokes the CSV object URL and removes the anchor when download fails', () => {
    const table = create({
      data: [{ id: 1, value: 'row' }],
      columnsConfig: [{ key: 'value', header: 'Value' }],
    });
    spyOn(URL, 'createObjectURL').and.returnValue('blob:failed-download');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const remove = spyOn(
      HTMLAnchorElement.prototype,
      'remove',
    ).and.callThrough();
    spyOn(HTMLAnchorElement.prototype, 'click').and.throwError(
      'download failed',
    );

    expect(() => table.exportCSV()).toThrowError('download failed');
    expect(revoke).toHaveBeenCalledOnceWith('blob:failed-download');
    expect(remove).toHaveBeenCalled();
  });

  it('creates the CSV download anchor in the table owner document', () => {
    const table = create({
      data: [{ id: 1, value: 'row' }],
      columnsConfig: [{ key: 'value', header: 'Value' }],
    });
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    const createElement = spyOn(
      frameDocument,
      'createElement',
    ).and.callThrough();
    spyOn(URL, 'createObjectURL').and.returnValue('blob:frame-download');
    spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    table.exportCSV();

    expect(createElement).toHaveBeenCalledWith('a');
    frame.remove();
  });

  it('uses deterministic deep selection keys for values with edge cases and cycles', () => {
    const table = create({
      compareSelectionBy: 'deepEquals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    });
    const deepTable = table as TableComponent<any>;
    const first: Record<string, unknown> = {
      number: NaN,
      zero: -0,
      date: new Date('2024-01-01T00:00:00.000Z'),
      nested: { a: 1, b: [2, 3] },
      optional: undefined,
    };
    deepTable.selectedRows.set([first]);

    const reordered: Record<string, unknown> = {
      optional: undefined,
      nested: { b: [2, 3], a: 1 },
      date: new Date('2024-01-01T00:00:00.000Z'),
      zero: -0,
      number: NaN,
    };
    expect(deepTable.isRowSelected(reordered)).toBeTrue();
    expect(
      deepTable.isRowSelected({ ...reordered, optional: null }),
    ).toBeFalse();
    const missingOptional = { ...reordered };
    delete missingOptional['optional'];
    expect(deepTable.isRowSelected(missingOptional)).toBeFalse();
    expect(deepTable.isRowSelected({ ...reordered, zero: 0 })).toBeFalse();
    expect(deepTable.isRowSelected({ ...reordered, number: null })).toBeFalse();
    expect(
      deepTable.isRowSelected({
        ...reordered,
        date: '2024-01-01T00:00:00.000Z',
      }),
    ).toBeFalse();
  });

  it('handles cyclic deep selection values without JSON collisions or crashes', () => {
    const table = create({
      compareSelectionBy: 'deepEquals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    });
    const deepTable = table as TableComponent<any>;
    const selected: Record<string, unknown> = { kind: 'cycle' };
    selected['self'] = selected;
    deepTable.selectedRows.set([selected]);
    const equivalent: Record<string, unknown> = { kind: 'cycle' };
    equivalent['self'] = equivalent;
    const different: Record<string, unknown> = { kind: 'cycle' };
    different['self'] = { kind: 'cycle' };

    expect(deepTable.isRowSelected(equivalent)).toBeTrue();
    expect(deepTable.isRowSelected(different)).toBeFalse();
  });

  it('treats shared and duplicated acyclic subobjects as equal deep values', () => {
    const table = create({
      compareSelectionBy: 'deepEquals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    }) as TableComponent<any>;
    const shared = { value: 1 };
    const selected = { first: shared, second: shared };
    table.selectedRows.set([selected]);

    expect(
      table.isRowSelected({ first: { value: 1 }, second: { value: 1 } }),
    ).toBeTrue();
  });

  it('keeps deep equality stable for cyclic keys containing path punctuation', () => {
    const table = create({
      compareSelectionBy: 'deepEquals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    }) as TableComponent<any>;
    const selected: Record<string, unknown> = {};
    selected['a.b'] = { owner: selected };
    table.selectedRows.set([selected]);
    const equivalent: Record<string, unknown> = {};
    equivalent['a.b'] = { owner: equivalent };

    expect(table.isRowSelected(equivalent)).toBeTrue();
  });

  it('retains identity fallback for symbol-bearing and unsupported deep values', () => {
    const table = create({
      compareSelectionBy: 'deepEquals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    }) as TableComponent<any>;
    const symbol = Symbol('private');
    const symbolRow: Record<PropertyKey, unknown> = { value: 1 };
    symbolRow[symbol] = 2;
    table.selectedRows.set([symbolRow]);
    expect(table.isRowSelected({ value: 1 })).toBeFalse();
    expect(table.isRowSelected(symbolRow)).toBeTrue();

    class UnsupportedValue {
      value = 1;
    }
    const classRow = new UnsupportedValue();
    table.selectedRows.set([classRow]);
    expect(table.isRowSelected(new UnsupportedValue())).toBeFalse();
    expect(table.isRowSelected(classRow)).toBeTrue();
  });

  it('preserves equals-mode rowKey and object-identity fallback', () => {
    const table = create({
      compareSelectionBy: 'equals',
      rowKey: 'missing',
      dataKey: 'missing',
      data: [{ id: 1 }],
    }) as TableComponent<any>;
    const selected = { value: 1 };
    table.selectedRows.set([selected]);

    expect(table.isRowSelected({ value: 1 })).toBeFalse();
    expect(table.isRowSelected(selected)).toBeTrue();
  });

  it('renders projected expansion templates with row context and supports multiple rows', () => {
    const host = TestBed.createComponent(ExpansionHost);
    host.detectChanges();
    const table = host.debugElement.query(By.directive(TableComponent))
      .componentInstance as TableComponent<Row>;
    const expanded = jasmine.createSpy('expanded');
    const collapsed = jasmine.createSpy('collapsed');
    table.onRowExpand.subscribe(expanded);
    table.onRowCollapse.subscribe(collapsed);

    table.toggleRowExpansion(host.componentInstance.data[0]);
    table.toggleRowExpansion(host.componentInstance.data[1]);
    host.detectChanges();

    expect(host.componentInstance.expandedRows).toEqual([
      host.componentInstance.data[0],
      host.componentInstance.data[1],
    ]);
    expect(
      Array.from(
        host.nativeElement.querySelectorAll(
          '.orc-table__expansion-row',
        ) as NodeListOf<HTMLTableRowElement>,
      ).map((row) => row.textContent?.trim()),
    ).toEqual(['Zulu / 0', 'Alpha / 1']);
    expect(expanded.calls.allArgs()).toEqual([
      [{ data: host.componentInstance.data[0] }],
      [{ data: host.componentInstance.data[1] }],
    ]);

    table.toggleRowExpansion(host.componentInstance.data[0]);
    host.detectChanges();
    expect(collapsed).toHaveBeenCalledOnceWith({
      data: host.componentInstance.data[0],
    });
    expect(
      host.nativeElement.querySelectorAll('.orc-table__expansion-row').length,
    ).toBe(1);
  });

  it('replaces the previous expanded row in single mode and projects the footer', () => {
    const host = TestBed.createComponent(ExpansionHost);
    host.componentInstance.rowExpandMode = 'single';
    host.detectChanges();
    const table = host.debugElement.query(By.directive(TableComponent))
      .componentInstance as TableComponent<Row>;
    const expanded = jasmine.createSpy('expanded');
    const collapsed = jasmine.createSpy('collapsed');
    table.onRowExpand.subscribe(expanded);
    table.onRowCollapse.subscribe(collapsed);

    table.toggleRowExpansion(host.componentInstance.data[0]);
    host.detectChanges();
    table.toggleRowExpansion(host.componentInstance.data[1]);
    host.detectChanges();

    expect(host.componentInstance.expandedRows).toEqual([
      host.componentInstance.data[1],
    ]);
    expect(
      host.nativeElement.querySelectorAll('.orc-table__expansion-row').length,
    ).toBe(1);
    expect(
      host.nativeElement
        .querySelector('.orc-table__expansion-row')
        ?.textContent?.trim(),
    ).toBe('Alpha / 1');
    expect(
      host.nativeElement
        .querySelector('.orc-table__aggregate-footer')
        ?.textContent?.trim(),
    ).toBe('Total: 3');
    expect(collapsed).toHaveBeenCalledOnceWith({
      data: host.componentInstance.data[0],
    });
    expect(expanded.calls.count()).toBe(2);
  });

  it('renders the compatibility value collection over data when both are bound', () => {
    const table = create({
      data: rows,
      value: rows.slice(0, 2),
    });
    expect(table.effectiveData()).toEqual(rows.slice(0, 2));
    expect(cells()).toEqual(['Zulu', 'Alpha']);
  });

  it('filters by configured column keys when no global filter fields are set', () => {
    create({ filterable: true });
    const table = fixture.componentInstance;
    table.applyFilter('Zulu');
    fixture.detectChanges();
    expect(cells()).toEqual(['Zulu']);

    // `allowed` is real row data but not a configured column key.
    table.applyFilter('true');
    fixture.detectChanges();
    expect(cells()).toEqual([]);
  });

  it('falls back to the row’s own keys when no filter fields can be inferred', () => {
    const table = create({ columnsConfig: [], filterable: true });
    table.applyFilter('1');
    fixture.detectChanges();
    expect(table.filteredData()).toEqual([rows[0]]);

    table.applyFilter('true');
    fixture.detectChanges();
    expect(table.filteredData()).toHaveSize(5);
  });

  it('sorts numbers numerically and keeps missing values last in both directions', () => {
    create({
      data: [
        { id: 1, profile: { name: 'ten' }, num: 10 },
        { id: 2, profile: { name: 'nine' }, num: 9 },
        { id: 3, profile: { name: 'none' }, num: null },
      ] as unknown as Row[],
      columnsConfig: [{ key: 'num', header: 'Num', sortable: true }],
      sortColumn: 'num',
      sortDirection: 'asc',
    });
    expect(cells()).toEqual(['9', '10', '']);

    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();
    expect(cells()).toEqual(['10', '9', '']);
  });

  it('prefers dataKey over rowKey for row identity', () => {
    const table = create({ rowKey: 'sku', dataKey: 'code' });
    expect(table.getRowId({ code: 'code-1', sku: 'sku-1' })).toBe('code-1');
  });
});
