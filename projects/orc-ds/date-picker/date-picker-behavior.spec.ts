import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DatePickerComponent,
  DatePickerCalendarComponent,
} from './date-picker.component';
import {
  calendarDateKey,
  calendarIsoWeekNumber,
  calendarParseDate,
  calendarParseDateTime,
} from '@ciag/orchestra/internal';
import { axe, toHaveNoViolations } from 'jasmine-axe';
import { focusElement } from '../../../tools/quality/test-focus-events';

@Component({
  standalone: true,
  imports: [DatePickerComponent],
  template: `<div (click)="$event.stopPropagation()">
    <orc-date-picker label="Appointment" [showIcon]="true" /><button
      class="outside-target"
    >
      Outside
    </button>
  </div>`,
})
class OutsideClickHost {}

describe('Date picker browser behavior', () => {
  it('closes for actual outside clicks even when a consumer stops bubbling', () => {
    const host = TestBed.createComponent(OutsideClickHost);
    host.detectChanges();
    const picker = host.debugElement.query(By.directive(DatePickerComponent))
      .componentInstance as DatePickerComponent;
    const outside = jasmine.createSpy();
    picker.onClickOutside.subscribe(outside);
    picker.show();
    host.detectChanges();
    host.nativeElement.querySelector('.outside-target').click();
    host.detectChanges();
    expect(picker.overlayVisible()).toBeFalse();
    expect(outside).toHaveBeenCalledTimes(1);
    expect(
      host.nativeElement.querySelector('.orc-date-picker__panel'),
    ).toBeNull();
  });

  it('dismisses a DateTime popup from legacy outside mousedown and document Escape', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('value', '2026-08-17T13:20');
    fixture.componentInstance.show();
    fixture.detectChanges();

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();

    fixture.componentInstance.show();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    expect(document.activeElement).toBe(input);

    fixture.destroy();
  });

  it('keeps calendar navigation inside the popup and closes on keyboard focus leaving', () => {
    const host = TestBed.createComponent(OutsideClickHost);
    host.detectChanges();
    const picker = host.debugElement.query(By.directive(DatePickerComponent))
      .componentInstance as DatePickerComponent;
    picker.show();
    host.detectChanges();
    host.nativeElement
      .querySelector('orc-date-picker-calendar header button')
      .click();
    host.detectChanges();
    expect(picker.overlayVisible()).toBeTrue();
    focusElement(
      host.nativeElement.querySelector('.outside-target') as HTMLButtonElement,
    );
    host.detectChanges();
    expect(picker.overlayVisible()).toBeFalse();
  });

  it('handles Escape from the calendar and returns input focus without reopening', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    focusElement(input);
    fixture.detectChanges();
    const day = fixture.nativeElement.querySelector(
      '[data-active="true"]',
    ) as HTMLButtonElement;
    focusElement(day);
    day.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    expect(document.activeElement).toBe(input);
  });

  it('closes and cleans up interaction handlers when disabled or destroyed', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const outside = jasmine.createSpy();
    fixture.componentInstance.onClickOutside.subscribe(outside);
    fixture.componentInstance.show();
    fixture.detectChanges();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    fixture.destroy();
    document.body.click();
    expect(outside).not.toHaveBeenCalled();
  });

  it('opens at the selected month and synchronizes multiple displayed months', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('value', '2028-02-12');
    fixture.componentRef.setInput('numberOfMonths', 2);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const calendars = fixture.debugElement
      .queryAll(By.directive(DatePickerCalendarComponent))
      .map((item) => item.componentInstance as DatePickerCalendarComponent);
    expect(calendarDateKey(calendars[0].monthDate())).toBe('2028-02-01');
    expect(calendarDateKey(calendars[1].monthDate())).toBe('2028-03-01');
    calendars[1].shift(1);
    fixture.detectChanges();
    expect(calendarDateKey(calendars[0].monthDate())).toBe('2028-03-01');
    expect(calendarDateKey(calendars[1].monthDate())).toBe('2028-04-01');
  });

  for (const dataType of ['string', 'date'] as const) {
    it(`validates real dates and constraints for ${dataType} models`, () => {
      const fixture = TestBed.createComponent(DatePickerComponent);
      const picker = fixture.componentInstance;
      fixture.componentRef.setInput('dataType', dataType);
      fixture.componentRef.setInput('min', '2026-02-01');
      fixture.componentRef.setInput('disabledDays', [0]);
      const change = jasmine.createSpy();
      picker.registerOnChange(change);
      for (const value of ['2026-02-31', '2026-01-30', '2026-02-01'])
        picker.update({ target: { value } } as unknown as Event);
      expect(change).not.toHaveBeenCalled();
      expect(picker.invalidInput()).toBeTrue();
      picker.update({ target: { value: '2026-02-02' } } as unknown as Event);
      expect(change).toHaveBeenCalledTimes(1);
      expect(picker.invalidInput()).toBeFalse();
    });
  }

  it('rejects disabled direct selection and preserves time when selecting a new day', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('value', '2026-08-26T13:20');
    picker.selectCalendarDate('2026-08-27');
    expect(picker.value()).toBe('2026-08-27T13:20');
    fixture.componentRef.setInput('disabled', true);
    picker.selectCalendarDate('2026-08-28');
    picker.adjustTime('hour', 1);
    picker.today();
    expect(picker.value()).toBe('2026-08-27T13:20');
  });

  it('edits a time-only string and keeps Date output when initialized empty', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const picker = fixture.componentInstance;
    fixture.componentRef.setInput('timeOnly', true);
    fixture.componentRef.setInput('value', '13:20');
    picker.adjustTime('minute', 1);
    expect(picker.value()).toBe('13:21');
    fixture.componentRef.setInput('dataType', 'date');
    picker.writeValue(null);
    picker.adjustTime('hour', 1);
    expect(picker.value() instanceof Date).toBeTrue();
    expect(picker.value().getHours()).toBe(1);
  });

  it('provides named, associated controls and valid calendar semantics', async () => {
    jasmine.addMatchers(toHaveNoViolations);
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('label', 'Appointment');
    fixture.componentRef.setInput('helperText', 'Choose a date');
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(
      fixture.nativeElement.querySelector(
        '#' + input.getAttribute('aria-describedby'),
      )?.textContent,
    ).toContain('Choose a date');
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});

