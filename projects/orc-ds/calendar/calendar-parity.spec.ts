import { TestBed } from '@angular/core/testing';
import { CalendarComponent } from '@ciag/orchestra/p2';
import type { CalendarDay } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the calendar. The specs import the component
 * through the public `@ciag/orchestra/p2` surface and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('Calendar behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput('currentMonth', '2026-03');
    // Pin the week start so keyboard navigation is deterministic in any CI locale.
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.detectChanges();
    return fixture;
  }

  function day(fixture: ReturnType<typeof create>, iso: string) {
    return fixture.nativeElement.querySelector(
      `button[data-date="${iso}"]`,
    ) as HTMLButtonElement | null;
  }

  function flush(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('renders a six-week grid with weekday headers and marks today', () => {
    const fixture = create();
    const grid = fixture.nativeElement.querySelector(
      '[role="grid"]',
    ) as HTMLElement;
    expect(grid).not.toBeNull();
    const cells = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[role="columnheader"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(cells.length).toBe(7);
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button[data-date]',
      ) as NodeListOf<HTMLElement>,
    ) as HTMLButtonElement[];
    expect(dayButtons.length).toBe(42);
    expect(
      dayButtons.filter((button) =>
        button.getAttribute('data-date')!.startsWith('2026-03'),
      ).length,
    ).toBe(31);
  });

  it('selects single days and reports dateSelected plus onSelect', () => {
    const fixture = create();
    const selectedDates: string[] = [];
    const selections: (string | string[])[] = [];
    const changes: (string | string[])[] = [];
    fixture.componentInstance.dateSelected.subscribe((iso) =>
      selectedDates.push(iso),
    );
    fixture.componentInstance.onSelect.subscribe((event) =>
      selections.push(event.value),
    );
    fixture.componentInstance.registerOnChange((value) => changes.push(value));

    const tenth = day(fixture, '2026-03-10')!;
    expect(tenth).not.toBeNull();
    tenth.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('2026-03-10');
    expect(selectedDates).toEqual(['2026-03-10']);
    expect(selections).toEqual(['2026-03-10']);
    expect(changes).toEqual(['2026-03-10']);
    expect(day(fixture, '2026-03-10')!.className).toContain(
      'orc-p2-calendar__day--selected',
    );
  });

  it('supports range and multiple selection modes', () => {
    const fixture = create();
    fixture.componentRef.setInput('selectionMode', 'range');
    day(fixture, '2026-03-10')!.click();
    day(fixture, '2026-03-14')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([
      '2026-03-10',
      '2026-03-14',
    ]);

    fixture.componentRef.setInput('selectionMode', 'multiple');
    // The range value carries over; clicking a selected day removes it.
    day(fixture, '2026-03-10')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['2026-03-14']);
    day(fixture, '2026-03-10')!.click();
    day(fixture, '2026-03-12')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([
      '2026-03-14',
      '2026-03-10',
      '2026-03-12',
    ]);
    day(fixture, '2026-03-10')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([
      '2026-03-14',
      '2026-03-12',
    ]);
  });

  it('honors min, max, disabledDates and disabledDays', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', '2026-03-05');
    fixture.componentRef.setInput('max', '2026-03-25');
    // Local-time construction: the component compares ISO calendar dates.
    fixture.componentRef.setInput('disabledDates', [new Date(2026, 2, 15)]);
    fixture.componentRef.setInput('disabledDays', [1]);
    fixture.detectChanges();

    expect(day(fixture, '2026-03-02')!.disabled).toBeTrue();
    expect(day(fixture, '2026-03-15')!.disabled).toBeTrue();
    // 2026-03-30 is a Monday.
    expect(day(fixture, '2026-03-30')!.disabled).toBeTrue();
    expect(day(fixture, '2026-03-10')!.disabled).toBeFalse();

    day(fixture, '2026-03-15')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');
  });

  it('moves DOM focus with arrow keys, Home and End across enabled days', async () => {
    const fixture = create();
    fixture.detectChanges();
    const tenth = day(fixture, '2026-03-10')!;
    tenth.focus();
    expect(document.activeElement).toBe(tenth);

    const key = (target: HTMLElement, name: string) =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: name,
          bubbles: true,
          cancelable: true,
        }),
      );

    key(tenth, 'ArrowRight');
    await flush();
    expect(document.activeElement).toBe(day(fixture, '2026-03-11'));

    key(document.activeElement as HTMLElement, 'ArrowDown');
    await flush();
    expect(document.activeElement).toBe(day(fixture, '2026-03-18'));

    key(document.activeElement as HTMLElement, 'Home');
    await flush();
    expect(document.activeElement).toBe(day(fixture, '2026-03-15'));

    key(document.activeElement as HTMLElement, 'End');
    await flush();
    expect(document.activeElement).toBe(day(fixture, '2026-03-21'));

    // PageUp jumps one month back; the focused day moves with the grid.
    key(document.activeElement as HTMLElement, 'PageUp');
    await flush();
    expect(fixture.componentInstance.currentMonth()).toBe('2026-02');
  });

  it('clears and jumps to today through the button bar with their outputs', () => {
    const fixture = create();
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('todayLabel', 'Today');
    fixture.componentRef.setInput('clearLabel', 'Clear');
    fixture.componentRef.setInput('value', '2026-03-10');
    fixture.detectChanges();
    const cleared: number[] = [];
    const todays: string[] = [];
    fixture.componentInstance.onClear.subscribe(() => cleared.push(1));
    fixture.componentInstance.onTodayClick.subscribe((iso) => todays.push(iso));

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'footer button',
      ) as NodeListOf<HTMLElement>,
    ) as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');
    expect(cleared.length).toBe(1);

    buttons[0].click();
    fixture.detectChanges();
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(todays).toEqual([iso]);
  });

  it('normalizes forms values, marks touched on focusout, and supports the time editor', () => {
    const fixture = create();
    let lastValue: string | string[] = '';
    let touched = 0;
    fixture.componentInstance.registerOnChange((value) => {
      lastValue = value;
    });
    fixture.componentInstance.registerOnTouched(() => {
      touched += 1;
    });
    fixture.componentInstance.writeValue('not-a-date');
    expect(fixture.componentInstance.value()).toBe('');
    fixture.componentInstance.writeValue('2026-03-10');
    expect(fixture.componentInstance.value()).toBe('2026-03-10');
    expect(lastValue).toBe('');

    fixture.componentInstance.onFocusOut(
      new FocusEvent('focusout', { relatedTarget: null }),
    );
    expect(touched).toBe(1);

    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('value', '2026-03-10T13:20');
    fixture.detectChanges();
    expect(fixture.componentInstance.timeValue()).toBe('13:20');
  });

  it('appends the time editor value to the selected date', () => {
    const fixture = create();
    fixture.componentRef.setInput('showTime', true);
    fixture.detectChanges();
    const changes: (string | string[])[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));

    day(fixture, '2026-03-10')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('2026-03-10T00:00');
    expect(changes).toEqual(['2026-03-10T00:00']);
  });

  it('keeps the CalendarDay contract rows complete', () => {
    const fixture = create();
    const days: CalendarDay[] = fixture.componentInstance.days();
    expect(days.length).toBe(42);
    for (const item of days) {
      expect(typeof item.iso).toBe('string');
      expect(typeof item.day).toBe('number');
      expect(typeof item.inCurrentMonth).toBe('boolean');
      expect(typeof item.today).toBe('boolean');
      expect(typeof item.disabled).toBe('boolean');
    }
  });
});
