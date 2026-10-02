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
import { P2_SHARED_STYLES } from './p2-shared';
import { isIsoDate } from './p2-date-utils';

let nextCalendarId = 0;

export interface CalendarDay {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
  today: boolean;
  disabled: boolean;
}

type LocaleWeekInfo = {
  weekInfo?: { firstDay?: number };
  getWeekInfo?: () => { firstDay?: number };
  maximize?: () => { region?: string };
};

const SUNDAY_FIRST_REGIONS = new Set([
  'AG',
  'AR',
  'AS',
  'BD',
  'BR',
  'BS',
  'BT',
  'BZ',
  'CA',
  'CO',
  'DM',
  'DO',
  'ET',
  'GT',
  'GU',
  'HK',
  'HN',
  'JM',
  'JP',
  'KE',
  'KH',
  'KR',
  'LA',
  'MH',
  'MM',
  'MO',
  'MT',
  'MX',
  'MZ',
  'NI',
  'NP',
  'PA',
  'PE',
  'PH',
  'PK',
  'PR',
  'PT',
  'SA',
  'SG',
  'SV',
  'TH',
  'TT',
  'TW',
  'UM',
  'US',
  'VE',
  'VI',
  'WS',
  'YE',
  'ZA',
  'ZW',
]);

const SATURDAY_FIRST_REGIONS = new Set([
  'AF',
  'BH',
  'DJ',
  'DZ',
  'EG',
  'IR',
  'IQ',
  'JO',
  'KW',
  'LY',
  'OM',
  'QA',
  'SD',
  'SY',
]);

// Older browsers may not expose weekInfo/getWeekInfo on Intl.Locale. Keep a
// regional fallback for those runtimes, defaulting to the ISO Monday start.
const fallbackFirstDayOfWeek = (
  localeId: string,
  locale?: LocaleWeekInfo,
): number => {
  const explicitRegion = localeId
    .replace(/_/g, '-')
    .split('-')
    .slice(1)
    .find((part) => /^[A-Z]{2}$|^\d{3}$/i.test(part))
    ?.toUpperCase();
  const region = explicitRegion || locale?.maximize?.().region;

  if (region && SATURDAY_FIRST_REGIONS.has(region)) return 6;
  if (region && SUNDAY_FIRST_REGIONS.has(region)) return 0;
  return 1;
};

const pad = (value: number): string => String(value).padStart(2, '0');
const toIso = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const fromMonthKey = (value: string): Date => {
  const [year, month] = value.split('-').map(Number);
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month - 1 : new Date().getMonth();
  return new Date(safeYear, safeMonth, 1);
};
const isIsoTime = (value: string): boolean => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return !!match && Number(match[1]) <= 23 && Number(match[2]) <= 59;
};

