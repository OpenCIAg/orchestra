import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TreeSelectComponent,
  TreeSelectNode,
} from '@ciag/orchestra/tree-select';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TreeSelectComponent],
  template: `<orc-tree-select
    [nodes]="nodes"
    selectionMode="multiple"
    [formControl]="control"
  />`,
})
class TreeSelectBlurHost {
  readonly control = new FormControl<string[]>([], { updateOn: 'blur' });
  readonly nodes: TreeSelectNode[] = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
  ];
}

describe('TreeSelect filtering and checkbox semantics', () => {
  // The panel renders detached from the host view; its items are located
  // in the document by the panel id the trigger points at.
  // Resolve the detached panel through the trigger's aria-controls, so
  // wrapper-host fixtures work the same as direct component fixtures.
  const panelOf = (fixture: ComponentFixture<unknown>) => {
    const controlsId = (fixture.nativeElement as HTMLElement)
      .querySelector('.trigger')
      ?.getAttribute('aria-controls');
    return document.getElementById(controlsId!) as HTMLElement;
  };

  it('filters collapsed descendants by configured nested fields and locale', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const nodes: TreeSelectNode[] = [
      {
        value: 'department',
        label: 'Department',
        data: { title: 'Operations' },
        children: [
          {
            value: 'employee',
            label: 'Employee',
            data: { title: 'İzmir Engineer' },
          },
        ],
      },
    ];
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('filterBy', 'data.title,label');
    fixture.componentRef.setInput('filterMode', 'strict');
    fixture.componentRef.setInput('filterLocale', 'tr');
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    component.filterValue.set('izmir');

    expect(
      component.filteredVisibleNodes().map(({ node }) => node.value),
    ).toEqual(['department', 'employee']);
    fixture.detectChanges();
    const rendered = Array.from(
      panelOf(fixture).querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(
      rendered.map((item) => item.querySelector('.item')?.textContent?.trim()),
    ).toEqual(['Department', 'Employee']);
    expect(rendered[0].getAttribute('aria-expanded')).toBe('true');
    component.activeTreeIndex.set(1);
    component.onFilterInput({
      target: { value: 'engineer' },
    } as unknown as Event);
    expect(component.activeTreeIndex()).toBe(0);
    expect(
      component.filteredVisibleNodes().map(({ node }) => node.value),
    ).toEqual(['department', 'employee']);
  });

  it('distinguishes lenient subtree matches from strict node matches', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [
        { value: 'alpha', label: 'Alpha' },
        { value: 'beta', label: 'Beta' },
      ],
    };
    fixture.componentRef.setInput('nodes', [root]);
    component.filterValue.set('root');

    expect(
      component.filteredVisibleNodes().map(({ node }) => node.value),
    ).toEqual(['root', 'alpha', 'beta']);
    fixture.componentRef.setInput('filterMode', 'strict');
    expect(
      component.filteredVisibleNodes().map(({ node }) => node.value),
    ).toEqual(['root']);
  });

  it('announces partial checkbox selection and propagates completed child selection', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const first = { value: 'first', label: 'First' };
    const second = { value: 'second', label: 'Second' };
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [first, second],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    component.open.set(true);
    fixture.detectChanges();

    component.select(first, new Event('click'));
    fixture.detectChanges();
    const rootOption = panelOf(fixture).querySelector(
      '[role="treeitem"]',
    ) as HTMLElement;
    expect(component.nodeCheckState(root)).toBe('mixed');
    expect(rootOption.getAttribute('aria-checked')).toBe('mixed');
    expect(rootOption.hasAttribute('aria-selected')).toBeFalse();
    expect(rootOption.classList.contains('partial')).toBeTrue();

    component.select(second, new Event('click'));
    fixture.detectChanges();
    expect(component.value()).toEqual(['first', 'second', 'root']);
    expect(rootOption.getAttribute('aria-checked')).toBe('true');
    expect(component.nodeCheckState(root)).toBeTrue();
  });

  it('does not propagate checkbox selection into disabled descendants', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const disabled = { value: 'disabled', label: 'Disabled', disabled: true };
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [disabled, { value: 'enabled', label: 'Enabled' }],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');

    component.select(root, new Event('click'));

    expect(component.value()).toEqual(['root', 'enabled']);
    expect(component.isNodeSelected(disabled)).toBeFalse();
  });

  it('keeps multiple-mode selection independent from checkbox propagation', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [{ value: 'child', label: 'Child' }],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    component.open.set(true);
    fixture.detectChanges();

    component.select(root, new Event('click'));
    expect(component.value()).toEqual(['root']);
    component.select(root.children![0], new Event('click'));
    fixture.detectChanges();
    expect(component.value()).toEqual(['root', 'child']);
    expect(
      panelOf(fixture)
        .querySelector('[role="treeitem"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true');

    fixture.destroy();
  });

  it('honors disabled downward and upward checkbox propagation', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    const first: TreeSelectNode = { value: 'first', label: 'First' };
    const second: TreeSelectNode = { value: 'second', label: 'Second' };
    const root: TreeSelectNode = {
      value: 'root',
      label: 'Root',
      children: [first, second],
    };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', false);
    fixture.componentRef.setInput('propagateSelectionUp', false);

    component.select(root, new Event('click'));
    expect(component.value()).toEqual(['root']);
    expect(component.isNodeSelected(first)).toBeFalse();
    component.select(root, new Event('click'));
    expect(component.value()).toEqual([]);
    component.select(first, new Event('click'));
    expect(component.value()).toEqual(['first']);
    component.select(second, new Event('click'));
    expect(component.value()).toEqual(['first', 'second']);

    fixture.destroy();
  });

  it('closes on an outside click and clears a hidden filter', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    component.open.set(true);
    component.filterValue.set('one');
    fixture.detectChanges();

    const hidden = jasmine.createSpy('hidden');
    component.onHide.subscribe(hidden);
    fixture.nativeElement.ownerDocument.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(component.open()).toBeFalse();
    expect(component.filterValue()).toBe('');
    expect(hidden).toHaveBeenCalledTimes(1);
  });

  it('ignores filter keyboard input and restores trigger focus on Escape', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    fixture.detectChanges();

    // The filter renders in the detached panel wrapper, next to the
    // element carrying the panel id.
    const filter = panelOf(fixture)!
      .closest('.orc-p2-tree-select-panel')!
      .querySelector('input') as HTMLInputElement;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    filter.focus();
    filter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    filter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(component.value()).toBeNull();
    expect(component.activeTreeIndex()).toBe(0);
    expect(component.open()).toBeTrue();

    filter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(component.open()).toBeFalse();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(trigger);
  });

  it('gives tree expansion controls contextual names and prevents no-op filter toggles', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        value: 'department',
        label: 'Department',
        children: [{ value: 'employee', label: 'Employee' }],
      },
    ]);
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    component.filterValue.set('employee');
    fixture.detectChanges();

    const toggle = panelOf(fixture).querySelector(
      '.expand',
    ) as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Collapse Department');
    expect(toggle.disabled).toBeTrue();
    expect(panelOf(fixture).querySelectorAll('[role="treeitem"]')).toHaveSize(
      2,
    );
  });

  it('renders a labelled clear control without requiring a custom ARIA label', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput('showClear', true);
    component.writeValue('one');
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      'button:not(.trigger)',
    ) as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Clear selection');
    clear.click();
    expect(component.value()).toBeNull();
  });

  it('gives the filter a useful default name and preserves a custom name', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('filter', true);
    component.open.set(true);
    fixture.detectChanges();

    // The filter renders in the detached panel wrapper.
    const filter = panelOf(fixture)!
      .closest('.orc-p2-tree-select-panel')!
      .querySelector('input') as HTMLInputElement;
    expect(filter.getAttribute('aria-label')).toBe('Filter options');

    fixture.componentRef.setInput('filterAriaLabel', 'Find a department');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-label')).toBe('Find a department');

    fixture.componentRef.setInput('filterAriaLabel', '   ');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-label')).toBe('Filter options');

    fixture.destroy();
  });

  it('falls back from whitespace-only accessible-name overrides', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [
      {
        value: 'root',
        label: 'Root',
        children: [{ value: 'child', label: 'Child' }],
      },
    ]);
    fixture.componentRef.setInput('label', '   ');
    fixture.componentRef.setInput('placeholder', 'Browse categories');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('clearAriaLabel', '   ');
    fixture.componentRef.setInput('expandAriaLabel', '   ');
    fixture.componentRef.setInput('showClear', true);
    component.writeValue('child');
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const clear = fixture.nativeElement.querySelector(
      'button:not(.trigger)',
    ) as HTMLButtonElement;
    const expand = panelOf(fixture).querySelector(
      '.expand',
    ) as HTMLButtonElement;
    const tree = panelOf(fixture) as HTMLElement;
    expect(fixture.nativeElement.querySelector('label')).toBeNull();
    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(trigger.textContent).toContain('Child');
    expect(tree.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(clear.getAttribute('aria-label')).toBe('Clear selection');
    expect(expand.getAttribute('aria-label')).toBe('Expand Root');

    fixture.destroy();
  });

  it('combines both panel classes and applies panel style and scroll height', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ value: 'one', label: 'One' }]);
    fixture.componentRef.setInput(
      'panelStyleClass',
      'primary-panel shared-panel',
    );
    fixture.componentRef.setInput('panelClass', 'legacy-panel shared-panel');
    fixture.componentRef.setInput('panelStyle', { outline: '1px solid red' });
    fixture.componentRef.setInput('scrollHeight', '240px');
    component.open.set(true);
    fixture.detectChanges();

    const panel = panelOf(fixture) as HTMLElement;
    expect(panel.classList.contains('primary-panel')).toBeTrue();
    expect(panel.classList.contains('legacy-panel')).toBeTrue();
    expect(panel.classList.contains('shared-panel')).toBeTrue();
    expect(panel.style.outline).toBe('red solid 1px');
    expect(panel.style.maxHeight).toBe('240px');

    fixture.destroy();
  });

  it('treats trigger and popup as one focus boundary for CVA touch and outputs', async () => {
    TestBed.configureTestingModule({ imports: [TreeSelectBlurHost] });
    const fixture = TestBed.createComponent(TreeSelectBlurHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as TreeSelectComponent;
    const focused = jasmine.createSpy('focused');
    const blurred = jasmine.createSpy('blurred');
    component.onFocus.subscribe(focused);
    component.onBlur.subscribe(blurred);

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    trigger.focus();
    expect(focused).toHaveBeenCalledTimes(1);
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const option = panelOf(fixture).querySelector('.item') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([]);
    expect(fixture.componentInstance.control.touched).toBeFalse();
    expect(focused).toHaveBeenCalledTimes(1);
    expect(blurred).not.toHaveBeenCalled();

    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(['one']);
    expect(fixture.componentInstance.control.touched).toBeTrue();
    expect(blurred).toHaveBeenCalledTimes(1);
    outside.remove();
    fixture.destroy();
  });
});
