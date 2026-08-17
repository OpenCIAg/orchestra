import { TestBed } from '@angular/core/testing';
import { CalendarComponent } from './p2/p2-form-components';
import { ComboboxComponent } from './p2/p2-form-components';
import { ListboxComponent, MultiSelectComponent } from './p2/p2-form-components';
import { TagsInputComponent } from './p2/p2-form-components';
import { DataTableComponent } from './p2/p2-data-components';
import { VirtualScrollerComponent } from './p2/p2-data-components';
import { SegmentedControlComponent, TreeSelectComponent } from './p2/p2-selection-components';
import { DataViewComponent } from './p2/p2-advanced-components';
import { ToggleButtonComponent } from './p2/p2-form-gap-components';
import { SelectComponent } from './select/select.component';
import { CheckboxComponent } from './checkbox/checkbox.component';

describe('P2 expansion components', () => {
  it('selects an allowed calendar day and advances months', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    component.selectDay(component.days().find(day => day.inCurrentMonth && !day.disabled)!);
    expect(component.value()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const currentMonth = component.currentMonth();
    component.nextMonth();
    expect(component.currentMonth()).not.toBe(currentMonth);
  });

  it('filters a combobox and emits the selected option', () => {
    const fixture = TestBed.createComponent(ComboboxComponent<string>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ value: 'sp', label: 'São Paulo' }, { value: 'rj', label: 'Rio de Janeiro' }]);
    component.query.set('são');
    expect(component.filteredOptions().map(option => option.value)).toEqual(['sp']);
    component.select(component.filteredOptions()[0]);
    expect(component.value()).toBe('sp');
  });

  it('supports multi-select and tag entry', () => {
    const multi = TestBed.createComponent(MultiSelectComponent<string>);
    multi.componentRef.setInput('options', [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }]);
    multi.componentInstance.select(multi.componentInstance.options()[0]);
    expect(multi.componentInstance.value()).toEqual(['one']);

    const tags = TestBed.createComponent(TagsInputComponent);
    tags.componentInstance.addTag('angular');
    tags.componentInstance.addTag('angular');
    expect(tags.componentInstance.value()).toEqual(['angular']);
  });

  it('maps, filters, and propagates CVA values for listbox and multiselect', () => {
    const listbox = TestBed.createComponent(ListboxComponent<any>);
    listbox.componentRef.setInput('options', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    listbox.componentRef.setInput('optionValue', 'id');
    listbox.componentRef.setInput('optionLabel', 'name');
    listbox.componentRef.setInput('filter', true);
    listbox.componentInstance.filterValue.set('beta');
    expect(listbox.componentInstance.filteredOptions()).toHaveSize(1);
    listbox.componentInstance.select(listbox.componentInstance.filteredOptions()[0]);
    expect(listbox.componentInstance.value()).toBe(2);

    const multi = TestBed.createComponent(MultiSelectComponent<any>);
    multi.componentRef.setInput('options', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    multi.componentRef.setInput('optionValue', 'id');
    multi.componentRef.setInput('optionLabel', 'name');
    multi.componentInstance.select(multi.componentInstance.options()[0]);
    expect(multi.componentInstance.value()).toEqual([1]);
  });

  it('paginates and sorts data view items', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ name: string }>);
    fixture.componentRef.setInput('value', [{ name: 'Beta' }, { name: 'Alpha' }]);
    fixture.componentRef.setInput('sortField', 'name');
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 1);
    expect(fixture.componentInstance.pageItems()[0].name).toBe('Alpha');
    fixture.componentInstance.goToPage(1);
    expect(fixture.componentInstance.pageItems()[0].name).toBe('Beta');
  });

  it('supports toggle button ControlValueAccessor updates', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    const component = fixture.componentInstance;
    let modelValue = false;
    component.registerOnChange(value => modelValue = value);
    component.toggle();
    expect(component.checked()).toBeTrue();
    expect(modelValue).toBeTrue();
    component.writeValue(false);
    expect(component.checked()).toBeFalse();
  });

  it('maps PrimeNG-style Select option fields and emits filter state', () => {
    const fixture = TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ code: 'br', title: 'Brazil' }, { code: 'pt', title: 'Portugal' }]);
    fixture.componentRef.setInput('optionValue', 'code');
    fixture.componentRef.setInput('optionLabel', 'title');
    expect(component.getOptionValue(component.options()![0])).toBe('br');
    expect(component.getOptionLabel(component.options()![1])).toBe('Portugal');
    component.onDataOptionClick(component.options()![0] as any);
    expect(component.value()).toBe('br');
  });

  it('supports Checkbox binary true/false values and lifecycle outputs', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('binary', true);
    fixture.componentRef.setInput('trueValue', 'yes');
    fixture.componentRef.setInput('falseValue', 'no');
    let modelValue: unknown;
    component.registerOnChange(value => modelValue = value);
    component.toggle();
    expect(modelValue).toBe('yes');
    component.writeValue('no');
    expect(component.checked()).toBeFalse();
  });

  it('sorts and selects rows in the data table', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ id: 1, name: 'Beta' }, { id: 2, name: 'Alpha' }]);
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Name', sortable: true }]);
    component.sortBy(component.columns()[0]);
    expect(component.rows()[0]['name']).toBe('Alpha');
    component.toggleRow(component.rows()[0], true);
    expect(component.selected()).toHaveSize(1);
  });

  it('calculates a virtualized range and expands a tree select', () => {
    const scroller = TestBed.createComponent(VirtualScrollerComponent);
    scroller.componentRef.setInput('items', Array.from({ length: 100 }, (_, index) => `Item ${index}`));
    scroller.componentInstance.onScroll({ target: { scrollTop: 400 } } as unknown as Event);
    expect(scroller.componentInstance.startIndex()).toBeGreaterThan(0);
    expect(scroller.componentInstance.visibleItems().length).toBeGreaterThan(0);

    const tree = TestBed.createComponent(TreeSelectComponent);
    const root = { value: 'root', label: 'Root', children: [{ value: 'child', label: 'Child' }] };
    tree.componentRef.setInput('nodes', [root]);
    tree.componentInstance.toggle(root);
    expect(tree.componentInstance.visibleNodes()).toHaveSize(2);
    tree.componentInstance.select(root.children[0]);
    expect(tree.componentInstance.value()).toBe('child');
  });

  it('updates a segmented control value', () => {
    const fixture = TestBed.createComponent(SegmentedControlComponent<string>);
    fixture.componentRef.setInput('options', [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]);
    fixture.componentInstance.select(fixture.componentInstance.options()[1]);
    expect(fixture.componentInstance.value()).toBe('list');
  });
});
