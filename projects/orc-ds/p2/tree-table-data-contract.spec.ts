import { TestBed } from '@angular/core/testing';
import {
  HierarchyNode,
  TreeTableComponent,
  TreeTableSortEvent,
} from './p2-hierarchical-components';

describe('TreeTable local data operations', () => {
  it('filters nested rows from the search control and emits once per edit', () => {
    const fixture =
      TestBed.createComponent<TreeTableComponent<{ code: string }>>(
        TreeTableComponent,
      );
    const component = fixture.componentInstance;
    const newYork: HierarchyNode<{ code: string }> = {
      key: 'nyc',
      label: 'New York',
      data: { code: 'NYC-1' },
    };
    fixture.componentRef.setInput('value', [
      {
        key: 'north',
        label: 'North region',
        children: [
          newYork,
          { key: 'bos', label: 'Boston', data: { code: 'BOS-1' } },
        ],
      },
      {
        key: 'south',
        label: 'South region',
        children: [{ key: 'mia', label: 'Miami', data: { code: 'MIA-1' } }],
      },
    ] satisfies HierarchyNode<{ code: string }>[]);
    fixture.componentRef.setInput('columns', [{ key: 'code', header: 'Code' }]);
    fixture.componentRef.setInput('globalFilterFields', ['code']);
    fixture.componentRef.setInput('filterable', true);
    fixture.componentRef.setInput('emptyText', 'No matches');
    const changes: Array<{ value: string }> = [];
    const selected: HierarchyNode<{ code: string }>[] = [];
    component.onFilter.subscribe((event) => changes.push(event));
    component.nodeSelect.subscribe((node) => selected.push(node));
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    expect(search.getAttribute('aria-label')).toBe('Filter');
    search.value = 'nyc';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.filterValue()).toBe('nyc');
    expect(changes).toEqual([{ value: 'nyc' }]);
    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          'tbody tr[role="row"]',
        ),
      ).map((row) => row.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(['▾North region', '·New YorkNYC-1']);
    component.select(component.displayNodes()[1], true);
    expect(selected).toEqual([newYork]);

    search.value = 'not-found';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(changes).toEqual([{ value: 'nyc' }, { value: 'not-found' }]);
    expect(fixture.nativeElement.querySelector('tbody')?.textContent).toContain(
      'No matches',
    );
  });

  it('sorts every sibling level stably and reports the field, direction, and source event', () => {
    const fixture =
      TestBed.createComponent<TreeTableComponent<{ rank: string }>>(
        TreeTableComponent,
      );
    const component = fixture.componentInstance;
    const original = [
      {
        key: 'b',
        label: 'B group',
        data: { rank: 'Beta' },
        children: [
          { key: 'b2', label: 'B2', data: { rank: 'same' } },
          { key: 'b1', label: 'B1', data: { rank: 'same' } },
        ],
      },
      { key: 'a', label: 'A group', data: { rank: 'Alpha' } },
    ] satisfies HierarchyNode<{ rank: string }>[];
    fixture.componentRef.setInput('value', original);
    fixture.componentRef.setInput('columns', [{ key: 'rank', header: 'Rank' }]);
    component.expanded.set(new Set(['b']));
    const events: TreeTableSortEvent[] = [];
    component.onSort.subscribe((event) => events.push(event));
    fixture.detectChanges();

    const sort = fixture.nativeElement.querySelector(
      '.sort-control',
    ) as HTMLButtonElement;
    expect(sort.getAttribute('aria-label')).toBe('Sort by Rank, ascending');
    sort.click();
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'tbody tr[role="row"] .row-selection span',
      ),
    ).map((label) => label.textContent?.trim());
    expect(labels).toEqual(['A group', 'B group', 'B2', 'B1']);
    expect(component.sortField()).toBe('rank');
    expect(component.sortOrder()).toBe(1);
    expect(events).toHaveSize(1);
    expect(events[0].field).toBe('rank');
    expect(events[0].order).toBe(1);
    expect(events[0].originalEvent).toEqual(jasmine.any(MouseEvent));
    expect(
      fixture.nativeElement.querySelector('th[aria-sort="ascending"]'),
    ).toBeTruthy();

    sort.click();
    fixture.detectChanges();
    expect(component.sortOrder()).toBe(-1);
    expect(events).toHaveSize(2);
    expect(events[1].order).toBe(-1);
    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          'tbody tr[role="row"] .row-selection span',
        ),
      ).map((label) => label.textContent?.trim()),
    ).toEqual(['B group', 'B2', 'B1', 'A group']);
    expect(original.map((node) => node.key)).toEqual(['b', 'a']);
  });

  it('pages root rows, synchronizes the controlled page models, and clamps after data changes', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    const roots: HierarchyNode[] = Array.from({ length: 5 }, (_, index) => ({
      key: `row-${index + 1}`,
      label: `Row ${index + 1}`,
    }));
    fixture.componentRef.setInput('value', roots);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 2);
    fixture.componentRef.setInput('rowsPerPageOptions', [2, 3]);
    const pages: Array<{ first: number; rows: number }> = [];
    component.onPage.subscribe((event) => pages.push(event));
    fixture.detectChanges();

    const labels = (): string[] =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          'tbody tr[role="row"] .row-selection span',
        ),
      ).map((label) => label.textContent?.trim() ?? '');
    expect(labels()).toEqual(['Row 1', 'Row 2']);
    (
      fixture.nativeElement.querySelectorAll(
        '.tree-table-paginator button',
      )[2] as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(labels()).toEqual(['Row 3', 'Row 4']);
    expect(component.first()).toBe(2);
    expect(pages).toEqual([{ first: 2, rows: 2 }]);

    const pageSize = fixture.nativeElement.querySelector(
      '.rows-per-page select',
    ) as HTMLSelectElement;
    pageSize.value = '3';
    pageSize.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(3);
    expect(labels()).toEqual(['Row 1', 'Row 2', 'Row 3']);
    expect(pages).toEqual([
      { first: 2, rows: 2 },
      { first: 0, rows: 3 },
    ]);

    (
      fixture.nativeElement.querySelectorAll(
        '.tree-table-paginator button',
      )[3] as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(component.first()).toBe(3);
    expect(labels()).toEqual(['Row 4', 'Row 5']);
    expect(pages).toHaveSize(3);
    expect(pages[2]).toEqual({ first: 3, rows: 3 });

    fixture.componentRef.setInput('value', roots.slice(0, 2));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(labels()).toEqual(['Row 1', 'Row 2']);
  });

  it('keeps sorting, filtering, and a controlled page start synchronized together', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      { key: 'z', label: 'Zulu', data: { rank: 'Zulu' } },
      { key: 'a', label: 'Alpha', data: { rank: 'Alpha' } },
      { key: 'b', label: 'Beta', data: { rank: 'Beta' } },
    ] satisfies HierarchyNode[]);
    fixture.componentRef.setInput('columns', [{ key: 'rank', header: 'Rank' }]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput('filterable', true);
    component.first.set(2);
    const sorts: TreeTableSortEvent[] = [];
    const filters: string[] = [];
    const pages: Array<{ first: number; rows: number }> = [];
    component.onSort.subscribe((event) => sorts.push(event));
    component.onFilter.subscribe((event) => filters.push(event.value));
    component.onPage.subscribe((event) => pages.push(event));
    fixture.detectChanges();

    const displayedLabels = (): string[] =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          'tbody tr[role="row"] .row-selection span',
        ),
      ).map((label) => label.textContent?.trim() ?? '');
    expect(displayedLabels()).toEqual(['Beta']);

    (
      fixture.nativeElement.querySelector('.sort-control') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(displayedLabels()).toEqual(['Alpha']);
    expect(sorts).toHaveSize(1);
    expect(pages).toHaveSize(0);

    const search = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    search.value = 'Beta';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(displayedLabels()).toEqual(['Beta']);
    expect(filters).toEqual(['Beta']);
    expect(sorts).toHaveSize(1);
    expect(pages).toHaveSize(0);
  });

  it('keeps empty data stable and disables every page action', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('value', []);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('emptyText', 'Nothing here');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tbody')?.textContent).toContain(
      'Nothing here',
    );
    expect(
      fixture.nativeElement.querySelector('.page-report')?.textContent?.trim(),
    ).toBe('0–0 of 0');
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.tree-table-paginator button'),
    ) as HTMLButtonElement[];
    expect(buttons).toHaveSize(4);
    expect(buttons.every((button) => button.disabled)).toBeTrue();
  });
});
