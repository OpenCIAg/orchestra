import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { focusElement } from '../../tools/quality/test-focus-events';
import { TreeComponent } from '@ciag/orchestra/tree';
import { HierarchyNode } from '@ciag/orchestra/tree-table';

@Component({
  standalone: true,
  imports: [TreeComponent],
  template: `<orc-tree
    [nodes]="nodes"
    [selected]="selection"
    selectionMode="multiple"
    (selectedChange)="updateSelection($event)"
  />`,
})
class ControlledTreeSelectionHost {
  readonly nodes: HierarchyNode[] = [
    { key: 'initial', label: 'Initial' },
    { key: 'next', label: 'Next' },
  ];
  selection: string | string[] | null = ['initial'];
  readonly changes: Array<string | string[] | null> = [];

  updateSelection(value: string | string[] | null): void {
    this.selection = Array.isArray(value) ? [...value] : value;
    this.changes.push(value);
  }
}

@Component({
  standalone: true,
  imports: [TreeComponent],
  template: `<orc-tree
    [nodes]="nodes"
    [filter]="true"
    [(filterValue)]="filter"
    (onFilter)="recordFilter($event.filter)"
  />`,
})
class ControlledTreeFilterHost {
  readonly nodes: HierarchyNode[] = [
    { key: 'alpha', label: 'Alpha' },
    { key: 'beta', label: 'Beta' },
  ];
  filter = '';
  readonly filters: string[] = [];

  recordFilter(value: string): void {
    this.filters.push(value);
  }
}

