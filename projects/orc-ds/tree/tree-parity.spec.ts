import { TestBed } from '@angular/core/testing';
import { TreeComponent } from '@ciag/orchestra/tree';
import { HierarchyNode } from '@ciag/orchestra/tree-table';

/**
 * Behavior-parity pins for the tree family. The specs import the component
 * through the family entry point and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('Tree behavior parity', () => {
  const nodes: HierarchyNode[] = [
    {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'child-a', label: 'Child A' },
        { key: 'child-b', label: 'Child B', disabled: true },
      ],
    },
    { key: 'solo', label: 'Solo' },
  ];

  const setup = () => {
    const fixture = TestBed.createComponent(TreeComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.detectChanges();
    return fixture;
  };

  const rows = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="treeitem"]',
      ),
    );

  const labels = (fixture: ReturnType<typeof setup>) =>
    rows(fixture).map(
      (row) => row.querySelector('button.label')?.textContent?.trim() ?? '',
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders collapsed roots, expands on the toggle button, and emits both expand output names', () => {
    const fixture = setup();
    expect(labels(fixture)).toEqual(['Root', 'Solo']);

    const expanded: unknown[] = [];
    const aliased: unknown[] = [];
    fixture.componentInstance.nodeExpand.subscribe(
      expanded.push.bind(expanded),
    );
    fixture.componentInstance.onNodeExpand.subscribe(
      aliased.push.bind(aliased),
    );

    rows(fixture)[0].querySelector<HTMLButtonElement>('button.toggle')!.click();
    fixture.detectChanges();

    expect(labels(fixture)).toEqual(['Root', 'Child A', 'Child B', 'Solo']);
    expect(expanded.map((node) => (node as HierarchyNode).key)).toEqual([
      'root',
    ]);
    expect(aliased.length).toBe(1);
  });

  it('selects a node, emits both select output names plus selectionChange, and toggles off', () => {
    const fixture = setup();
    const selected: unknown[] = [];
    const aliased: unknown[] = [];
    const changes: unknown[] = [];
    fixture.componentInstance.nodeSelect.subscribe(
      selected.push.bind(selected),
    );
    fixture.componentInstance.onNodeSelect.subscribe(
      aliased.push.bind(aliased),
    );
    fixture.componentInstance.selectionChange.subscribe(
      changes.push.bind(changes),
    );

    rows(fixture)[1].querySelector<HTMLButtonElement>('button.label')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('solo');
    expect(selected.length).toBe(1);
    expect(aliased.length).toBe(1);
    expect(changes).toEqual(['solo']);

    rows(fixture)[1].querySelector<HTMLButtonElement>('button.label')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBeNull();
  });

  it('keeps disabled nodes unselectable and collapsed', () => {
    const fixture = setup();
    rows(fixture)[0].querySelector<HTMLButtonElement>('button.toggle')!.click();
    fixture.detectChanges();
    const disabledRow = rows(fixture)[2];
    expect(labels(fixture)[2]).toBe('Child B');

    disabledRow.querySelector<HTMLButtonElement>('button.label')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBeNull();
  });

  it('roves the active descendant with arrows and honors Home/End', async () => {
    const fixture = setup();
    rows(fixture)[0].querySelector<HTMLButtonElement>('button.toggle')!.click();
    fixture.detectChanges();

    const tree = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('[role="tree"]')!;
    tree.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    expect(
      tree
        .querySelector('.tree-row.active')
        ?.querySelector('button.label')
        ?.textContent?.trim(),
    ).toBe('Child A');

    tree.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    fixture.detectChanges();
    expect(
      tree
        .querySelector('.tree-row.active')
        ?.querySelector('button.label')
        ?.textContent?.trim(),
    ).toBe('Solo');

    tree.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    fixture.detectChanges();
    expect(
      tree
        .querySelector('.tree-row.active')
        ?.querySelector('button.label')
        ?.textContent?.trim(),
    ).toBe('Root');
  });

  it('filters nodes into the matched subtree when the filter input changes', () => {
    const fixture = setup();
    fixture.componentInstance.onFilterInput({
      target: { value: 'child a' },
    } as unknown as Event);
    fixture.detectChanges();
    expect(labels(fixture)).toEqual(['Root', 'Child A']);
  });
});
