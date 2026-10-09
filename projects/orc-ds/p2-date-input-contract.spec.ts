import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CalendarComponent } from '@ciag/orchestra/calendar';
import { DateInputComponent } from '@ciag/orchestra/date-input';

@Component({
  standalone: true,
  imports: [CalendarComponent],
  template: `<orc-calendar
    showTime
    [currentMonth]="month()"
    [(value)]="value"
  />`,
})
class BoundDateTimeCalendarHost {
  readonly month = signal('2025-02');
  readonly value = signal<string | string[]>('2025-02-03T09:15');
}

@Component({
  standalone: true,
  imports: [CalendarComponent],
  template: `<orc-calendar
    [currentMonth]="month()"
    (currentMonthChange)="onMonthChange($event)"
    [value]="value()"
    (valueChange)="onValueChange($event)"
    [selectionMode]="selectionMode()"
  />`,
})
class CalendarModelOutputHost {
  readonly month = signal('2025-02');
  readonly value = signal<string | string[]>('');
  readonly selectionMode = signal<'single' | 'multiple' | 'range'>('single');
  readonly monthChanges: string[] = [];
  readonly valueChanges: Array<string | string[]> = [];

  onMonthChange(value: string): void {
    this.month.set(value);
    this.monthChanges.push(value);
  }

  onValueChange(value: string | string[]): void {
    this.value.set(value);
    this.valueChanges.push(value);
  }
}

