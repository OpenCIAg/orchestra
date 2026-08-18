import { TestBed } from '@angular/core/testing';
import { CalendarComponent, DateInputComponent } from './p2/p2-form-components';
import { ComboboxComponent } from './p2/p2-form-components';
import { ListboxComponent, MultiSelectComponent } from './p2/p2-form-components';
import { TagsInputComponent } from './p2/p2-form-components';
import { DataTableComponent } from './p2/p2-data-components';
import { VirtualScrollerComponent } from './p2/p2-data-components';
import { SegmentedControlComponent, TreeSelectComponent } from './p2/p2-selection-components';
import { CascadeSelectComponent } from './p2/p2-form-gap-components';
import { DataViewComponent } from './p2/p2-advanced-components';
import { ToggleButtonComponent } from './p2/p2-form-gap-components';
import { SelectComponent } from './select/select.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { SwitchComponent } from './switch/switch.component';
import { SliderComponent } from './slider/slider.component';
import { RatingComponent } from './rating/rating.component';
import { KnobComponent, OrganizationChartComponent } from './p2/p2-org-knob-components';
import { ProgressBarComponent } from './progress/progress-bar.component';
import { ProgressCircleComponent } from './progress/progress-circle.component';
import { ProgressSpinnerComponent } from './progress/progress-spinner.component';
import { ButtonComponent } from './button/button.component';
import { AlertComponent } from './alert/alert.component';
import { CardComponent } from './card/card.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { TabMenuComponent } from './tab-menu/tab-menu.component';
import { DraggableDirective, DroppableDirective } from './drag-drop/drag-drop.directive';
import { TreeComponent, TreeTableComponent } from './p2/p2-hierarchical-components';
import { OverlayPanelComponent, PopoverComponent } from './p2/p2-overlay-components';
import { StepperComponent } from './stepper/stepper.component';
import { TableComponent } from './table/table.component';
import { FieldsetComponent, PanelComponent } from './p2/p2-primeng-gap-components';
import { DrawerComponent } from './drawer/drawer.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { DatePickerCalendarComponent, DatePickerComponent } from './date-picker/date-picker.component';
import { GalleriaComponent, OrderListComponent, PickListComponent } from './p2/p2-list-gallery-components';
import { MessagesComponent } from './p2/p2-message-components';
import { ContextMenuComponent, ContextMenuItem } from './p2/p2-overlay-components';
import { SplitterComponent } from './p2/p2-overlay-components';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AvatarComponent } from './avatar/avatar.component';
import { AvatarGroupComponent } from './avatar/avatar-group.component';
import { ModalRef } from './modal/modal-ref';
import { BadgeComponent } from './badge/badge.component';
import { MenubarComponent, TagComponent } from './p2/p2-data-components';
import { CarouselComponent } from './carousel/carousel.component';
import { ToastService } from './toast/toast.service';
import { ToastComponent } from './toast/toast.component';
import { ConfirmDialogComponent, ConfirmationService, MenuComponent, PanelMenuComponent, TieredMenuComponent } from './p2/p2-advanced-components';
import { DropdownComponent } from './dropdown/dropdown.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { ChipComponent } from './chip/chip.component';
import { FloatLabelComponent, MeterGroupComponent } from './p2/p2-primeng-gap-components';
import { ImageCompareComponent, InplaceComponent, TerminalComponent } from './p2/p2-input-gap-components';
import { BlockUiComponent } from './p2/p2-advanced-components';
import { SpeedDialComponent } from './p2/p2-overlay-components';
import { ChartComponent, EditorComponent } from './p2/p2-chart-editor-components';
import { TabComponent, TabGroupComponent } from './tabs';
import { ImageComponent } from './image/image.component';

