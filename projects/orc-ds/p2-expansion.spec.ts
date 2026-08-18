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
import { SwitchComponent } from './switch/switch.component';
import { SliderComponent } from './slider/slider.component';
import { RatingComponent } from './rating/rating.component';
import { KnobComponent } from './p2/p2-org-knob-components';
import { ProgressBarComponent } from './progress/progress-bar.component';
import { ProgressCircleComponent } from './progress/progress-circle.component';
import { TreeComponent, TreeTableComponent } from './p2/p2-hierarchical-components';
import { OverlayPanelComponent, PopoverComponent } from './p2/p2-overlay-components';
import { StepperComponent } from './stepper/stepper.component';
import { TableComponent } from './table/table.component';
import { PanelComponent } from './p2/p2-primeng-gap-components';

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

  it('propagates ToggleSwitch trueValue/falseValue through ControlValueAccessor', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('trueValue', 'enabled');
    fixture.componentRef.setInput('falseValue', 'disabled');
    let modelValue: unknown;
    component.registerOnChange(value => modelValue = value);
    component.toggle();
    expect(modelValue).toBe('enabled');
    component.writeValue('disabled');
    expect(component.checked()).toBeFalse();
  });

  it('supports PrimeNG slider orientation and range values', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('range', true);
    fixture.componentRef.setInput('orientation', 'vertical');
    component.writeValue([20, 80]);
    expect(component.normalizedValues()).toEqual([20, 80]);
    expect(component.orientation()).toBe('vertical');
  });

  it('supports PrimeNG rating stars and rate events', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('stars', 10);
    component.onItemClick(new MouseEvent('click'), 8);
    expect(component.value()).toBe(8);
    expect(component.starsArray()).toHaveSize(10);
  });

  it('supports Knob ControlValueAccessor and styled value configuration', () => {
    const fixture = TestBed.createComponent(KnobComponent);
    const component = fixture.componentInstance;
    let modelValue = 0;
    component.registerOnChange(value => modelValue = value);
    component.writeValue(42);
    expect(component.value()).toBe(42);
    expect(component.dashOffset()).toBeGreaterThan(0);
    component.onInput({ target: { value: '55' } } as unknown as Event);
    expect(modelValue).toBe(55);
  });

  it('normalizes progress values and exposes PrimeNG display configuration', () => {
    const bar = TestBed.createComponent(ProgressBarComponent);
    bar.componentRef.setInput('value', 140);
    bar.componentRef.setInput('unit', ' units');
    expect(bar.componentInstance.normalizedValue()).toBe(100);
    expect(bar.componentInstance.formattedValue()).toBe('100 units');

    const circle = TestBed.createComponent(ProgressCircleComponent);
    circle.componentRef.setInput('value', 25);
    circle.componentRef.setInput('animationDuration', '1s');
    expect(circle.componentInstance.normalizedValue()).toBe(25);
    expect(circle.componentInstance.strokeDashOffset()).toBeGreaterThan(0);
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

  it('supports Tree filtering, multiple selection, and expand/collapse events', () => {
    const fixture = TestBed.createComponent(TreeComponent<{ kind: string }>);
    const root = { key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child', data: { kind: 'leaf' } }] };
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('filter', true);
    const component = fixture.componentInstance;
    component.toggle(root);
    expect(component.visibleNodes()).toHaveSize(2);
    component.filterValue.set('child');
    expect(component.filteredVisibleNodes().map(item => item.node.key)).toEqual(['child']);
    component.select(root.children[0]);
    expect(component.selected()).toEqual(['child']);
    component.select(root.children[0]);
    expect(component.selected()).toEqual([]);
  });

  it('supports TreeTable selection and expansion lifecycle outputs', () => {
    const fixture = TestBed.createComponent(TreeTableComponent<{ amount: number }>);
    const root = { key: 'root', label: 'Root', data: { amount: 1 }, children: [{ key: 'child', label: 'Child', data: { amount: 2 } }] };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('columns', [{ key: 'amount', header: 'Amount' }]);
    const component = fixture.componentInstance;
    component.toggle(component.visibleNodes()[0]);
    expect(component.visibleNodes()).toHaveSize(2);
    component.select(component.visibleNodes()[1], true);
    expect(component.selected().has('child')).toBeTrue();
    component.select(component.visibleNodes()[1], false);
    expect(component.selected().size).toBe(0);
  });

  it('supports controlled OverlayPanel and Popover show/hide lifecycle', () => {
    const panel = TestBed.createComponent(OverlayPanelComponent).componentInstance;
    panel.show();
    expect(panel.visible()).toBeTrue();
    panel.toggle();
    expect(panel.visible()).toBeFalse();
    const popover = TestBed.createComponent(PopoverComponent).componentInstance;
    popover.show();
    expect(popover.visible()).toBeTrue();
    popover.onEscape();
    expect(popover.visible()).toBeFalse();
  });

  it('supports stepper next/previous/reset and completion lifecycle', () => {
    const fixture = TestBed.createComponent(StepperComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', [{ id: 'one', title: 'One' }, { id: 'two', title: 'Two' }]);
    component.next();
    expect(component.currentStep()).toBe(1);
    component.previous();
    expect(component.currentStep()).toBe(0);
    component.next();
    component.reset();
    expect(component.currentStep()).toBe(0);
  });

  it('supports PrimeNG-style table filtering, row events, and lazy paging', () => {
    const fixture = TestBed.createComponent(TableComponent<{ id: number; name: string }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('filterable', true);
    fixture.componentRef.setInput('globalFilterFields', ['name']);
    component.applyFilter('alpha');
    expect(component.displayData()).toHaveSize(1);
    component.toggleRowSelect(component.displayData()[0], true);
    expect(component.selectedRows()).toHaveSize(1);
    component.handlePageChange({ page: 2, pageSize: 5, startIndex: 6 });
    expect(component.currentPage()).toBe(2);
  });

  it('supports Panel toggle lifecycle and header detection', () => {
    const fixture = TestBed.createComponent(PanelComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('toggleable', true);
    fixture.componentRef.setInput('header', 'Details');
    expect(component.hasHeader()).toBeTrue();
    component.toggle();
    expect(component.collapsed()).toBeTrue();
    component.toggle();
    expect(component.collapsed()).toBeFalse();
  });
});
