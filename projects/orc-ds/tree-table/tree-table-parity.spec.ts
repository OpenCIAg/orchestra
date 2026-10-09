import { TestBed } from '@angular/core/testing';
import {
  TreeTableComponent,
  HierarchyNode,
  TreeTableColumn,
} from '@ciag/orchestra/tree-table';

/**
 * Behavior-parity pins for the tree table family. The specs import the
 * component through the family entry point and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('TreeTable behavior parity', () => {
  const columns: TreeTableColumn[] = [
    { key: 'data.size', header: 'Size' },
    { key: 'notes', header: 'Notes', sortable: false },
  ];
  const nodes: HierarchyNode<{ size?: number }>[] = [
    {
      key: 'root-1',
      label: 'Root One',
      data: { size: 2 },
      children: [
        { key: 'leaf-1', label: 'Leaf One', data: { size: 1 } },
        { key: 'leaf-2', label: 'Leaf Two', disabled: true },
      ],
    },
    { key: 'root-2', label: 'Root Two', data: { size: 10 } },
  ];

  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    fixture.componentRef.setInput('value', nodes);
    fixture.componentRef.setInput('columns', columns);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  const rows = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'tbody tr[role="row"]',
      ),
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders rows with disabled state, expands on the toggle, and emits expand outputs', () => {
    const fixture = setup();
    expect(rows(fixture).length).toBe(2);

    const expanded: unknown[] = [];
    fixture.componentInstance.nodeExpand.subscribe(
      expanded.push.bind(expanded),
    );
    rows(fixture)[0].querySelector<HTMLButtonElement>('button.toggle')!.click();
    fixture.detectChanges();

    expect(rows(fixture).length).toBe(4);
    expect(
      rows(fixture).map((row) => row.textContent?.includes('Leaf Two')),
    ).toContain(true);
    expect(expanded.map((node) => (node as HierarchyNode).key)).toEqual([
      'root-1',
    ]);
    const disabledCellText = rows(fixture)[2].textContent ?? '';
    expect(disabledCellText).toContain('Leaf Two');
  });

  it('sorts by a sortable column on header click and emits onSort with the order', () => {
    const fixture = setup();
    const sorts: unknown[] = [];
    fixture.componentInstance.onSort.subscribe(sorts.push.bind(sorts));

    const sortButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('th button.sort-control')!;
    sortButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sortField()).toBe('data.size');
    expect(fixture.componentInstance.sortOrder()).toBe(1);
    expect(sorts.length).toBe(1);

    sortButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sortOrder()).toBe(-1);
    expect(rows(fixture).at(-1)!.textContent?.includes('Root One')).toBeTrue();
  });

  it('selects rows through the row checkboxes and emits both select output names', () => {
    const fixture = setup();
    const selected: unknown[] = [];
    const aliased: unknown[] = [];
    fixture.componentInstance.nodeSelect.subscribe(
      selected.push.bind(selected),
    );
    fixture.componentInstance.onNodeSelect.subscribe(
      aliased.push.bind(aliased),
    );

    rows(fixture)[1].querySelector<HTMLInputElement>('input')!.click();
    fixture.detectChanges();

    expect([...fixture.componentInstance.selected()]).toEqual(['root-2']);
    expect(selected.length).toBe(1);
    expect(aliased.length).toBe(1);

    rows(fixture)[1].querySelector<HTMLInputElement>('input')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected().size).toBe(0);
  });

  it('paginates top-level roots locally and reports pages', () => {
    const fixture = setup({ paginator: true, rows: 1 });
    expect(rows(fixture).length).toBe(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '1–1 of 2',
    );

    (fixture.nativeElement as HTMLElement)
      .querySelectorAll<HTMLButtonElement>('.tree-table-paginator button')[3]!
      .click();
    fixture.detectChanges();
    expect(rows(fixture)[0].textContent?.includes('Root Two')).toBeTrue();
  });

  it('filters roots by label through the filter input', () => {
    const fixture = setup({ filterable: true });
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('.tree-table-filter input')!;
    input.value = 'root two';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(rows(fixture).length).toBe(1);
    expect(rows(fixture)[0].textContent).toContain('Root Two');
  });

  it('roves DOM focus across visible rows with arrows', async () => {
    const fixture = setup();
    rows(fixture)[0].querySelector<HTMLButtonElement>('button.toggle')!.click();
    fixture.detectChanges();

    // Navigable rows are Root One, Leaf One, and Root Two (Leaf Two is disabled).
    const firstRow = rows(fixture)[0];
    firstRow.focus();
    firstRow.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await fixture.whenStable();
    const focused = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('tbody tr[role="row"]:focus');
    expect(focused?.textContent).toContain('Leaf One');
  });
});