describe('P2 Calendar and DateInput date contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalendarComponent,
        DateInputComponent,
        BoundDateTimeCalendarHost,
        CalendarModelOutputHost,
      ],
    }).compileComponents();
  });

  it('syncs a parent-bound date-time value into the editor before selecting a new day', async () => {
    const fixture = TestBed.createComponent(BoundDateTimeCalendarHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const component = fixture.debugElement.query(
      By.directive(CalendarComponent),
    ).componentInstance as CalendarComponent;

    host.value.set('2025-02-03T14:20');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const time = fixture.nativeElement.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    expect(component.timeValue()).toBe('14:20');
    expect(time.value).toBe('14:20');

    const nextDay = fixture.nativeElement.querySelector(
      '[aria-label="2025-02-05"]',
    ) as HTMLButtonElement;
    nextDay.click();
    fixture.detectChanges();

    expect(host.value()).toBe('2025-02-05T14:20');
    expect(component.value()).toBe('2025-02-05T14:20');
    fixture.destroy();
  });

  it('keeps date-only values date-only and normalizes Calendar date-time values with an editable time', () => {
    const dateOnly = TestBed.createComponent(CalendarComponent);
    dateOnly.componentInstance.writeValue('2025-02-03T14:20');
    expect(dateOnly.componentInstance.value()).toBe('2025-02-03');

    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('currentMonth', '2025-02');
    component.writeValue('2025-02-03T14:20:59');
    fixture.detectChanges();
    expect(component.value()).toBe('2025-02-03T14:20');
    expect(component.timeValue()).toBe('14:20');
    expect(
      (
        fixture.nativeElement.querySelector(
          'input[type="time"]',
        ) as HTMLInputElement
      ).value,
    ).toBe('14:20');

    let changed: string | string[] = '';
    const touched = jasmine.createSpy('touched');
    const selected = jasmine.createSpy('selected');
    component.registerOnChange((value) => (changed = value));
    component.registerOnTouched(touched);
    component.onSelect.subscribe(selected);
    const time = fixture.nativeElement.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    time.value = '15:45';
    time.dispatchEvent(new Event('input', { bubbles: true }));
    expect(component.value()).toBe('2025-02-03T15:45');
    expect(changed).toBe('2025-02-03T15:45');
    expect(touched).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledWith({ value: '2025-02-03T15:45' });
  });

  it('rejects invalid Calendar dates and emits the selected date-time through CVA and outputs', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('currentMonth', '2025-02');
    component.writeValue('2025-02-30T10:00');
    expect(component.value()).toBe('');

    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    component.registerOnChange(changed);
    component.dateSelected.subscribe(selected);
    component.writeValue('2025-02-03T10:00');
    component.selectDay(
      component.days().find((day) => day.iso === '2025-02-05')!,
    );
    expect(component.value()).toBe('2025-02-05T10:00');
    expect(changed).toHaveBeenCalledWith('2025-02-05T10:00');
    expect(selected).toHaveBeenCalledWith('2025-02-05T10:00');
  });

  it('applies Calendar constraints, locale, accessible labels and styling inputs', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput('currentMonth', '2025-02');
    fixture.componentRef.setInput('min', '2025-02-10');
    fixture.componentRef.setInput('max', '2025-02-20');
    fixture.componentRef.setInput('disabledDates', [new Date(2025, 1, 12)]);
    fixture.componentRef.setInput('disabledDays', [3]);
    fixture.componentRef.setInput('inputId', 'delivery-calendar');
    fixture.componentRef.setInput('styleClass', 'compact-calendar');
    fixture.componentRef.setInput('style', { width: '360px' });
    fixture.componentRef.setInput('ariaLabel', 'Delivery date');
    fixture.componentRef.setInput('locale', 'fr-FR');
    fixture.componentRef.setInput('previousMonthLabel', 'Mois précédent');
    fixture.componentRef.setInput('nextMonthLabel', 'Mois suivant');
    fixture.componentRef.setInput('showOtherMonths', true);
    fixture.componentRef.setInput('selectOtherMonths', true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('section') as HTMLElement;
    const grid = fixture.nativeElement.querySelector(
      '[role="grid"]',
    ) as HTMLElement;
    const weekdays = Array.from(
      fixture.nativeElement.querySelectorAll('.orc-p2-calendar__weekdays span'),
    ) as HTMLElement[];
    const button = (iso: string) =>
      fixture.nativeElement.querySelector(
        `[aria-label="${iso}"]`,
      ) as HTMLButtonElement;

    expect(root.classList.contains('compact-calendar')).toBeTrue();
    expect(root.style.width).toBe('360px');
    expect(root.getAttribute('aria-label')).toBe('Delivery date');
    expect(grid.id).toBe('delivery-calendar-grid');
    expect(grid.getAttribute('aria-label')).toContain('février');
    expect(weekdays[0].textContent?.trim()).toBe(
      new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(
        new Date(2021, 7, 2),
      ),
    );
    const firstWeek = fixture.nativeElement.querySelectorAll(
      '[role="grid"] [role="row"]',
    )[1] as HTMLElement;
    expect(
      firstWeek.children[5].querySelector('[aria-label="2025-02-01"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Mois précédent"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Mois suivant"]'),
    ).toBeTruthy();
    expect(button('2025-02-09').disabled).toBeTrue();
    expect(button('2025-02-10').disabled).toBeFalse();
    expect(button('2025-02-12').disabled).toBeTrue();
    expect(button('2025-02-19').disabled).toBeTrue();
    expect(button('2025-02-20').disabled).toBeFalse();
    expect(button('2025-02-21').disabled).toBeTrue();
  });

  it('preserves weekday alignment when other-month days are hidden', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput('currentMonth', '2025-02');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('showOtherMonths', false);
    fixture.detectChanges();

    const weeks = Array.from(
      fixture.nativeElement.querySelectorAll('[role="grid"] [role="row"]'),
    ) as HTMLElement[];
    const firstWeekCells = Array.from(weeks[1].children) as HTMLElement[];
    expect(weeks).toHaveSize(7);
    expect(firstWeekCells).toHaveSize(7);
    expect(
      firstWeekCells[0].querySelector('[aria-hidden="true"]'),
    ).toBeTruthy();
    expect(
      firstWeekCells[5].querySelector('[aria-hidden="true"]'),
    ).toBeTruthy();
    expect(
      firstWeekCells[6].querySelector('[aria-label="2025-02-01"]'),
    ).toBeTruthy();
  });

  it('provides roving calendar-grid keyboard navigation across dates and months', async () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentInstance.currentMonth.set('2025-02');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('showOtherMonths', false);
    fixture.detectChanges();

    const firstDate = fixture.nativeElement.querySelector(
      '[aria-label="2025-02-01"]',
    ) as HTMLButtonElement;
    const component = fixture.componentInstance;
    const keydown = spyOn(component, 'onDayKeydown').and.callThrough();
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    firstDate.focus();
    firstDate.dispatchEvent(keyEvent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(keydown).toHaveBeenCalled();
    expect(keyEvent.defaultPrevented).toBeTrue();

    const previousMonthDate = fixture.nativeElement.querySelector(
      '[aria-label="2025-01-31"]',
    ) as HTMLButtonElement;
    expect(previousMonthDate).toBeTruthy();
    expect(fixture.componentInstance.currentMonth()).toBe('2025-01');
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      previousMonthDate,
    );
    expect(previousMonthDate.tabIndex).toBe(0);
    expect(
      fixture.nativeElement.querySelectorAll(
        '[role="grid"] button[tabindex="0"]',
      ),
    ).toHaveSize(1);
  });

  it('supports calendar row/month keys and skips disabled dates', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    component.currentMonth.set('2025-02');
    fixture.componentRef.setInput('disabledDays', [1]);
    fixture.detectChanges();

    const press = (iso: string, key: string, altKey = false) => {
      const day = component.days().find((item) => item.iso === iso)!;
      const event = new KeyboardEvent('keydown', {
        key,
        altKey,
        cancelable: true,
      });
      component.onDayKeydown(event, day);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBeTrue();
      return component.activeDate();
    };

    expect(press('2025-02-02', 'ArrowRight')).toBe('2025-02-04');
    expect(press('2025-02-04', 'Home')).toBe('2025-02-02');
    expect(press('2025-02-02', 'End')).toBe('2025-02-08');
    expect(press('2025-02-01', 'ArrowDown')).toBe('2025-02-08');
    expect(press('2025-02-08', 'ArrowUp')).toBe('2025-02-01');
    expect(press('2025-02-08', 'PageUp')).toBe('2025-01-08');
    expect(component.currentMonth()).toBe('2025-01');
    expect(press('2025-01-08', 'PageDown')).toBe('2025-02-08');
    expect(press('2025-02-08', 'PageDown', true)).toBe('2026-02-08');
    expect(component.currentMonth()).toBe('2026-02');
    component.currentMonth.set('2026-03');
    fixture.detectChanges();
    expect(press('2026-03-31', 'PageUp')).toBe('2026-02-28');
  });

  it('selects visible other-month dates and updates the displayed month', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    component.currentMonth.set('2025-02');
    fixture.componentRef.setInput('showOtherMonths', true);
    fixture.detectChanges();

    const previousMonthDay = fixture.nativeElement.querySelector(
      '[aria-label="2025-01-31"]',
    ) as HTMLButtonElement;
    expect(previousMonthDay.disabled).toBeTrue();

    fixture.componentRef.setInput('selectOtherMonths', true);
    fixture.detectChanges();
    const selectablePreviousMonthDay = fixture.nativeElement.querySelector(
      '[aria-label="2025-01-31"]',
    ) as HTMLButtonElement;
    expect(selectablePreviousMonthDay.disabled).toBeFalse();
    const staleDay = component.days().find((day) => day.iso === '2025-01-31')!;
    fixture.componentRef.setInput('selectOtherMonths', false);
    fixture.detectChanges();
    component.selectDay(staleDay);
    expect(component.value()).toBe('');

    fixture.componentRef.setInput('selectOtherMonths', true);
    fixture.detectChanges();
    const currentPreviousMonthDay = fixture.nativeElement.querySelector(
      '[aria-label="2025-01-31"]',
    ) as HTMLButtonElement;
    currentPreviousMonthDay.click();
    fixture.detectChanges();

    expect(component.value()).toBe('2025-01-31');
    expect(component.currentMonth()).toBe('2025-01');
  });

  it('jumps to today from a distant month and reports the date-time outputs', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    const today = new Date();
    const distant = new Date(today);
    distant.setFullYear(today.getFullYear() - 5);
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const distantMonth = `${distant.getFullYear()}-${String(distant.getMonth() + 1).padStart(2, '0')}`;
    const iso = `${month}-${String(today.getDate()).padStart(2, '0')}`;
    component.currentMonth.set(
      distantMonth === month ? '2000-01' : distantMonth,
    );
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('todayLabel', 'Today');
    fixture.componentRef.setInput('clearLabel', 'Clear');
    fixture.detectChanges();

    const changed = jasmine.createSpy('changed');
    const touched = jasmine.createSpy('touched');
    const selected = jasmine.createSpy('selected');
    const todayClicked = jasmine.createSpy('todayClicked');
    const cleared = jasmine.createSpy('cleared');
    component.registerOnChange(changed);
    component.registerOnTouched(touched);
    component.dateSelected.subscribe(selected);
    component.onTodayClick.subscribe(todayClicked);
    component.onClear.subscribe(cleared);

    const time = fixture.nativeElement.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    expect(time).toBeTruthy();
    const todayButton = (
      Array.from(
        fixture.nativeElement.querySelectorAll('footer button'),
      ) as HTMLButtonElement[]
    ).find((button) => button.textContent?.trim() === 'Today')!;
    todayButton.click();
    fixture.detectChanges();

    expect(component.currentMonth()).toBe(month);
    expect(component.value()).toBe(`${iso}T${component.timeValue()}`);
    expect(changed).toHaveBeenCalledWith(component.value());
    expect(touched).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledWith(component.value());
    expect(todayClicked).toHaveBeenCalledWith(iso);

    const clearButton = (
      Array.from(
        fixture.nativeElement.querySelectorAll('footer button'),
      ) as HTMLButtonElement[]
    ).find((button) => button.textContent?.trim() === 'Clear')!;
    clearButton.click();
    expect(component.value()).toBe('');
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith('');
    expect(touched).toHaveBeenCalledTimes(2);
  });

  it('does not toggle today off when the Today action is used in multiple mode', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('todayLabel', 'Today');
    component.writeValue([iso]);
    component.currentMonth.set('2000-01');
    fixture.detectChanges();

    const todayClicked = jasmine.createSpy('todayClicked');
    component.onTodayClick.subscribe(todayClicked);
    (
      fixture.nativeElement.querySelector('footer button') as HTMLButtonElement
    ).click();

    expect(component.value()).toEqual([iso]);
    expect(todayClicked).toHaveBeenCalledWith(iso);
  });

  it('keeps disabled Calendar controls and stale direct selections inert', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('currentMonth', '2025-02');
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('todayLabel', 'Today');
    fixture.componentRef.setInput('clearLabel', 'Clear');
    fixture.detectChanges();
    const staleDay = component.days().find((day) => day.iso === '2025-02-05')!;
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.setDisabledState(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    const month = component.currentMonth();
    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    component.registerOnChange(changed);
    component.dateSelected.subscribe(selected);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBeTrue();
    component.nextMonth();
    component.selectDay(staleDay);
    component.clear();
    component.today();

    expect(component.currentMonth()).toBe(month);
    expect(component.value()).toBe('');
    expect(changed).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
  });

  it('marks the CVA touched only when focus leaves the whole Calendar', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentInstance.currentMonth.set('2025-02');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const touched = jasmine.createSpy('touched');
    component.registerOnTouched(touched);
    const day = fixture.nativeElement.querySelector(
      '[aria-label="2025-02-03"]',
    ) as HTMLButtonElement;
    const internalTarget = fixture.nativeElement.querySelector(
      '[aria-label="2025-02-04"]',
    ) as HTMLButtonElement;
    const externalTarget = document.createElement('button');

    day.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: internalTarget,
      }),
    );
    expect(touched).not.toHaveBeenCalled();

    day.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: externalTarget,
      }),
    );
    expect(touched).toHaveBeenCalledTimes(1);
    expect(component.value()).toBe('');
  });

  it('reports controlled multiple and range selections through models and outputs', () => {
    const fixture = TestBed.createComponent(CalendarModelOutputHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const component = fixture.debugElement.query(
      By.directive(CalendarComponent),
    ).componentInstance as CalendarComponent;
    host.selectionMode.set('multiple');
    fixture.detectChanges();

    const selected = jasmine.createSpy('selected');
    const selectedDate = jasmine.createSpy('selectedDate');
    const touched = jasmine.createSpy('touched');
    component.onSelect.subscribe(selected);
    component.dateSelected.subscribe(selectedDate);
    component.registerOnTouched(touched);
    component.selectDay(
      component.days().find((day) => day.iso === '2025-02-03')!,
    );
    component.selectDay(
      component.days().find((day) => day.iso === '2025-02-05')!,
    );

    expect(component.value()).toEqual(['2025-02-03', '2025-02-05']);
    expect(host.valueChanges).toEqual([
      ['2025-02-03'],
      ['2025-02-03', '2025-02-05'],
    ]);
    expect(selected).toHaveBeenCalledWith({
      value: ['2025-02-03', '2025-02-05'],
    });
    expect(selected).toHaveBeenCalledTimes(2);
    expect(selectedDate).toHaveBeenCalledWith('2025-02-05');
    expect(touched).toHaveBeenCalledTimes(2);

    component.nextMonth();
    fixture.detectChanges();
    expect(host.month()).toBe('2025-03');
    expect(host.monthChanges).toEqual(['2025-03']);

    const rangeFixture = TestBed.createComponent(CalendarComponent);
    const rangeComponent = rangeFixture.componentInstance;
    rangeFixture.componentRef.setInput('selectionMode', 'range');
    rangeComponent.writeValue('2025-02-03');
    rangeFixture.detectChanges();
    rangeComponent.selectDay(
      rangeComponent.days().find((day) => day.iso === '2025-02-01')!,
    );
    expect(rangeComponent.value()).toEqual(['2025-02-01', '2025-02-03']);

    const multipleFixture = TestBed.createComponent(CalendarComponent);
    const multipleComponent = multipleFixture.componentInstance;
    multipleFixture.componentRef.setInput('selectionMode', 'multiple');
    multipleComponent.writeValue('2025-02-03');
    multipleFixture.detectChanges();
    multipleComponent.selectDay(
      multipleComponent.days().find((day) => day.iso === '2025-02-03')!,
    );
    expect(multipleComponent.value()).toEqual([]);
  });

  it('keeps inline and dateFormat as deprecated ISO inline compatibility inputs', () => {
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('inline', false);
    fixture.componentRef.setInput('dateFormat', 'dd/mm/yy');
    fixture.componentRef.setInput('currentMonth', '2025-02');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('section')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Previous month"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Next month"]'),
    ).toBeTruthy();
    component.selectDay(
      component.days().find((day) => day.iso === '2025-02-03')!,
    );
    expect(component.value()).toBe('2025-02-03');
  });

  it('keeps DateInput native required and rejects date-time or invalid CVA/input values', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.required).toBeTrue();

    component.writeValue('2025-02-03T10:00');
    expect(component.value()).toBe('');
    component.writeValue('2025-02-03');
    expect(component.value()).toBe('2025-02-03');

    let changed = '';
    let touched = 0;
    component.registerOnChange((value) => (changed = value));
    component.registerOnTouched(() => (touched += 1));
    input.value = '2025-02-04';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(component.value()).toBe('2025-02-04');
    expect(changed).toBe('2025-02-04');
    expect(touched).toBe(1);

    input.value = '2025-02-30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(component.value()).toBe('');
    expect(changed).toBe('');
  });
});