describe('Calendar dates and keyboard navigation', () => {
  it('keeps local dates and rejects rollover and invalid times', () => {
    expect(calendarDateKey(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
    expect(calendarParseDate('2026-02-29')).toBeNull();
    expect(calendarParseDate('2028-02-29')).not.toBeNull();
    expect(calendarParseDateTime('2026-01-01T25:00')).toBeNull();
    expect(calendarIsoWeekNumber(new Date(2021, 0, 1))).toBe(53);
  });

  it('retains all day cells when other months are hidden', () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    fixture.componentRef.setInput('currentMonth', '2026-02');
    fixture.componentRef.setInput('showOtherMonths', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody td').length).toBe(42);
    expect(fixture.nativeElement.querySelectorAll('tbody button').length).toBe(
      28,
    );
  });

  it('does not select unavailable months or years and honors disabled state', () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    const calendar = fixture.componentInstance;
    fixture.componentRef.setInput('currentMonth', '2026-01');
    fixture.componentRef.setInput('view', 'month');
    fixture.componentRef.setInput('min', '2026-03-15');
    fixture.componentRef.setInput('max', '2026-03-20');
    calendar.select('2026-01-01');
    expect(calendar.value()).toBe('');
    calendar.select('2026-03-01');
    expect(calendar.value()).toBe('2026-03-15');
    fixture.componentRef.setInput('view', 'year');
    calendar.select('2025-01-01');
    expect(calendar.value()).toBe('2026-03-15');
    fixture.componentRef.setInput('disabled', true);
    calendar.select('2026-01-01');
    expect(calendar.value()).toBe('2026-03-15');
  });

  it('moves day focus across a month boundary with one calendar tab stop', async () => {
    const fixture = TestBed.createComponent(DatePickerCalendarComponent);
    fixture.componentRef.setInput('currentMonth', '2026-01');
    fixture.componentRef.setInput('value', '2026-01-31');
    fixture.detectChanges();
    const active = fixture.nativeElement.querySelector(
      '[data-active="true"]',
    ) as HTMLButtonElement;
    active.focus();
    active.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.currentMonth()).toBe('2026-02');
    expect(document.activeElement?.getAttribute('data-date')).toBe(
      '2026-02-01',
    );
    expect(
      fixture.nativeElement.querySelectorAll('tbody button[tabindex="0"]')
        .length,
    ).toBe(1);
  });
});