@Component({
  selector: 'orc-calendar',
  standalone: true,
  template: `
    <section
      class="p-datepicker p-component orc-p2-calendar"
      [class]="'p-datepicker p-component orc-p2-calendar ' + styleClass()"
      [style]="style()"
      [attr.data-pc-name]="'calendar'"
      [attr.data-pc-section]="'root'"
      [attr.aria-label]="ariaLabel() || null"
      (focusout)="onFocusOut($event)"
    >
      <header class="orc-p2-calendar__header">
        <button
          type="button"
          [attr.aria-label]="previousMonthLabel() || 'Previous month'"
          [disabled]="isDisabled()"
          (click)="previousMonth()"
        >
          ‹
        </button>
        <strong aria-live="polite" aria-atomic="true">{{
          monthLabel()
        }}</strong>
        <button
          type="button"
          [attr.aria-label]="nextMonthLabel() || 'Next month'"
          [disabled]="isDisabled()"
          (click)="nextMonth()"
        >
          ›
        </button>
      </header>
      <div
        class="p-datepicker-calendar orc-p2-calendar__grid"
        [id]="effectiveId() + '-grid'"
        role="grid"
        [attr.tabindex]="activeDate() ? -1 : 0"
        [attr.aria-label]="monthLabel()"
      >
        <div class="orc-p2-calendar__weekdays" role="row">
          @for (weekday of weekdays(); track weekday) {
            <span role="columnheader">{{ weekday }}</span>
          }
        </div>
        @for (week of weeks(); track week[0].iso) {
          <div class="orc-p2-calendar__week" role="row">
            @for (day of week; track day.iso) {
              <div
                class="orc-p2-calendar__cell"
                role="gridcell"
                [attr.aria-selected]="isSelected(day.iso)"
              >
                @if (showOtherMonths() || day.inCurrentMonth) {
                  <button
                    type="button"
                    class="p-datepicker-day p-datepicker-calendar-container orc-p2-calendar__day"
                    [class.orc-p2-calendar__day--outside]="!day.inCurrentMonth"
                    [class.orc-p2-calendar__day--today]="day.today"
                    [class.orc-p2-calendar__day--selected]="isSelected(day.iso)"
                    [disabled]="day.disabled"
                    [attr.data-date]="day.iso"
                    [attr.aria-current]="day.today ? 'date' : null"
                    [attr.aria-label]="day.iso"
                    [tabIndex]="activeDate() === day.iso ? 0 : -1"
                    (click)="selectDay(day)"
                    (keydown)="onDayKeydown($event, day)"
                  >
                    {{ day.day }}
                  </button>
                } @else {
                  <span
                    class="orc-p2-calendar__placeholder"
                    aria-hidden="true"
                  ></span>
                }
              </div>
            }
          </div>
        }
      </div>
      @if (showTime()) {
        <label class="orc-p2-calendar__time"
          >Time
          <input
            type="time"
            [value]="timeValue()"
            [disabled]="isDisabled()"
            (input)="onTimeInput($event)"
          />
        </label>
      }
      @if (showButtonBar() && (todayLabel() || clearLabel())) {
        <footer class="p-datepicker-buttonbar orc-p2-calendar__buttonbar">
          @if (todayLabel()) {
            <button
              type="button"
              [disabled]="isDisabled() || !isTodaySelectable()"
              (click)="today()"
            >
              {{ todayLabel() }}
            </button>
          }
          @if (clearLabel()) {
            <button type="button" [disabled]="isDisabled()" (click)="clear()">
              {{ clearLabel() }}
            </button>
          }
        </footer>
      }
    </section>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    .orc-p2-calendar { width: min(100%, 320px); padding: 1rem; border: 1px solid var(--orc-component-border); border-radius: .875rem; background: var(--orc-component-surface-raised); color: var(--orc-component-text); }
    .orc-p2-calendar__weekdays, .orc-p2-calendar__week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); align-items: center; gap: .25rem; }
    .orc-p2-calendar__grid { display: grid; gap: .25rem; }
    .orc-p2-calendar__header { display: grid; grid-template-columns: 2rem 1fr 2rem; align-items: center; gap: .25rem; margin-bottom: .75rem; text-align: center; }
    .orc-p2-calendar__header button { border: 0; border-radius: .375rem; background: transparent; font-size: 1.35rem; line-height: 2rem; }
    .orc-p2-calendar__header button:hover { background: var(--orc-component-surface-muted); }
    .orc-p2-calendar__weekdays { margin-bottom: .25rem; color: var(--orc-component-text-muted); font-size: .7rem; font-weight: 700; text-align: center; text-transform: uppercase; }
    .orc-p2-calendar__cell { min-width: 0; text-align: center; }
    .orc-p2-calendar__placeholder { display: block; min-height: 2.2rem; }
    .orc-p2-calendar__day { min-height: 2.2rem; border: 0; border-radius: .5rem; background: transparent; color: inherit; }
    .orc-p2-calendar__day:hover:not(:disabled), .orc-p2-calendar__day--selected { background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); }
    .orc-p2-calendar__day--outside { color: var(--orc-component-text-muted); }
    .orc-p2-calendar__day--today { box-shadow: inset 0 0 0 1px var(--orc-component-interactive-shadow); }
    .orc-p2-calendar__time { display: grid; gap: .25rem; margin-top: .75rem; font-size: .8rem; font-weight: 600; }
    .orc-p2-calendar__time input { min-height: 2rem; border: 1px solid var(--orc-component-border-strong); border-radius: .375rem; padding: .25rem .4rem; background: var(--orc-component-control); color: var(--orc-component-text); font-weight: 400; }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
})
export class CalendarComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-calendar-${++nextCalendarId}`;
  private readonly rovingDate = signal<string | null>(null);
  readonly value = model<string | string[]>('');
  readonly currentMonth = model(toMonthKey(new Date()));
  readonly min = input('');
  readonly max = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly cvaDisabled = signal(false);
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
  readonly firstDayOfWeek = computed(() => {
    try {
      const localeId =
        this.effectiveLocale() ||
        new Intl.DateTimeFormat().resolvedOptions().locale;
      const LocaleConstructor = (
        Intl as unknown as {
          Locale?: new (locale: string) => LocaleWeekInfo;
        }
      ).Locale;
      const locale = LocaleConstructor
        ? new LocaleConstructor(localeId)
        : undefined;
      const firstDay =
        locale?.getWeekInfo?.().firstDay ?? locale?.weekInfo?.firstDay;
      if (
        typeof firstDay === 'number' &&
        Number.isInteger(firstDay) &&
        firstDay >= 1 &&
        firstDay <= 7
      ) {
        return firstDay % 7;
      }
      return fallbackFirstDayOfWeek(localeId, locale);
    } catch {
      return fallbackFirstDayOfWeek(
        this.effectiveLocale() ||
          new Intl.DateTimeFormat().resolvedOptions().locale,
      );
    }
  });
  readonly timeValue = signal('00:00');
  private readonly syncValuePresentation = effect(() => {
    const value = this.value();
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first !== 'string') return;

    const date = first.slice(0, 10);
    if (!isIsoDate(date)) return;

    // The writable value model can be updated by a parent without going
    // through CVA writeValue(), so keep the separate time editor in sync too.
    if (!this.showTime()) return;

    const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/.exec(
      first,
    );
    const time = match?.[2] ?? (first === date ? '00:00' : null);
    if (time && isIsoTime(time)) this.timeValue.set(time);
  });
  readonly weekdays = computed(() =>
    Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(this.effectiveLocale(), {
        weekday: 'short',
      }).format(new Date(2021, 7, 1 + ((index + this.firstDayOfWeek()) % 7))),
    ),
  );
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly weeks = computed(() => {
    const days = this.days();
    return Array.from({ length: 6 }, (_, week) =>
      days.slice(week * 7, week * 7 + 7),
    );
  });
  readonly activeDate = computed(() => {
    const visibleEnabled = this.days().filter(
      (day) => !day.disabled && (this.showOtherMonths() || day.inCurrentMonth),
    );
    const focused = this.rovingDate();
    if (focused && visibleEnabled.some((day) => day.iso === focused)) {
      return focused;
    }
    const selected = visibleEnabled.find((day) => this.isSelected(day.iso));
    if (selected) return selected.iso;
    const today = visibleEnabled.find((day) => day.today);
    return (
      (
        today ??
        visibleEnabled.find((day) => day.inCurrentMonth) ??
        visibleEnabled[0]
      )?.iso ?? null
    );
  });

  readonly monthLabel = computed(() =>
    fromMonthKey(this.currentMonth()).toLocaleDateString(
      this.effectiveLocale(),
      { month: 'long', year: 'numeric' },
    ),
  );
  isSelected(iso: string): boolean {
    const selected = (value: string): boolean => value.slice(0, 10) === iso;
    const value = this.value();
    return Array.isArray(value) ? value.some(selected) : selected(value);
  }
  readonly days = computed<CalendarDay[]>(() => {
    const month = fromMonthKey(this.currentMonth());
    const startOffset = (month.getDay() - this.firstDayOfWeek() + 7) % 7;
    const start = new Date(
      month.getFullYear(),
      month.getMonth(),
      1 - startOffset,
    );
    const today = toIso(new Date());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + index,
      );
      const iso = toIso(date);
      return {
        iso,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
        today: iso === today,
        disabled:
          this.isDateDisabled(date) ||
          (!this.selectOtherMonths() && date.getMonth() !== month.getMonth()),
      };
    });
  });

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
      !isIsoDate(day.iso) ||
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
    let next: string | string[] = selectedValue;
    if (this.selectionMode() === 'multiple') {
      const current = this.value();
      const values = Array.isArray(current)
        ? [...current]
        : current
          ? [current]
          : [];
      const index = values.findIndex((value) => value.slice(0, 10) === day.iso);
      if (index >= 0) values.splice(index, 1);
      else values.push(selectedValue);
      next = values;
    } else if (this.selectionMode() === 'range') {
      const current = this.value();
      const values = Array.isArray(current)
        ? [...current]
        : current
          ? [current]
          : [];
      next =
        values.length !== 1
          ? [selectedValue]
          : values[0].slice(0, 10) <= day.iso
            ? [values[0], selectedValue]
            : [selectedValue, values[0]];
    }
    this.value.set(next);
    this.onModelChange(next);
    this.onModelTouched();
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
    this.onModelChange(next);
    this.onModelTouched();
    this.onSelect.emit({ value: next });
  }

  onFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.host.nativeElement.contains(nextTarget)) return;
    this.onModelTouched();
  }

  clear(): void {
    if (this.isDisabled()) return;
    this.value.set('');
    this.onModelChange('');
    this.onModelTouched();
    this.onClear.emit();
  }
  today(): void {
    if (this.isDisabled()) return;
    const iso = toIso(new Date());
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
    return !this.isDateDisabled(new Date(`${toIso(new Date())}T00:00:00`));
  }

  onDayKeydown(event: KeyboardEvent, day: CalendarDay): void {
    if (this.isDisabled()) return;
    const date = new Date(`${day.iso}T00:00:00`);
    let target: Date | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        target = this.findEnabledDate(
          new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
          -1,
          -1,
        );
        break;
      case 'ArrowRight':
        target = this.findEnabledDate(
          new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          1,
          1,
        );
        break;
      case 'ArrowUp':
        target = this.findEnabledDate(
          new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7),
          -7,
          -7,
        );
        break;
      case 'ArrowDown':
        target = this.findEnabledDate(
          new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7),
          7,
          7,
        );
        break;
      case 'Home':
        target = this.findEnabledDate(
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() - this.weekOffset(date),
          ),
          1,
          1,
          7,
        );
        break;
      case 'End':
        target = this.findEnabledDate(
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + (6 - this.weekOffset(date)),
          ),
          -1,
          -1,
          7,
        );
        break;
      case 'PageUp':
      case 'PageDown': {
        const monthDelta = event.key === 'PageUp' ? -1 : 1;
        target = this.offsetDateByMonths(
          date,
          monthDelta * (event.altKey ? 12 : 1),
        );
        target = this.findEnabledDate(target, 1, 1, 31);
        break;
      }
      default:
        return;
    }

    event.preventDefault();
    if (!target) return;
    const iso = toIso(target);
    this.rovingDate.set(iso);
    this.currentMonth.set(iso.slice(0, 7));
    queueMicrotask(() => {
      const target = this.host.nativeElement.querySelector(
        `[data-date="${iso}"]`,
      ) as HTMLButtonElement | null;
      target?.focus();
    });
  }

  private onModelChange: (value: string | string[]) => void = () => {};
  private onModelTouched: () => void = () => {};
  writeValue(value: unknown): void {
    const normalize = (item: unknown): string | null => {
      if (typeof item !== 'string') return null;
      const date = item.slice(0, 10);
      if (!isIsoDate(date)) return null;
      if (!this.showTime()) return date;
      const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/.exec(
        item,
      );
      const time = match?.[2] ?? '00:00';
      return match && isIsoTime(time)
        ? `${date}T${time}`
        : item === date
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
  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  private shiftMonth(delta: number): void {
    const current = fromMonthKey(this.currentMonth());
    this.currentMonth.set(
      toMonthKey(
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
      ),
    );
  }

  private isDateDisabled(date: Date): boolean {
    const iso = toIso(date);
    const min = this.min().slice(0, 10);
    const max = this.max().slice(0, 10);
    return (
      this.isDisabled() ||
      (isIsoDate(min) && iso < min) ||
      (isIsoDate(max) && iso > max) ||
      this.disabledDays().includes(date.getDay()) ||
      this.disabledDates().some(
        (disabled) =>
          disabled instanceof Date &&
          Number.isFinite(disabled.getTime()) &&
          toIso(disabled) === iso,
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

  private offsetDateByMonths(date: Date, months: number): Date {
    const targetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + months,
      1,
    );
    const lastDay = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0,
    ).getDate();
    return new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth(),
      Math.min(date.getDate(), lastDay),
    );
  }

  private weekOffset(date: Date): number {
    return (date.getDay() - this.firstDayOfWeek() + 7) % 7;
  }
}
