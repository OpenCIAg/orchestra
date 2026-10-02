import { TestBed } from '@angular/core/testing';
import { TreeSelectComponent, TreeSelectNode } from './p2-selection-components';

describe('TreeSelect presentation and loading contract', () => {
  it('applies trigger identity, placeholder and root presentation inputs', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'sales', label: 'Sales' },
    ]);
    fixture.componentRef.setInput('label', 'Department');
    fixture.componentRef.setInput('placeholder', 'Choose a department');
    fixture.componentRef.setInput('inputId', 'department-picker');
    fixture.componentRef.setInput('tabindex', 4);
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('styleClass', 'department-tree');
    fixture.componentRef.setInput('style', { width: '24rem' });
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-tree-select',
    ) as HTMLElement;
    const label = fixture.nativeElement.querySelector(
      'label',
    ) as HTMLLabelElement;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    expect(root.classList.contains('department-tree')).toBeTrue();
    expect(root.classList.contains('p-treeselect-fluid')).toBeTrue();
    expect(root.style.width).toBe('24rem');
    expect(label.htmlFor).toBe('department-picker');
    expect(trigger.id).toBe('department-picker');
    expect(trigger.getAttribute('tabindex')).toBe('4');
    expect(trigger.textContent).toContain('Choose a department');

    component.writeValue('sales');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Sales');
    expect(trigger.textContent).not.toContain('Choose a department');

    fixture.destroy();
  });

  it('keeps a readonly trigger closed and blocks value changes', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const first: TreeSelectNode = { value: 'first', label: 'First' };
    const second: TreeSelectNode = { value: 'second', label: 'Second' };
    fixture.componentRef.setInput('nodes', [first, second]);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('showClear', true);
    component.writeValue('first');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-readonly')).toBe('true');
    expect(trigger.disabled).toBeFalse();
    trigger.click();
    component.select(second, new Event('click'));
    fixture.detectChanges();

    expect(component.open()).toBeFalse();
    expect(component.value()).toBe('first');
    expect(
      fixture.nativeElement.querySelector('button:not(.trigger)'),
    ).toBeNull();

    fixture.destroy();
  });

  it('disables an already-open tree and its controls for public and CVA disabled state', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const child: TreeSelectNode = { value: 'child', label: 'Child' };
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [child],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    const filterChanges = jasmine.createSpy('filterChanges');
    component.onFilter.subscribe(filterChanges);

    const expectTreeDisabled = (): void => {
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector(
        '.trigger',
      ) as HTMLButtonElement;
      const tree = fixture.nativeElement.querySelector(
        '[role="tree"]',
      ) as HTMLElement;
      const row = fixture.nativeElement.querySelector(
        '[role="treeitem"]',
      ) as HTMLElement;
      const filter = fixture.nativeElement.querySelector(
        'input',
      ) as HTMLInputElement;
      const controls = Array.from(
        row.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      expect(trigger.disabled).toBeTrue();
      expect(tree.getAttribute('aria-disabled')).toBe('true');
      expect(row.getAttribute('aria-disabled')).toBe('true');
      expect(filter.disabled).toBeTrue();
      expect(controls.length).toBe(2);
      expect(controls.every((control) => control.disabled)).toBeTrue();

      component.toggle(root);
      component.select(child, new Event('click'));
      expect(component.expanded().has('root')).toBeFalse();
      expect(component.value()).toBeNull();
      const filterEvent = new Event('input');
      filter.value = 'child';
      component.onFilterInput(filterEvent);
      expect(component.filterValue()).toBe('');
      expect(filterChanges).not.toHaveBeenCalled();
    };

    fixture.componentRef.setInput('disabled', true);
    expectTreeDisabled();
    fixture.componentRef.setInput('disabled', false);
    component.setDisabledState(true);
    expectTreeDisabled();

    fixture.destroy();
  });

  it('honors the filter placeholder and custom clear and expansion labels', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        value: 'team',
        label: 'Team',
        children: [{ value: 'member', label: 'Member' }],
      },
    ]);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('filterPlaceholder', 'Find a team');
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('clearAriaLabel', 'Remove selection');
    fixture.componentRef.setInput('expandAriaLabel', 'Show children');
    fixture.componentRef.setInput('collapseAriaLabel', 'Hide children');
    component.writeValue('member');
    component.open.set(true);
    fixture.detectChanges();

    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const clear = fixture.nativeElement.querySelector(
      'button:not(.trigger)',
    ) as HTMLButtonElement;
    const expand = fixture.nativeElement.querySelector(
      '.expand',
    ) as HTMLButtonElement;
    expect(filter.placeholder).toBe('Find a team');
    expect(clear.getAttribute('aria-label')).toBe('Remove selection');
    expect(expand.getAttribute('aria-label')).toBe('Show children Team');

    expand.click();
    fixture.detectChanges();
    expect(expand.getAttribute('aria-label')).toBe('Hide children Team');

    fixture.destroy();
  });

  it('preserves the filter across hide and reopen when resetFilterOnHide is false', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'europe', label: 'Europe' },
    ]);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('resetFilterOnHide', false);
    component.open.set(true);
    component.filterValue.set('euro');
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.open()).toBeFalse();
    expect(component.filterValue()).toBe('euro');
    component.toggleOpen();
    fixture.detectChanges();

    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(filter.value).toBe('euro');
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(1);

    fixture.destroy();
  });

  it('announces loading, suppresses nodes and blocks selection until loading ends', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const initial: TreeSelectNode = { value: 'initial', label: 'Initial' };
    const target: TreeSelectNode = { value: 'target', label: 'Target' };
    fixture.componentRef.setInput('nodes', [initial, target]);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('loading', true);
    component.writeValue('initial');
    component.open.set(true);

    const modelChange = jasmine.createSpy('modelChange');
    const touched = jasmine.createSpy('touched');
    const selection = jasmine.createSpy('selection');
    const change = jasmine.createSpy('change');
    component.registerOnChange(modelChange);
    component.registerOnTouched(touched);
    component.nodeSelect.subscribe(selection);
    component.onChange.subscribe(change);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-tree-select',
    ) as HTMLElement;
    const status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(status.textContent.trim()).toBe('Loading options');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(0);

    const event = new Event('click');
    component.select(target, event);
    expect(component.value()).toBe('initial');
    expect(modelChange).not.toHaveBeenCalled();
    expect(touched).not.toHaveBeenCalled();
    expect(selection).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'target';
    const filterEvent = new Event('input', { bubbles: true });
    const filtered = jasmine.createSpy('filtered');
    component.onFilter.subscribe(filtered);
    input.dispatchEvent(filterEvent);
    fixture.detectChanges();
    expect(component.filterValue()).toBe('target');
    expect(filtered).toHaveBeenCalledOnceWith({
      originalEvent: filterEvent,
      filter: 'target',
    });
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(0);

    fixture.destroy();
  });

  it('shows a custom empty message after filtering and restores matching options', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('emptyMessage', 'No matching entries');
    component.open.set(true);
    component.filterValue.set('missing');
    fixture.detectChanges();

    let status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;
    expect(status.textContent.trim()).toBe('No matching entries');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(0);

    fixture.componentRef.setInput('emptyMessage', undefined);
    fixture.detectChanges();
    status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;
    expect(status.textContent.trim()).toBe('No results found');

    component.filterValue.set('one');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(1);

    fixture.destroy();
  });

  it('applies variant and size classes to the trigger presentation', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-tree-select',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    expect(root.classList.contains('orc-p2-tree-select--filled')).toBeTrue();
    expect(root.classList.contains('orc-p2-tree-select--small')).toBeTrue();
    expect(getComputedStyle(trigger).minHeight).toBe('32px');

    fixture.componentRef.setInput('variant', 'outlined');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(root.classList.contains('orc-p2-tree-select--filled')).toBeFalse();
    expect(root.classList.contains('orc-p2-tree-select--outlined')).toBeTrue();
    expect(root.classList.contains('orc-p2-tree-select--large')).toBeTrue();
    expect(getComputedStyle(trigger).minHeight).toBe('48px');

    fixture.destroy();
  });

  it('keeps tree focus aligned with the active descendant through ArrowDown and Enter', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
    ]);
    component.open.set(true);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const items = Array.from(tree.querySelectorAll<HTMLButtonElement>('.item'));
    expect(items.map((item) => item.tabIndex)).toEqual([-1, -1]);

    // If an item receives pointer or programmatic focus, normalize focus back to
    // the tree's active-descendant owner before handling keyboard navigation.
    items[0].focus();
    expect(document.activeElement).toBe(tree);

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(1),
    );
    expect(
      fixture.nativeElement
        .querySelector(`#${component.treeOptionId(1)}`)
        ?.classList.contains('active'),
    ).toBeTrue();
    expect(document.activeElement).toBe(tree);

    const activationTarget = document.activeElement as HTMLElement;
    activationTarget.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    // Synthetic key events do not trigger native button activation. Preserve
    // the old stale-button path in this regression if focus escaped the tree.
    if (activationTarget.matches('button.item')) activationTarget.click();
    fixture.detectChanges();
    expect(component.value()).toBe('second');
    expect(component.open()).toBeFalse();
    expect(document.activeElement).toBe(trigger);

    fixture.destroy();
  });

  it('moves focus into the rendered tree after opening from the trigger', async () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
    ]);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    expect(component.open()).toBeTrue();

    await fixture.whenStable();
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(tree).not.toBeNull();
    expect(document.activeElement).toBe(tree);

    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(1),
    );
    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.value()).toBe('second');
    expect(component.open()).toBeFalse();
    expect(document.activeElement).toBe(trigger);

    fixture.destroy();
  });

  it('does not move focus when the open model is changed directly', async () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'first', label: 'First' },
    ]);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    trigger.focus();
    component.open.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(tree).not.toBeNull();
    expect(document.activeElement).toBe(trigger);

    fixture.destroy();
  });

  it('names the tree from the visible trigger label', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('label', 'Category');
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const label = fixture.nativeElement.querySelector(
      'label',
    ) as HTMLLabelElement;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(label.htmlFor).toBe(trigger.id);
    expect(tree.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(tree.getAttribute('aria-label')).toBeNull();

    fixture.destroy();
  });

  it('names the tree from the trigger ariaLabel', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('ariaLabel', 'Browse categories');
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-label')).toBe('Browse categories');
    expect(tree.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(tree.getAttribute('aria-label')).toBeNull();

    fixture.destroy();
  });

  it('names the tree from the trigger ariaLabelledBy reference', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const document = fixture.nativeElement.ownerDocument as Document;
    const externalLabel = document.createElement('span');
    externalLabel.id = 'tree-select-accessible-label';
    externalLabel.textContent = 'Product categories';
    document.body.append(externalLabel);
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('ariaLabelledBy', externalLabel.id);
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-labelledby')).toBe(externalLabel.id);
    expect(tree.getAttribute('aria-labelledby')).toBe(externalLabel.id);
    expect(tree.getAttribute('aria-label')).toBeNull();

    fixture.destroy();
    externalLabel.remove();
  });

  it('gives an otherwise unnamed tree a useful default name', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(trigger.getAttribute('aria-labelledby')).toBeNull();
    expect(tree.getAttribute('aria-labelledby')).toBeNull();
    expect(tree.getAttribute('aria-label')).toBe('Options');

    fixture.destroy();
  });

  it('keeps checkbox keyboard and pointer selection on the tree active row', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
    ]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    component.open.set(true);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const focused = jasmine.createSpy('focused');
    const blurred = jasmine.createSpy('blurred');
    component.onFocus.subscribe(focused);
    component.onBlur.subscribe(blurred);
    tree.focus();
    tree.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(1),
    );
    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.value()).toEqual(['second']);
    expect(component.open()).toBeTrue();
    expect(document.activeElement).toBe(tree);

    const firstItem = tree.querySelector('.item') as HTMLButtonElement;
    firstItem.focus();
    expect(document.activeElement).toBe(tree);
    firstItem.click();
    fixture.detectChanges();
    expect(component.value()).toEqual(['second', 'first']);
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(0),
    );
    expect(document.activeElement).toBe(tree);
    expect(focused).toHaveBeenCalledTimes(1);
    expect(blurred).not.toHaveBeenCalled();

    fixture.destroy();
  });

  it('supports keyboard expansion and collapse while focus stays on the tree', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [{ value: 'child', label: 'Child' }],
    };
    fixture.componentRef.setInput('nodes', [root]);
    component.open.set(true);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    tree.focus();
    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.expanded().has('root')).toBeTrue();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(0),
    );

    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(1),
    );
    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tree.getAttribute('aria-activedescendant')).toBe(
      component.treeOptionId(0),
    );
    tree.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.expanded().has('root')).toBeFalse();
    expect(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ).toHaveSize(1);
    expect(document.activeElement).toBe(tree);

    fixture.destroy();
  });

  it('disables Clear for public and CVA disabled state and emits once when enabled', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('showClear', true);
    component.writeValue('one');
    const modelChange = jasmine.createSpy('modelChange');
    const touched = jasmine.createSpy('touched');
    const changed = jasmine.createSpy('changed');
    const cleared = jasmine.createSpy('cleared');
    component.registerOnChange(modelChange);
    component.registerOnTouched(touched);
    component.onChange.subscribe(changed);
    component.onClear.subscribe(cleared);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear selection"]',
    ) as HTMLButtonElement;
    expect(clear.disabled).toBeTrue();
    clear.click();
    expect(component.value()).toBe('one');

    fixture.componentRef.setInput('disabled', false);
    component.setDisabledState(true);
    fixture.detectChanges();
    clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear selection"]',
    ) as HTMLButtonElement;
    expect(clear.disabled).toBeTrue();
    clear.click();
    expect(component.value()).toBe('one');
    expect(modelChange).not.toHaveBeenCalled();
    expect(touched).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
    expect(cleared).not.toHaveBeenCalled();

    component.setDisabledState(false);
    fixture.detectChanges();
    clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear selection"]',
    ) as HTMLButtonElement;
    expect(clear.disabled).toBeFalse();
    clear.click();
    expect(component.value()).toBeNull();
    expect(modelChange).toHaveBeenCalledOnceWith(null);
    expect(touched).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(
      jasmine.objectContaining({ value: null }),
    );
    expect(cleared).toHaveBeenCalledTimes(1);

    fixture.destroy();
  });

  it('marks disabled treeitems and keeps active navigation on enabled nodes through filtering', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const disabledInitial: TreeSelectNode = {
      value: 'disabled-initial',
      label: 'Initial disabled',
      disabled: true,
    };
    const initialEnabled: TreeSelectNode = {
      value: 'initial-enabled',
      label: 'Initial enabled',
    };
    const outsideFilter: TreeSelectNode = {
      value: 'outside-filter',
      label: 'Other',
    };
    const disabledA: TreeSelectNode = {
      value: 'disabled-a',
      label: 'Target disabled A',
      disabled: true,
    };
    const enabledA: TreeSelectNode = {
      value: 'enabled-a',
      label: 'Target One',
    };
    const disabledB: TreeSelectNode = {
      value: 'disabled-b',
      label: 'Target disabled B',
      disabled: true,
    };
    const enabledB: TreeSelectNode = {
      value: 'enabled-b',
      label: 'Target Two',
    };
    fixture.componentRef.setInput('nodes', [
      disabledInitial,
      initialEnabled,
      outsideFilter,
      disabledA,
      enabledA,
      disabledB,
      enabledB,
    ]);
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    fixture.detectChanges();

    const activeTreeItem = (): HTMLElement | null => {
      const tree = fixture.nativeElement.querySelector(
        '[role="tree"]',
      ) as HTMLElement;
      const activeId = tree.getAttribute('aria-activedescendant');
      return activeId
        ? fixture.nativeElement.querySelector(`#${activeId}`)
        : null;
    };
    const keydown = (key: string): void => {
      const tree = fixture.nativeElement.querySelector(
        '[role="tree"]',
      ) as HTMLElement;
      tree.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };
    const disabledItems = (): HTMLElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          '[role="treeitem"][aria-disabled="true"]',
        ),
      ) as HTMLElement[];

    expect(disabledItems()).toHaveSize(3);
    expect(disabledItems()[0].id).toBe(component.treeOptionId(0));
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(1));
    expect(activeTreeItem()?.classList.contains('disabled')).toBeFalse();
    expect(activeTreeItem()?.classList.contains('active')).toBeTrue();

    keydown('ArrowDown');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(2));
    keydown('ArrowDown');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(4));
    keydown('ArrowDown');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(6));
    keydown('ArrowDown');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(1));
    keydown('ArrowUp');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(6));
    keydown('Home');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(1));
    keydown('End');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(6));

    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    filter.value = 'target';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(
      component.filteredVisibleNodes().map(({ node }) => node.value),
    ).toEqual(['disabled-a', 'enabled-a', 'disabled-b', 'enabled-b']);
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(1));
    keydown('End');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(3));
    keydown('Home');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(1));
    keydown('ArrowDown');
    expect(activeTreeItem()?.id).toBe(component.treeOptionId(3));

    const modelChange = jasmine.createSpy('modelChange');
    const selection = jasmine.createSpy('selection');
    const change = jasmine.createSpy('change');
    component.registerOnChange(modelChange);
    component.nodeSelect.subscribe(selection);
    component.onChange.subscribe(change);
    filter.value = 'target disabled';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const allDisabledTree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(allDisabledTree.getAttribute('aria-activedescendant')).toBeNull();
    allDisabledTree.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();
    expect(component.value()).toBeNull();
    expect(modelChange).not.toHaveBeenCalled();
    expect(selection).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();

    fixture.destroy();
  });
});