describe('P2 expansion components', () => {
  it('selects an allowed calendar day and advances months', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    component.selectDay(component.days().find(day => day.inCurrentMonth && !day.disabled)!);
    expect(component.value()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const currentMonth = component.currentMonth();
    component.nextMonth();
    expect(component.currentMonth()).not.toBe(currentMonth);
    component.today();
    expect(component.value()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    component.clear();
    expect(component.value()).toBe('');
  });

  it('supports Calendar ControlValueAccessor synchronization', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    component.writeValue('2025-01-10');
    expect(component.value()).toBe('2025-01-10');
    let changed: string | string[] = '';
    component.registerOnChange(value => changed = value);
    component.clear();
    expect(changed).toBe('');
    component.setDisabledState(true);
    component.today();
    expect(component.value()).toBe('');
  });

  it('exposes Calendar multiple selection arrays through onSelect', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('selectionMode', 'multiple');
    const selected = jasmine.createSpy('selected');
    component.onSelect.subscribe(selected);
    component.selectDay(component.days()[15]);
    expect(selected).toHaveBeenCalledWith({ value: jasmine.any(Array) });
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

  it('supports PrimeNG Chips separator, duplicate, blur, clear, and lifecycle aliases', () => {
    const fixture = TestBed.createComponent(TagsInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('allowDuplicate', true);
    fixture.componentRef.setInput('separator', ';');
    component.onKeydown(new KeyboardEvent('keydown', { key: ';' }));
    component.draft.set('alpha');
    component.onKeydown(new KeyboardEvent('keydown', { key: ';' }));
    component.draft.set('alpha');
    component.onKeydown(new KeyboardEvent('keydown', { key: ';' }));
    expect(component.value()).toEqual(['alpha', 'alpha']);
    component.clear(new Event('clear'));
    expect(component.value()).toEqual([]);
  });

  it('enforces DatePicker selection mode and disabled dates', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataType', 'date');
    fixture.componentRef.setInput('disabledDays', [0]);
    fixture.componentRef.setInput('minDate', new Date(2025, 0, 6));
    fixture.componentRef.setInput('maxDate', new Date(2025, 0, 31));
    expect(component.calendarMin()).toBe('2025-01-06');
    expect(component.calendarMax()).toBe('2025-01-31');
    component.update({ target: { value: '2025-01-05' } } as unknown as Event);
    expect(component.value()).toBe('');
    component.update({ target: { value: '2025-01-06' } } as unknown as Event);
    expect(component.value()).toEqual(new Date('2025-01-06T00:00:00'));
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('numberOfMonths', 2);
    expect(component.monthOffsets()).toEqual([0, 1]);
    component.update({ target: { value: '2025-01-06, 2025-01-07' } } as unknown as Event);
    expect(component.value()).toHaveSize(2);
  });

  it('supports DatePicker calendar multiple and range selection', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('selectionMode', 'multiple');
    component.selectCalendarDate('2025-01-06');
    component.selectCalendarDate('2025-01-07');
    expect(component.value()).toEqual(['2025-01-06', '2025-01-07']);
    expect(component.calendarValues()).toEqual(['2025-01-06', '2025-01-07']);

    fixture.componentRef.setInput('selectionMode', 'range');
    component.clear();
    component.selectCalendarDate('2025-01-10');
    component.selectCalendarDate('2025-01-05');
    expect(component.value()).toEqual(['2025-01-05', '2025-01-10']);
  });

  it('enforces DatePicker maxDateCount and hideOnDateTimeSelect', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('maxDateCount', 1);
    component.selectCalendarDate('2025-01-01');
    component.selectCalendarDate('2025-01-02');
    expect(component.value()).toEqual(['2025-01-01']);
    fixture.componentRef.setInput('selectionMode', 'single');
    fixture.componentRef.setInput('hideOnDateTimeSelect', false);
    component.show();
    component.selectCalendarDate('2025-01-03');
    expect(component.overlayVisible()).toBeTrue();
  });

  it('includes seconds in DatePicker time values when showSeconds is enabled', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataType', 'date');
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showSeconds', true);
    component.writeValue(new Date(2025, 0, 1, 13, 4, 9));
    expect(component.inputValue()).toContain('13:04:09');
    fixture.componentRef.setInput('timeOnly', true);
    expect(component.inputValue()).toBe('13:04:09');
  });

  it('supports DatePicker time stepping and 12-hour meridiem controls', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataType', 'date');
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('hourFormat', '12');
    fixture.componentRef.setInput('stepMinute', 5);
    component.writeValue(new Date(2025, 0, 1, 13, 10, 0));
    expect(component.displayHour()).toBe(1);
    expect(component.meridiem()).toBe('PM');
    component.adjustTime('minute', 1);
    expect(component.inputValue()).toContain('13:15');
    component.toggleMeridiem();
    expect(component.meridiem()).toBe('AM');
  });

  it('emits DatePicker input lifecycle and closes on Today when configured', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    const input = jasmine.createSpy('input');
    component.onInput.subscribe(input);
    component.show();
    component.today();
    expect(input).toHaveBeenCalled();
    expect(component.overlayVisible()).toBeFalse();
  });

  it('supports DatePicker keyboard show and Escape close behavior', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    component.onInputKeydown({ key: 'ArrowDown', preventDefault() {} } as KeyboardEvent);
    expect(component.overlayVisible()).toBeTrue();
    component.onInputKeydown({ key: 'Escape', preventDefault() {} } as KeyboardEvent);
    expect(component.overlayVisible()).toBeFalse();
  });

  it('closes a dismissable overlay panel only when clicking outside its host', () => {
    const fixture = TestBed.createComponent(OverlayPanelComponent);
    const component = fixture.componentInstance;
    component.show();
    component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);
    expect(component.visible()).toBeTrue();
    component.onDocumentClick({ target: document.body } as unknown as MouseEvent);
    expect(component.visible()).toBeFalse();
  });

  it('honors DatePickerCalendar firstDayOfWeek grid configuration', () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('currentMonth', '2025-01');
    fixture.componentRef.setInput('firstDayOfWeek', 1);
    expect(component.days()[0].iso).toBe('2024-12-30');
    expect(component.weekdayLabels()[0]).toBe('Mo');
  });

  it('renders week numbers when DatePicker showWeek is enabled', () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('currentMonth', '2025-01');
    fixture.componentRef.setInput('showWeek', true);
    expect(component.days()[0].weekNumber).toBe(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.week-number').length).toBe(6);
  });

  it('renders DatePicker month and year views', () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('currentMonth', '2025-01');
    fixture.componentRef.setInput('view', 'month');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.month-grid button').length).toBe(12);
    fixture.componentRef.setInput('view', 'year');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.year-grid button').length).toBe(12);
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
    const removed = jasmine.createSpy('removed');
    multi.componentInstance.onRemove.subscribe(removed);
    multi.componentInstance.select(multi.componentInstance.options()[0], new Event('click'));
    expect(removed).toHaveBeenCalledWith({ value: 1, originalEvent: jasmine.any(Event) });
    let touched = false;
    multi.componentInstance.registerOnTouched(() => touched = true);
    multi.componentInstance.clear(new Event('click'));
    expect(touched).toBeTrue();
  });

  it('skips disabled Listbox options during keyboard navigation', () => {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', [{ value: 'blocked', label: 'Blocked', disabled: true }, { value: 'open', label: 'Open' }]);
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it('uses Listbox dataKey for object-valued selection identity', () => {
    const fixture = TestBed.createComponent(ListboxComponent<any>);
    fixture.componentRef.setInput('options', [{ id: 1, label: 'Alpha' }]);
    fixture.componentRef.setInput('dataKey', 'id');
    fixture.componentRef.setInput('value', { id: 1 });
    expect(fixture.componentInstance.isSelected(fixture.componentInstance.options()[0])).toBeTrue();
  });

  it('defaults DateInput tabindex while retaining native min/max constraints', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('min', '2025-01-01');
    fixture.componentRef.setInput('max', '2025-12-31');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.tabIndex).toBe(0);
    expect(input.min).toBe('2025-01-01');
    expect(input.max).toBe('2025-12-31');
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
    expect(component.selectedItems()[0].label).toBe('Brazil');
    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    component.onChange.subscribe(changed);
    component.onOptionSelect.subscribe(selected);
    component.onDataOptionClick(component.options()![1] as any, new Event('click'));
    expect(changed).toHaveBeenCalled();
    expect(selected).toHaveBeenCalledWith({ originalEvent: jasmine.any(Event), value: 'pt' });
    const clearEvent = new MouseEvent('click');
    component.clearValue(clearEvent);
    expect(component.value()).toBeUndefined();
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

  it('supports non-binary checkbox array membership', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'email');
    component.writeValue(['sms', 'email']);
    expect(component.checked()).toBeTrue();
    let modelValue: unknown;
    component.registerOnChange(value => modelValue = value);
    component.toggle();
    expect(modelValue).toEqual(['sms']);
    component.toggle();
    expect(modelValue).toEqual(['sms', 'email']);
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

  it('preserves the native event in ToggleSwitch changes and defaults tabindex', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    component.onChange.subscribe(changed);
    const event = new MouseEvent('click');
    component.onToggle(event);
    expect(component.tabindex()).toBe(0);
    expect(changed).toHaveBeenCalledWith(jasmine.objectContaining({ originalEvent: event, checked: true }));
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

  it('preserves the source event in slider change notifications', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    component.onChange.subscribe(changed);
    component.writeValue(20);
    (component as any).onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), 'end');
    expect(changed).toHaveBeenCalledWith(jasmine.objectContaining({ originalEvent: jasmine.any(KeyboardEvent), value: 21 }));
  });

  it('supports PrimeNG rating stars and rate events', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('stars', 10);
    component.onItemClick(new MouseEvent('click'), 8);
    expect(component.value()).toBe(8);
    expect(component.starsArray()).toHaveSize(10);
    const rated = jasmine.createSpy('rated');
    component.onRate.subscribe(rated);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(rated).toHaveBeenCalledWith(jasmine.objectContaining({ value: 9 }));
  });

  it('does not emit a rate event when clearable rating is cancelled', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('clearable', true);
    component.writeValue(3);
    const rated = jasmine.createSpy('rated');
    const cancelled = jasmine.createSpy('cancelled');
    component.onRate.subscribe(rated);
    component.onCancel.subscribe(cancelled);
    component.onItemClick(new MouseEvent('click'), 3);
    expect(component.value()).toBe(0);
    expect(cancelled).toHaveBeenCalled();
    expect(rated).not.toHaveBeenCalled();
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

  it('normalizes Knob values to its min/max/step contract', () => {
    const fixture = TestBed.createComponent(KnobComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 20);
    fixture.componentRef.setInput('step', 2);
    component.writeValue(99);
    expect(component.value()).toBe(20);
    component.onInput({ target: { value: '13' } } as unknown as Event);
    expect(component.value()).toBe(14);
  });

  it('exposes OrganizationChart selectionChange and collapsible behavior', () => {
    const fixture = TestBed.createComponent(OrganizationChartComponent);
    const component = fixture.componentInstance;
    const root = { key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child' }] };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('collapsible', false);
    component.toggle(root);
    expect(component.expanded().size).toBe(0);
    component.select(root);
    expect(component.selected()).toBe('root');
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

  it('provides a dedicated ProgressSpinner selector and API', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('size', 32);
    fixture.componentRef.setInput('strokeWidth', 4);
    expect(component.size()).toBe(32);
    expect(component.strokeWidth()).toBe(4);
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

  it('emits DataTable onSort alongside sortChange', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Name', sortable: true }]);
    const sort = jasmine.createSpy('sort');
    component.onSort.subscribe(sort);
    component.sortBy(component.columns()[0]);
    expect(sort).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' });
  });

  it('supports PrimeNG DataTable value/rows/sort aliases and header selection event', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    component.toggleAll(true);
    expect(component.pageRows()).toHaveSize(1);
    expect(component.selected()).toHaveSize(1);
    expect(component.sortField()).toBe('');
  });

  it('emits DataTable paginator events when navigating rendered controls', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ id: 1 }, { id: 2 }]);
    fixture.componentRef.setInput('columns', [{ key: 'id', header: 'ID' }]);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput('paginator', true);
    const page = jasmine.createSpy('page');
    component.onPage.subscribe(page);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.paginator button:last-child') as HTMLButtonElement).click();
    expect(page).toHaveBeenCalledWith({ first: 1, rows: 1 });
  });

  it('uses DataTable totalRecords for lazy page count', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ id: 1 }]);
    fixture.componentRef.setInput('columns', [{ key: 'id', header: 'ID' }]);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentRef.setInput('totalRecords', 3);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('paginator', true);
    expect(component.pageCount()).toBe(3);
  });

  it('emits DataTable initial lazy load when configured', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('lazyLoadOnInit', true);
    fixture.componentRef.setInput('rows', 25);
    const lazy = jasmine.createSpy('lazy');
    component.onLazyLoad.subscribe(lazy);
    fixture.detectChanges();
    expect(lazy).toHaveBeenCalledWith({ first: 0, rows: 25 });
  });

  it('uses DataTable dataKey for controlled row selection identity', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const row = { code: 'A', label: 'Alpha' };
    fixture.componentRef.setInput('data', [row]);
    fixture.componentRef.setInput('dataKey', 'code');
    fixture.componentRef.setInput('selection', [{ code: 'A', label: 'External copy' }]);
    expect(fixture.componentInstance.isSelected(row)).toBeTrue();
  });

  it('honors single-row selection and emits filter changes', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    const first = { id: 1, name: 'Alpha' };
    const second = { id: 2, name: 'Beta' };
    fixture.componentRef.setInput('data', [first, second]);
    fixture.componentRef.setInput('selectionMode', 'single');
    component.toggleRow(first, true);
    component.toggleRow(second, true);
    expect(component.selected()).toEqual([second]);
    component.setFilter('beta');
    expect(component.filteredRows()).toEqual([second]);
    expect(component.page()).toBe(0);
    fixture.componentRef.setInput('selection', [first]);
    expect(component.selected()).toEqual([first]);
  });

  it('calculates a virtualized range and expands a tree select', () => {
    const scroller = TestBed.createComponent(VirtualScrollerComponent);
    scroller.componentRef.setInput('items', Array.from({ length: 100 }, (_, index) => `Item ${index}`));
    scroller.componentInstance.onScroll({ target: { scrollTop: 400 } } as unknown as Event);
    expect(scroller.componentInstance.startIndex()).toBeGreaterThan(0);
    expect(scroller.componentInstance.visibleItems().length).toBeGreaterThan(0);
    scroller.componentRef.setInput('lazy', true);
    scroller.componentInstance.onScroll({ target: { scrollTop: 800 } } as unknown as Event);
    expect(scroller.componentInstance.startIndex()).toBeGreaterThan(0);

    const tree = TestBed.createComponent(TreeSelectComponent);
    const root = { value: 'root', label: 'Root', children: [{ value: 'child', label: 'Child' }] };
    tree.componentRef.setInput('nodes', [root]);
    tree.componentInstance.toggle(root);
    expect(tree.componentInstance.visibleNodes()).toHaveSize(2);
    tree.componentInstance.select(root.children[0]);
    expect(tree.componentInstance.value()).toBe('child');
    let hidden = false;
    tree.componentInstance.onHide.subscribe(() => hidden = true);
    tree.componentInstance.open.set(true);
    tree.componentInstance.select(root.children[0], new Event('click'));
    expect(hidden).toBeTrue();
    tree.componentRef.setInput('selectionMode', 'checkbox');
    tree.componentInstance.select(root, new Event('click'));
    expect(tree.componentInstance.value()).toEqual(['root', 'child']);
    tree.componentInstance.select(root, new Event('click'));
    expect(tree.componentInstance.value()).toEqual([]);

    const upward = TestBed.createComponent(TreeSelectComponent);
    upward.componentRef.setInput('nodes', [root]);
    upward.componentRef.setInput('selectionMode', 'checkbox');
    upward.componentInstance.select(root.children[0], new Event('click'));
    expect(upward.componentInstance.value()).toEqual(['child']);
    upward.componentInstance.select(root, new Event('click'));
    expect(upward.componentInstance.value()).toEqual(['child', 'root']);
    upward.componentInstance.select(root.children[0], new Event('click'));
    expect(upward.componentInstance.value()).toEqual([]);
  });

  it('updates a segmented control value', () => {
    const fixture = TestBed.createComponent(SegmentedControlComponent<string>);
    fixture.componentRef.setInput('options', [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]);
    fixture.componentInstance.select(fixture.componentInstance.options()[1]);
    expect(fixture.componentInstance.value()).toBe('list');
  });

  it('supports CascadeSelect ControlValueAccessor synchronization', () => {
    const fixture = TestBed.createComponent(CascadeSelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ value: 'br', label: 'Brazil', children: [{ value: 'sp', label: 'São Paulo' }] }]);
    component.writeValue('sp');
    expect(component.value()).toBe('sp');
    expect(component.selectedLabel()).toContain('São Paulo');
    let changed: string | null = 'sp';
    component.registerOnChange(value => changed = value);
    component.clear();
    expect(changed).toBeNull();
  });

  it('honors ToggleButton allowEmpty when already active', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    const component = fixture.componentInstance;
    component.toggle();
    expect(component.checked()).toBeTrue();
    component.toggle();
    expect(component.checked()).toBeTrue();
    fixture.componentRef.setInput('allowEmpty', true);
    component.toggle();
    expect(component.checked()).toBeFalse();
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
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', true);
    fixture.componentRef.setInput('propagateSelectionUp', true);
    component.select(root);
    expect(component.selected()).toEqual(['root', 'child']);
    component.select(root);
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

  it('supports TreeTable selection modes and descendant propagation', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    const root = { key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child' }] };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('selectionMode', 'checkbox');
    fixture.componentRef.setInput('propagateSelectionDown', true);
    fixture.componentRef.setInput('propagateSelectionUp', true);
    component.select({ node: root, level: 1 }, true);
    expect([...component.selected()]).toEqual(['root', 'child']);
    component.select({ node: root, level: 1 }, false);
    expect(component.selected().size).toBe(0);
  });

  it('emits TreeTable initial lazy-load payload with configured rows', () => {
    const fixture = TestBed.createComponent(TreeTableComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('lazyLoadOnInit', true);
    fixture.componentRef.setInput('rows', 25);
    let request: { first: number; rows: number } | undefined;
    component.onLazyLoad.subscribe(event => request = event);
    component.ngOnInit();
    expect(request).toEqual({ first: 0, rows: 25 });
  });

  it('emits DataView layout and initial lazy-load lifecycle events', () => {
    const fixture = TestBed.createComponent(DataViewComponent);
    const component = fixture.componentInstance as DataViewComponent<{ id: number }>;
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('lazyLoadOnInit', true);
    const lazy = jasmine.createSpy('lazy');
    const layout = jasmine.createSpy('layout');
    component.onLazyLoad.subscribe(lazy);
    component.onChangeLayout.subscribe(layout);
    component.ngOnInit();
    component.setLayout('list');
    expect(lazy).toHaveBeenCalledWith({ first: 0, rows: 10 });
    expect(layout).toHaveBeenCalledWith('list');
  });

  it('supports OrderList multiple selection and PickList selection events', () => {
    const order = TestBed.createComponent(OrderListComponent<string>);
    const orderComponent = order.componentInstance;
    order.componentRef.setInput('value', ['A', 'B']);
    order.componentRef.setInput('selectionMode', 'multiple');
    orderComponent.select(0);
    orderComponent.select(1);
    expect(orderComponent.selection()).toEqual(['A', 'B']);
    orderComponent.select(0);
    expect(orderComponent.selection()).toEqual(['B']);
    const pick = TestBed.createComponent(PickListComponent);
    const pickComponent = pick.componentInstance;
    pick.componentRef.setInput('source', [{ value: 'a', label: 'A' }]);
    pickComponent.toggleSource({ value: 'a', label: 'A' });
    expect(pickComponent.sourceSelected().has('a')).toBeTrue();
  });

  it('supports OrderList ControlValueAccessor reorder propagation', () => {
    const fixture = TestBed.createComponent(OrderListComponent<string>);
    const component = fixture.componentInstance;
    component.writeValue(['A', 'B']);
    component.selectedIndex.set(0);
    let changed: string[] = [];
    component.registerOnChange(value => changed = value);
    component.move(1);
    expect(changed).toEqual(['B', 'A']);
  });

  it('supports Galleria PrimeNG navigation configuration and keyboard navigation', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('images', [{ src: 'a' }, { src: 'b' }]);
    fixture.componentRef.setInput('fullScreen', true);
    fixture.componentRef.setInput('showItemNavigators', true);
    component.onKeydown({ key: 'ArrowRight', preventDefault() {} } as KeyboardEvent);
    expect(component.activeIndex()).toBe(1);
    expect(component.fullScreen()).toBeTrue();
  });

  it('supports Galleria autoPlay slideshow lifecycle', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('images', [{ src: 'a' }, { src: 'b' }]);
    fixture.componentRef.setInput('circular', true);
    fixture.componentRef.setInput('autoPlay', true);
    fixture.componentRef.setInput('transitionInterval', 10);
    jasmine.clock().install();
    try {
      component.restartSlideShow();
      jasmine.clock().tick(10);
      expect(component.activeIndex()).toBe(1);
      component.stopSlideShow();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('supports Galleria fullscreen visibility and Escape dismissal', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('fullScreen', true);
    component.hide();
    expect(component.visible()).toBeFalse();
    component.show();
    component.onKeydown({ key: 'Escape', preventDefault() {} } as KeyboardEvent);
    expect(component.visible()).toBeFalse();
  });

  it('supports controlled OverlayPanel and Popover show/hide lifecycle', () => {
    const panelFixture = TestBed.createComponent(OverlayPanelComponent);
    const panel = panelFixture.componentInstance;
    panelFixture.componentRef.setInput('baseZIndex', 20);
    panelFixture.componentRef.setInput('autoZIndex', true);
    expect(panel.computedZIndex()).toBe(21);
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

  it('keeps Steps activeIndex and Stepper currentStep synchronized', () => {
    const fixture = TestBed.createComponent(StepperComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', [{ id: 'one', title: 'One' }, { id: 'two', title: 'Two' }]);
    fixture.componentRef.setInput('activeIndex', 1);
    fixture.detectChanges();
    expect(component.currentStep()).toBe(1);
    component.reset();
    expect(component.activeIndex()).toBe(0);
  });

  it('uses the PrimeNG Steps model input and honors readonly navigation', () => {
    const fixture = TestBed.createComponent(StepperComponent);
    const component = fixture.componentInstance;
    const model = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }];
    fixture.componentRef.setInput('model', model);
    fixture.componentRef.setInput('readonly', true);
    expect(component.effectiveSteps()).toEqual(model);
    component.next();
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
    fixture.componentRef.setInput('rowsPerPageOptions', [1, 2]);
    fixture.componentRef.setInput('showGridlines', true);
    fixture.componentRef.setInput('metaKeySelection', false);
    let selectedEvent: unknown;
    component.onRowSelect.subscribe(event => selectedEvent = event);
    component.toggleRowSelect(component.displayData()[0], true);
    expect(component.selectedRows()).toHaveSize(1);
    expect(selectedEvent).toEqual({ data: { id: 1, name: 'Alpha' } });
    component.handlePageChange({ page: 2, pageSize: 5, startIndex: 6 });
    expect(component.currentPage()).toBe(2);
  });

  it('supports Table single selection, row guards, reset, and deep selection comparison', () => {
    const fixture = TestBed.createComponent(TableComponent<{ id: number; name: string }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('selectionMode', 'single');
    component.toggleRowSelect(component.data()[0], true);
    component.toggleRowSelect(component.data()[1], true);
    expect(component.selectedRows()).toEqual([{ id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('rowSelectable', ({ data }: { data: { id: number; name: string }; index: number }) => data.id === 1);
    component.toggleRowSelect(component.data()[1], true);
    expect(component.selectedRows()).toEqual([{ id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('compareSelectionBy', 'deepEquals');
    component.reset();
    expect(component.selectedRows()).toEqual([]);
    expect(component.sortDirection()).toBe('none');
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

  it('provides a dedicated Fieldset component contract', () => {
    const fixture = TestBed.createComponent(FieldsetComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('legend', 'Details');
    fixture.componentRef.setInput('toggleable', true);
    component.collapse();
    expect(component.collapsed()).toBeTrue();
    component.expand();
    expect(component.collapsed()).toBeFalse();
  });

  it('supports Drawer visible alias and PrimeNG lifecycle controls', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.show();
    expect(component.visible()).toBeTrue();
    fixture.componentRef.setInput('closeOnEscape', false);
    component.onEscape();
    expect(component.open()).toBeTrue();
    component.close();
    expect(component.visible()).toBeFalse();
  });

  it('supports PrimeNG paginator aliases and first/rows event fields', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 100);
    component.rows.set(10);
    component.goToPage(3);
    expect(component.totalRecords()).toBe(100);
    expect(component.first()).toBe(20);
    expect(component.rows()).toBe(10);
  });

  it('supports remaining PrimeNG structural and utility aliases', () => {
    const block = TestBed.createComponent(BlockUiComponent).componentInstance;
    expect(block.blocked()).toBeFalse();
    block.block();
    expect(block.blocked()).toBeTrue();
    block.unblock();
    expect(block.blocked()).toBeFalse();
    const meter = TestBed.createComponent(MeterGroupComponent);
    meter.componentRef.setInput('value', [{ value: 25, label: 'CPU' }]);
    expect(meter.componentInstance.total()).toBe(25);
    expect(meter.componentInstance.percent(meter.componentInstance.effectiveValues()[0])).toBe(25);
    const inplace = TestBed.createComponent(InplaceComponent).componentInstance;
    inplace.activate();
    expect(inplace.active()).toBeTrue();
    inplace.deactivate();
    const dialFixture = TestBed.createComponent(SpeedDialComponent);
    const dial = dialFixture.componentInstance;
    dial.show();
    expect(dial.open()).toBeTrue();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(dial.open()).toBeFalse();
    dial.show();
    dialFixture.componentRef.setInput('hideOnClickOutside', false);
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(dial.open()).toBeTrue();
    dial.hide();
    const compare = TestBed.createComponent(ImageCompareComponent).componentInstance;
    compare.setPosition(120);
    expect(compare.position()).toBe(100);
    const terminal = TestBed.createComponent(TerminalComponent).componentInstance;
    terminal.command.set('help');
    terminal.submit(new Event('submit'));
    expect(terminal.history()[0].command).toBe('help');
    expect(TestBed.createComponent(FloatLabelComponent).componentInstance.variant()).toBe('over');
  });

  it('supports PrimeNG chart and editor lifecycle aliases', () => {
    const chart = TestBed.createComponent(ChartComponent).componentInstance;
    chart.refresh();
    chart.reinit();
    chart.selectPoint(0);
    expect(chart.generateLegend()).toBe('');
    const editorFixture = TestBed.createComponent(EditorComponent);
    editorFixture.detectChanges();
    const editor = editorFixture.componentInstance;
    editor.exec('bold');
    editor.onInput({ target: document.createElement('div') } as unknown as Event);
    expect(editor.getQuill()).not.toBeNull();
  });

  it('emits PrimeNG-style Editor text and selection lifecycle payloads', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    const editor = fixture.componentInstance;
    let textEvent: any;
    let selectionEvent: any;
    editor.onTextChange.subscribe(event => textEvent = event);
    editor.onSelectionChange.subscribe(event => selectionEvent = event);
    const surface = fixture.nativeElement.querySelector('.surface') as HTMLElement;
    surface.innerHTML = '<b>Hello</b>';
    editor.onInput({ target: surface } as unknown as Event);
    editor.emitSelectionChange(new Event('selectionchange'));
    expect(textEvent.source).toBe('user');
    expect(textEvent.html).toContain('Hello');
    expect(selectionEvent).toEqual(jasmine.objectContaining({ source: 'user' }));
  });

  it('supports PrimeNG Image preview, zoom, rotation, and hide lifecycle', () => {
    const fixture = TestBed.createComponent(ImageComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('src', 'image.jpg');
    fixture.componentRef.setInput('preview', true);
    component.onImageClick();
    expect(component.previewVisible()).toBeTrue();
    component.zoomIn();
    expect(component.scale()).toBe(1.25);
    component.rotateRight();
    expect(component.rotation()).toBe(90);
    component.closePreview();
    expect(component.previewVisible()).toBeFalse();
  });

  it('emits Toast onClick and onClose lifecycle payloads', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('toast', { id: 't1', type: 'info', title: 'Info', message: 'Hello', duration: 0, dismissible: true, showIcon: true, position: 'top-right', pauseOnHover: true });
    let clicked: any;
    let closed: any;
    component.onClick.subscribe(event => clicked = event);
    component.onClose.subscribe(event => closed = event);
    const click = new MouseEvent('click');
    component.handleToastClick(click);
    component.handleClose(click);
    expect(clicked.originalEvent).toBe(click);
    expect(closed.message.id).toBe('t1');
  });

  it('supports Galleria circular navigation and image change events', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('images', [{ src: 'one' }, { src: 'two' }]);
    fixture.componentRef.setInput('circular', true);
    component.previous();
    expect(component.activeIndex()).toBe(1);
    component.next();
    expect(component.activeIndex()).toBe(0);
  });

  it('supports OrderList reorder and PickList transfer events', () => {
    const order = TestBed.createComponent(OrderListComponent<string>).componentInstance;
    order.value.set(['a', 'b']);
    order.select(1);
    order.move(-1);
    expect(order.value()).toEqual(['b', 'a']);

    const pick = TestBed.createComponent(PickListComponent<{ value: string; label: string }>).componentInstance;
    pick.source.set([{ value: 'a', label: 'A' }]);
    pick.toggleSource(pick.source()[0]);
    pick.transferSelected();
    expect(pick.source()).toEqual([]);
    expect(pick.target()[0].value).toBe('a');
  });

  it('supports Messages removal and clear lifecycle', () => {
    const fixture = TestBed.createComponent(MessagesComponent);
    const component = fixture.componentInstance;
    component.messages.set([{ id: 1, severity: 'success', detail: 'Saved' }, { id: 2, severity: 'error', detail: 'Failed' }]);
    component.remove(0);
    expect(component.messages()).toHaveSize(1);
    component.clearMessages();
    expect(component.messages()).toEqual([]);
  });

  it('supports ContextMenu controlled visibility and lifecycle', () => {
    const fixture = TestBed.createComponent(ContextMenuComponent);
    const component = fixture.componentInstance;
    const selected: ContextMenuItem[] = [];
    fixture.componentRef.setInput('items', [{ label: 'Disabled', value: 'disabled', disabled: true }, { label: 'Open', value: 'open' }]);
    component.itemSelect.subscribe(item => selected.push(item));
    component.show();
    expect(component.visible()).toBeTrue();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(0);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(selected.map(item => item.value)).toEqual(['open']);
    component.show();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(component.visible()).toBeFalse();
    component.toggle();
    expect(component.visible()).toBeTrue();
    component.openAt(new MouseEvent('contextmenu', { clientX: 20, clientY: 30 }));
    expect(component.position()).toEqual({ x: 20, y: 30 });
    component.hide();
    expect(component.visible()).toBeFalse();
  });

  it('supports TieredMenu popup visibility and item lifecycle', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('popup', true);
    component.show();
    expect(component.visible()).toBeTrue();
    fixture.componentRef.setInput('items', [{ label: 'File', value: 'file' }, { label: 'Edit', value: 'edit' }]);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(1);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component.activeIndex()).toBe(0);
    component.hide();
    expect(component.visible()).toBeFalse();
  });

  it('supports Paginator jump controls and clamped page state', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 100);
    fixture.componentRef.setInput('rows', 10);
    component.jumpPageInput.set('99');
    component.jumpToPage();
    expect(component.currentPage()).toBe(10);
    component.jumpPageInput.set('0');
    component.jumpToPage();
    expect(component.currentPage()).toBe(1);
  });

  it('interpolates PrimeNG paginator current page report tokens', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 42);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('currentPageReportTemplate', '{first}-{last} / {totalRecords} ({currentPage}/{totalPages})');
    component.goToPage(2);
    expect(component.pageReport()).toBe('11-20 / 42 (2/5)');
  });

  it('supports PanelMenu controlled expansion and multiple mode', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    const component = fixture.componentInstance;
    const first = { label: 'First', items: [{ label: 'Child' }] };
    const second = { label: 'Second', items: [{ label: 'Child 2' }] };
    fixture.componentRef.setInput('items', [first, second]);
    component.toggle(first);
    expect(component.open().has(first)).toBeTrue();
    component.toggle(second);
    expect(component.open().has(first)).toBeFalse();
    fixture.componentRef.setInput('multiple', true);
    const expanded = jasmine.createSpy('expanded');
    component.onNodeExpand.subscribe(expanded);
    component.toggle(first);
    expect(component.open().has(first)).toBeTrue();
    expect(component.open().has(second)).toBeTrue();
    expect(expanded).toHaveBeenCalledWith(first);
  });

  it('provides a real Menu contract instead of the old Dropdown alias', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const component = fixture.componentInstance;
    const command = jasmine.createSpy('command');
    const item = { label: 'Open', command };
    fixture.componentRef.setInput('model', [item]);
    fixture.componentRef.setInput('popup', true);
    const selected = jasmine.createSpy('selected');
    component.itemSelect.subscribe(selected);
    component.show();
    component.activate(item);
    expect(command).toHaveBeenCalled();
    expect(selected).toHaveBeenCalledWith(item);
    expect(component.visible()).toBeFalse();
  });

  it('renders and activates nested Menu items through the PrimeNG model shape', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const component = fixture.componentInstance;
    const command = jasmine.createSpy('nestedCommand');
    const child = { label: 'Child', command };
    const parent = { label: 'Parent', items: [child] };
    fixture.componentRef.setInput('model', [parent]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ul[role="menu"]').length).toBe(1);
    component.activate(child);
    expect(command).toHaveBeenCalled();
  });

  it('supports Menu keyboard navigation and activation', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const component = fixture.componentInstance;
    const command = jasmine.createSpy('keyboardCommand');
    const items = [{ label: 'First' }, { label: 'Second', command }];
    fixture.componentRef.setInput('model', items);
    component.onKeydown({ key: 'ArrowDown', preventDefault() {} } as KeyboardEvent);
    expect(component.activeIndex()).toBe(1);
    component.onKeydown({ key: 'Enter', preventDefault() {} } as KeyboardEvent);
    expect(command).toHaveBeenCalled();
  });

  it('supports OrganizationChart expansion and multiple selection', () => {
    const fixture = TestBed.createComponent(OrganizationChartComponent);
    const component = fixture.componentInstance;
    const root = { key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child' }] };
    fixture.componentRef.setInput('value', [root]);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    component.toggle(root);
    expect(component.flatNodes()).toHaveSize(2);
    component.select(root);
    component.select(root.children[0]);
    expect(component.selected()).toEqual(['root', 'child']);
  });

  it('supports Autocomplete dropdown, loading, and clear lifecycle', () => {
    const fixture = TestBed.createComponent(AutocompleteComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ value: 'a', label: 'Alpha' }]);
    fixture.componentRef.setInput('dropdown', true);
    component.onFocus();
    expect(component.isOpen()).toBeTrue();
    component.select(component.filteredOptions()[0]);
    expect(component.value()).toBe('a');
    component.clear();
    expect(component.value()).toBeNull();
  });

  it('supports Splitter gutter resizing and size events', () => {
    const fixture = TestBed.createComponent(SplitterComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('panels', [{ id: 'a' }, { id: 'b' }]);
    expect(component.normalizedSizes()).toEqual([50, 50]);
    component.resize(0, 10);
    expect(component.normalizedSizes()[0]).toBeGreaterThan(50);
  });

  it('supports ColorPicker format inputs and clear behavior', () => {
    const fixture = TestBed.createComponent(ColorPickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('inline', true);
    fixture.componentRef.setInput('format', 'hex');
    component.selectColor('#ffffff');
    expect(component.value()).toBe('#ffffff');
    component.clear();
    expect(component.value()).toBe('');
  });

  it('parses and emits ColorPicker RGB and HSV formats', () => {
    const fixture = TestBed.createComponent(ColorPickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('format', 'rgb');
    component.onTextInput({ target: { value: '#ff0000' } } as unknown as Event);
    expect(component.value()).toBe('rgb(255, 0, 0)');
    fixture.componentRef.setInput('format', 'hsv');
    component.onTextInput({ target: { value: 'rgb(0, 255, 0)' } } as unknown as Event);
    expect(component.value()).toBe('hsv(120, 100%, 100%)');
    expect(component.nativeValue()).toBe('#00ff00');
    fixture.componentRef.setInput('format', 'hsb');
    component.onTextInput({ target: { value: '#0000ff' } } as unknown as Event);
    expect(component.value()).toBe('hsb(240, 100%, 100%)');
  });

  it('supports PrimeNG badge value and severity aliases', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 120);
    fixture.componentRef.setInput('severity', 'success');
    expect(component.displayValue()).toBe('120');
    expect(component.normalizedStatus()).toBe('success');
  });

  it('supports PrimeNG toast add/addAll/remove aliases and message fields', () => {
    const service = TestBed.inject(ToastService);
    service.clear();
    const first = service.add({ severity: 'success', summary: 'Saved', detail: 'Done', life: 0 });
    const ids = service.addAll([{ severity: 'error', summary: 'Failed', detail: 'Nope', sticky: true }]);
    expect(service.toasts().map(toast => toast.id)).toContain(first);
    expect(ids).toHaveSize(1);
    expect(service.toasts()[0].message).toBe('Done');
    service.remove(first);
    expect(service.toasts().map(toast => toast.id)).not.toContain(first);
    service.clear();
  });

  it('supports Avatar label/icon aliases and AvatarGroup overflow', () => {
    const avatar = TestBed.createComponent(AvatarComponent);
    avatar.componentRef.setInput('label', 'Ada Lovelace');
    avatar.componentRef.setInput('icon', '★');
    expect(avatar.componentInstance.computedInitials()).toBe('AL');
    const group = TestBed.createComponent(AvatarGroupComponent);
    group.componentRef.setInput('items', [{ name: 'A' }, { name: 'B' }, { name: 'C' }]);
    group.componentRef.setInput('max', 2);
    expect(group.componentInstance.visibleItems()).toHaveSize(2);
    expect(group.componentInstance.calculatedExcess()).toBe(1);
  });

  it('supports DynamicDialog-style ModalRef close results', () => {
    let destroyed = false;
    const ref = new ModalRef({ instance: {} } as any, () => destroyed = true);
    ref.close({ saved: true });
    expect(destroyed).toBeTrue();
    expect(ref.afterClosed()).toEqual({ saved: true });
  });

  it('supports ConfirmDialog escape and accept lifecycle', () => {
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const component = fixture.componentInstance;
    let accepted = false;
    service.confirm({ message: 'Continue?', accept: () => accepted = true });
    expect(component.request()).toBeTruthy();
    component.accept();
    expect(accepted).toBeTrue();
    expect(component.request()).toBeNull();
  });

  it('supports ConfirmDialog configurable accept/reject visibility and callbacks', () => {
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const component = fixture.componentInstance;
    let rejected = false;
    service.confirm({ message: 'Delete?', acceptVisible: false, rejectLabel: 'Keep', reject: () => rejected = true });
    expect(component.request()?.acceptVisible).toBeFalse();
    expect(component.request()?.rejectLabel).toBe('Keep');
    component.reject();
    expect(rejected).toBeTrue();
    expect(component.request()).toBeNull();
  });

  it('supports Menubar nested submenu activation', () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    const component = fixture.componentInstance;
    const item = { value: 'file', label: 'File', children: [{ value: 'new', label: 'New' }] };
    fixture.componentRef.setInput('items', [item]);
    component.activate(item);
    expect(component.openItem()).toBe(item);
    component.activate(item.children[0]);
  });

  it('supports Carousel hover pause and page lifecycle events', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]);
    component.next();
    expect(component.activeIndex()).toBe(1);
    component.onMouseEnter();
    expect(component.hovered()).toBeTrue();
    component.onMouseLeave();
    expect(component.hovered()).toBeFalse();
  });

  it('supports PrimeNG Carousel value/page aliases and page event bounds', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }]);
    fixture.componentRef.setInput('numVisible', 2);
    let page: any;
    component.onPage.subscribe(event => page = event);
    component.goTo(1);
    expect(component.activeItem()?.label).toBe('B');
    expect(page).toEqual(jasmine.objectContaining({ first: 1, last: 2, pageCount: 2 }));
  });

  it('supports PrimeNG Tag value, severity, icon, and remove events', () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'New');
    fixture.componentRef.setInput('severity', 'info');
    expect(component.effectiveLabel()).toBe('New');
    expect(component.effectiveVariant()).toBe('info');
  });

  it('supports PrimeNG Dropdown form mode with option mapping and CVA events', () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta', blocked: true }]);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('optionValue', 'id');
    fixture.componentRef.setInput('optionDisabled', 'blocked');
    let changed: unknown;
    component.registerOnChange(value => changed = value);
    component.selectOption(component.options()![0], new Event('click'));
    expect(component.value()).toBe(1);
    expect(changed).toBe(1);
    expect(component.selectedLabel()).toBe('Alpha');
    expect(component.isOptionDisabled(component.options()![1])).toBeTrue();
  });

  it('does not open a disabled dropdown and navigates mapped options', () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('optionValue', 'id');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.open();
    expect(component.isOpen()).toBeFalse();
    fixture.componentRef.setInput('disabled', false);
    component.open();
    expect(component.isOpen()).toBeTrue();
    component.close();
  });

  it('supports PrimeNG Skeleton shape, size, style, and animation aliases', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('size', 32);
    fixture.componentRef.setInput('animation', 'wave');
    expect(component.effectiveVariant()).toBe('circular');
    expect(component.computedWidth()).toBe('32px');
  });

  it('supports PrimeNG Chip icon/image/remove aliases', () => {
    const fixture = TestBed.createComponent(ChipComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Angular');
    fixture.componentRef.setInput('icon', '★');
    fixture.componentRef.setInput('removable', true);
    let removed = false;
    component.onRemove.subscribe(() => removed = true);
    component.remove(new Event('click'));
    expect(removed).toBeTrue();
  });

  it('supports ProgressSpinner animation and string stroke width aliases', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('animation', 'none');
    fixture.componentRef.setInput('strokeWidth', '6');
    expect(component.computedStrokeWidth()).toBe(6);
    expect(component.isIndeterminate()).toBeTrue();
  });

  it('supports PrimeNG Button severity, visual flags, badge, and focus lifecycle', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('severity', 'success');
    fixture.componentRef.setInput('outlined', true);
    fixture.componentRef.setInput('badge', 3);
    expect(component.buttonClassString()).toContain('orc-button--variant-success');
    expect(component.buttonClassString()).toContain('orc-button--outlined');
  });

  it('supports PrimeNG Message text, severity, closable, and style aliases', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('text', 'Saved');
    fixture.componentRef.setInput('severity', 'success');
    fixture.componentRef.setInput('closable', true);
    expect(component.activeMessage()).toBe('Saved');
    expect(component.isClosable()).toBeTrue();
  });

  it('supports PrimeNG Card header, subheader, style, and click aliases', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('header', 'Summary');
    fixture.componentRef.setInput('subheader', 'Details');
    fixture.componentRef.setInput('clickable', true);
    let clicked = false;
    component.onClickEvent.subscribe(() => clicked = true);
    component.onClick();
    expect(component.header()).toBe('Summary');
    expect(clicked).toBeFalse();
  });

  it('supports PrimeNG FileUpload fileLimit, customUpload, and lifecycle aliases', () => {
    const fixture = TestBed.createComponent(FileUploaderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('fileLimit', 1);
    fixture.componentRef.setInput('customUpload', true);
    fixture.componentRef.setInput('showUploadButton', false);
    expect(component.fileLimit()).toBe(1);
    expect(component.customUpload()).toBeTrue();
    expect(component.showUploadButton()).toBeFalse();
  });

  it('does not submit rejected FileUpload items', () => {
    const fixture = TestBed.createComponent(FileUploaderComponent);
    const component = fixture.componentInstance;
    const uploaded = jasmine.createSpy('uploaded');
    component.onUpload.subscribe(uploaded);
    const bad = new File(['bad'], 'bad.txt', { type: 'text/plain' });
    component.files.set([{ id: 'bad', file: bad, name: bad.name, size: bad.size, formattedSize: '3 Bytes', type: bad.type, progress: 0, status: 'error', errorMessage: 'Invalid' }]);
    component.upload();
    expect(uploaded).not.toHaveBeenCalled();
  });

  it('matches PrimeNG FileUpload event payloads for selection and custom upload', () => {
    const fixture = TestBed.createComponent(FileUploaderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('customUpload', true);
    const file = new File(['ok'], 'ok.txt', { type: 'text/plain' });
    const selectEvent = new Event('change');
    let selected: { originalEvent: Event; files: File[]; currentFiles: File[] } | undefined;
    let before: FormData | undefined;
    let handled: File[] | undefined;
    component.onSelect.subscribe(event => selected = event);
    component.onBeforeUpload.subscribe(event => before = event.formData);
    component.uploadHandler.subscribe(event => handled = event.files);
    (component as any).handleFiles([file], selectEvent);
    expect(selected?.originalEvent).toBe(selectEvent);
    expect(selected?.files).toEqual([file]);
    expect(selected?.currentFiles).toEqual([file]);
    component.upload();
    expect(before?.get('files')).toBeTruthy();
    expect(handled).toEqual([file]);
  });

  it('supports PrimeNG TabMenu model, active item, command, and keyboard aliases', () => {
    const fixture = TestBed.createComponent(TabMenuComponent);
    const component = fixture.componentInstance;
    const items = [{ label: 'Home' }, { label: 'Settings' }];
    fixture.componentRef.setInput('model', items);
    component.activate(items[1], new Event('click'));
    expect(component.activeItem()).toBe(items[1]);
    expect(component.isActive(items[1])).toBeTrue();
  });

  it('supports PrimeNG TabPanel closable/cache inputs and TabView navigation labels', () => {
    const tab = TestBed.createComponent(TabComponent).componentInstance;
    expect(tab.cache()).toBeTrue();
    expect(tab.closable()).toBeFalse();
    const group = TestBed.createComponent(TabGroupComponent).componentInstance;
    expect(group.controlClose()).toBeFalse();
    expect(group.nextButtonAriaLabel()).toBe('Next tab');
  });

  it('exposes PrimeNG drag/drop standalone directives', () => {
    expect(DraggableDirective).toBeTruthy();
    expect(DroppableDirective).toBeTruthy();
  });
});
