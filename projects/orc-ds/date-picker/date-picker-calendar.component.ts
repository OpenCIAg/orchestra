import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  calendarActiveDay,
  calendarDateKey,
  calendarLocalDate,
  calendarMonthGrid,
  calendarMonthKey,
  calendarMonthLabel,
  calendarMonthStart,
  calendarNavigateDay,
  calendarParseDate,
  calendarShiftMonth,
  calendarWeekRows,
  calendarWeekdayLabels,
} from '@ciag/orchestra/internal';

let nextCalendarId = 0;

@Component({
  selector: 'orc-date-picker-calendar',
  standalone: true,
  templateUrl: './date-picker-calendar.component.html',
  styleUrl: './date-picker-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerCalendarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  readonly titleId = `orc-calendar-title-${++nextCalendarId}`;
  readonly value = model('');
  readonly selectedValues = input<string[]>([]);
  readonly currentMonth = model(calendarMonthKey(new Date()));
  readonly min = input('');
  readonly max = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly disabledDates = input<Date[]>([]);
  readonly disabledDays = input<number[]>([]);
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly showOtherMonths = input(true, { transform: booleanAttribute });
  readonly selectOtherMonths = input(false, { transform: booleanAttribute });
  readonly showWeek = input(false, { transform: booleanAttribute });
  readonly embedded = input(false, { transform: booleanAttribute });
  readonly view = input<'date' | 'month' | 'year'>('date');
  readonly monthNavigator = input(false, { transform: booleanAttribute });
  readonly yearNavigator = input(false, { transform: booleanAttribute });
  readonly yearRange = input<string | undefined>();
  readonly locale = input<string>();
  readonly ariaLabel = input<string>();
  readonly previousMonthLabel = input<string>();
  readonly nextMonthLabel = input<string>();
  readonly weekLabel = input<string>();
  readonly monthOffset = input(0, { transform: numberAttribute });
  readonly dateSelected = output<string>();
  readonly viewDateChange = output<{ month: number; year: number }>();
  private readonly focusedDate = signal('');
  readonly effectiveLocale = computed(
    () => this.locale() || this.document.documentElement.lang || undefined,
  );
  readonly firstWeekday = computed(() =>
    Number.isFinite(this.firstDayOfWeek())
      ? ((Math.trunc(this.firstDayOfWeek()) % 7) + 7) % 7
      : 0,
  );
  readonly monthDate = computed(() => {
    const base = calendarParseDate(`${this.currentMonth()}-01`) ?? new Date();
    return calendarLocalDate(
      base.getFullYear(),
      base.getMonth() + 1 + this.monthOffset(),
      1,
    );
  });
  readonly monthLabel = computed(() =>
    calendarMonthLabel(this.monthDate(), this.effectiveLocale()),
  );
  readonly weekdayLabels = computed(() =>
    calendarWeekdayLabels(this.effectiveLocale(), this.firstWeekday()),
  );
  private readonly disabledKeys = computed(
    () => new Set(this.disabledDates().map(calendarDateKey)),
  );
  readonly days = computed(() =>
    calendarMonthGrid({
      month: this.monthDate(),
      firstDayOfWeek: this.firstWeekday(),
      labelLocale: this.effectiveLocale(),
      today: new Date(),
      weekNumbers: this.showWeek(),
      selectOtherMonths: this.selectOtherMonths(),
      isAllowed: (date) => this.isAllowed(date),
    }),
  );
  readonly weeks = computed(() => calendarWeekRows(this.days()));
  readonly activeDate = computed(() =>
    calendarActiveDay(
      this.days(),
      [this.focusedDate(), this.value(), calendarDateKey(new Date())],
      { showOtherMonths: this.showOtherMonths(), requireEnabled: false },
    ),
  );
  readonly months = computed(() =>
    Array.from({ length: 12 }, (_, index) => ({
      index,
      label: calendarLocalDate(2000, index + 1, 1).toLocaleDateString(
        this.effectiveLocale(),
        { month: 'long' },
      ),
      iso: calendarDateKey(
        calendarLocalDate(this.monthDate().getFullYear(), index + 1, 1),
      ),
    })),
  );
  readonly years = computed(() =>
    Array.from(
      { length: 12 },
      (_, index) => this.monthDate().getFullYear() - 5 + index,
    ),
  );
  readonly navigatorYears = computed(() => {
    const fallback = this.years();
    const range = this.yearRange()?.match(/^\s*(-?\d+)\s*:\s*(-?\d+)\s*$/);
    if (!range) return fallback;
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (!Number.isInteger(start) || !Number.isInteger(end)) return fallback;
    const first = Math.min(start, end);
    const last = Math.max(start, end);
    return Array.from(
      { length: Math.min(last - first + 1, 200) },
      (_, index) => first + index,
    );
  });
  readonly periods = computed(() =>
    (this.view() === 'month'
      ? this.months()
      : this.years().map((year) => ({
          label: String(year),
          iso: calendarDateKey(calendarLocalDate(year, 1, 1)),
        }))
    ).map((period) => ({
      ...period,
      selected: this.isSelected(period.iso),
      selection: this.periodSelection(period.iso),
    })),
  );
  readonly activePeriod = computed(
    () =>
      this.periods().find((period) => period.selected && period.selection)
        ?.iso ?? this.periods().find((period) => period.selection)?.iso,
  );
  readonly periodRows = computed(() =>
    Array.from({ length: 4 }, (_, index) =>
      this.periods().slice(index * 3, index * 3 + 3),
    ),
  );

  private isAllowed(date: Date): boolean {
    const key = calendarDateKey(date);
    return (
      !this.disabled() &&
      (!this.min() || key >= this.min()) &&
      (!this.max() || key <= this.max()) &&
      !this.disabledDays().includes(date.getDay()) &&
      !this.disabledKeys().has(key)
    );
  }

  private periodSelection(iso: string): string | null {
    const start = calendarParseDate(iso);
    if (!start || this.disabled()) return null;
    const end =
      this.view() === 'year'
        ? calendarLocalDate(start.getFullYear() + 1, 1, 1)
        : calendarLocalDate(start.getFullYear(), start.getMonth() + 2, 1);
    for (
      const day = new Date(start);
      day < end;
      day.setDate(day.getDate() + 1)
    ) {
      if (this.isAllowed(day)) return calendarDateKey(day);
    }
    return null;
  }

  isSelected(iso: string): boolean {
    const length =
      this.view() === 'month' ? 7 : this.view() === 'year' ? 4 : 10;
    return [...this.selectedValues(), this.value()].some(
      (value) => value && value.slice(0, length) === iso.slice(0, length),
    );
  }

  shift(delta: number): void {
    if (this.disabled()) return;
    const base =
      calendarParseDate(`${this.currentMonth()}-01`) ??
      calendarMonthStart(this.currentMonth());
    const step =
      this.view() === 'date' ? 1 : this.view() === 'month' ? 12 : 144;
    this.setMonth(calendarShiftMonth(base, delta * step));
  }

  private setMonth(date: Date): void {
    this.currentMonth.set(calendarMonthKey(date));
    this.viewDateChange.emit({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  selectMonth(event: Event): void {
    if (this.disabled()) return;
    const month = Number((event.target as HTMLSelectElement).value);
    if (!Number.isInteger(month) || month < 0 || month > 11) return;
    this.setMonth(
      calendarLocalDate(this.monthDate().getFullYear(), month + 1, 1),
    );
  }

  selectYear(event: Event): void {
    if (this.disabled()) return;
    const year = Number((event.target as HTMLSelectElement).value);
    if (!this.navigatorYears().includes(year)) return;
    this.setMonth(calendarLocalDate(year, this.monthDate().getMonth() + 1, 1));
  }

  select(iso: string): void {
    const date = calendarParseDate(iso);
    if (!date || this.disabled()) return;
    if (this.view() === 'date') {
      if (
        !this.isAllowed(date) ||
        (calendarMonthKey(date) !== calendarMonthKey(this.monthDate()) &&
          !this.selectOtherMonths())
      )
        return;
    } else {
      const selected = this.periodSelection(iso);
      if (!selected) return;
      iso = selected;
    }
    this.value.set(iso);
    this.dateSelected.emit(iso);
  }

  focusSelected(): void {
    this.host.nativeElement
      .querySelector<HTMLElement>('[data-active="true"]')
      ?.focus();
  }

  onDayKeydown(event: KeyboardEvent, iso: string): void {
    const current = calendarParseDate(iso);
    if (!current || this.disabled()) return;
    const next = calendarNavigateDay(
      current,
      event.key,
      event.shiftKey,
      this.firstWeekday(),
    );
    if (!next) return;
    event.preventDefault();
    this.focusedDate.set(calendarDateKey(next));
    if (calendarMonthKey(next) !== calendarMonthKey(this.monthDate()))
      this.setMonth(
        calendarLocalDate(
          next.getFullYear(),
          next.getMonth() + 1 - this.monthOffset(),
          1,
        ),
      );
    afterNextRender(() => this.focusSelected(), { injector: this.injector });
  }

  onPeriodKeydown(event: KeyboardEvent): void {
    const buttons = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.period-button:not(:disabled)',
      ),
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    const delta = (
      { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 } as Record<
        string,
        number
      >
    )[event.key];
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? buttons.length - 1
          : delta === undefined
            ? -1
            : Math.max(0, Math.min(buttons.length - 1, index + delta));
    if (next >= 0 && buttons[next]) {
      event.preventDefault();
      buttons.forEach((button, i) => (button.tabIndex = i === next ? 0 : -1));
      buttons[next].focus();
    }
  }
}
