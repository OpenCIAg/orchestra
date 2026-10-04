import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TreeNode, TreeViewComponent } from './tree-view.component';
import { focusElement } from '../../../tools/quality/test-focus-events';

describe('TreeViewComponent', () => {
  const nodes: TreeNode[] = [
    {
      id: 'one',
      label: 'One',
      children: [
        { id: 'one-a', label: 'One A' },
        { id: 'one-b', label: 'One B', disabled: true },
      ],
    },
    { id: 'two', label: 'Two' },
  ];

  function createFixture(value = nodes) {
    const fixture = TestBed.createComponent(TreeViewComponent);
    fixture.componentRef.setInput('nodes', value);
    fixture.detectChanges();
    return fixture;
  }

  function items(fixture: ReturnType<typeof createFixture>): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    );
  }

  function itemText(item: HTMLElement): string {
    const toggle = item.querySelector('.orc-tree__toggle')?.textContent ?? '';
    const label = item.querySelector('.orc-tree__label')?.textContent ?? '';
    return `${toggle}${label}`.replace(/\s+/g, '').trim();
  }

  function press(fixture: ReturnType<typeof createFixture>, key: string): void {
    const active = fixture.nativeElement.ownerDocument
      .activeElement as HTMLElement;
    active.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
    tick();
    fixture.detectChanges();
  }

  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TreeViewComponent] }),
  );

  it('exposes treeitem/group semantics and unique instance IDs', () => {
    const first = createFixture();
    const second = createFixture();
    first.componentInstance.toggle(nodes[0]);
    first.detectChanges();
    second.detectChanges();

    const firstTree = first.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const secondTree = second.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(firstTree.id).not.toBe(secondTree.id);
    expect(firstTree.getAttribute('aria-label')).toBe('Tree');
    expect(firstTree.querySelector('[role="group"]')).not.toBeNull();
    expect(
      firstTree.querySelector('[role="treeitem"]')?.getAttribute('aria-level'),
    ).toBe('1');
    expect(
      firstTree
        .querySelector('[role="group"] [role="treeitem"]')
        ?.getAttribute('aria-level'),
    ).toBe('2');
    expect(firstTree.querySelector('[role="treeitem"]')?.id).not.toBe(
      secondTree.querySelector('[role="treeitem"]')?.id,
    );
  });

  it('supports roving keyboard navigation, expansion, parent navigation, and selection', fakeAsync(() => {
    const fixture = createFixture();
    const selected: TreeNode[] = [];
    fixture.componentInstance.nodeSelect.subscribe((node) =>
      selected.push(node),
    );

    items(fixture)[0].focus();
    press(fixture, 'ArrowRight');
    expect(fixture.componentInstance.expanded()).toEqual(new Set(['one']));
    expect(items(fixture).map(itemText)).toEqual([
      '−One',
      'OneA',
      'OneB',
      'Two',
    ]);

    press(fixture, 'ArrowRight');
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneA');
    press(fixture, 'ArrowDown');
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneB');
    press(fixture, 'ArrowUp');
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneA');
    press(fixture, 'End');
    expect(itemText(document.activeElement as HTMLElement)).toBe('Two');
    press(fixture, 'Home');
    expect(itemText(document.activeElement as HTMLElement)).toBe('−One');
    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowLeft');
    expect(itemText(document.activeElement as HTMLElement)).toBe('−One');
    press(fixture, 'Enter');
    expect(selected.map((node) => node.id)).toEqual(['one']);
    press(fixture, ' ');
    expect(selected.map((node) => node.id)).toEqual(['one', 'one']);
  }));

  it('does not expand or select disabled nodes', fakeAsync(() => {
    const fixture = createFixture([
      {
        id: 'disabled',
        label: 'Disabled',
        disabled: true,
        children: [{ id: 'child', label: 'Child' }],
      },
    ]);
    let selected = false;
    fixture.componentInstance.nodeSelect.subscribe(() => (selected = true));
    const item = items(fixture)[0];
    item.focus();
    press(fixture, 'ArrowRight');
    press(fixture, 'Enter');
    press(fixture, ' ');
    expect(fixture.componentInstance.expanded().size).toBe(0);
    expect(selected).toBeFalse();
    expect(item.getAttribute('aria-disabled')).toBe('true');
    expect(
      (item.querySelector('button') as HTMLButtonElement).disabled,
    ).toBeTrue();
  }));

  it('keeps toggle button activation separate from node selection', fakeAsync(() => {
    const fixture = createFixture();
    let selected = false;
    fixture.componentInstance.nodeSelect.subscribe(() => (selected = true));
    const toggle = items(fixture)[0].querySelector(
      '.orc-tree__toggle',
    ) as HTMLButtonElement;
    toggle.focus();
    press(fixture, ' ');
    expect(fixture.componentInstance.expanded()).toEqual(new Set(['one']));
    expect(selected).toBeFalse();
    expect(document.activeElement).toBe(items(fixture)[0]);
  }));

  it('does not let nested child events activate or move the owning parent', fakeAsync(() => {
    const fixture = createFixture();
    fixture.componentInstance.toggle(nodes[0]);
    fixture.detectChanges();
    const child = items(fixture)[1];
    const selected: TreeNode[] = [];
    fixture.componentInstance.nodeSelect.subscribe((node) =>
      selected.push(node),
    );
    child.click();
    expect(selected.map((node) => node.id)).toEqual(['one-a']);
    child.focus();
    press(fixture, 'ArrowDown');
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneB');
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  }));

  it('supports buffered, wraparound typeahead across visible nodes', fakeAsync(() => {
    const fixture = createFixture([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
      { id: 'bravo', label: 'Bravo' },
    ]);
    items(fixture)[0].focus();
    press(fixture, 'b');
    expect(itemText(document.activeElement as HTMLElement)).toBe('Beta');
    tick(600);
    press(fixture, 'b');
    expect(itemText(document.activeElement as HTMLElement)).toBe('Bravo');
    tick(600);
    press(fixture, 'b');
    expect(itemText(document.activeElement as HTMLElement)).toBe('Beta');
  }));

  it('ignores composing key events during typeahead', fakeAsync(() => {
    const fixture = createFixture([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ]);
    const first = items(fixture)[0];
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'b',
        bubbles: true,
        cancelable: true,
        isComposing: true,
      }),
    );
    tick();
    fixture.detectChanges();
    expect(itemText(document.activeElement as HTMLElement)).toBe('Alpha');
  }));

  it('preserves the focused node ID when visible nodes are reordered', () => {
    const fixture = createFixture([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ]);
    focusElement(items(fixture)[1]);
    fixture.componentRef.setInput('nodes', [
      { id: 'beta', label: 'Beta (updated)' },
      { id: 'alpha', label: 'Alpha' },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(items(fixture)[0].getAttribute('tabindex')).toBe('0');
    expect(itemText(document.activeElement as HTMLElement)).toBe(
      'Beta(updated)',
    );
  });

  it('focuses a child when expansion and active index change before render', fakeAsync(() => {
    const fixture = createFixture(nodes);
    fixture.componentInstance.toggle(nodes[0]);
    fixture.componentInstance.setActiveIndex(1);
    fixture.detectChanges();
    tick();
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneA');
  }));

  it('resolves IDs with CSS punctuation through the owning tree', fakeAsync(() => {
    const fixture = createFixture([
      { id: 'odd id/a:%:one', label: 'Odd' },
      { id: 'plain', label: 'Plain' },
    ]);
    const odd = items(fixture)[0];
    expect(document.getElementById(odd.id)).toBe(odd);
    odd.focus();
    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowUp');
    expect(document.activeElement).toBe(odd);
  }));

  it('does not restore focus when a background update occurs outside the tree', () => {
    const fixture = createFixture([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ]);
    const outside = document.createElement('button');
    outside.textContent = 'Outside';
    document.body.appendChild(outside);
    outside.focus();
    fixture.componentRef.setInput('nodes', [
      { id: 'beta', label: 'Beta (updated)' },
      { id: 'alpha', label: 'Alpha' },
    ]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('preserves focus inside a collapsed subtree in its same-origin owner document', fakeAsync(() => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const ownerDocument = frame.contentDocument!;
    const treeNodes: TreeNode[] = [
      {
        id: 'one',
        label: 'One',
        children: [{ id: 'one-a', label: 'One A' }],
      },
      { id: 'two', label: 'Two' },
    ];
    const fixture = createFixture(treeNodes);
    try {
      ownerDocument.body.append(fixture.nativeElement as HTMLElement);
      expect(fixture.nativeElement.ownerDocument).toBe(ownerDocument);

      fixture.componentInstance.toggle(treeNodes[0]);
      fixture.detectChanges();
      const child = items(fixture)[1];
      child.focus();
      expect(ownerDocument.activeElement).toBe(child);

      // A programmatic roving-index update may temporarily differ from DOM focus.
      // Collapsing the focused ancestor still needs to return focus to that ancestor.
      fixture.componentInstance.setActiveIndex(2, false);
      expect(ownerDocument.activeElement).toBe(child);
      fixture.componentInstance.toggle(treeNodes[0]);
      fixture.detectChanges();
      tick();

      expect(ownerDocument.activeElement).toBe(items(fixture)[0]);
      expect(ownerDocument.activeElement?.textContent).toContain('One');
    } finally {
      fixture.destroy();
      frame.remove();
    }
  }));

  it('restores focus to a reordered active node in its same-origin owner document', fakeAsync(() => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const ownerDocument = frame.contentDocument!;
    const fixture = createFixture([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ]);
    try {
      ownerDocument.body.append(fixture.nativeElement as HTMLElement);
      const beta = items(fixture)[1];
      beta.focus();
      expect(ownerDocument.activeElement).toBe(beta);
      const restoreFocus = spyOn(beta, 'focus').and.callThrough();

      fixture.componentRef.setInput('nodes', [
        { id: 'beta', label: 'Beta (updated)' },
        { id: 'alpha', label: 'Alpha' },
      ]);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.activeIndex()).toBe(0);
      expect(ownerDocument.activeElement).toBe(items(fixture)[0]);
      expect(restoreFocus).toHaveBeenCalled();
    } finally {
      fixture.destroy();
      frame.remove();
    }
  }));

  it('cancels superseded and destroyed deferred focus requests', fakeAsync(() => {
    const fixture = createFixture(nodes);
    fixture.componentInstance.toggle(nodes[0]);
    fixture.componentInstance.setActiveIndex(1);
    fixture.componentInstance.setActiveIndex(2);
    fixture.detectChanges();
    tick();
    expect(itemText(document.activeElement as HTMLElement)).toBe('OneB');

    const destroyed = createFixture(nodes);
    destroyed.componentInstance.toggle(nodes[0]);
    destroyed.componentInstance.setActiveIndex(1);
    destroyed.destroy();
    expect(() => tick()).not.toThrow();
  }));

  it('returns focus to a collapsed node and synchronizes removed nodes', fakeAsync(() => {
    const fixture = createFixture();
    fixture.componentInstance.toggle(nodes[0]);
    fixture.detectChanges();
    items(fixture)[1].focus();
    fixture.componentInstance.toggle(nodes[0]);
    fixture.detectChanges();
    tick();
    expect(itemText(document.activeElement as HTMLElement)).toBe('+One');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    fixture.componentRef.setInput('nodes', [
      { id: 'replacement', label: 'Replacement' },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded().size).toBe(0);
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(items(fixture)[0].getAttribute('tabindex')).toBe('0');
  }));

  it('updates labels and item text when nodes are replaced with the same IDs', () => {
    const fixture = createFixture([{ id: 'same', label: 'Before' }]);
    fixture.componentRef.setInput('nodes', [{ id: 'same', label: 'After' }]);
    fixture.detectChanges();
    expect(itemText(items(fixture)[0])).toBe('After');
  });

  it('cleans up its DOM when destroyed', () => {
    const fixture = createFixture();
    expect(() => fixture.destroy()).not.toThrow();
  });
});
