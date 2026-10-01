import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './p2/p2-form-components';
import { MultiSelectComponent as FocusedMultiSelectComponent } from './p2/p2-multi-select-component';
import { MultiSelectComponent as P2MultiSelectComponent } from '@ciag/orchestra/p2';
import { MultiSelectComponent as SecondaryMultiSelectComponent } from './multi-select';

describe('MultiSelect public contract', () => {
  it('preserves one component class across legacy, focused, p2, and secondary imports', () => {
    expect(MultiSelectComponent).toBe(FocusedMultiSelectComponent);
    expect(MultiSelectComponent).toBe(P2MultiSelectComponent);
    expect(MultiSelectComponent).toBe(SecondaryMultiSelectComponent);
  });

  let fixture: ComponentFixture<MultiSelectComponent<string>>;
  let component: MultiSelectComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MultiSelectComponent<string>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renders a clear control with an accessible fallback label', () => {
    component.select(component.options()[0]);
    fixture.componentRef.setInput('showClear', true);
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      'button.clear',
    ) as HTMLButtonElement;
    expect(clear).not.toBeNull();
    expect(clear.getAttribute('aria-label')).toBe('Clear selection');

    clear.click();
    expect(component.value()).toEqual([]);

    component.select(component.options()[0]);
    fixture.componentRef.setInput('clearAriaLabel', 'Remove all teams');
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector('button.clear') as HTMLButtonElement
      ).getAttribute('aria-label'),
    ).toBe('Remove all teams');
  });

  it('exposes the trigger as a labelled listbox combobox', () => {
    fixture.componentRef.setInput('label', 'Teams');
    component.open.set(true);
    component.activeIndex.set(0);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button.trigger',
    ) as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLUListElement;

    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.labels?.item(0)?.textContent?.trim()).toBe('Teams');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(
      fixture.nativeElement.querySelector('[role="option"]').id,
    );
  });

  it('honors membership and numeric filter match modes', () => {
    fixture.componentRef.setInput('filterMatchMode', 'in');
    component.filterValue.set('one, two');
    expect(component.filteredOptions().map((option) => option.label)).toEqual([
      'One',
      'Two',
    ]);

    fixture.componentRef.setInput('options', [
      { value: 'low', label: '10' },
      { value: 'high', label: '20' },
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'gte');
    component.filterValue.set('15');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'high',
    ]);
  });

  it('does not emit a selection change when selectionLimit blocks a new option', () => {
    fixture.componentRef.setInput('selectionLimit', 1);
    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    component.onChange.subscribe(changed);
    component.optionSelected.subscribe(selected);

    component.select(component.options()[0]);
    component.select(component.options()[1]);

    expect(component.value()).toEqual(['one']);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('can clear the select-all limit set after reaching selectionLimit', () => {
    fixture.componentRef.setInput('selectionLimit', 1);
    fixture.componentRef.setInput('selectAllLabel', 'Select all');
    fixture.componentRef.setInput('clearAllLabel', 'Clear all');
    component.open.set(true);
    fixture.detectChanges();

    const toggleAll = fixture.nativeElement.querySelector(
      'button.toggle-all',
    ) as HTMLButtonElement;
    expect(toggleAll.textContent?.trim()).toBe('Select all');

    toggleAll.click();
    fixture.detectChanges();
    expect(component.value()).toEqual(['one']);
    expect(toggleAll.textContent?.trim()).toBe('Clear all');

    toggleAll.click();
    expect(component.value()).toEqual([]);
  });

  it('exposes the disabled CVA state on every visible selection control', () => {
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('selectAllLabel', 'Select all');
    fixture.componentRef.setInput('filter', true);
    component.select(component.options()[0]);
    component.open.set(true);
    component.setDisabledState(true);
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      'button.clear',
    ) as HTMLButtonElement;
    const toggleAll = fixture.nativeElement.querySelector(
      'button.toggle-all',
    ) as HTMLButtonElement;
    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const option = fixture.nativeElement.querySelector(
      '[role="option"]',
    ) as HTMLLIElement;

    expect(clear.disabled).toBeTrue();
    expect(toggleAll.disabled).toBeTrue();
    expect(filter.disabled).toBeTrue();
    expect(option.getAttribute('aria-disabled')).toBe('true');
    expect(option.classList.contains('is-disabled')).toBeTrue();

    clear.click();
    toggleAll.click();
    option.click();
    expect(component.value()).toEqual(['one']);

    component.open.set(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      'button.trigger',
    ) as HTMLButtonElement;
    expect(trigger.disabled).toBeTrue();
    trigger.click();
    expect(component.open()).toBeFalse();
    expect(component.value()).toEqual(['one']);
  });

  it('applies trigger, panel, style, fluid, and placeholder inputs', () => {
    fixture.componentRef.setInput('placeholder', 'Choose teams');
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('styleClass', 'customer-select');
    fixture.componentRef.setInput('style', { width: '30rem' });
    fixture.componentRef.setInput('panelStyleClass', 'customer-panel');
    fixture.componentRef.setInput('panelStyle', { maxHeight: '8rem' });
    component.open.set(true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-multi-select',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      'button.trigger',
    ) as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector(
      '[role="listbox"]',
    ) as HTMLElement;
    expect(root.classList.contains('fluid')).toBeTrue();
    expect(root.classList.contains('customer-select')).toBeTrue();
    expect(root.style.width).toBe('30rem');
    expect(trigger.textContent).toContain('Choose teams');
    expect(panel.classList.contains('customer-panel')).toBeTrue();
    expect(panel.style.maxHeight).toBe('8rem');
  });

  it('maps option fields, disabled options, and object identity inputs', () => {
    const objectFixture = TestBed.createComponent(MultiSelectComponent<any>);
    const objectComponent = objectFixture.componentInstance;
    objectFixture.componentRef.setInput('options', [
      { key: 1, caption: 'Alpha', blocked: false },
      { key: 2, caption: 'Beta', blocked: true },
    ]);
    objectFixture.componentRef.setInput('optionValue', 'key');
    objectFixture.componentRef.setInput('optionLabel', 'caption');
    objectFixture.componentRef.setInput('optionDisabled', 'blocked');
    objectFixture.componentRef.setInput('dataKey', 'key');
    objectComponent.writeValue([1]);
    objectComponent.open.set(true);
    objectFixture.detectChanges();

    const options = objectFixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLElement>;
    expect(objectComponent.selectedLabels()).toBe('Alpha');
    expect(options[0].textContent).toContain('Alpha');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-disabled')).toBe('true');
    options[1].click();
    expect(objectComponent.value()).toEqual([1]);
    objectComponent.select({
      key: 1,
      caption: 'Alpha copy',
      blocked: false,
    } as any);
    expect(objectComponent.value()).toEqual([]);
    objectFixture.destroy();

    const identityFixture = TestBed.createComponent(MultiSelectComponent<any>);
    const identityComponent = identityFixture.componentInstance;
    identityFixture.componentRef.setInput('options', [
      { value: { id: 1 }, label: 'Alpha' },
    ]);
    identityFixture.componentRef.setInput('dataKey', 'id');
    identityComponent.writeValue([{ id: 1 }]);
    expect(
      identityComponent.isSelected(identityComponent.options()[0]),
    ).toBeTrue();
    identityComponent.select(identityComponent.options()[0]);
    expect(identityComponent.value()).toEqual([]);
    identityFixture.destroy();
  });

  it('renders accessible trigger and filter labels and emits focus, blur, and filter events', () => {
    fixture.componentRef.setInput('inputId', 'team-picker');
    fixture.componentRef.setInput('ariaLabel', 'Team chooser');
    fixture.componentRef.setInput('ariaLabelledBy', 'team-caption');
    fixture.componentRef.setInput('tabindex', 3);
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('ariaFilterLabel', 'Filter teams');
    fixture.componentRef.setInput('filterPlaceholder', 'Type a team');
    component.open.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button.trigger',
    ) as HTMLButtonElement;
    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const focused = jasmine.createSpy('focused');
    const blurred = jasmine.createSpy('blurred');
    const filtered = jasmine.createSpy('filtered');
    component.onFocus.subscribe(focused);
    component.onBlur.subscribe(blurred);
    component.onFilter.subscribe(filtered);

    expect(trigger.id).toBe('team-picker');
    expect(trigger.getAttribute('aria-label')).toBe('Team chooser');
    expect(trigger.getAttribute('aria-labelledby')).toBe('team-caption');
    expect(trigger.tabIndex).toBe(3);
    expect(filter.getAttribute('aria-label')).toBe('Filter teams');
    expect(filter.placeholder).toBe('Type a team');
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));
    filter.value = 'Alpha';
    filter.dispatchEvent(new Event('input'));
    expect(focused).toHaveBeenCalledTimes(1);
    expect(blurred).toHaveBeenCalledTimes(1);
    expect(filtered).toHaveBeenCalledWith({
      originalEvent: jasmine.any(Event),
      filter: 'Alpha',
    });
    expect(component.filterValue()).toBe('Alpha');
  });

  it('honors filter fields, locale, empty states, and resetFilterOnHide', () => {
    fixture.componentRef.setInput('options', [
      { value: 'one', label: 'Istanbul', search: 'Turkey' },
      { value: 'two', label: 'Rome', search: 'Italy' },
    ]);
    fixture.componentRef.setInput('filterFields', ['search']);
    fixture.componentRef.setInput('filterLocale', 'en-US');
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('emptyFilterMessage', 'No matching team');
    fixture.componentRef.setInput('emptyMessage', 'No teams');
    fixture.componentRef.setInput('resetFilterOnHide', false);
    component.filterValue.set('unknown');
    component.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No matching team');
    component.filterValue.set('turkey');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'one',
    ]);
    component.filterValue.set('unknown');
    component.toggleOpen();
    expect(component.filterValue()).toBe('unknown');

    fixture.componentRef.setInput('filter', false);
    fixture.componentRef.setInput('options', []);
    component.filterValue.set('');
    component.open.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No teams');
  });

  it('filters through filterBy fields and applies the requested locale', () => {
    fixture.componentRef.setInput('options', [
      { value: 'one', label: 'Rome', category: 'Istanbul' },
      { value: 'two', label: 'Istanbul', category: 'Europe' },
    ]);
    fixture.componentRef.setInput('filterBy', 'label, category');
    component.filterValue.set('istanbul');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'one',
      'two',
    ]);

    fixture.componentRef.setInput('options', [
      { value: 'capital-i', label: 'Istanbul' },
    ]);
    fixture.componentRef.setInput('filterLocale', 'tr');
    component.filterValue.set('ı');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'capital-i',
    ]);
  });

  it('summarizes selected labels with the default and custom templates', () => {
    fixture.componentRef.setInput('maxSelectedLabels', 1);
    component.writeValue(['one', 'two']);
    expect(component.selectedLabels()).toBe('2 items selected');

    fixture.componentRef.setInput('selectedItemsLabel', '{0} teams selected');
    expect(component.selectedLabels()).toBe('2 teams selected');
  });

  it('exposes loading and header visibility behavior', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', 'Loading teams');
    fixture.componentRef.setInput('selectAllLabel', 'Select all');
    component.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading teams');
    expect(fixture.nativeElement.querySelector('[role="option"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('button.toggle-all'),
    ).not.toBeNull();

    fixture.componentRef.setInput('loadingMessage', undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading…');

    fixture.componentRef.setInput('showHeader', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button.toggle-all')).toBeNull();

    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('showToggleAll', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button.toggle-all')).toBeNull();
  });

  it('can autofocus the filter when the panel is shown', () => {
    fixture.componentRef.setInput('filter', true);
    fixture.componentRef.setInput('autofocusFilter', true);
    component.open.set(true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('input') as HTMLInputElement)
        .autofocus,
    ).toBeTrue();
  });

  it('emits model changes and panel lifecycle events while resetting keyboard state', () => {
    const panelShow = jasmine.createSpy('panelShow');
    const panelHide = jasmine.createSpy('panelHide');
    component.onPanelShow.subscribe(panelShow);
    component.onPanelHide.subscribe(panelHide);
    component.filterValue.set('one');
    component.toggleOpen();
    component.activeIndex.set(1);
    component.toggleOpen();

    expect(panelShow).toHaveBeenCalledTimes(1);
    expect(panelHide).toHaveBeenCalledTimes(1);
    expect(component.filterValue()).toBe('');
    expect(component.activeIndex()).toBe(-1);
  });
});
