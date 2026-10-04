import { TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';

describe('DatePickerComponent', () => {
  it('omits optional native attributes when they are not configured', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    expect(input.getAttribute('name')).toBeNull();
    expect(input.getAttribute('placeholder')).toBeNull();
  });

  it('uses only the library calendar trigger and does not render a native date input', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const control = fixture.nativeElement.querySelector(
      '.orc-date-picker__control',
    ) as HTMLElement;
    const trigger = control.querySelector(
      '.orc-date-picker__trigger',
    ) as HTMLButtonElement;

    expect(input.getAttribute('type')).toBe('text');
    expect(
      fixture.nativeElement.querySelector('input[type="date"]'),
    ).toBeNull();
    expect(control.querySelectorAll('button')).toHaveSize(1);
    expect(trigger.querySelector('svg')).not.toBeNull();
    expect(trigger.textContent?.trim()).toBe('');
  });

  it('renders configured Today and Clear actions inside an anchored overlay panel', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('todayLabel', 'Today');
    fixture.componentRef.setInput('clearLabel', 'Clear');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentInstance.show();
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector(
      '.orc-date-picker__anchor',
    ) as HTMLElement;
    const panel = fixture.nativeElement.querySelector(
      '.orc-date-picker__panel',
    ) as HTMLElement;
    const control = fixture.nativeElement.querySelector(
      '.orc-date-picker__control',
    ) as HTMLElement;
    const actions = Array.from(
      panel.querySelectorAll<HTMLButtonElement>(
        '.orc-date-picker__buttonbar button',
      ),
    );

    expect(panel.parentElement).toBe(anchor);
    expect(panel.matches(':popover-open')).toBeTrue();
    expect(control.querySelectorAll('button')).toHaveSize(1);
    expect(actions.map((button) => button.textContent?.trim())).toEqual([
      'Today',
      'Clear',
    ]);

    actions[1].click();
    expect(fixture.componentInstance.value()).toBe('');
  });

  it('keeps a configured standalone Clear action in the panel instead of beside the input', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('clearLabel', 'Clear');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentInstance.show();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.orc-date-picker__control button'),
    ).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('.orc-date-picker__buttonbar button')
        ?.textContent?.trim(),
    ).toBe('Clear');
  });

  it('renders requested actions with usable default labels and names the icon trigger', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentInstance.show();
    fixture.detectChanges();

    const actions = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.orc-date-picker__buttonbar button',
      ),
    ) as HTMLButtonElement[];
    expect(actions.map((button) => button.textContent?.trim())).toEqual([
      'Today',
      'Clear',
    ]);
    expect(
      fixture.nativeElement
        .querySelector('.orc-date-picker__trigger')
        ?.getAttribute('aria-label'),
    ).toBe('Choose date');
    actions[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');
    expect(actions[1].disabled).toBeTrue();
  });

  it('closes the overlay and emits the outside event only for clicks outside the component', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const outside = jasmine.createSpy('outside');
    fixture.componentInstance.onClickOutside.subscribe(outside);
    fixture.componentInstance.show();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    fixture.componentInstance.onDocumentClick({
      target: input,
    } as unknown as MouseEvent);
    expect(fixture.componentInstance.overlayVisible()).toBeTrue();

    fixture.componentInstance.onDocumentClick({
      target: document.body,
    } as unknown as MouseEvent);
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    expect(outside).toHaveBeenCalledTimes(1);
  });

  it('closes on a real document click outside the rendered date-time panel', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const component = fixture.componentInstance;
    const outside = jasmine.createSpy('outside');
    component.onClickOutside.subscribe(outside);
    fixture.componentRef.setInput('showTime', true);
    component.show();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.orc-date-picker__panel'),
    ).not.toBeNull();
    expect(component.overlayVisible()).toBeTrue();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.overlayVisible()).toBeFalse();
    expect(outside).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('keeps an ISO model while formatting and parsing the visible date', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('dateFormat', 'dd/mm/yy');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.value).toBe('26/08/2026');

    input.value = '27/08/2026';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('2026-08-27');
  });

  it('passes the public month view through to the calendar and selects a valid month', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('view', 'month');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentInstance.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.month-grid')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.days')).toBeNull();

    const monthButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.month-grid .period-button'),
    ) as HTMLButtonElement[];
    const march = monthButtons.find(
      (button) => button.textContent?.trim() === 'March',
    );
    expect(march).not.toBeNull();
    march!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('2026-03-01');
  });

  it('applies filled and size presentation inputs to the native field', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-date-picker',
    ) as HTMLElement;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(root.classList).toContain('orc-date-picker--variant-filled');
    expect(root.classList).toContain('orc-date-picker--size-small');
    expect(getComputedStyle(input).minHeight).toBe('36px');
    expect(getComputedStyle(input).backgroundColor).toBe('rgb(247, 247, 247)');

    fixture.componentRef.setInput('variant', 'outlined');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(root.classList).toContain('orc-date-picker--variant-outlined');
    expect(root.classList).toContain('orc-date-picker--size-large');
    expect(getComputedStyle(input).minHeight).toBe('52px');
    expect(getComputedStyle(input).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('renders accessible month and bounded year navigators when requested', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('monthNavigator', true);
    fixture.componentRef.setInput('yearNavigator', true);
    fixture.componentRef.setInput('yearRange', '2028:2029');
    fixture.componentInstance.show();
    fixture.detectChanges();

    const month = fixture.nativeElement.querySelector(
      'select[aria-label="Select month"]',
    ) as HTMLSelectElement;
    const year = fixture.nativeElement.querySelector(
      'select[aria-label="Select year"]',
    ) as HTMLSelectElement;
    expect(month.options.length).toBe(12);
    expect(year.options.length).toBe(2);
    expect(Array.from(year.options).map((option) => option.value)).toEqual([
      '2028',
      '2029',
    ]);

    year.value = '2029';
    year.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    const calendar = fixture.nativeElement.querySelector(
      'orc-date-picker-calendar',
    ) as HTMLElement;
    expect(calendar.querySelector('strong')?.textContent).not.toContain('2026');
    expect(fixture.componentInstance.viewDate().getFullYear()).toBe(2029);
  });

  it('normalizes reversed year ranges and bounds malformed ranges to the default twelve years', () => {
    const reversed = TestBed.createComponent(DatePickerComponent);
    reversed.componentRef.setInput('value', '2026-08-26');
    reversed.componentRef.setInput('showOnFocus', false);
    reversed.componentRef.setInput('yearNavigator', true);
    reversed.componentRef.setInput('yearRange', '2029:2028');
    reversed.componentInstance.show();
    reversed.detectChanges();
    expect(
      (
        Array.from(
          reversed.nativeElement.querySelectorAll(
            'select[aria-label="Select year"] option',
          ),
        ) as HTMLOptionElement[]
      ).map((option) => option.value),
    ).toEqual(['2028', '2029']);

    const malformed = TestBed.createComponent(DatePickerComponent);
    malformed.componentRef.setInput('value', '2026-08-26');
    malformed.componentRef.setInput('showOnFocus', false);
    malformed.componentRef.setInput('yearNavigator', true);
    malformed.componentRef.setInput('yearRange', 'not-a-range');
    malformed.componentInstance.show();
    malformed.detectChanges();
    const options = Array.from(
      malformed.nativeElement.querySelectorAll(
        'select[aria-label="Select year"] option',
      ),
    ) as HTMLOptionElement[];
    expect(options.length).toBe(12);
    expect(
      options.every((option) => option.value.trim().length > 0),
    ).toBeTrue();
    expect(options[0].value).toBe('2021');
    expect(options[11].value).toBe('2032');
  });

  it('binds input, description, style, and overlay accessibility inputs', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('label', 'Appointment');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('autofocus', true);
    fixture.componentRef.setInput('placeholder', 'Choose a day');
    fixture.componentRef.setInput('name', 'appointmentDate');
    fixture.componentRef.setInput('inputId', 'appointment-date');
    fixture.componentRef.setInput('tabindex', 3);
    fixture.componentRef.setInput('ariaLabel', 'Appointment date');
    fixture.componentRef.setInput('ariaLabelledBy', 'appointment-heading');
    fixture.componentRef.setInput('helperText', 'Dates are local');
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('styleClass', 'host-class');
    fixture.componentRef.setInput('style', { color: 'rgb(1, 2, 3)' });
    fixture.componentRef.setInput('inputStyleClass', 'field-class');
    fixture.componentRef.setInput('inputStyle', { width: '240px' });
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('icon', 'custom-calendar');
    fixture.componentRef.setInput('iconAriaLabel', 'Open appointment calendar');
    fixture.componentRef.setInput('baseZIndex', 230);
    fixture.componentRef.setInput('autoZIndex', false);
    fixture.componentRef.setInput('panelAriaLabel', 'Choose appointment day');
    fixture.componentRef.setInput('panelStyleClass', 'panel-class');
    fixture.componentRef.setInput('panelStyle', { maxWidth: '310px' });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const root = fixture.nativeElement.querySelector(
      '.orc-date-picker',
    ) as HTMLElement;
    expect(input.id).toBe('appointment-date');
    expect(input.name).toBe('appointmentDate');
    expect(input.placeholder).toBe('Choose a day');
    expect(input.required).toBeTrue();
    expect(input.autofocus).toBeTrue();
    expect(input.tabIndex).toBe(3);
    expect(input.getAttribute('aria-label')).toBe('Appointment date');
    expect(input.getAttribute('aria-labelledby')).toBe('appointment-heading');
    expect(input.getAttribute('aria-describedby')).toBe(
      'appointment-date-help',
    );
    expect(
      fixture.nativeElement.querySelector('label[for="appointment-date"]')
        ?.textContent,
    ).toContain('Appointment');
    expect(root.classList).toContain('host-class');
    expect(root.classList).toContain('orc-date-picker--fluid');
    expect(input.classList).toContain('field-class');
    expect(input.style.width).toBe('240px');
    const trigger = fixture.nativeElement.querySelector(
      '.orc-date-picker__trigger',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe(
      'Open appointment calendar',
    );
    expect(trigger.querySelector('.custom-calendar')).not.toBeNull();
    expect(root.style.color).toBe('rgb(1, 2, 3)');

    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '.orc-date-picker__panel',
    ) as HTMLElement;
    expect(panel.classList).toContain('panel-class');
    expect(panel.style.maxWidth).toBe('310px');
    expect(panel.style.zIndex).toBe('230');
    expect(panel.getAttribute('aria-label')).toBe('Choose appointment day');
    expect(panel.getAttribute('aria-labelledby')).toBe('appointment-heading');
    fixture.componentRef.setInput('autoZIndex', true);
    fixture.detectChanges();
    expect(panel.style.zIndex).toBe('1230');
    fixture.componentRef.setInput('error', 'Enter a valid date');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      'appointment-date-error',
    );
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')?.textContent,
    ).toContain('Enter a valid date');
    fixture.destroy();
  });

  it('applies DatePicker input constraints and preserves invalid text only when requested', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('dateFormat', 'dd/mm/yy');
    fixture.componentRef.setInput('minDate', new Date(2026, 7, 10));
    fixture.componentRef.setInput('max', '2026-08-20');
    fixture.componentRef.setInput('disabledDates', [new Date(2026, 7, 17)]);
    fixture.componentRef.setInput('value', '2026-08-12');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.getAttribute('min')).toBe('2026-08-10');
    expect(input.getAttribute('max')).toBe('2026-08-20');
    input.value = '09/08/2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(picker.invalidInput()).toBeTrue();
    expect(picker.value()).toBe('2026-08-12');
    input.value = '21/08/2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(picker.invalidInput()).toBeTrue();
    fixture.componentRef.setInput('max', '');
    fixture.componentRef.setInput('maxDate', new Date(2026, 7, 20));
    input.value = '21/08/2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(picker.invalidInput()).toBeTrue();

    fixture.componentRef.setInput('keepInvalid', true);
    input.value = 'bad date';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(picker.invalidInput()).toBeTrue();
    expect(picker.value()).toBe('bad date');
    fixture.destroy();
  });

  it('honors focus, read-only, multiple-count, separator, and dismissal configuration', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('focusOnShow', false);
    fixture.componentRef.setInput('readonlyInput', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.focus();
    fixture.detectChanges();
    expect(picker.overlayVisible()).toBeFalse();
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(picker.overlayVisible()).toBeTrue();
    expect(document.activeElement).toBe(input);
    input.value = '2026-08-17';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(picker.value()).toBe('');

    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('multipleSeparator', ' / ');
    fixture.componentRef.setInput('maxDateCount', 2);
    fixture.componentRef.setInput('value', ['2026-08-17', '2026-08-18']);
    fixture.detectChanges();
    expect(input.value).toBe('08/17/2026 / 08/18/2026');
    picker.selectCalendarDate('2026-08-19');
    expect(picker.value()).toEqual(['2026-08-17', '2026-08-18']);

    fixture.componentRef.setInput('selectionMode', 'range');
    fixture.componentRef.setInput('rangeSeparator', ' through ');
    fixture.componentRef.setInput('value', ['2026-08-17', '2026-08-18']);
    fixture.detectChanges();
    expect(input.value).toBe('08/17/2026 through 08/18/2026');
    fixture.componentRef.setInput('selectionMode', 'single');
    fixture.componentRef.setInput('value', '2026-08-17');
    fixture.componentRef.setInput('hideOnDateTimeSelect', false);
    picker.show();
    fixture.detectChanges();
    picker.selectCalendarDate('2026-08-20');
    expect(picker.overlayVisible()).toBeTrue();
    fixture.componentRef.setInput('hideOnDateTimeSelect', true);
    picker.show();
    fixture.detectChanges();
    picker.selectCalendarDate('2026-08-21');
    expect(picker.overlayVisible()).toBeFalse();
    fixture.destroy();
  });

  it('passes locale, week, other-month, and localized action labels to live controls', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('locale', 'fr-FR');
    fixture.componentRef.setInput('firstDayOfWeek', 1);
    fixture.componentRef.setInput('showWeek', true);
    fixture.componentRef.setInput('showOtherMonths', false);
    fixture.componentRef.setInput('selectOtherMonths', true);
    fixture.componentRef.setInput('previousMonthLabel', 'Mois précédent');
    fixture.componentRef.setInput('nextMonthLabel', 'Mois suivant');
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('todayLabel', 'Aujourd’hui');
    fixture.componentRef.setInput('clearLabel', 'Effacer');
    fixture.componentRef.setInput('clearButtonStyleClass', 'clear-custom');
    fixture.componentRef.setInput('todayButtonStyleClass', 'today-custom');
    fixture.componentRef.setInput('value', '2026-08-17');
    fixture.componentInstance.show();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[aria-label="Mois précédent"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Mois suivant"]')).not.toBeNull();
    expect(host.querySelector('.week-heading')?.textContent).toContain('Week');
    expect(host.querySelectorAll('tbody .outside')).toHaveSize(0);
    const actions = Array.from(
      host.querySelectorAll('.orc-date-picker__buttonbar button'),
    ) as HTMLButtonElement[];
    expect(actions.map((button) => button.textContent?.trim())).toEqual([
      'Aujourd’hui',
      'Effacer',
    ]);
    expect(actions[0].classList).toContain('today-custom');
    expect(actions[1].classList).toContain('clear-custom');
    const weekdays = Array.from(host.querySelectorAll('.weekdays th')).map(
      (th) => th.textContent?.trim(),
    );
    expect(weekdays[1]?.toLowerCase()).toContain('lun');
    fixture.destroy();
  });

  it('keeps the public view models, initial-date precedence, and two-way visibility live', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('defaultDate', new Date(2025, 3, 8));
    fixture.componentRef.setInput('defaultViewDate', new Date(2027, 5, 2));
    fixture.detectChanges();
    expect(picker.viewMonth()).toBe('2027-06');
    fixture.componentRef.setInput('defaultViewDate', undefined);
    fixture.detectChanges();
    expect(picker.viewMonth()).toBe('2025-04');

    fixture.componentRef.setInput('viewDate', new Date(2028, 8, 1));
    fixture.detectChanges();
    expect(picker.viewMonth()).toBe('2028-09');
    fixture.componentRef.setInput('overlayVisible', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-date-picker__panel'),
    ).not.toBeNull();
    fixture.componentRef.setInput('overlayVisible', false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-date-picker__panel'),
    ).toBeNull();
    fixture.destroy();
  });

  it('uses custom time steps and labels and allows Tab to leave when focusTrap is false', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentRef.setInput('hourFormat', '12');
    fixture.componentRef.setInput('stepHour', 2);
    fixture.componentRef.setInput('stepMinute', 5);
    fixture.componentRef.setInput('stepSecond', 10);
    fixture.componentRef.setInput(
      'timePickerAriaLabel',
      'Heure du rendez-vous',
    );
    fixture.componentRef.setInput('nextHourLabel', 'Heure suivante');
    fixture.componentRef.setInput('previousHourLabel', 'Heure précédente');
    fixture.componentRef.setInput('nextMinuteLabel', 'Minute suivante');
    fixture.componentRef.setInput('previousMinuteLabel', 'Minute précédente');
    fixture.componentRef.setInput('nextSecondLabel', 'Seconde suivante');
    fixture.componentRef.setInput('previousSecondLabel', 'Seconde précédente');
    fixture.componentRef.setInput('toggleMeridiemLabel', 'Changer AM/PM');
    fixture.componentRef.setInput('focusTrap', false);
    fixture.componentRef.setInput('value', '2026-08-17T10:00:00');
    picker.show();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '.orc-date-picker__panel',
    ) as HTMLElement;
    expect(
      panel.querySelector('[aria-label="Heure du rendez-vous"]'),
    ).not.toBeNull();
    for (const label of [
      'Heure suivante',
      'Heure précédente',
      'Minute suivante',
      'Minute précédente',
      'Seconde suivante',
      'Seconde précédente',
      'Changer AM/PM',
    ]) {
      expect(panel.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
    }
    panel
      .querySelector<HTMLButtonElement>('[aria-label="Heure suivante"]')!
      .click();
    expect(picker.value()).toBe('2026-08-17T12:00:00');
    panel
      .querySelector<HTMLButtonElement>('[aria-label="Minute suivante"]')!
      .click();
    expect(picker.value()).toBe('2026-08-17T12:05:00');
    panel
      .querySelector<HTMLButtonElement>('[aria-label="Seconde suivante"]')!
      .click();
    expect(picker.value()).toBe('2026-08-17T12:05:10');
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    try {
      const tab = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      panel.dispatchEvent(tab);
      expect(tab.defaultPrevented).toBeFalse();
      expect(picker.overlayVisible()).toBeTrue();
    } finally {
      outside.remove();
      fixture.destroy();
    }
  });

  it('selects an enabled adjacent-month date when other-month selection is enabled', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('value', '2026-08-17');
    fixture.componentRef.setInput('showOtherMonths', true);
    fixture.componentRef.setInput('selectOtherMonths', true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const adjacent = fixture.nativeElement.querySelector(
      'button[data-date="2026-09-01"]',
    ) as HTMLButtonElement;
    expect(adjacent).not.toBeNull();
    expect(adjacent.disabled).toBeFalse();
    adjacent.click();
    expect(fixture.componentInstance.value()).toBe('2026-09-01');
    fixture.destroy();
  });

  it('round-trips the yy-mm-dd dateFormat through the visible input', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('dateFormat', 'yy-mm-dd');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.value).toBe('2026-08-26');

    input.value = '2026-08-27';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.value()).toBe('2026-08-27');
    expect(input.value).toBe('2026-08-27');
  });

  it('orders range bounds regardless of click order and reports onSelect', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    const selected: unknown[] = [];
    picker.onSelect.subscribe((value) => selected.push(value));
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('selectionMode', 'range');
    fixture.componentRef.setInput('value', ['2026-08-20']);
    picker.show();
    fixture.detectChanges();

    picker.selectCalendarDate('2026-08-15');
    expect(picker.value()).toEqual(['2026-08-15', '2026-08-20']);
    expect(selected).toEqual([['2026-08-15', '2026-08-20']]);

    picker.selectCalendarDate('2026-08-22');
    expect(picker.value()).toEqual(['2026-08-22']);
    expect(selected[selected.length - 1]).toEqual(['2026-08-22']);
  });

  it('emits onSelect with the typed model value from the input path', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    const selected: unknown[] = [];
    picker.onSelect.subscribe((value) => selected.push(value));
    fixture.componentRef.setInput('showOnFocus', false);
    fixture.componentRef.setInput('dataType', 'date');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '2026-08-26';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(selected).toHaveSize(1);
    expect(selected[0] instanceof Date).toBeTrue();
    expect((selected[0] as Date).getFullYear()).toBe(2026);
  });

  describe('embedded calendar day-cell constraint policy', () => {
    function openMarchPicker(bindings: {
      min?: string;
      max?: string;
      minDate?: Date;
      maxDate?: Date;
    }) {
      const fixture = TestBed.createComponent(DatePickerComponent);
      const picker = fixture.componentInstance;
      fixture.componentRef.setInput('showOnFocus', false);
      fixture.componentRef.setInput('value', '2026-03-10');
      picker.viewDate.set(new Date(2026, 2, 10));
      if (bindings.min) fixture.componentRef.setInput('min', bindings.min);
      if (bindings.max) fixture.componentRef.setInput('max', bindings.max);
      if (bindings.minDate)
        fixture.componentRef.setInput('minDate', bindings.minDate);
      if (bindings.maxDate)
        fixture.componentRef.setInput('maxDate', bindings.maxDate);
      picker.show();
      fixture.detectChanges();
      const day = (iso: string) =>
        fixture.nativeElement.querySelector(
          `orc-date-picker-calendar [data-date="${iso}"]`,
        ) as HTMLButtonElement;
      return { fixture, picker, day };
    }

    function expectDisabledDayPolicy(
      fixture: ReturnType<typeof openMarchPicker>['fixture'],
    ) {
      // Constrained and other-month days render as real DOM-disabled
      // buttons — not merely aria-disabled, focusable dead ends.
      for (const button of fixture.nativeElement.querySelectorAll(
        'orc-date-picker-calendar tbody .days button',
      ) as NodeListOf<HTMLButtonElement>) {
        if (button.classList.contains('unavailable')) {
          expect(button.disabled)
            .withContext(`data-date=${button.getAttribute('data-date')}`)
            .toBeTrue();
        }
        expect(button.getAttribute('aria-disabled')).toBeNull();
      }
      // Roving tab stops and the active day only ever land on enabled days.
      const active = fixture.nativeElement.querySelector(
        'orc-date-picker-calendar [data-active="true"]',
      ) as HTMLButtonElement;
      expect(active).not.toBeNull();
      expect(active.disabled).toBeFalse();
      for (const button of fixture.nativeElement.querySelectorAll(
        'orc-date-picker-calendar tbody .days button[tabindex="0"]',
      ) as NodeListOf<HTMLButtonElement>) {
        expect(button.disabled).toBeFalse();
      }
    }

    it('DOM-disables days outside ISO string min/max bounds', () => {
      const { fixture, picker, day } = openMarchPicker({
        min: '2026-03-05',
        max: '2026-03-25',
      });
      expect(day('2026-03-02').disabled).toBeTrue();
      expect(day('2026-03-30').disabled).toBeTrue();
      expect(day('2026-03-10').disabled).toBeFalse();
      expect(day('2026-03-02').classList.contains('unavailable')).toBeTrue();

      day('2026-03-02').click();
      fixture.detectChanges();
      expect(picker.value()).toBe('2026-03-10');
      expectDisabledDayPolicy(fixture);
      fixture.destroy();
    });

    it('DOM-disables days outside Date-object minDate/maxDate bounds', () => {
      const { fixture, day } = openMarchPicker({
        minDate: new Date(2026, 2, 5),
        maxDate: new Date(2026, 2, 25),
      });
      expect(day('2026-03-02').disabled).toBeTrue();
      expect(day('2026-03-30').disabled).toBeTrue();
      expect(day('2026-03-10').disabled).toBeFalse();
      expectDisabledDayPolicy(fixture);
      fixture.destroy();
    });
  });
});
