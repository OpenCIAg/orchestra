import { TestBed } from '@angular/core/testing';
import { ListboxComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the listbox. The specs import the component
 * through the public `@ciag/orchestra/p2` surface and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('Listbox behavior parity', () => {
  const OPTIONS: P2Option<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  function keyOn(fixture: ReturnType<typeof create>, key: string): void {
    const list = fixture.nativeElement.querySelector(
      'ul[role="listbox"]',
    ) as HTMLElement;
    list.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  it('renders options with selection and disabled state', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('a');
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    ) as HTMLElement[];
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-disabled')).toBe('true');
    expect(options[1].className).toContain('is-disabled');
  });

  it('roves the active option with wrap-around over enabled entries and selects with Enter', () => {
    const fixture = create();
    const selected: string[] = [];
    const changes: unknown[] = [];
    fixture.componentInstance.optionSelected.subscribe((option) =>
      selected.push(option.value),
    );
    fixture.componentInstance.onChange.subscribe((event) =>
      changes.push(event.value),
    );

    keyOn(fixture, 'ArrowDown');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    keyOn(fixture, 'ArrowDown');
    // Beta is disabled; the roving index jumps past it.
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    keyOn(fixture, 'ArrowDown');
    // Wrap-around returns to the first enabled option.
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    keyOn(fixture, 'ArrowUp');
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    keyOn(fixture, 'Enter');
    fixture.detectChanges();
    expect(selected).toEqual(['c']);
    expect(changes).toEqual(['c']);
    expect(fixture.componentInstance.value()).toBe('c');
  });

  it('supports multiple selection through clicks and reports double clicks', () => {
    const fixture = create();
    fixture.componentRef.setInput('multiple', true);
    const doubles: string[] = [];
    fixture.componentInstance.onDblClick.subscribe((event) =>
      doubles.push(event.option.value),
    );
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    ) as HTMLElement[];
    options[0].click();
    options[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['a', 'c']);

    options[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(doubles).toEqual(['a']);
  });

  it('filters with the requested match mode and emits the filter event', () => {
    const fixture = create();
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Alpha', tags: ['hydrogen', 'light'] },
      { value: 'b', label: 'Beta', tags: ['helium'] },
    ] as unknown as P2Option<string>[]);
    fixture.componentRef.setInput('filter', true);
    fixture.detectChanges();

    const filterInput = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const filters: string[] = [];
    fixture.componentInstance.onFilter.subscribe((event) =>
      filters.push(event.filter),
    );

    filterInput.value = 'alph';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(filters).toEqual(['alph']);
    expect(
      fixture.nativeElement.querySelectorAll('li[role="option"]').length,
    ).toBe(1);
    expect(fixture.componentInstance.filteredOptions()[0].value).toBe('a');

    fixture.componentRef.setInput('filterFields', ['label']);
    fixture.componentRef.setInput('filterMatchMode', 'notEquals');
    filterInput.value = 'Alpha';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredOptions()[0].value).toBe('b');
  });

  it('resolves option label/value fields, string and function disabled rules, and scalar options', () => {
    const fixture = TestBed.createComponent(ListboxComponent<any>);
    fixture.componentRef.setInput('options', [
      { code: 1, caption: 'One', locked: true },
      { code: 2, caption: 'Two', locked: false },
      { code: 3, caption: 'Three', locked: false },
    ]);
    fixture.componentRef.setInput('optionLabel', 'caption');
    fixture.componentRef.setInput('optionValue', 'code');
    fixture.componentRef.setInput('optionDisabled', 'locked');
    fixture.detectChanges();

    let options = Array.from(
      fixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'One',
      'Two',
      'Three',
    ]);
    expect(options[0].getAttribute('aria-disabled')).toBe('true');
    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();

    // The disabled rule also accepts a predicate function.
    fixture.componentRef.setInput('optionDisabled', (option: any) =>
      option.caption.startsWith('Two'),
    );
    fixture.detectChanges();
    options = Array.from(
      fixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(options[0].getAttribute('aria-disabled')).toBeNull();
    expect(options[1].getAttribute('aria-disabled')).toBe('true');

    options[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(3);

    // Scalar entries resolve to themselves as both label and value.
    const scalarFixture = TestBed.createComponent(ListboxComponent<string>);
    scalarFixture.componentRef.setInput('options', ['Solo', 'Duo']);
    scalarFixture.detectChanges();
    const scalarOptions = Array.from(
      scalarFixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(scalarOptions.map((option) => option.textContent?.trim())).toEqual([
      'Solo',
      'Duo',
    ]);
    scalarOptions[0].click();
    scalarFixture.detectChanges();
    expect(scalarFixture.componentInstance.value()).toBe('Solo');
  });

  it('matches object values by dataKey in single and multiple selection', () => {
    const fixture = TestBed.createComponent(ListboxComponent<any>);
    fixture.componentRef.setInput('options', [
      { value: { id: 7 }, label: 'Seven' },
    ]);
    fixture.componentRef.setInput('dataKey', 'id');
    fixture.componentInstance.writeValue({ id: 7 });
    fixture.detectChanges();
    expect(
      fixture.componentInstance.isSelected(
        fixture.componentInstance.options()[0],
      ),
    ).toBeTrue();
    expect(
      fixture.nativeElement
        .querySelector('li[role="option"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true');

    fixture.componentRef.setInput('multiple', true);
    fixture.componentInstance.writeValue([{ id: 7 }]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.isSelected(component.options()[0])).toBeTrue();
    // Selecting it again removes the matched entry despite the new object identity.
    component.select(component.options()[0]);
    expect(component.value()).toEqual([]);
  });

  it('registers through the forms API and keeps a null writeValue empty', () => {
    const fixture = create();
    const changes: unknown[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(changes).toEqual([]);

    const options = Array.from(
      fixture.nativeElement.querySelectorAll(
        'li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    ) as HTMLElement[];
    options[2].click();
    fixture.detectChanges();
    expect(changes).toEqual(['c']);
  });

  it('marks touched when the list loses focus', () => {
    const fixture = create();
    let touched = 0;
    fixture.componentInstance.registerOnTouched(() => {
      touched += 1;
    });
    const list = fixture.nativeElement.querySelector(
      'ul[role="listbox"]',
    ) as HTMLElement;
    list.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(touched).toBe(1);
  });
});
