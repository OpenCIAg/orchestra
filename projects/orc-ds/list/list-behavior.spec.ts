import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { focusElement } from '../../../tools/quality/test-focus-events';
import { ListComponent, ListItem } from './list.component';

const items: ListItem[] = [
  { id: 'alpha', label: 'Alpha', description: 'First option' },
  { id: 'disabled', label: 'Disabled', disabled: true },
  { id: 'beta', label: 'Beta' },
];

describe('List interaction and accessibility contract', () => {
  function create(
    selection: 'none' | 'single' | 'multiple' = 'none',
    value = items,
  ) {
    const fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('items', value);
    fixture.componentRef.setInput('selection', selection);
    fixture.componentRef.setInput('label', 'Results');
    fixture.componentRef.setInput('styleClass', 'custom-list');
    fixture.detectChanges();
    return fixture;
  }

  function host(fixture: ReturnType<typeof create>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renders an action list without listbox or option roles', () => {
    const fixture = create();
    const list = host(fixture).querySelector<HTMLElement>('.orc-list')!;
    const buttons = Array.from(
      host(fixture).querySelectorAll('.orc-list__item'),
    ) as HTMLButtonElement[];
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.itemSelect.subscribe(selected);

    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-multiselectable')).toBeNull();
    expect(
      list.querySelectorAll('[role="listbox"], [role="option"]').length,
    ).toBe(0);
    expect(list.querySelectorAll('[role="listitem"]').length).toBe(3);
    expect(buttons[0].getAttribute('role')).toBeNull();
    buttons[0].click();

    expect(selected).toHaveBeenCalledOnceWith(items[0]);
    expect(fixture.componentInstance.selectedIds()).toEqual([]);
    fixture.destroy();
  });

  it('renders single selection as a labelled listbox and emits the selected item', () => {
    const fixture = create('single');
    const list = host(fixture).querySelector<HTMLElement>('.orc-list')!;
    const options = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.itemSelect.subscribe(selected);

    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-label')).toBe('Results');
    expect(list.getAttribute('aria-multiselectable')).toBeNull();
    expect(
      options.map((option) => option.getAttribute('aria-selected')),
    ).toEqual(['false', 'false', 'false']);
    options[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIds()).toEqual(['beta']);
    expect(options[2].getAttribute('aria-selected')).toBe('true');
    expect(selected).toHaveBeenCalledOnceWith(items[2]);

    fixture.componentRef.setInput('label', undefined);
    fixture.detectChanges();
    expect(list.getAttribute('aria-label')).toBe('Options');
    fixture.destroy();
  });

  it('supports multiple selection and clears an initially selected item when toggled', () => {
    const initiallySelected: ListItem[] = [
      { id: 'alpha', label: 'Alpha', selected: true },
      { id: 'beta', label: 'Beta' },
    ];
    const fixture = create('multiple', initiallySelected);
    const list = host(fixture).querySelector<HTMLElement>('.orc-list')!;
    const options = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );

    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    options[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIds()).toEqual([]);
    expect(options[0].getAttribute('aria-selected')).toBe('false');
    options[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['beta']);
    fixture.destroy();
  });

  it('keeps disabled items unavailable and gives the first enabled item the tab stop', () => {
    const fixture = create('single', [
      { id: 'disabled', label: 'Disabled', disabled: true },
      { id: 'enabled', label: 'Enabled' },
    ]);
    const buttons = Array.from(
      host(fixture).querySelectorAll('.orc-list__item'),
    ) as HTMLButtonElement[];
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.itemSelect.subscribe(selected);

    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, 0]);
    buttons[0].click();
    expect(selected).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('moves keyboard focus across enabled actions and wraps at the ends', fakeAsync(() => {
    const fixture = create('none');
    const buttons = Array.from(
      host(fixture).querySelectorAll('.orc-list__item'),
    ) as HTMLButtonElement[];

    focusElement(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    flushMicrotasks();
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    flushMicrotasks();
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    flushMicrotasks();
    expect(document.activeElement).toBe(buttons[0]);
    fixture.destroy();
  }));

  it('applies the public style class to the component host', () => {
    const fixture = create();
    expect(host(fixture).classList).toContain('p-listbox');
    expect(host(fixture).classList).toContain('p-component');
    expect(host(fixture).classList).toContain('custom-list');
    fixture.destroy();
  });
});
