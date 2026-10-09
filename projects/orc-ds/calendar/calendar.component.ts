import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CvaControl,
  ORC_SHARED_STYLES,
  calendarActiveDay,
  calendarDateKey,
  calendarLocaleFirstDay,
  calendarMonthGrid,
  calendarMonthKey,
  calendarMonthLabel,
  calendarMonthStart,
  calendarNavigateDay,
  calendarParseTime,
  calendarSelection,
  calendarShiftMonth,
  calendarWeekRows,
  calendarWeekdayLabels,
} from '@ciag/orchestra/internal';

let nextCalendarId = 0;

export interface CalendarDay {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
  today: boolean;
  disabled: boolean;
}

// The time editor accepts strict two-digit `HH:mm` values only.
const isIsoTime = (value: string): boolean =>
  /^(\d{2}):(\d{2})$/.test(value) && calendarParseTime(value) !== null;

@Component({
  selector: 'orc-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styles: [ORC_SHARED_STYLES],
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
})
export class CalendarComponent extends CvaControl {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-calendar-${++nextCalendarId}`;
  private readonly rovingDate = signal<string | null>(null);
  readonly value = model<string | string[]>('');
  readonly currentMonth = model(calendarMonthKey(new Date()));
  readonly min = input('');
  readonly max = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly previousMonthLabel = input<string | undefined>(undefined);
  readonly nextMonthLabel = input<string | undefined>(undefined);
  readonly todayLabel = input<string | undefined>(undefined);
  readonly clearLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; this implementation always renders inline. */
  readonly inline = input(true, { transform: booleanAttribute });
  readonly showTime = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; values always use ISO `yyyy-MM-dd` formatting. */
  readonly dateFormat = input('yy-mm-dd');
  readonly showButtonBar = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<'single' | 'multiple' | 'range'>('single');
  readonly disabledDates = input<Date[]>([]);
  readonly disabledDays = input<number[]>([]);
  readonly showOtherMonths = input(true, { transform: booleanAttribute });
  readonly selectOtherMonths = input(false, { transform: booleanAttribute });
  readonly dateSelected = output<string>();
  readonly onSelect = output<{ value: string | string[] }>();
  readonly onClear = output<void>();
  readonly onTodayClick = output<string>();
  private readonly effectiveLocale = computed(() => this.locale() || undefined);
  readonly firstDayOfWeek = computed(() =>
    calendarLocaleFirstDay(this.effectiveLocale()),
  );
  readonly timeValue = signal('00:00');
  private readonly syncValuePresentation = effect(() => {
    const value = this.value();
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first !== 'string') return;

    if (!calendarDateKey(first)) return;

    // The writable value model can be updated by a parent without going
    // through CVA writeValue(), so keep the separate time editor in sync too.
    if (!this.showTime()) return;

    const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/.exec(
      first,
    );
    const time = match?.[2] ?? (first.length === 10 ? '00:00' : null);
    if (time && isIsoTime(time)) this.timeValue.set(time);
  });
  readonly weekdays = computed(() =>
    calendarWeekdayLabels(this.effectiveLocale(), this.firstDayOfWeek()),
  );
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly isDisabled = computed(() => this.effectiveDisabled());
  readonly weeks = computed(() => calendarWeekRows(this.days()));
  readonly activeDate = computed(() => {
    const days = this.days();
    const selectedKeys = days
      .filter((day) => this.isSelected(day.iso))
      .map((day) => day.iso);
    return calendarActiveDay(
      days,
      [this.rovingDate(), ...selectedKeys, calendarDateKey(new Date())],
      { showOtherMonths: this.showOtherMonths(), requireEnabled: true },
    );
  });

  readonly monthLabel = computed(() =>
    calendarMonthLabel(
      calendarMonthStart(this.currentMonth()),
      this.effectiveLocale(),
    ),
  );
  isSelected(iso: string): boolean {
    const selected = (value: string): boolean => value.slice(0, 10) === iso;
    const value = this.value();
    return Array.isArray(value) ? value.some(selected) : selected(value);
  }
  readonly days = computed(() =>
    calendarMonthGrid({
      month: calendarMonthStart(this.currentMonth()),
      firstDayOfWeek: this.firstDayOfWeek(),
      today: new Date(),
      selectOtherMonths: this.selectOtherMonths(),
      isAllowed: (date) => !this.isDateDisabled(date),
    }),
  );

  previousMonth(): void {
    if (this.isDisabled()) return;
    this.shiftMonth(-1);
  }
  nextMonth(): void {
    if (this.isDisabled()) return;
    this.shiftMonth(1);
  }

  selectDay(day: CalendarDay): void {
    const date = new Date(`${day.iso}T00:00:00`);
    const outsideMonth = day.iso.slice(0, 7) !== this.currentMonth();
    if (
      !calendarDateKey(day.iso) ||
      this.isDateDisabled(date) ||
      day.disabled ||
      (outsideMonth && !this.selectOtherMonths())
    )
      return;
    this.rovingDate.set(day.iso);
    if (!day.inCurrentMonth && this.selectOtherMonths()) {
      this.currentMonth.set(day.iso.slice(0, 7));
    }
    const selectedValue = this.showTime()
      ? `${day.iso}T${this.timeValue()}`
      : day.iso;
    const mode = this.selectionMode();
    const current = this.value();
    const currentValues = Array.isArray(current)
      ? current
      : current
        ? [current]
        : [];
    if (mode === 'single') {
      this.commit(selectedValue);
      this.dateSelected.emit(selectedValue);
      this.onSelect.emit({ value: selectedValue });
      return;
    }
    // Resolve the engine's day keys back onto the stored values, keeping
    // the historical same-day range behavior (the pair extends the bound).
    const nextKeys = calendarSelection(
      mode,
      currentValues.map((value) => value.slice(0, 10)),
      day.iso,
    );
    const consumed = new Set<number>();
    const next: string[] = nextKeys.map((key) => {
      const index = currentValues.findIndex(
        (value, position) =>
          !consumed.has(position) && value.slice(0, 10) === key,
      );
      if (index >= 0) {
        consumed.add(index);
        return currentValues[index];
      }
      return selectedValue;
    });
    this.commit(next);
    this.dateSelected.emit(selectedValue);
    this.onSelect.emit({ value: next });
  }

  onTimeInput(event: Event): void {
    if (this.isDisabled()) return;
    const time = (event.target as HTMLInputElement).value;
    if (!isIsoTime(time)) return;
    this.timeValue.set(time);
    const current = this.value();
    const withTime = (value: string): string => `${value.slice(0, 10)}T${time}`;
    const next = Array.isArray(current)
      ? current.map(withTime)
      : current
        ? withTime(current)
        : current;
    if (!next || (Array.isArray(next) && !next.length)) return;
    this.value.set(next);
    this.cvaOnChange(next);
    this.cvaOnTouched();
    this.onSelect.emit({ value: next });
  }

  onFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.host.nativeElement.contains(nextTarget)) return;
    this.cvaOnTouched();
  }

  clear(): void {
    if (this.isDisabled()) return;
    this.value.set('');
    this.cvaOnChange('');
    this.cvaOnTouched();
    this.onClear.emit();
  }
  today(): void {
    if (this.isDisabled()) return;
    const iso = calendarDateKey(new Date());
    const date = new Date(`${iso}T00:00:00`);
    if (this.isDateDisabled(date)) return;
    const alreadySelected =
      this.selectionMode() === 'multiple' && this.isSelected(iso);
    this.currentMonth.set(iso.slice(0, 7));
    const day = this.days().find((item) => item.iso === iso);
    if (!day || day.disabled) return;
    this.rovingDate.set(iso);
    if (!alreadySelected) this.selectDay(day);
    this.onTodayClick.emit(iso);
  }

  isTodaySelectable(): boolean {
    return !this.isDateDisabled(
      new Date(`${calendarDateKey(new Date())}T00:00:00`),
    );
  }

  onDayKeydown(event: KeyboardEvent, day: CalendarDay): void {
    if (this.isDisabled()) return;
    const date = new Date(`${day.iso}T00:00:00`);
    const target = calendarNavigateDay(
      date,
      event.key,
      event.altKey,
      this.firstDayOfWeek(),
    );
    if (!target) return;
    event.preventDefault();
    // Keep each contract's historical enabled-day skip policy: arrows skip
    // in their own direction, week edges search within the week, page keys
    // within the target month.
    const skipStep =
      event.key === 'Home'
        ? 1
        : event.key === 'End'
          ? -1
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? -1
            : 1;
    const maxAttempts =
      event.key === 'Home' || event.key === 'End'
        ? 7
        : event.key === 'PageUp' || event.key === 'PageDown'
          ? 31
          : 366;
    const enabled = this.findEnabledDate(
      target,
      skipStep,
      skipStep,
      maxAttempts,
    );
    if (!enabled) return;
    const iso = calendarDateKey(enabled);
    this.rovingDate.set(iso);
    this.currentMonth.set(iso.slice(0, 7));
    queueMicrotask(() => {
      const target = this.host.nativeElement.querySelector(
        `[data-date="${iso}"]`,
      ) as HTMLButtonElement | null;
      target?.focus();
    });
  }

  writeValue(value: unknown): void {
    const normalize = (item: unknown): string | null => {
      if (typeof item !== 'string') return null;
      const date = calendarDateKey(item);
      if (!date) return null;
      if (!this.showTime()) return date;
      const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/.exec(
        item,
      );
      const time = match?.[2] ?? '00:00';
      return match && isIsoTime(time)
        ? `${date}T${time}`
        : item.length === 10
          ? `${date}T00:00`
          : null;
    };
    const normalized = Array.isArray(value)
      ? value.map(normalize).filter((item): item is string => !!item)
      : (normalize(value) ?? '');
    this.value.set(normalized);
    const first = Array.isArray(normalized) ? normalized[0] : normalized;
    if (first) {
      this.currentMonth.set(first.slice(0, 7));
      if (this.showTime()) this.timeValue.set(first.slice(11, 16));
    }
  }

  /** The control's own disabled input, for the shared CVA base. */
  protected isSelfDisabled(): boolean {
    return this.disabled();
  }

  private commit(value: string | string[]): void {
    this.value.set(value);
    this.cvaOnChange(value);
    this.cvaOnTouched();
  }

  private shiftMonth(delta: number): void {
    this.currentMonth.set(
      calendarMonthKey(
        calendarShiftMonth(calendarMonthStart(this.currentMonth()), delta),
      ),
    );
  }

  private isDateDisabled(date: Date): boolean {
    const iso = calendarDateKey(date);
    const min = calendarDateKey(this.min());
    const max = calendarDateKey(this.max());
    return (
      this.isDisabled() ||
      (!!min && iso < min) ||
      (!!max && iso > max) ||
      this.disabledDays().includes(date.getDay()) ||
      this.disabledDates().some(
        (disabled) =>
          disabled instanceof Date &&
          Number.isFinite(disabled.getTime()) &&
          calendarDateKey(disabled) === iso,
      )
    );
  }

  private findEnabledDate(
    candidate: Date,
    step: number,
    skipStep = step,
    maxAttempts = 366,
  ): Date | null {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (!this.isDateDisabled(candidate)) return candidate;
      candidate = new Date(
        candidate.getFullYear(),
        candidate.getMonth(),
        candidate.getDate() + skipStep,
      );
    }
    return null;
  }
}
