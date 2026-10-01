import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { OptionComponent } from './option.component';
import { SelectComponent } from './select.component';

@Component({
  standalone: true,
  imports: [SelectComponent, OptionComponent],
  template: `<orc-select
    [autoOptionFocus]="autoOptionFocus"
    [focusOnHover]="focusOnHover()"
  >
    <orc-option value="a">Alpha</orc-option>
    <orc-option value="b">Beta</orc-option>
  </orc-select>`,
})
class ProjectedFocusHost {
  autoOptionFocus = true;
  readonly focusOnHover = signal(false);
}

describe('Select public input contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OverlayModule,
        SelectComponent,
        OptionComponent,
        ProjectedFocusHost,
      ],
    }).compileComponents();
  });

  const create = (
    inputs: Record<string, unknown> = {},
  ): ComponentFixture<SelectComponent> => {
    const fixture = TestBed.createComponent(SelectComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  };

  const openListbox = (fixture: ComponentFixture<SelectComponent>) => {
    const component = fixture.componentInstance;
    component.openPanel();
    fixture.detectChanges();
    return document.getElementById(component.listboxId())!;
  };

  it('applies identity, field, accessibility, and appearance inputs to the host', () => {
    const fixture = create({
      id: 'country',
      inputId: 'country-fallback',
      name: 'country',
      placeholder: 'Choose a country',
      label: 'Country',
      helperText: 'Select one value',
      errorMessage: 'Country is required',
      status: 'error',
      required: true,
      tabindex: 4,
      ariaLabel: '  Choose a country  ',
      ariaLabelledBy: ' external-country-label ',
      ariaDescribedby: ' external-description ',
      style: { marginTop: '5px' },
      styleClass: 'consumer-select',
      variant: 'filled',
      size: 'large',
      fluid: true,
      autofocus: true,
      dropdownIcon: 'chevron',
    });
    const component = fixture.componentInstance;
    const wrapper = fixture.nativeElement.querySelector(
      '.orc-select-wrapper',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;

    expect(component.effectiveId()).toBe('country');
    expect(trigger.id).toBe('country');
    expect(trigger.getAttribute('name')).toBeNull();
    expect(trigger.textContent).toContain('Choose a country');
    expect(trigger.getAttribute('tabindex')).toBe('4');
    expect(trigger.getAttribute('aria-required')).toBe('true');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-label')).toBe('Choose a country');
    expect(trigger.getAttribute('aria-labelledby')).toBe(
      'external-country-label',
    );
    expect(trigger.getAttribute('aria-describedby')).toBe(
      'external-description country-error',
    );
    expect(wrapper.classList.contains('consumer-select')).toBeTrue();
    expect(wrapper.classList.contains('is-fluid')).toBeTrue();
    expect(wrapper.style.marginTop).toBe('5px');
    expect(trigger.classList.contains('is-filled')).toBeTrue();
    expect(trigger.classList.contains('is-large')).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.orc-select-arrow')?.textContent,
    ).toContain('chevron');
    expect(document.activeElement).toBe(trigger);

    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('ariaLabelledBy', '   ');
    fixture.componentRef.setInput('ariaDescribedby', '   ');
    fixture.componentRef.setInput('id', '');
    fixture.detectChanges();
    expect(trigger.id).toBe('country-fallback');
    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(trigger.getAttribute('aria-labelledby')).toBe(component.labelId());
    expect(trigger.getAttribute('aria-describedby')).toBe(component.errorId());
    fixture.componentRef.setInput('status', 'default');
    fixture.componentRef.setInput('errorMessage', '');
    fixture.componentRef.setInput('ariaDescribedby', ' help-description ');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-invalid')).toBe('false');
    expect(trigger.getAttribute('aria-describedby')).toBe(
      'help-description ' + component.helperId(),
    );
  });

  it('uses the configured filter name, placeholder, length, field names, and output payloads', () => {
    const fixture = create({
      options: [
        { label: 'Işık', name: 'Işık', code: 'TR' },
        { label: 'İzmir', name: 'İzmir', code: '35' },
      ],
      filter: true,
      filterPlaceholder: '   ',
      searchPlaceholder: '  Search countries  ',
      filterLocale: 'tr-TR',
      filterBy: 'name, code',
      filterFields: ['name'],
      maxlength: 12,
      ariaFilterLabel: '   ',
    });
    const component = fixture.componentInstance;
    const searchChange = jasmine.createSpy('searchChange');
    const onFilter = jasmine.createSpy('onFilter');
    component.searchChange.subscribe(searchChange);
    component.onFilter.subscribe(onFilter);
    const listbox = openListbox(fixture);
    const search = listbox.querySelector(
      '.orc-select-search-input',
    ) as HTMLInputElement;

    expect(search.placeholder).toBe('Search countries');
    expect(search.maxLength).toBe(12);
    expect(search.getAttribute('aria-label')).toBe('Filter options');

    search.value = 'ışık';
    const event = new Event('input', { bubbles: true });
    search.dispatchEvent(event);
    fixture.detectChanges();
    expect(
      component.filteredDataOptions().map((option) => option.label),
    ).toEqual(['Işık']);
    expect(searchChange).toHaveBeenCalledOnceWith('ışık');
    expect(onFilter).toHaveBeenCalledOnceWith({
      originalEvent: event,
      filter: 'ışık',
    });

    fixture.componentRef.setInput('filterFields', undefined);
    component.searchTerm.set('TR');
    fixture.detectChanges();
    expect(
      component.filteredDataOptions().map((option) => option.label),
    ).toEqual(['Işık']);

    fixture.componentRef.setInput('filterPlaceholder', ' Find by city ');
    fixture.componentRef.setInput('ariaFilterLabel', ' Search cities ');
    fixture.detectChanges();
    expect(search.placeholder).toBe('Find by city');
    expect(search.getAttribute('aria-label')).toBe('Search cities');
  });

  it('submits scalar and multiple values through native hidden form fields', () => {
    const fixture = create({
      name: 'city',
      options: [
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ],
      multiple: true,
      value: ['a', 'b'],
    });
    const form = document.createElement('form');
    document.body.appendChild(form);
    form.appendChild(fixture.nativeElement);
    const formData = () => new FormData(form);

    expect(formData().getAll('city')).toEqual(['a', 'b']);
    expect(
      fixture.nativeElement.querySelectorAll(
        'input.orc-select__form-value[type="hidden"]',
      ).length,
    ).toBe(2);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(formData().getAll('city')).toEqual([]);

    fixture.componentRef.setInput('disabled', false);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(formData().getAll('city')).toEqual([]);

    fixture.componentInstance.setDisabledState(false);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(formData().getAll('city')).toEqual(['a', 'b']);
    fixture.destroy();
    form.remove();

    const singleFixture = create({
      name: 'singleCity',
      options: [{ label: 'Beta', value: 'b' }],
      value: 'b',
    });
    const singleForm = document.createElement('form');
    singleForm.appendChild(singleFixture.nativeElement);
    expect(new FormData(singleForm).getAll('singleCity')).toEqual(['b']);
    singleFixture.destroy();
    singleForm.remove();
  });

  it('applies each supported filter match mode to the displayed options', () => {
    const fixture = create({
      options: [
        { label: '2', value: 2 },
        { label: '10', value: 10 },
        { label: '20', value: 20 },
      ],
      filter: true,
    });
    const component = fixture.componentInstance;
    const cases = [
      ['contains', '0', ['10', '20']],
      ['startsWith', '1', ['10']],
      ['endsWith', '0', ['10', '20']],
      ['equals', '10', ['10']],
      ['notEquals', '10', ['2', '20']],
      ['in', '2, 20', ['2', '20']],
      ['lt', '10', ['2']],
      ['lte', '10', ['2', '10']],
      ['gt', '10', ['20']],
      ['gte', '10', ['10', '20']],
    ] as const;

    for (const [mode, query, expected] of cases) {
      fixture.componentRef.setInput('filterMatchMode', mode);
      component.searchTerm.set(query);
      fixture.detectChanges();
      expect(component.filteredDataOptions().map((option) => option.label))
        .withContext(`${mode} ${query}`)
        .toEqual(expected);
    }
  });

  it('maps custom option label/value/disabled fields and preserves keyed multiple values', () => {
    const fixture = create({
      name: 'records',
      options: [
        { code: 'a', caption: 'Alpha', locked: false },
        { code: 'b', caption: 'Beta', locked: true },
        { code: 'c', caption: 'Gamma', locked: false },
      ],
      optionLabel: 'caption',
      optionValue: 'code',
      optionDisabled: 'locked',
      dataKey: 'code',
      multiple: true,
      value: [{ code: 'a' }],
    });
    const component = fixture.componentInstance;
    const form = document.createElement('form');
    form.appendChild(fixture.nativeElement);
    expect(component.selectedItems().map((item) => item.label)).toEqual([
      'Alpha',
    ]);
    expect(new FormData(form).getAll('records')).toEqual(['a']);
    const listbox = openListbox(fixture);
    const options = Array.from(
      listbox.querySelectorAll('[role="option"]'),
    ) as HTMLElement[];
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
    expect(options[1].getAttribute('aria-disabled')).toBe('true');

    options[1].click();
    expect(component.value()).toEqual([{ code: 'a' }]);
    options[2].click();
    fixture.detectChanges();
    expect(component.value()).toEqual([{ code: 'a' }, 'c']);
    expect(new FormData(form).getAll('records')).toEqual(['a', 'c']);
    expect(component.selectedItems().map((item) => item.label)).toEqual([
      'Alpha',
      'Gamma',
    ]);
    fixture.destroy();
    form.remove();
  });

  it('trims trigger, filter, clear, and chip-removal labels and honors caller overrides', () => {
    const fixture = create({
      label: 'City',
      ariaLabel: '   ',
      ariaLabelledBy: '   ',
      ariaDescribedby: '   ',
      options: [{ label: 'Alpha', value: 'a' }],
      multiple: true,
      filter: true,
      value: ['a'],
      showClear: true,
      clearAriaLabel: '   ',
      removeOptionAriaLabel: '   ',
      ariaFilterLabel: '   ',
      filterPlaceholder: '   ',
    });
    const component = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    const clear = fixture.nativeElement.querySelector(
      '.orc-select-clear-btn',
    ) as HTMLButtonElement;
    const remove = fixture.nativeElement.querySelector(
      '.orc-chip-remove',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(trigger.getAttribute('aria-labelledby')).toBe(component.labelId());
    expect(trigger.hasAttribute('aria-describedby')).toBeFalse();
    expect(clear.getAttribute('aria-label')).toBe('Clear selection');
    expect(remove.getAttribute('aria-label')).toBe('Remove Alpha');

    const listbox = openListbox(fixture);
    const search = listbox.querySelector(
      '.orc-select-search-input',
    ) as HTMLInputElement;
    expect(search.getAttribute('aria-label')).toBe('Filter options');
    expect(search.hasAttribute('placeholder')).toBeFalse();

    fixture.componentRef.setInput('clearAriaLabel', '  Clear cities  ');
    fixture.componentRef.setInput('removeOptionAriaLabel', '  Remove city  ');
    fixture.componentRef.setInput('ariaFilterLabel', '  Filter cities  ');
    fixture.detectChanges();
    expect(clear.getAttribute('aria-label')).toBe('Clear cities');
    expect(remove.getAttribute('aria-label')).toBe('Remove city');
    expect(search.getAttribute('aria-label')).toBe('Filter cities');
  });

  it('honors panel attachment, class/style, size, and automatic z-index inputs', () => {
    const target = document.createElement('div');
    target.id = 'select-overlay-target';
    document.body.appendChild(target);
    const fixture = create({
      options: [{ label: 'Alpha', value: 'a' }],
      appendTo: target,
      panelStyleClass: 'consumer-panel',
      panelStyle: { minWidth: '280px' },
      scrollHeight: '140px',
      autoZIndex: true,
      baseZIndex: 25,
    });
    const component = fixture.componentInstance;
    const listbox = openListbox(fixture);
    const pane = listbox.closest('.cdk-overlay-pane') as HTMLElement;
    const overlayHost = pane.parentElement as HTMLElement;

    expect(target.contains(listbox)).toBeTrue();
    expect(listbox.classList.contains('orc-select-dropdown')).toBeTrue();
    expect(listbox.classList.contains('consumer-panel')).toBeTrue();
    expect(listbox.style.minWidth).toBe('280px');
    expect(listbox.style.maxHeight).toBe('140px');
    expect(overlayHost.style.zIndex).toBe('1025');

    component.closePanel();
    fixture.componentRef.setInput('autoZIndex', false);
    fixture.detectChanges();
    openListbox(fixture);
    const paneWithoutAutoZIndex = document
      .getElementById(component.listboxId())
      ?.closest('.cdk-overlay-pane') as HTMLElement;
    expect(paneWithoutAutoZIndex.parentElement?.style.zIndex).toBe('');
    component.closePanel();
    fixture.destroy();
    target.remove();
  });

  it('retains the filter only when requested and exposes both clear input names', () => {
    const fixture = create({
      options: [
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ],
      multiple: true,
      value: ['a', 'b'],
      filter: true,
      showClear: true,
      resetFilterOnHide: false,
    });
    const component = fixture.componentInstance;
    expect(
      fixture.nativeElement.querySelector('.orc-select-clear-btn'),
    ).not.toBeNull();
    component.openPanel();
    component.searchTerm.set('Beta');
    fixture.detectChanges();
    component.closePanel();
    expect(component.searchTerm()).toBe('Beta');

    fixture.componentRef.setInput('resetFilterOnHide', true);
    component.openPanel();
    component.searchTerm.set('Alpha');
    component.closePanel();
    fixture.detectChanges();
    expect(component.searchTerm()).toBe('');

    const clearableFixture = create({
      options: [{ label: 'Alpha', value: 'a' }],
      value: 'a',
      clearable: true,
    });
    expect(
      clearableFixture.nativeElement.querySelector('.orc-select-clear-btn'),
    ).not.toBeNull();
    clearableFixture.destroy();
  });

  it('renders default and caller-provided empty messages for search and unfiltered states', () => {
    const fixture = create({
      options: [],
      filter: true,
      emptyMessage: 'No cities available',
      searchEmptyText: 'No cities match this search',
    });
    const component = fixture.componentInstance;
    component.openPanel();
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector(
      '.orc-select-sr-only',
    ) as HTMLElement;
    expect(status.textContent).toContain('No cities available');

    component.searchTerm.set('missing');
    fixture.detectChanges();
    expect(status.textContent).toContain('No cities match this search');
    fixture.componentRef.setInput('emptyFilterMessage', 'No matching cities');
    fixture.detectChanges();
    expect(status.textContent).toContain('No matching cities');
  });

  it('autofocuses the trigger and emits the initial lazy range for either loading mode', () => {
    const autofocusFixture = create({ autofocus: true });
    const trigger = autofocusFixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    expect(document.activeElement).toBe(trigger);
    autofocusFixture.destroy();

    const fixture = create({
      options: [
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ],
      lazy: true,
    });
    const component = fixture.componentInstance;
    const lazyLoad = jasmine.createSpy('lazyLoad');
    component.onLazyLoad.subscribe(lazyLoad);
    component.openPanel();
    expect(lazyLoad).toHaveBeenCalledOnceWith({ first: 0, last: 1 });
    component.closePanel();
    fixture.componentRef.setInput('lazy', false);
    fixture.componentRef.setInput('virtualScroll', true);
    fixture.detectChanges();
    component.openPanel();
    expect(lazyLoad).toHaveBeenCalledTimes(2);
    expect(lazyLoad.calls.mostRecent().args[0]).toEqual({ first: 0, last: 1 });
  });

  it('starts on the first projected option when requested and ignores hover when disabled', () => {
    const fixture = TestBed.createComponent(ProjectedFocusHost);
    fixture.detectChanges();
    const select = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    select.openPanel();
    fixture.detectChanges();
    const optionElements = Array.from(
      document
        .getElementById(select.listboxId())!
        .querySelectorAll('orc-option'),
    ) as HTMLElement[];
    expect(select.activeOptionIndex()).toBe(0);
    optionElements[1].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(select.activeOptionIndex()).toBe(0);

    fixture.componentInstance.focusOnHover.set(true);
    fixture.detectChanges();
    expect(select.focusOnHover()).toBeTrue();
    optionElements[1].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(select.activeOptionIndex()).toBe(1);
  });

  it('does not open while readonly and closes an open panel when readonly becomes true', () => {
    const fixture = create({
      options: [{ label: 'Alpha', value: 'a' }],
      readonly: true,
    });
    const component = fixture.componentInstance;
    component.openPanel();
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(
      fixture.nativeElement
        .querySelector('[role="combobox"]')
        .getAttribute('aria-readonly'),
    ).toBe('true');

    fixture.componentRef.setInput('readonly', false);
    fixture.detectChanges();
    component.openPanel();
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
  });
});
