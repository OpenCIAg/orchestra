import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListboxComponent } from '@ciag/orchestra/listbox';

describe('ListboxComponent disabled option accessibility', () => {
  let fixture: ComponentFixture<ListboxComponent<string>>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', [
      { value: 'unavailable', label: 'Unavailable', disabled: true },
      { value: 'available', label: 'Available' },
    ]);
    fixture.detectChanges();
  });

  it('exposes disabled options with aria-disabled', () => {
    const options = fixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLLIElement>;

    expect(options).toHaveSize(2);
    expect(options[0].getAttribute('aria-disabled')).toBe('true');
    expect(options[1].hasAttribute('aria-disabled')).toBeFalse();
  });

  it('names the listbox and assigns unique ids when callers omit an id', () => {
    const first = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    expect(first.getAttribute('aria-label')).toBe('Listbox');
    expect(first.id).toMatch(/^orc-listbox-\d+$/);
    expect((first.querySelector('[role="option"]') as HTMLLIElement).id).toBe(
      `${first.id}-option-0`,
    );

    const sibling = TestBed.createComponent(ListboxComponent<string>);
    sibling.componentRef.setInput('options', [
      { value: 'north', label: 'North' },
    ]);
    sibling.componentRef.setInput('label', 'Cities');
    sibling.detectChanges();
    const second = sibling.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    expect(second.hasAttribute('aria-label')).toBeFalse();
    expect(second.getAttribute('aria-labelledby')).toBe(`${second.id}-label`);
    expect(second.id).not.toBe(first.id);
    sibling.destroy();
  });

  it('trims explicit names and gives aria-labelledby precedence over aria-label', () => {
    fixture.componentRef.setInput('ariaLabel', '  Select a city  ');
    fixture.detectChanges();
    const listbox = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    expect(listbox.getAttribute('aria-label')).toBe('Select a city');

    fixture.componentRef.setInput('ariaLabelledBy', '  city-list-label  ');
    fixture.detectChanges();
    expect(listbox.hasAttribute('aria-label')).toBeFalse();
    expect(listbox.getAttribute('aria-labelledby')).toBe('city-list-label');
  });

  it('gives the filter a default name and honors a trimmed override', () => {
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('filterPlaceholder', 'Find a city');
    fixture.componentRef.setInput('ariaFilterLabel', '   ');
    fixture.detectChanges();
    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(filter.getAttribute('aria-label')).toBe('Filter options');

    fixture.componentRef.setInput('ariaFilterLabel', '  Filter cities  ');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-label')).toBe('Filter cities');
  });

  it('keeps aria-activedescendant valid after filtering and ignores disabled hover', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('focusOnHover', true);
    fixture.componentRef.setInput('id', 'cities');
    fixture.detectChanges();
    const listbox = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    const disabledOption = fixture.nativeElement.querySelector(
      '[role="option"][aria-disabled="true"]',
    ) as HTMLLIElement;

    disabledOption.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.activeIndex()).toBe(-1);

    component.activeIndex.set(1);
    fixture.detectChanges();
    expect(listbox.getAttribute('aria-activedescendant')).toBe(
      'cities-option-1',
    );

    component.filterValue.set('Unavailable');
    fixture.detectChanges();
    expect(listbox.hasAttribute('aria-activedescendant')).toBeFalse();
  });

  it('supports option label/value fields, data-key identity, multiple toggling and CVA callbacks', () => {
    const objectFixture = TestBed.createComponent(ListboxComponent<any>);
    const component = objectFixture.componentInstance;
    objectFixture.componentRef.setInput('options', [
      { id: 1, name: 'North' },
      { id: 2, name: 'South' },
    ]);
    objectFixture.componentRef.setInput('optionLabel', 'name');
    objectFixture.componentRef.setInput('optionValue', 'id');
    objectFixture.componentRef.setInput('dataKey', 'id');
    objectFixture.componentRef.setInput('multiple', true);
    const changed: unknown[] = [];
    component.registerOnChange((value) => changed.push(value));
    component.writeValue([1]);
    objectFixture.detectChanges();

    const rows = objectFixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLLIElement>;
    expect(rows[0].textContent).toContain('North');
    expect(rows[0].getAttribute('aria-selected')).toBe('true');
    component.select({ id: 2, name: 'South' });
    expect(component.value()).toEqual([1, 2]);
    expect(changed).toEqual([[1, 2]]);
    component.select({ id: 1, name: 'Copied North' });
    expect(component.value()).toEqual([2]);
    objectFixture.destroy();
  });

  it('honors readonly, component disabled, CVA disabled, and property or predicate disabled options', () => {
    const component = fixture.componentInstance;
    const option = { value: 'available', label: 'Available' };
    component.select(option);
    expect(component.value()).toBe('available');

    fixture.componentRef.setInput('readonly', true);
    component.select({ value: 'readonly', label: 'Readonly' });
    expect(component.value()).toBe('available');
    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('disabled', true);
    component.select({ value: 'disabled', label: 'Disabled' });
    expect(component.value()).toBe('available');
    fixture.componentRef.setInput('disabled', false);
    component.setDisabledState(true);
    component.select({ value: 'cva', label: 'CVA' });
    expect(component.value()).toBe('available');
    component.setDisabledState(false);

    fixture.componentRef.setInput('options', [
      { id: 1, name: 'Closed', unavailable: true },
      { id: 2, name: 'Open', unavailable: false },
    ]);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('optionDisabled', 'unavailable');
    fixture.detectChanges();
    let rows = fixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLLIElement>;
    expect(rows[0].getAttribute('aria-disabled')).toBe('true');
    expect(rows[1].hasAttribute('aria-disabled')).toBeFalse();

    fixture.componentRef.setInput(
      'optionDisabled',
      (row: { id: number }) => row.id === 2,
    );
    fixture.detectChanges();
    rows = fixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLLIElement>;
    expect(rows[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('filters by fields, supports declared match modes, locale, and filter models', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', aliases: ['A', 'First'], rank: 1, code: 'x' },
      { label: 'Beta', aliases: ['B', 'Second'], rank: 2, code: 'y' },
      { label: 'Gamma', aliases: ['G'], rank: 3, code: 'x' },
      { label: 'Istanbul', aliases: ['City'], rank: 4, code: 'z' },
    ]);
    fixture.componentRef.setInput('filterFields', ['label', 'code']);
    component.filterValue.set('x');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Alpha',
      'Gamma',
    ]);

    fixture.componentRef.setInput('filterBy', 'label');
    fixture.componentRef.setInput('filterFields', undefined);
    fixture.componentRef.setInput('filterMatchMode', 'startsWith');
    component.filterValue.set('be');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Beta',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'endsWith');
    component.filterValue.set('ta');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Beta',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'equals');
    component.filterValue.set('BETA');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Beta',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'notEquals');
    fixture.componentRef.setInput('filterFields', ['label', 'code']);
    component.filterValue.set('alpha');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Beta',
      'Gamma',
      'Istanbul',
    ]);

    fixture.componentRef.setInput('filterFields', ['aliases']);
    fixture.componentRef.setInput('filterMatchMode', 'in');
    component.filterValue.set('first');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Alpha',
    ]);
    fixture.componentRef.setInput('filterFields', ['rank']);
    fixture.componentRef.setInput('filterMatchMode', 'lt');
    component.filterValue.set('3');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Alpha',
      'Beta',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'lte');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'gt');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Istanbul',
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'gte');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Gamma',
      'Istanbul',
    ]);

    fixture.componentRef.setInput('filterLocale', 'tr');
    fixture.componentRef.setInput('filterFields', ['label']);
    fixture.componentRef.setInput('filterMatchMode', 'contains');
    component.filterValue.set('ı');
    expect(component.filteredOptions().map((row) => row.label)).toEqual([
      'Istanbul',
    ]);
  });

  it('updates the filter model and emits filter events from the rendered input', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('filterPlaceholder', 'Search cities');
    fixture.componentRef.setInput('emptyFilterMessage', 'No matching city');
    fixture.componentRef.setInput('options', [
      { value: 'rome', label: 'Rome' },
    ]);
    const events: string[] = [];
    component.onFilter.subscribe(({ filter }) => events.push(filter));
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.placeholder).toBe('Search cities');
    input.value = 'missing';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.filterValue()).toBe('missing');
    expect(events).toEqual(['missing']);
    expect(fixture.nativeElement.textContent).toContain('No matching city');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.componentRef.setInput('emptyText', 'No cities');
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No cities');
  });

  it('applies documented list and wrapper layout inputs', () => {
    fixture.componentRef.setInput('styleClass', 'custom-shell');
    fixture.componentRef.setInput('listStyleClass', 'custom-list');
    fixture.componentRef.setInput('style', { width: '240px' });
    fixture.componentRef.setInput('listStyle', { padding: '12px' });
    fixture.componentRef.setInput('scrollHeight', '9rem');
    fixture.componentRef.setInput('tabindex', -1);
    fixture.componentRef.setInput('options', [{ value: 'one', label: 'One' }]);
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector(
      '.orc-p2-listbox-wrap',
    ) as HTMLDivElement;
    const list = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    expect(shell.classList.contains('custom-shell')).toBeTrue();
    expect(shell.style.width).toBe('240px');
    expect(list.classList.contains('custom-list')).toBeTrue();
    expect(list.style.padding).toBe('12px');
    expect(list.style.maxHeight).toBe('9rem');
    expect(list.getAttribute('tabindex')).toBe('-1');
  });

  it('supports label descriptions, select-on-keyboard and optional hover focus', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Choose a region');
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'A', description: 'First region' },
      { value: 'b', label: 'B' },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Choose a region');
    expect(fixture.nativeElement.textContent).toContain('First region');
    const label = fixture.nativeElement.querySelector(
      'label',
    ) as HTMLLabelElement;
    const listbox = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;
    expect(label.id).toBe(`${listbox.id}-label`);
    expect(listbox.getAttribute('aria-labelledby')).toBe(label.id);
    expect(listbox.hasAttribute('aria-label')).toBeFalse();
    const row = fixture.nativeElement.querySelector(
      '[role="option"]',
    ) as HTMLLIElement;
    row.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.activeIndex()).toBe(-1);
    fixture.componentRef.setInput('focusOnHover', true);
    fixture.detectChanges();
    row.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.activeIndex()).toBe(0);
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      cancelable: true,
    });
    component.onKeydown(enter);
    expect(enter.defaultPrevented).toBeTrue();
    expect(component.value()).toBe('a');
  });
});