describe('Tree naming, filtering and scroll contract', () => {
  it('uses the visible label when the explicit accessible name is blank', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    fixture.componentRef.setInput('label', 'Asset hierarchy');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(tree.getAttribute('aria-label')).toBe('Asset hierarchy');

    fixture.componentRef.setInput('ariaLabelledBy', 'hierarchy-title');
    fixture.detectChanges();

    expect(tree.getAttribute('aria-label')).toBeNull();
    expect(tree.getAttribute('aria-labelledby')).toBe('hierarchy-title');
  });

  it('uses configured names and styles, filters nested fields through collapsed branches, and emits scroll', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    const nodes: HierarchyNode[] = [
      {
        key: 'division',
        label: 'Division',
        data: { location: 'Operations' },
        children: [
          {
            key: 'site',
            label: 'Site',
            data: { location: 'Northern Warehouse' },
          },
        ],
      },
    ];
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('filterBy', 'data.location,label');
    fixture.componentRef.setInput('filterMode', 'strict');
    fixture.componentRef.setInput('filterLocale', 'en-US');
    fixture.componentRef.setInput('ariaLabel', 'Asset hierarchy');
    fixture.componentRef.setInput('ariaLabelledBy', 'hierarchy-heading');
    fixture.componentRef.setInput('style', { '--tree-contract-color': 'teal' });
    fixture.componentRef.setInput('scrollHeight', '9rem');
    component.filterValue.set('warehouse');
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const viewport = fixture.nativeElement.querySelector(
      '.orc-tree',
    ) as HTMLElement;
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(tree.getAttribute('aria-label')).toBe('Asset hierarchy');
    expect(tree.getAttribute('aria-labelledby')).toBe('hierarchy-heading');
    expect(tree.tabIndex).toBe(0);
    expect(tree.getAttribute('aria-activedescendant')).toBe(items[0].id);
    expect(viewport.style.maxHeight).toBe('9rem');
    expect(viewport.style.getPropertyValue('--tree-contract-color')).toBe(
      'teal',
    );
    expect(items.map((item) => item.textContent?.replace(/\s+/g, ''))).toEqual([
      '▾Division',
      '·Site',
    ]);
    expect(items[0].getAttribute('aria-expanded')).toBe('true');

    const scrollEvents: Event[] = [];
    component.onScroll.subscribe((event) => scrollEvents.push(event));
    const scrollEvent = new Event('scroll');
    viewport.dispatchEvent(scrollEvent);
    expect(scrollEvents).toEqual([scrollEvent]);
  });

  it('keeps filter keystrokes out of tree row navigation and selection', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
    ]);
    fixture.componentRef.setInput('filter', true);
    fixture.detectChanges();

    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    filter.focus();
    filter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    filter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );

    expect(component.selected()).toBeNull();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(filter);
  });

  it('uses value over nodes and keeps filter model and event payload synchronized', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'asset-tree');
    fixture.componentRef.setInput('nodes', [
      { key: 'fallback', label: 'Fallback node' },
    ]);
    fixture.componentRef.setInput('value', [
      { key: 'match', label: 'Matching node' },
      { key: 'other', label: 'Another node' },
    ]);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('filterPlaceholder', 'Search assets');
    fixture.componentRef.setInput('filterAriaLabel', 'Filter assets');
    fixture.componentRef.setInput('styleClass', 'compact-tree');
    fixture.componentRef.setInput('indentation', 2);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const viewport = fixture.nativeElement.querySelector(
      '.orc-tree',
    ) as HTMLElement;
    const firstRow = fixture.nativeElement.querySelector(
      '[role="treeitem"]',
    ) as HTMLElement;
    expect((fixture.nativeElement as HTMLElement).id).toBe('asset-tree');
    expect(tree.id).toBe('asset-tree-tree');
    expect(viewport.classList.contains('compact-tree')).toBeTrue();
    expect(input.placeholder).toBe('Search assets');
    expect(input.getAttribute('aria-label')).toBe('Filter assets');
    expect(firstRow.textContent).toContain('Matching node');
    expect(firstRow.textContent).not.toContain('Fallback node');
    expect(firstRow.style.paddingLeft).toBe('2.5rem');

    let filterEvent: { originalEvent: Event; filter: string } | undefined;
    component.onFilter.subscribe((event) => (filterEvent = event));
    input.value = 'matching';
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    fixture.detectChanges();

    expect(component.filterValue()).toBe('matching');
    expect(filterEvent).toEqual({ originalEvent: event, filter: 'matching' });
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          '[role="treeitem"]',
        ) as NodeListOf<HTMLElement>,
      ).map((row) => row.textContent?.trim()),
    ).toEqual(['· Matching node']);
  });

  it('binds filterValue as a model and filters with the configured locale', () => {
    const fixture = TestBed.createComponent(ControlledTreeFilterHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'beta';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(host.filter).toBe('beta');
    expect(host.filters).toEqual(['beta']);
    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          '[role="treeitem"]',
        ),
      ).map((row) => row.textContent?.trim()),
    ).toEqual(['· Beta']);

    const localeFixture = TestBed.createComponent(TreeComponent);
    const localeComponent = localeFixture.componentInstance;
    localeFixture.componentRef.setInput('nodes', [
      { key: 'turkish', label: 'İSTANBUL' },
      { key: 'other', label: 'Ankara' },
    ]);
    localeFixture.componentRef.setInput('filter', true);
    localeFixture.componentRef.setInput('filterLocale', 'tr');
    localeComponent.filterValue.set('istanbul');
    localeFixture.detectChanges();

    expect(
      Array.from(
        (
          localeFixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLElement>('[role="treeitem"]'),
      ).map((row) => row.textContent?.trim()),
    ).toEqual(['· İSTANBUL']);
  });

  it('renders configured empty and loading status messages', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    fixture.componentRef.setInput('nodes', []);
    fixture.componentRef.setInput('emptyText', 'No assets found');
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', 'Loading assets');
    fixture.componentRef.setInput('loadingMode', 'icon');
    fixture.componentRef.setInput('loadingIcon', 'spinner');
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const statuses = Array.from(
      fixture.nativeElement.querySelectorAll('[role="status"]'),
    ) as HTMLElement[];
    expect(tree.getAttribute('aria-busy')).toBe('true');
    expect(statuses.map((status) => status.textContent?.trim())).toEqual([
      'Loading assets',
    ]);
    expect(statuses[0].textContent).not.toContain('spinner');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          '[role="status"]',
        ),
      ).map((status) => status.textContent?.trim()),
    ).toEqual(['No assets found']);
  });

  it('names expansion actions and disables forced expansion while filtering', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
    ]);
    fixture.componentRef.setInput('filter', true);
    component.filterValue.set('child');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '.toggle',
    ) as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Collapse Root');
    expect(toggle.disabled).toBeTrue();
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(2);
  });

  it('uses configured expand and collapse accessible names', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [{ key: 'child', label: 'Child' }],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('expandAriaLabel', 'Open branch');
    fixture.componentRef.setInput('collapseAriaLabel', 'Close branch');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '.toggle',
    ) as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Open branch Root');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Close branch Root');
  });

  it('renders checkbox selection with checked and mixed accessible states', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        key: 'root',
        label: 'Root',
        children: [
          { key: 'selected', label: 'Selected child' },
          { key: 'unselected', label: 'Unselected child' },
          { key: 'disabled', label: 'Disabled child', disabled: true },
        ],
      },
    ]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    component.selected.set(['selected', 'disabled']);
    component.toggle(component.nodes()[0]);
    fixture.detectChanges();

    const [rootRow, selectedRow, unselectedRow, disabledRow] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(rootRow.getAttribute('aria-checked')).toBe('mixed');
    expect(rootRow.hasAttribute('aria-selected')).toBeFalse();
    expect(selectedRow.getAttribute('aria-checked')).toBe('true');
    expect(
      selectedRow.querySelector('.tree-checkbox')?.textContent?.trim(),
    ).toBe('✓');
    expect(unselectedRow.getAttribute('aria-checked')).toBe('false');
    expect(disabledRow.getAttribute('aria-checked')).toBe('true');
    expect(disabledRow.getAttribute('aria-disabled')).toBe('true');

    (unselectedRow.querySelector('.label') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(unselectedRow.getAttribute('aria-checked')).toBe('true');
    expect(component.selected()).toEqual([
      'selected',
      'disabled',
      'unselected',
    ]);
  });

  it('propagates checkbox selection to enabled descendants only', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'child', label: 'Child' },
        { key: 'blocked', label: 'Blocked', disabled: true },
      ],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const rootLabel = fixture.nativeElement.querySelector(
      '.label',
    ) as HTMLButtonElement;
    rootLabel.click();
    fixture.detectChanges();

    expect(component.selected()).toEqual(['root', 'child']);
    expect(component.selected()).not.toContain('blocked');
    const [rootRow] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(rootRow.getAttribute('aria-checked')).toBe('true');

    (rootRow.querySelector('.toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(rows[1].getAttribute('aria-checked')).toBe('true');
    expect(rows[2].getAttribute('aria-checked')).toBe('false');
  });

  it('does not propagate checkbox selection through a disabled branch', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'enabled-leaf', label: 'Enabled leaf' },
        {
          key: 'disabled-branch',
          label: 'Disabled branch',
          disabled: true,
          children: [{ key: 'hidden-leaf', label: 'Hidden leaf' }],
        },
      ],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', true);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const rootLabel = fixture.nativeElement.querySelector(
      '.label',
    ) as HTMLButtonElement;
    rootLabel.click();
    fixture.detectChanges();

    expect(component.selected()).toEqual(['root', 'enabled-leaf']);
    expect(component.selected()).not.toContain('disabled-branch');
    expect(component.selected()).not.toContain('hidden-leaf');
    fixture.destroy();
  });

  it('does not expand disabled branches through pointer or direct activation', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const disabledBranch: HierarchyNode = {
      key: 'disabled-branch',
      label: 'Disabled branch',
      disabled: true,
      children: [{ key: 'child', label: 'Child' }],
    };
    fixture.componentRef.setInput('nodes', [disabledBranch]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const expandEvents: HierarchyNode<unknown>[] = [];
    component.nodeExpand.subscribe((node) => expandEvents.push(node));

    const toggle = fixture.nativeElement.querySelector(
      '.toggle',
    ) as HTMLButtonElement;
    expect(toggle.disabled).toBeTrue();
    toggle.click();
    component.toggle(disabledBranch);
    fixture.detectChanges();

    expect(component.expanded().has(disabledBranch.key)).toBeFalse();
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(1);
    expect(expandEvents).toEqual([]);
  });

  it('does not select a disabled parent during upward checkbox propagation', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    const root: HierarchyNode = {
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
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionUp', true);
    component.expanded.set(new Set(['root', 'blocked-parent']));
    fixture.detectChanges();

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    const blockedParent = rows[1];
    const leaf = rows[2];
    (leaf.querySelector('.label') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.selected()).toEqual(['leaf']);
    expect(blockedParent.getAttribute('aria-checked')).toBe('mixed');
    expect(leaf.getAttribute('aria-checked')).toBe('true');
  });

  it('emits expansion outputs after committing the expanded state', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [{ key: 'child', label: 'Child' }],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const primaryStates: boolean[] = [];
    const aliasStates: boolean[] = [];
    component.nodeExpand.subscribe(() =>
      primaryStates.push(component.expanded().has(root.key)),
    );
    component.onNodeExpand.subscribe(() =>
      aliasStates.push(component.expanded().has(root.key)),
    );
    component.nodeCollapse.subscribe(() =>
      primaryStates.push(component.expanded().has(root.key)),
    );
    component.onNodeCollapse.subscribe(() =>
      aliasStates.push(component.expanded().has(root.key)),
    );

    component.toggle(root);
    component.toggle(root);

    expect(primaryStates).toEqual([true, false]);
    expect(aliasStates).toEqual([true, false]);
  });

  it('preserves an empty node key when changing from single to multiple selection', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    const emptyKeyNode: HierarchyNode = { key: '', label: 'Empty key' };
    const otherNode: HierarchyNode = { key: 'other', label: 'Other' };
    fixture.componentRef.setInput('nodes', [emptyKeyNode, otherNode]);
    fixture.detectChanges();

    component.select(emptyKeyNode);
    expect(component.selected()).toBe('');

    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.detectChanges();
    component.select(otherNode);
    expect(component.selected()).toEqual(['', 'other']);
  });

  it('owns one tab stop and navigates enabled visible treeitems without selecting', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'first', label: 'First' },
        { key: 'blocked', label: 'Blocked', disabled: true },
        { key: 'second', label: 'Second' },
      ],
    };
    const second = root.children![2]!;
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const rows = (): HTMLElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
      ) as HTMLElement[];
    const activeRow = () =>
      tree.querySelector<HTMLElement>(
        `#${tree.getAttribute('aria-activedescendant')}`,
      );
    const key = (keyName: string) => {
      const event = new KeyboardEvent('keydown', {
        key: keyName,
        bubbles: true,
        cancelable: true,
      });
      tree.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    const expanded: HierarchyNode<unknown>[] = [];
    const expandedAliases: HierarchyNode<unknown>[] = [];
    const collapsed: HierarchyNode<unknown>[] = [];
    const collapsedAliases: HierarchyNode<unknown>[] = [];
    const selectionChanges: Array<string | string[] | null> = [];
    const selected: HierarchyNode<unknown>[] = [];
    const selectedAliases: HierarchyNode<unknown>[] = [];
    const unselected: HierarchyNode<unknown>[] = [];
    const unselectedAliases: HierarchyNode<unknown>[] = [];
    component.nodeExpand.subscribe((node) => expanded.push(node));
    component.onNodeExpand.subscribe((node) => expandedAliases.push(node));
    component.nodeCollapse.subscribe((node) => collapsed.push(node));
    component.onNodeCollapse.subscribe((node) => collapsedAliases.push(node));
    component.selectionChange.subscribe((value) =>
      selectionChanges.push(value),
    );
    component.nodeSelect.subscribe((node) => selected.push(node));
    component.onNodeSelect.subscribe((node) => selectedAliases.push(node));
    component.nodeUnselect.subscribe((node) => unselected.push(node));
    component.onNodeUnselect.subscribe((node) => unselectedAliases.push(node));

    expect(tree.getAttribute('aria-label')).toBe('Tree');
    expect(tree.getAttribute('aria-activedescendant')).toBe(rows()[0].id);
    expect(fixture.nativeElement.querySelectorAll('[tabindex="0"]')).toHaveSize(
      1,
    );
    expect(fixture.nativeElement.querySelector('[tabindex="0"]')).toBe(tree);
    expect(
      Array.from(tree.querySelectorAll('button')).every(
        (button) => button.tabIndex === -1,
      ),
    ).toBeTrue();

    focusElement(tree);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tree);
    expect(key('ArrowRight').defaultPrevented).toBeTrue();
    expect(component.expanded().has('root')).toBeTrue();
    expect(rows()).toHaveSize(4);
    expect(activeRow()?.textContent).toContain('Root');
    expect(expanded).toEqual([root]);
    expect(expandedAliases).toEqual([root]);
    expect(selectionChanges).toEqual([]);

    key('ArrowRight');
    expect(activeRow()?.textContent).toContain('First');
    key('ArrowDown');
    expect(activeRow()?.textContent).toContain('Second');
    expect(tree.getAttribute('aria-activedescendant')).toBe(rows()[3].id);
    expect(component.selected()).toBeNull();
    key('ArrowUp');
    expect(activeRow()?.textContent).toContain('First');
    key('End');
    expect(activeRow()?.textContent).toContain('Second');
    key('Home');
    expect(activeRow()?.textContent).toContain('Root');

    key('End');
    expect(key('Enter').defaultPrevented).toBeTrue();
    expect(component.selected()).toEqual(['second']);
    expect(selectionChanges).toEqual([['second']]);
    expect(selected).toHaveSize(1);
    expect(selected[0]).toBe(second);
    expect(selectedAliases).toHaveSize(1);
    expect(selectedAliases[0]).toBe(second);
    expect(unselected).toEqual([]);
    expect(activeRow()?.getAttribute('aria-selected')).toBe('true');

    key(' ');
    expect(component.selected()).toEqual([]);
    expect(selectionChanges).toEqual([['second'], []]);
    expect(unselected).toHaveSize(1);
    expect(unselected[0]).toBe(second);
    expect(unselectedAliases).toHaveSize(1);
    expect(unselectedAliases[0]).toBe(second);
    expect(selected).toHaveSize(1);
    expect(selectedAliases).toHaveSize(1);

    key('ArrowLeft');
    expect(activeRow()?.textContent).toContain('Root');
    expect(component.expanded().has('root')).toBeTrue();
    key('ArrowLeft');
    expect(component.expanded().has('root')).toBeFalse();
    expect(rows()).toHaveSize(1);
    expect(activeRow()?.textContent).toContain('Root');
    expect(collapsed).toEqual([root]);
    expect(collapsedAliases).toEqual([root]);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tree);
  });

  it('keeps the active descendant valid when filtering removes active rows', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('nodes', [
      {
        key: 'root',
        label: 'Root',
        children: [{ key: 'child', label: 'Child' }],
      },
      { key: 'other', label: 'Other' },
    ]);
    component.filterValue.set('child');
    fixture.detectChanges();
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;

    component.activeTreeIndex.set(1);
    component.filterValue.set('other');
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      fixture.nativeElement.querySelector('[role="treeitem"]')?.id,
    );

    component.filterValue.set('no match');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(0);
    expect(tree.hasAttribute('aria-activedescendant')).toBeFalse();
  });

  it('preserves pointer expansion and selection outputs while syncing active focus', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const root: HierarchyNode = {
      key: 'root',
      label: 'Root',
      children: [{ key: 'child', label: 'Child' }],
    };
    const child = root.children![0]!;
    fixture.componentRef.setInput('nodes', [root]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const expandEvents: HierarchyNode<unknown>[] = [];
    const selectEvents: HierarchyNode<unknown>[] = [];
    component.nodeExpand.subscribe((node) => expandEvents.push(node));
    component.nodeSelect.subscribe((node) => selectEvents.push(node));

    (
      fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(component.expanded().has('root')).toBeTrue();
    expect(expandEvents).toEqual([root]);
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      fixture.nativeElement.querySelector('[role="treeitem"]')?.id,
    );
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tree);

    const childRow = (
      Array.from(
        fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
      ) as HTMLElement[]
    ).find((row) => row.textContent?.includes('Child'))!;
    (childRow.querySelector('.label') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selected()).toBe('child');
    expect(selectEvents).toHaveSize(1);
    expect(selectEvents[0]).toBe(child);
    expect(tree.getAttribute('aria-activedescendant')).toBe(childRow.id);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tree);
  });

  it('emits selectedChange and updates the controlled selection binding', () => {
    const fixture = TestBed.createComponent(ControlledTreeSelectionHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const nextRow = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[role="treeitem"]',
      ) as NodeListOf<HTMLElement>,
    ).find((row) => row.textContent?.includes('Next'))!;

    (nextRow.querySelector('.label') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.selection).toEqual(['initial', 'next']);
    expect(host.changes).toEqual([['initial', 'next']]);
    expect(nextRow.getAttribute('aria-selected')).toBe('true');
  });

  it('emits context-menu and double-click events only for enabled nodes', () => {
    const fixture = TestBed.createComponent(TreeComponent);
    const enabled: HierarchyNode = { key: 'enabled', label: 'Enabled' };
    const disabled: HierarchyNode = {
      key: 'disabled',
      label: 'Disabled',
      disabled: true,
    };
    fixture.componentRef.setInput('nodes', [enabled, disabled]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const contextSelections: HierarchyNode<unknown>[] = [];
    const doubleClicks: HierarchyNode<unknown>[] = [];
    component.onNodeContextMenuSelect.subscribe((node) =>
      contextSelections.push(node),
    );
    component.onNodeDoubleClick.subscribe((node) => doubleClicks.push(node));
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[role="treeitem"]',
      ) as NodeListOf<HTMLElement>,
    );

    const enabledContextMenu = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    rows[0].dispatchEvent(enabledContextMenu);
    rows[0].dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    );
    const disabledContextMenu = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    rows[1].dispatchEvent(disabledContextMenu);
    rows[1].dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    );

    expect(enabledContextMenu.defaultPrevented).toBeTrue();
    expect(disabledContextMenu.defaultPrevented).toBeTrue();
    expect(contextSelections).toEqual([enabled]);
    expect(doubleClicks).toEqual([enabled]);
  });
});
