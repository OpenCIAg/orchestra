import { TestBed } from '@angular/core/testing';
import { PickListComponent } from '@ciag/orchestra/pick-list';
import { OrcOption } from '@ciag/orchestra/internal';

describe('PickListComponent public input behavior', () => {
  const items: OrcOption<string>[] = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
    { value: 'disabled', label: 'Disabled', disabled: true },
  ];

  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [PickListComponent] }),
  );

  it('uses case-insensitive filter modes, multiple fields, and locale fallback', () => {
    const fixture = TestBed.createComponent(PickListComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('source', items);
    fixture.componentRef.setInput('filterBy', 'label, value');
    fixture.componentRef.setInput('filterMatchMode', 'startsWith');
    component.sourceFilter.set('AL');
    fixture.detectChanges();
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'alpha',
    ]);

    fixture.componentRef.setInput('filterMatchMode', 'equals');
    component.sourceFilter.set('beta');
    fixture.detectChanges();
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'beta',
    ]);

    fixture.componentRef.setInput('filterMatchMode', 'endsWith');
    component.sourceFilter.set('TA');
    fixture.detectChanges();
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'beta',
    ]);

    fixture.componentRef.setInput('filterLocale', 'not_a_locale');
    fixture.componentRef.setInput('filterMatchMode', 'contains');
    component.sourceFilter.set('ALP');
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'alpha',
    ]);

    const records = [
      { value: 'one', label: 'One', rank: 1, tags: ['first', 'small'] },
      { value: 'two', label: 'Two', rank: 2, tags: ['second', 'large'] },
    ];
    component.source.set(records);
    fixture.componentRef.setInput('filterBy', 'rank');
    fixture.componentRef.setInput('filterMatchMode', 'gte');
    component.sourceFilter.set('2');
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'two',
    ]);
    fixture.componentRef.setInput('filterBy', 'tags');
    fixture.componentRef.setInput('filterMatchMode', 'in');
    component.sourceFilter.set('large');
    expect(component.filteredSource().map((item) => item.value)).toEqual([
      'two',
    ]);
  });

  it('applies meta-key selection semantics and emits only changed selections', () => {
    const fixture = TestBed.createComponent(PickListComponent);
    const component = fixture.componentInstance;
    component.source.set(items);
    const changes: ReadonlySet<string>[] = [];
    component.selectionChange.subscribe((change) =>
      changes.push(change.source),
    );

    component.toggleSource(items[0], new MouseEvent('click'));
    component.toggleSource(items[1], new MouseEvent('click'));
    expect([...component.sourceSelected()]).toEqual(['beta']);

    component.toggleSource(
      items[0],
      new MouseEvent('click', { ctrlKey: true }),
    );
    expect([...component.sourceSelected()]).toEqual(['beta', 'alpha']);
    component.toggleSource(
      items[0],
      new MouseEvent('click', { metaKey: true }),
    );
    expect([...component.sourceSelected()]).toEqual(['beta']);
    const countAfterChanges = changes.length;
    component.toggleSource(items[1], new MouseEvent('click'));
    expect(changes).toHaveSize(countAfterChanges);

    fixture.componentRef.setInput('metaKeySelection', false);
    component.toggleSource(items[0], new MouseEvent('click'));
    expect([...component.sourceSelected()]).toEqual(['beta', 'alpha']);
  });

  it('applies compact responsive layout, striped rows, styles, and usable names', async () => {
    const fixture = TestBed.createComponent(PickListComponent);
    fixture.componentRef.setInput('source', items);
    fixture.componentRef.setInput('label', '  ');
    fixture.componentRef.setInput('sourceHeader', '  Available  ');
    fixture.componentRef.setInput('targetHeader', ' Chosen ');
    fixture.componentRef.setInput('filterBy', 'label');
    fixture.componentRef.setInput('sourceFilterPlaceholder', ' Find here ');
    fixture.componentRef.setInput('ariaSourceFilterLabel', '  ');
    fixture.componentRef.setInput('styleClass', ' consumer-picklist ');
    fixture.componentRef.setInput('style', { width: '80%' });
    fixture.componentRef.setInput('sourceStyle', { height: '12rem' });
    fixture.componentRef.setInput('targetStyle', { height: '14rem' });
    fixture.componentRef.setInput('stripedRows', true);
    fixture.componentRef.setInput('responsive', true);
    fixture.componentRef.setInput('breakpoint', '99999px');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('Pick list');
    expect(section.classList).toContain('consumer-picklist');
    expect(section.classList).toContain('orc-pick-list--striped');
    expect(section.classList).toContain('orc-pick-list--compact');
    expect(section.style.width).toBe('80%');
    expect(
      root.querySelector('.list-pane:first-child header')?.textContent,
    ).toBe('Available');
    expect(
      root.querySelector('.list-pane:last-child header')?.textContent,
    ).toBe('Chosen');
    const sourceFilter = root.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    expect(sourceFilter.placeholder).toBe('Find here');
    expect(sourceFilter.getAttribute('aria-label')).toBe('Filter source list');
    expect(
      (root.querySelector('.list-pane:first-child') as HTMLElement).style
        .height,
    ).toBe('12rem');
    expect(
      (root.querySelector('.list-pane:last-child') as HTMLElement).style.height,
    ).toBe('14rem');

    fixture.componentRef.setInput('breakpoint', '1px');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(section.classList).not.toContain('orc-pick-list--compact');
  });

  it('moves and reorders draggable items with the transfer event contract', async () => {
    const fixture = TestBed.createComponent(PickListComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('source', items.slice(0, 2));
    fixture.componentRef.setInput('target', [
      { value: 'gamma', label: 'Gamma' },
    ]);
    fixture.componentRef.setInput('dragdrop', true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const moveEvents: string[] = [];
    component.onMoveToTarget.subscribe(() => moveEvents.push('target'));
    component.onSourceReorder.subscribe(() => moveEvents.push('reorder'));
    const sourceAlpha = root.querySelector(
      '[data-orc-option-value="alpha"]',
    ) as HTMLElement;
    const targetGamma = root.querySelector(
      '[data-orc-option-value="gamma"]',
    ) as HTMLElement;
    expect(sourceAlpha.getAttribute('draggable')).toBe('true');

    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: jasmine.createSpy('setData'),
    } as unknown as DataTransfer;
    const dragStart = new Event('dragstart', {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    Object.defineProperty(dragStart, 'dataTransfer', { value: dataTransfer });
    sourceAlpha.dispatchEvent(dragStart);
    const dropOnTarget = new Event('drop', {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    targetGamma.dispatchEvent(dropOnTarget);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.source().map((item) => item.value)).toEqual(['beta']);
    expect(component.target().map((item) => item.value)).toEqual([
      'alpha',
      'gamma',
    ]);
    expect(moveEvents).toEqual(['target']);

    const gammaInTarget = root.querySelector(
      '.list-pane:last-child [data-orc-option-value="gamma"]',
    ) as HTMLElement;
    const alphaInTarget = root.querySelector(
      '.list-pane:last-child [data-orc-option-value="alpha"]',
    ) as HTMLElement;
    component.onTargetReorder.subscribe(() => moveEvents.push('reorder'));
    const reorderStart = new Event('dragstart', {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    Object.defineProperty(reorderStart, 'dataTransfer', {
      value: dataTransfer,
    });
    gammaInTarget.dispatchEvent(reorderStart);
    const reorderDrop = new Event('drop', {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    alphaInTarget.dispatchEvent(reorderDrop);
    fixture.detectChanges();
    expect(component.source().map((item) => item.value)).toEqual(['beta']);
    expect(component.target().map((item) => item.value)).toEqual([
      'gamma',
      'alpha',
    ]);
    expect(moveEvents).toEqual(['target', 'reorder']);
  });

  it('guards drag activation while disabled', () => {
    const fixture = TestBed.createComponent(PickListComponent);
    fixture.componentRef.setInput('source', items);
    fixture.componentRef.setInput('dragdrop', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const alpha = fixture.nativeElement.querySelector(
      '[data-orc-option-value="alpha"]',
    ) as HTMLElement;
    expect(alpha.hasAttribute('draggable')).toBeFalse();
    expect(alpha.getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps filters independent and suppresses blank empty-state content', () => {
    const fixture = TestBed.createComponent(PickListComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('source', items);
    fixture.componentRef.setInput('target', items.slice(0, 2));
    fixture.componentRef.setInput('filterBy', 'label');
    fixture.componentRef.setInput('sourceFilterPlaceholder', ' Available ');
    fixture.componentRef.setInput('targetFilterPlaceholder', ' Chosen ');
    fixture.componentRef.setInput('ariaTargetFilterLabel', ' Chosen filter ');
    fixture.componentRef.setInput('emptyText', '   ');
    component.sourceFilter.set('Alpha');
    component.targetFilter.set('Beta');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelectorAll('.list-pane:first-child [role="option"]'),
    ).toHaveSize(1);
    expect(
      root.querySelectorAll('.list-pane:last-child [role="option"]'),
    ).toHaveSize(1);
    expect(
      (root.querySelector('.list-pane:first-child input') as HTMLInputElement)
        .placeholder,
    ).toBe('Available');
    const targetFilter = root.querySelector(
      '.list-pane:last-child input',
    ) as HTMLInputElement;
    expect(targetFilter.placeholder).toBe('Chosen');
    expect(targetFilter.getAttribute('aria-label')).toBe('Chosen filter');

    component.sourceFilter.set('missing');
    fixture.detectChanges();
    expect(root.querySelector('.list-pane:first-child .empty')).toBeNull();
    fixture.componentRef.setInput('emptyText', 'No available options');
    fixture.detectChanges();
    expect(
      root.querySelector('.list-pane:first-child .empty')?.textContent,
    ).toBe('No available options');
  });
});
