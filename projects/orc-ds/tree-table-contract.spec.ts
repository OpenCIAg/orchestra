import { TestBed } from '@angular/core/testing';
import { HierarchyNode, TreeTableComponent } from '@ciag/orchestra/tree-table';

describe('TreeTable accessible filtering, layout and selection contracts', () => {
  it('applies public identity, labeling, style, loading, and page-report inputs', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('id', 'inventory-tree');
    fixture.componentRef.setInput('label', 'Inventory hierarchy');
    fixture.componentRef.setInput('treeColumnHeader', 'Item');
    fixture.componentRef.setInput('styleClass', 'compact inventory-view');
    fixture.componentRef.setInput('tableStyleClass', 'dense-table');
    fixture.componentRef.setInput('tableStyle', { width: '42rem' });
    fixture.componentRef.setInput('autoLayout', true);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('columns', [
      { key: 'sku', header: 'SKU', sortable: false },
    ]);
    fixture.componentRef.setInput('value', [
      { key: 'item', label: 'Widget', data: { sku: 'W-1' } },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput(
      'currentPageReportTemplate',
      '{currentPage}/{totalPages}: {first}-{last} of {totalRecords}',
    );
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const table = host.querySelector('table') as HTMLTableElement;
    const container = host.querySelector('.orc-tree-table') as HTMLElement;
    expect(host.id).toBe('inventory-tree');
    expect(container.classList.contains('compact')).toBeTrue();
    expect(container.classList.contains('inventory-view')).toBeTrue();
    expect(container.getAttribute('aria-busy')).toBe('true');
    expect(table.classList.contains('dense-table')).toBeTrue();
    expect(container.classList.contains('auto-layout')).toBeTrue();
    expect(table.style.width).toBe('42rem');
    expect(getComputedStyle(table).tableLayout).toBe('auto');
    expect(table.getAttribute('aria-label')).toBe('Inventory hierarchy');
    expect(table.querySelector('thead th')?.textContent?.trim()).toBe('Item');
    expect(host.querySelector('.page-report')?.textContent?.trim()).toBe(
      '1/1: 1-1 of 1',
    );

    fixture.componentRef.setInput('ariaLabelledBy', 'inventory-heading');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(table.getAttribute('aria-labelledby')).toBe('inventory-heading');
    expect(container.getAttribute('aria-busy')).toBe('false');
  });

  it('renders configurable filter and pagination labels and honors sort defaults', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      { key: 'one', label: 'One', data: { rank: 1 } },
      { key: 'two', label: 'Two', data: { rank: 2 } },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('columns', [{ key: 'rank', header: 'Rank' }]);
    fixture.componentRef.setInput('filterable', true);
    fixture.componentRef.setInput('filterLabel', 'Find items');
    fixture.componentRef.setInput('filterAriaLabel', 'Search inventory');
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput('rowsPerPageOptions', [1, 2]);
    fixture.componentRef.setInput('rowsPerPageLabel', 'Page size');
    fixture.componentRef.setInput('paginatorAriaLabel', 'Inventory pages');
    fixture.componentRef.setInput('firstPageLabel', 'Start');
    fixture.componentRef.setInput('previousPageLabel', 'Back');
    fixture.componentRef.setInput('nextPageLabel', 'Forward');
    fixture.componentRef.setInput('lastPageLabel', 'End');
    fixture.componentRef.setInput('defaultSortOrder', -1);
    fixture.componentRef.setInput('resetPageOnSort', false);
    component.first.set(1);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(
      host.querySelector('.tree-table-filter span')?.textContent?.trim(),
    ).toBe('Find items');
    expect(
      (
        host.querySelector('input[type="search"]') as HTMLInputElement
      ).getAttribute('aria-label'),
    ).toBe('Search inventory');
    expect(host.querySelector('.rows-per-page span')?.textContent?.trim()).toBe(
      'Page size',
    );
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Inventory pages',
    );
    const pageButtons = Array.from(
      host.querySelectorAll('.tree-table-paginator button'),
    );
    expect(pageButtons.map((button) => button.textContent?.trim())).toEqual([
      'Start',
      'Back',
      'Forward',
      'End',
    ]);

    const sort = host.querySelector('.sort-control') as HTMLButtonElement;
    expect(sort.getAttribute('aria-label')).toBe('Sort by Rank, descending');
    sort.click();
    fixture.detectChanges();
    expect(component.sortOrder()).toBe(-1);
    expect(component.first()).toBe(1);
    expect(host.querySelector('th[aria-sort="descending"]')).toBeTruthy();
  });

  it('switches the node toggle accessible name with expansion state', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('value', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('expandAriaLabel', 'Open branch');
    fixture.componentRef.setInput('collapseAriaLabel', 'Close branch');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '.toggle',
    ) as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Open branch');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Close branch');
  });

  it('uses lenient filtering to retain a matched node subtree and strict filtering to prune it', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      {
        key: 'north',
        label: 'North region',
        children: [{ key: 'warehouse', label: 'Warehouse' }],
      },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('filterable', true);
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    search.value = 'North';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(component.displayNodes().map(({ node }) => node.key)).toEqual([
      'north',
      'warehouse',
    ]);

    fixture.componentRef.setInput('filterMode', 'strict');
    fixture.detectChanges();
    expect(component.displayNodes().map(({ node }) => node.key)).toEqual([
      'north',
    ]);
  });

  it('filters collapsed nested data and exposes the treegrid hierarchy and layout inputs', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    const root: HierarchyNode = {
      key: 'division',
      label: 'Division',
      children: [
        {
          key: 'site',
          label: 'Site',
          data: { location: 'İzmir Warehouse' },
        },
      ],
    };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('columns', [
      { key: 'location', header: 'Location' },
    ]);
    fixture.componentRef.setInput('globalFilterFields', ['location']);
    fixture.componentRef.setInput('filterMode', 'strict');
    fixture.componentRef.setInput('filterLocale', 'tr');
    fixture.componentRef.setInput('ariaLabel', 'Warehouse hierarchy');
    fixture.componentRef.setInput('scrollable', true);
    fixture.componentRef.setInput('scrollHeight', '12rem');
    fixture.componentRef.setInput('style', {
      '--tree-table-contract-color': 'teal',
    });
    fixture.componentRef.setInput('rowHover', true);
    fixture.componentRef.setInput('showGridlines', true);
    component.filterValue.set('izmir');
    fixture.detectChanges();

    const treegrid = fixture.nativeElement.querySelector(
      '[role="treegrid"]',
    ) as HTMLElement;
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ) as HTMLElement[];
    const container = fixture.nativeElement.querySelector(
      '.orc-tree-table',
    ) as HTMLElement;
    expect(treegrid.getAttribute('aria-label')).toBe('Warehouse hierarchy');
    expect(container.style.maxHeight).toBe('12rem');
    expect(
      container.style.getPropertyValue('--tree-table-contract-color'),
    ).toBe('teal');
    expect(container.classList.contains('row-hover')).toBeTrue();
    expect(container.classList.contains('gridlines')).toBeTrue();
    expect(
      rows.map((row) => row.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(['▾Division', '·Siteİzmir Warehouse']);
    expect(rows.map((row) => row.getAttribute('aria-level'))).toEqual([
      '1',
      '2',
    ]);
    expect(rows[0].getAttribute('aria-expanded')).toBe('true');
    expect(
      (rows[0].querySelector('.toggle') as HTMLButtonElement).disabled,
    ).toBeTrue();
  });

  it('uses a single radio group for single selection and replaces the selected row', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    const first = { key: 'first', label: 'First' };
    const second = { key: 'second', label: 'Second' };
    fixture.componentRef.setInput('value', [first, second]);
    fixture.componentRef.setInput('selectionMode', 'single');
    component.selected.set(new Set(['first']));
    fixture.detectChanges();

    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(radios).toHaveSize(2);
    expect(radios[0].name).toBe(radios[1].name);
    expect(
      fixture.nativeElement
        .querySelector('table')
        ?.getAttribute('aria-multiselectable'),
    ).toBe('false');
    expect(radios[0].checked).toBeTrue();
    expect(radios[1].checked).toBeFalse();
    radios[1].checked = true;
    radios[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect([...component.selected()]).toEqual(['second']);
    expect(radios[0].checked).toBeFalse();
    expect(radios[1].checked).toBeTrue();
    expect(
      fixture.nativeElement.querySelectorAll('input[type="checkbox"]'),
    ).toHaveSize(0);
  });

  it('keeps checkbox mode distinct and excludes disabled descendants from propagation', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'disabled', label: 'Disabled', disabled: true },
        { key: 'enabled', label: 'Enabled' },
      ],
    };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('table')
        ?.getAttribute('aria-multiselectable'),
    ).toBe('true');
    const checkboxes = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"]',
    );
    expect(checkboxes).toHaveSize(1);
    expect(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ).toHaveSize(0);
    component.select({ node: root, level: 1 }, true);
    expect([...component.selected()]).toEqual(['root', 'enabled']);
  });

  it('does not select a disabled parent while normalizing upward propagation', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      {
        key: 'root',
        label: 'Root',
        children: [
          {
            key: 'blocked-parent',
            label: 'Blocked parent',
            disabled: true,
            children: [{ key: 'leaf', label: 'Leaf' }],
          },
        ],
      },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionUp', true);
    component.expanded.set(new Set(['root', 'blocked-parent']));
    fixture.detectChanges();

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ) as HTMLElement[];
    const blockedParentCheckbox = rows[1].querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    const leafCheckbox = rows[2].querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(blockedParentCheckbox.disabled).toBeTrue();

    leafCheckbox.checked = true;
    leafCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect([...component.selected()]).toEqual(['leaf']);
    expect(blockedParentCheckbox.checked).toBeFalse();
  });

  it('emits the bounded initial lazy request when local pagination is disabled', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('rows', 25);
    const requests: Array<{ first: number; rows: number }> = [];
    component.onLazyLoad.subscribe((request) => requests.push(request));
    fixture.detectChanges();

    expect(requests).toEqual([{ first: 0, rows: 25 }]);
  });

  it('moves focus across visible navigable rows with arrows, Home, and End', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
      { key: 'disabled', label: 'Disabled', disabled: true },
      { key: 'hidden', label: 'Hidden' },
      { key: 'last', label: 'Last' },
    ] satisfies HierarchyNode[]);
    component.expanded.set(new Set(['root']));
    fixture.detectChanges();

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ) as HTMLElement[];
    rows[3].hidden = true;
    const rootRow = rows[0];
    const childRow = rows[1];
    const disabledCheckbox = rows[2].querySelector('input') as HTMLInputElement;
    const hiddenRow = rows[3];
    const lastRow = rows[4];

    expect(rootRow.getAttribute('tabindex')).toBe('0');
    expect(
      rows.slice(1).every((row) => row.getAttribute('tabindex') === '-1'),
    ).toBeTrue();
    rootRow.focus();
    rootRow.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(childRow);
    expect(childRow.getAttribute('tabindex')).toBe('0');
    expect(rootRow.getAttribute('tabindex')).toBe('-1');
    expect(
      rows.filter((row) => row.getAttribute('tabindex') === '0'),
    ).toHaveSize(1);
    childRow.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(lastRow);
    lastRow.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(childRow);
    childRow.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(rootRow);
    rootRow.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(lastRow);
    expect(disabledCheckbox.disabled).toBeTrue();
    expect(hiddenRow.hidden).toBeTrue();
  });

  it('expands and collapses the focused treegrid row with Right and Left', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
    ] satisfies HierarchyNode[]);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      'tbody tr[role="row"]',
    ) as HTMLElement;
    row.focus();
    const expand = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    row.dispatchEvent(expand);
    fixture.detectChanges();

    expect(expand.defaultPrevented).toBeTrue();
    expect(component.expanded().has('root')).toBeTrue();
    expect(
      fixture.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ).toHaveSize(2);

    const collapse = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    row.dispatchEvent(collapse);
    fixture.detectChanges();

    expect(collapse.defaultPrevented).toBeTrue();
    expect(component.expanded().has('root')).toBeFalse();
    expect(
      fixture.nativeElement.querySelectorAll('tbody tr[role="row"]'),
    ).toHaveSize(1);
  });

  it('leaves native radio, select, and button activation keys alone', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('value', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('selectionMode', 'single');
    fixture.detectChanges();

    const radio = fixture.nativeElement.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement;
    radio.focus();
    const radioArrow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    radio.dispatchEvent(radioArrow);
    expect(radioArrow.defaultPrevented).toBeFalse();
    expect(document.activeElement).toBe(radio);

    const select = document.createElement('select');
    fixture.nativeElement.querySelector('tbody tr')?.append(select);
    select.focus();
    const selectArrow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    select.dispatchEvent(selectArrow);
    expect(selectArrow.defaultPrevented).toBeFalse();
    expect(document.activeElement).toBe(select);

    const toggle = fixture.nativeElement.querySelector(
      '.toggle',
    ) as HTMLButtonElement;
    toggle.focus();
    const activate = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    toggle.dispatchEvent(activate);
    expect(activate.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.expanded().has('root')).toBeFalse();
  });

  it('uses the tree table owner window for row visibility styles', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('value', [
      { key: 'first', label: 'First' },
      { key: 'second', label: 'Second' },
    ] satisfies HierarchyNode[]);
    fixture.detectChanges();
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    const getComputedStyle = spyOn(
      frameWindow,
      'getComputedStyle',
    ).and.callThrough();
    const row = fixture.nativeElement.querySelector(
      'tbody tr[role="row"]',
    ) as HTMLElement;
    fixture.componentInstance.onKeydown(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    row.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(getComputedStyle).toHaveBeenCalled();
    fixture.destroy();
    frame.remove();
  });
});
