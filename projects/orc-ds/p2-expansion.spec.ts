import { TestBed } from '@angular/core/testing';
import { CalendarComponent } from './p2/p2-form-components';
import { ComboboxComponent } from './p2/p2-form-components';
import { MultiSelectComponent } from './p2/p2-form-components';
import { TagsInputComponent } from './p2/p2-form-components';
import { DataTableComponent } from './p2/p2-data-components';
import { VirtualScrollerComponent } from './p2/p2-data-components';
import { SegmentedControlComponent, TreeSelectComponent } from './p2/p2-selection-components';

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
