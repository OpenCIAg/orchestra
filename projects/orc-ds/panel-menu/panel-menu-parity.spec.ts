import { TestBed } from '@angular/core/testing';
import { PanelMenuComponent } from '@ciag/orchestra/p2';
import type { PrimeMenuItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the panel menu. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('PanelMenu behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  const items = (): PrimeMenuItem[] => [
    {
      label: 'Group one',
      value: 'one',
      items: [
        { label: 'Child A', value: 'a' },
        { label: 'Child B', value: 'b' },
      ],
    },
    {
      label: 'Group two',
      value: 'two',
      items: [{ label: 'Child C', value: 'c' }],
    },
    { label: 'Leaf', value: 'leaf' },
    { label: 'Hidden', value: 'hidden', visible: false },
    { label: 'Blocked', value: 'blocked', disabled: true },
  ];

  const treeHost = (fixture: ReturnType<typeof create>) =>
    (fixture.nativeElement as HTMLElement).querySelector(
      '[role="tree"]',
    ) as HTMLElement;

  const treeItems = (fixture: ReturnType<typeof create>) =>
    Array.from(
      treeHost(fixture).querySelectorAll<HTMLElement>('[role="treeitem"]'),
    ).filter((item) => !(item instanceof HTMLButtonElement && item.disabled));

  function create() {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', items());
    fixture.detectChanges();
    return fixture;
  }

  it('renders one child level for expanded groups and skips hidden and disabled roots', () => {
    const fixture = create();
    const roots = Array.from(
      treeHost(fixture).querySelectorAll<HTMLElement>(
        ':scope > [role="treeitem"]',
      ),
    );
    const label = (root: HTMLElement) =>
      root.textContent?.replace(/[+−]\s*$/, '').trim();
    expect(roots.map(label)).toEqual([
      'Group one',
      'Group two',
      'Leaf',
      'Blocked',
    ]);

    fixture.componentInstance.toggle(
      fixture.componentInstance.effectiveItems()[0],
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open().size).toBe(1);
    const children = Array.from(
      treeHost(fixture).querySelectorAll<HTMLElement>(
        '.children [role="treeitem"]',
      ),
    );
    expect(children.map((child) => child.textContent?.trim())).toEqual([
      'Child A',
      'Child B',
    ]);
  });

  it('collapses the previous group in single mode and emits both collapse aliases', () => {
    const fixture = create();
    const model = fixture.componentInstance.effectiveItems();
    const collapsed: PrimeMenuItem[] = [];
    const nodeCollapsed: PrimeMenuItem[] = [];
    fixture.componentInstance.onItemCollapse.subscribe((item) =>
      collapsed.push(item),
    );
    fixture.componentInstance.onNodeCollapse.subscribe((item) =>
      nodeCollapsed.push(item),
    );

    fixture.componentInstance.toggle(model[0]);
    fixture.componentInstance.toggle(model[1]);
    fixture.detectChanges();

    expect(fixture.componentInstance.open().size).toBe(1);
    expect([...fixture.componentInstance.open()][0]).toBe(model[1]);
    expect(collapsed.length).toBe(1);
    expect(nodeCollapsed.length).toBe(1);
    expect(collapsed[0]).toBe(nodeCollapsed[0]);
    expect(collapsed[0]).toBe(model[0]);
  });

  it('selects a leaf with both select aliases and expands a group through keyboard', () => {
    const fixture = create();
    const selected: PrimeMenuItem[] = [];
    const nodeSelected: PrimeMenuItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onNodeSelect.subscribe((item) =>
      nodeSelected.push(item),
    );
    const roots = Array.from(
      treeHost(fixture).querySelectorAll<HTMLElement>(
        ':scope > [role="treeitem"]',
      ),
    );
    roots[2].focus();
    keydown('Enter', roots[2]);
    fixture.detectChanges();
    expect(selected.map((item) => item.value)).toEqual(['leaf']);
    expect(nodeSelected.map((item) => item.value)).toEqual(['leaf']);

    roots[0].focus();
    keydown('ArrowRight', roots[0]);
    fixture.detectChanges();
    expect(
      fixture.componentInstance
        .open()
        .has(fixture.componentInstance.effectiveItems()[0]),
    ).toBeTrue();
  });

  it('roves DOM focus across the visible tree, including open children', () => {
    const fixture = create();
    fixture.componentInstance.toggle(
      fixture.componentInstance.effectiveItems()[0],
    );
    fixture.detectChanges();
    const focusables = treeItems(fixture);
    expect(focusables.length).toBe(5);
    focusables[0].focus();
    keydown('ArrowDown', focusables[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(focusables[1]);
    keydown('End', focusables[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);
  });
});
