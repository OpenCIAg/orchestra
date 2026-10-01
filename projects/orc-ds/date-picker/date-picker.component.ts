import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  DestroyRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  booleanAttribute,
  numberAttribute,
  viewChildren,
  viewChild,
  Injector,
  afterNextRender,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  attachAnchoredPopup,
  eventIsInside,
  isTopOverlay,
  listenForOutsideInteraction,
  registerOverlay,
  trapTabKey,
} from '@ciag/orchestra/internal';
import { DatePickerCalendarComponent } from './date-picker-calendar.component';
import {
  dateKey,
  parseDateTime,
  parseDate,
  monthKey,
  positiveInteger,
  timeString,
} from './date-value';
export { DatePickerCalendarComponent } from './date-picker-calendar.component';
let nextDatePickerId = 0;

@Component({
  selector: 'orc-date-picker',
  standalone: true,
  imports: [CommonModule, DatePickerCalendarComponent],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-datepicker p-component',
    '[attr.data-pc-name]': "'datepicker'",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly uniqueId = `orc-date-picker-${++nextDatePickerId}`;
  readonly calendars = viewChildren(DatePickerCalendarComponent);
  readonly maxDateCount = input<number | undefined, unknown>(undefined, {
    transform: numberAttribute,
  });
  readonly hideOnDateTimeSelect = input(true, { transform: booleanAttribute });
  /** PrimeNG-compatible value and configuration surface. */
  readonly value = model<any>('');
  readonly label = input('');
  readonly min = input('');
  readonly max = input('');
  readonly helperText = input('');
  readonly error = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string | undefined>(undefined);
  readonly dateFormat = input<string | undefined>(undefined);
  readonly selectionMode = input<'single' | 'multiple' | 'range'>('single');
  readonly showIcon = input(false, { transform: booleanAttribute });
  readonly showButtonBar = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly inline = input(false, { transform: booleanAttribute });
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly timeOnly = input(false, { transform: booleanAttribute });
  readonly showSeconds = input(false, { transform: booleanAttribute });
  readonly touchUI = input(false, { transform: booleanAttribute });
  readonly showWeek = input(false, { transform: booleanAttribute });
  readonly showOtherMonths = input(true, { transform: booleanAttribute });
  readonly selectOtherMonths = input(false, { transform: booleanAttribute });
  readonly readonlyInput = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly hourFormat = input('24');
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly numberOfMonths = input(1, { transform: numberAttribute });
  readonly minDate = input<Date | null | undefined>(undefined);
  readonly maxDate = input<Date | null | undefined>(undefined);
  readonly disabledDates = input<Date[] | undefined>(undefined);
  readonly disabledDays = input<number[] | undefined>(undefined);
  readonly view = input<'date' | 'month' | 'year'>('date');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  readonly panelStyleClass = input<string | undefined>(undefined);
  readonly panelStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input<string | undefined>(undefined);
  readonly inputStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly inputStyleClass = input<string | undefined>(undefined);
  readonly dataType = input<'date' | 'string'>('string');
  readonly defaultDate = input<Date | null | undefined>(undefined);
  readonly viewDate = model<Date>(new Date());
  readonly showOnFocus = input(true, { transform: booleanAttribute });
  readonly keepInvalid = input(false, { transform: booleanAttribute });
  readonly appendTo = input<unknown>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0, { transform: numberAttribute });
  readonly focusOnShow = input(true, { transform: booleanAttribute });
  readonly focusTrap = input(true, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly variant = input<'outlined' | 'filled' | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  /** @deprecated Compatibility-only input; text parsing is controlled by dateFormat and the date value parser. */
  readonly mask = input(false, { transform: booleanAttribute });
  readonly multipleSeparator = input(', ');
  readonly rangeSeparator = input(' - ');
  readonly yearNavigator = input(false, { transform: booleanAttribute });
  readonly monthNavigator = input(false, { transform: booleanAttribute });
  readonly yearRange = input<string | undefined>(undefined);
  readonly stepHour = input(1, { transform: numberAttribute });
  readonly stepMinute = input(1, { transform: numberAttribute });
  readonly stepSecond = input(1, { transform: numberAttribute });
  /** @deprecated Compatibility-only input; panel visibility has no transition configuration in this implementation. */
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  /** @deprecated Compatibility-only input; panel visibility has no transition configuration in this implementation. */
  readonly hideTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  readonly clearButtonStyleClass = input<string | undefined>(undefined);
  readonly todayButtonStyleClass = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly iconAriaLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility-only input; the icon is rendered as the dedicated trigger button. */
  readonly iconDisplay = input<'input' | 'button'>('button');
  readonly defaultViewDate = input<Date | null | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly panelAriaLabel = input<string | undefined>(undefined);
  readonly previousMonthLabel = input<string | undefined>(undefined);
  readonly nextMonthLabel = input<string | undefined>(undefined);
  readonly timePickerAriaLabel = input<string | undefined>(undefined);
  readonly previousHourLabel = input<string | undefined>(undefined);
  readonly nextHourLabel = input<string | undefined>(undefined);
  readonly previousMinuteLabel = input<string | undefined>(undefined);
  readonly nextMinuteLabel = input<string | undefined>(undefined);
  readonly previousSecondLabel = input<string | undefined>(undefined);
  readonly nextSecondLabel = input<string | undefined>(undefined);
  readonly toggleMeridiemLabel = input<string | undefined>(undefined);
  readonly todayLabel = input<string | undefined>(undefined);
  readonly clearLabel = input<string | undefined>(undefined);
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onClose = output<void>();
  readonly onSelect = output<any>();
  readonly onClear = output<void>();
  readonly onInput = output<any>();
  readonly onTodayClick = output<Date>();
  readonly onClearClick = output<void>();
  readonly onShow = output<void>();
  readonly onViewDateChange = output<{ month: number; year: number }>();
  readonly onMonthChange = output<{ month: number; year: number }>();
  readonly onYearChange = output<{ month: number; year: number }>();
  readonly onClickOutside = output<MouseEvent>();
  readonly overlayVisible = model(false);
  readonly effectiveInputId = computed(() => this.inputId() || this.uniqueId);
  readonly panelId = computed(() => `${this.effectiveInputId()}-panel`);
  private readonly injector = inject(Injector);
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly anchor = viewChild<ElementRef<HTMLElement>>('anchor');
  private restoringFocus = false;
  readonly invalidInput = signal(false);
  private lastCalendarView: { month: number; year: number } | null = null;
  protected readonly cvaDisabled = signal(false);
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  constructor() {
    effect((onCleanup) => {
      if (this.disabled() || this.cvaDisabled()) {
        this.hide();
        return;
      }
      if (!this.overlayVisible() || this.inline()) return;
      const panel = this.panel()?.nativeElement;
      const anchor = this.anchor()?.nativeElement;
      if (!panel || !anchor) return;
      const detach = attachAnchoredPopup(anchor, panel, this.appendTo());
      if (this.touchUI() && panel.matches(':popover-open')) {
        panel.hidePopover();
        panel.removeAttribute('popover');
      }
      const applyTouchLayout = () => {
        if (!this.touchUI() || !panel.isConnected) return;
        panel.style.setProperty('position', 'fixed', 'important');
        panel.style.setProperty('top', 'auto', 'important');
        panel.style.setProperty('right', '0.5rem', 'important');
        panel.style.setProperty('bottom', '0.5rem', 'important');
        panel.style.setProperty('left', '0.5rem', 'important');
      };
      if (this.touchUI()) applyTouchLayout();
      const release = registerOverlay(panel, {
        anchor: this.host.nativeElement,
        onParentClose: () => this.hide(),
      });
      const stop = listenForOutsideInteraction(
        this.document,
        () => [this.host.nativeElement, this.panel()?.nativeElement],
        (event) => this.onDocumentClick(event),
      );
      const onDocumentMouseDown = (event: MouseEvent) =>
        this.onDocumentClick(event);
      const onDocumentKeydown = (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          this.overlayVisible() &&
          this.panel()?.nativeElement &&
          isTopOverlay(this.panel()!.nativeElement)
        ) {
          event.preventDefault();
          this.hide(true);
        }
      };
      // Preserve the mouse-only interaction contract for consumers that dispatch
      // mousedown without a corresponding PointerEvent or click.
      this.document.addEventListener('mousedown', onDocumentMouseDown, true);
      this.document.addEventListener('keydown', onDocumentKeydown);
      const onFocus = (event: FocusEvent) => {
        if (
          !eventIsInside(event, [
            this.host.nativeElement,
            this.panel()?.nativeElement,
          ])
        )
          this.hide();
      };
      this.document.addEventListener('focusin', onFocus, true);
      onCleanup(() => {
        stop();
        this.document.removeEventListener(
          'mousedown',
          onDocumentMouseDown,
          true,
        );
        this.document.removeEventListener('keydown', onDocumentKeydown);
        release();
        this.document.removeEventListener('focusin', onFocus, true);
        detach();
        if (this.destroyRef.destroyed) panel.remove();
      });
    });
    effect(() => {
      const key = this.calendarValue();
      const selected =
        parseDate(key) ?? this.defaultViewDate() ?? this.defaultDate();
      if (selected && Number.isFinite(selected.getTime()))
        this.viewDate.set(new Date(selected));
    });
  }
  readonly viewMonth = computed(() =>
    monthKey(
      Number.isFinite(this.viewDate().getTime()) ? this.viewDate() : new Date(),
    ),
  );
  handleCalendarViewDateChange(view: { month: number; year: number }): void {
    const previous = this.lastCalendarView;
    this.lastCalendarView = view;
    this.viewDate.set(new Date(view.year, view.month - 1, 1));
    this.onViewDateChange.emit(view);
    if (
      !previous ||
      previous.month !== view.month ||
      previous.year !== view.year
    )
      this.onMonthChange.emit(view);
    if (!previous || previous.year !== view.year) this.onYearChange.emit(view);
  }
  readonly calendarValue = computed(() => {
    const value = this.value();
    return dateKey(Array.isArray(value) ? value[0] : value);
  });
  readonly calendarValues = computed(() => {
    const value = this.value();
    return (Array.isArray(value) ? value : [value])
      .map(dateKey)
      .filter(Boolean);
  });
  readonly timeParts = computed(() => {
    const value = this.value();
    const date = parseDateTime(
      Array.isArray(value) ? value[0] : value,
      this.timeOnly(),
    );
    return date
      ? {
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
        }
      : { hour: 0, minute: 0, second: 0 };
  });
  readonly calendarMin = computed(() =>
    this.dateConstraint(this.minDate(), this.min()),
  );
  readonly calendarMax = computed(() =>
    this.dateConstraint(this.maxDate(), this.max()),
  );
  readonly monthOffsets = computed(() =>
    Array.from(
      { length: positiveInteger(this.numberOfMonths(), 1, 12) },
      (_, index) => index,
    ),
  );
  writeValue(value: any): void {
    this.invalidInput.set(false);
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  inputValue(): string {
    const value = this.value();
    const format = (item: unknown) => this.formatInputValue(item);
    if (Array.isArray(value)) {
      const separator =
        this.selectionMode() === 'range'
          ? this.rangeSeparator()
          : this.multipleSeparator();
      return value.map(format).join(separator);
    }
    return value === undefined || value === null ? '' : format(value);
  }
  private formatInputValue(value: unknown): string {
    if (value instanceof Date)
      return Number.isNaN(value.valueOf()) ? '' : this.formatInputDate(value);
    const raw = String(value ?? '');
    if (!this.showTime() && !this.timeOnly() && /^\d{4}-\d{2}-\d{2}$/.test(raw))
      return this.formatDateParts(
        ...(raw.split('-').map(Number) as [number, number, number]),
      );
    return raw;
  }
  private formatInputDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    if (!this.showTime() && !this.timeOnly())
      return this.formatDateParts(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${this.showSeconds() ? `:${pad(date.getSeconds())}` : ''}`;
    return this.timeOnly() ? time : `${day}T${time}`;
  }
  private formatDateParts(year: number, month: number, day: number): string {
    const format = this.dateFormat();
    const pad = (value: number) => String(value).padStart(2, '0');
    if (format) {
      const replacements: Record<string, string> = {
        dd: pad(day),
        d: String(day),
        mm: pad(month),
        m: String(month),
        yy: String(year),
        y: pad(year % 100),
      };
      return format.replace(/dd|d|mm|m|yy|y/g, (token) => replacements[token]);
    }
    return new Intl.DateTimeFormat(
      this.locale() || this.document.documentElement.lang || undefined,
      { day: '2-digit', month: '2-digit', year: 'numeric' },
    ).format(new Date(year, month - 1, day));
  }
  private parseValue(raw: string): any {
    const separator =
      this.selectionMode() === 'range'
        ? this.rangeSeparator()
        : this.multipleSeparator();
    const values = raw
      .split(separator || ',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => this.normalizeDateInput(item));
    const parsed =
      this.dataType() === 'date'
        ? values.map((item) => parseDateTime(item, this.timeOnly()) ?? item)
        : values;
    return this.selectionMode() === 'single' ? (parsed[0] ?? '') : parsed;
  }
  private normalizeDateInput(value: string): string {
    if (this.showTime() || this.timeOnly() || /^\d{4}-\d{2}-\d{2}$/.test(value))
      return value;
    const numbers = value.match(/\d+/g)?.map(Number);
    if (!numbers || numbers.length !== 3) return value;
    const configuredTokens = this.dateFormat()?.match(/dd|d|mm|m|yy|y/g);
    const localeTokens = new Intl.DateTimeFormat(
      this.locale() || this.document.documentElement.lang || undefined,
      { day: 'numeric', month: 'numeric', year: 'numeric' },
    )
      .formatToParts(new Date(2006, 10, 22))
      .filter(
        (part) =>
          part.type === 'day' || part.type === 'month' || part.type === 'year',
      )
      .map((part) =>
        part.type === 'day' ? 'd' : part.type === 'month' ? 'm' : 'yy',
      );
    const tokens =
      configuredTokens?.length === 3 ? configuredTokens : localeTokens;
    const parts: Record<'day' | 'month' | 'year', number> = {
      day: 0,
      month: 0,
      year: 0,
    };
    tokens.forEach((token, index) => {
      parts[
        token.startsWith('d') ? 'day' : token.startsWith('m') ? 'month' : 'year'
      ] = numbers[index];
    });
    if (parts.year < 100) parts.year += 2000;
    const date = new Date(parts.year, parts.month - 1, parts.day);
    if (
      date.getFullYear() !== parts.year ||
      date.getMonth() !== parts.month - 1 ||
      date.getDate() !== parts.day
    )
      return value;
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  }
  private isDateSelectable(date: Date): boolean {
    if (!Number.isFinite(date.getTime())) return false;
    const min = this.minDate();
    const max = this.maxDate();
    const key = dateKey(date);
    if (this.timeOnly()) {
      const seconds = (item: Date) =>
        item.getHours() * 3600 + item.getMinutes() * 60 + item.getSeconds();
      return (
        (!min || seconds(date) >= seconds(min)) &&
        (!max || seconds(date) <= seconds(max))
      );
    }
    if (
      (this.calendarMin() && key < this.calendarMin()) ||
      (this.calendarMax() && key > this.calendarMax())
    )
      return false;
    if (this.showTime() && ((min && date < min) || (max && date > max)))
      return false;
    return (
      !this.disabledDays()?.includes(date.getDay()) &&
      !(this.disabledDates() || []).some(
        (disabled) => dateKey(disabled) === key,
      )
    );
  }
  update(event: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.readonlyInput()) return;
    const raw = (event.target as HTMLInputElement).value;
    const value = this.parseValue(raw);
    const values = Array.isArray(value) ? value : value === '' ? [] : [value];
    const dates = values.map((item) => parseDateTime(item, this.timeOnly()));
    const maxCount = this.maxDateCount();
    const invalid =
      dates.some((date) => !date || !this.isDateSelectable(date)) ||
      (this.selectionMode() === 'range' &&
        (values.length > 2 ||
          (values.length === 2 && dates[0]! > dates[1]!))) ||
      (this.selectionMode() === 'multiple' &&
        maxCount !== undefined &&
        values.length > maxCount);
    this.invalidInput.set(invalid);
    if (invalid) {
      if (this.keepInvalid()) {
        this.value.set(raw);
        this.onChange(raw);
      }
      this.onInput.emit(raw);
      return;
    }
    this.value.set(value);
    this.onChange(value);
    this.onInput.emit(value);
    this.onSelect.emit(value);
  }
  focus(event: Event): void {
    this.onFocus.emit(event);
    if (this.showOnFocus() && !this.restoringFocus) this.show();
  }
  touch(event?: Event): void {
    if (event) this.onBlur.emit(event);
    this.onTouched();
  }
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.overlayVisible()) {
      event.preventDefault();
      event.stopPropagation?.();
      this.hide(true);
    } else if (
      event.key === 'ArrowDown' ||
      (event.key === 'Enter' && !this.overlayVisible())
    ) {
      event.preventDefault();
      this.show();
      this.focusCalendar();
    }
  }
  onPanelKeydown(event: KeyboardEvent): void {
    if (this.inline()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.hide(true);
    } else if (this.focusTrap() && this.panel())
      trapTabKey(event, this.panel()!.nativeElement);
  }
  private focusCalendar(): void {
    if (!this.focusOnShow()) return;
    afterNextRender(
      () => {
        if (this.overlayVisible()) {
          if (this.timeOnly())
            this.panel()
              ?.nativeElement.querySelector<HTMLElement>(
                'button:not(:disabled)',
              )
              ?.focus();
          else this.calendars()[0]?.focusSelected();
        }
      },
      { injector: this.injector },
    );
  }
  show(): void {
    if (
      !this.inline() &&
      !this.overlayVisible() &&
      !this.disabled() &&
      !this.cvaDisabled()
    ) {
      this.overlayVisible.set(true);
      this.onShow.emit();
    }
  }
  hide(restoreFocus = false): void {
    if (!this.overlayVisible()) return;
    this.overlayVisible.set(false);
    this.onClose.emit();
    this.onTouched();
    if (restoreFocus) {
      this.restoringFocus = true;
      this.host.nativeElement
        .querySelector<HTMLInputElement>('input')
        ?.focus({ preventScroll: true });
      this.restoringFocus = false;
    }
  }
  toggle(): void {
    if (this.overlayVisible()) this.hide(true);
    else {
      this.show();
      this.focusCalendar();
    }
  }
  onDocumentClick(event: MouseEvent): void {
    if (
      !this.inline() &&
      this.overlayVisible() &&
      !eventIsInside(event, [
        this.host.nativeElement,
        this.panel()?.nativeElement,
      ])
    ) {
      this.onClickOutside.emit(event);
      this.hide();
    }
  }
  selectCalendarDate(iso: string): void {
    if (this.disabled() || this.cvaDisabled()) return;
    const date = parseDate(iso);
    if (!date) return;
    if (this.showTime()) {
      const time = this.timeParts();
      date.setHours(time.hour, time.minute, time.second);
    }
    if (!this.isDateSelectable(date)) return;
    const selected =
      this.dataType() === 'date'
        ? date
        : this.showTime()
          ? `${iso}T${timeString(this.timeParts(), this.showSeconds())}`
          : iso;
    this.invalidInput.set(false);
    const mode = this.selectionMode();
    let next: any = selected;
    if (mode === 'multiple') {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const index = current.findIndex((item) => this.calendarIso(item) === iso);
      if (
        index < 0 &&
        this.maxDateCount() !== undefined &&
        current.length >= this.maxDateCount()!
      )
        return;
      index >= 0 ? current.splice(index, 1) : current.push(selected);
      next = current;
    } else if (mode === 'range') {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      if (current.length !== 1 || this.calendarIso(current[0]) === iso)
        next = [selected];
      else
        next =
          this.calendarIso(current[0]) < iso
            ? [current[0], selected]
            : [selected, current[0]];
    }
    this.value.set(next);
    this.onChange(next);
    this.onInput.emit(next);
    this.onSelect.emit(next);
    if (
      this.hideOnDateTimeSelect() &&
      (mode === 'single' ||
        (mode === 'range' && Array.isArray(next) && next.length === 2))
    )
      this.hide(true);
  }
  private calendarIso(value: unknown): string {
    return dateKey(value);
  }
  displayHour(): number {
    const hour = this.timeParts().hour;
    return this.hourFormat() === '12' ? hour % 12 || 12 : hour;
  }
  meridiem(): 'AM' | 'PM' {
    return this.timeParts().hour >= 12 ? 'PM' : 'AM';
  }
  adjustTime(part: 'hour' | 'minute' | 'second', delta: number): void {
    const current = this.timeParts();
    const step =
      positiveInteger(
        part === 'hour'
          ? this.stepHour()
          : part === 'minute'
            ? this.stepMinute()
            : this.stepSecond(),
        1,
      ) % (part === 'hour' ? 24 : 60);
    let hour = current.hour;
    let minute = current.minute;
    let second = current.second;
    if (part === 'hour') hour = (hour + delta * step + 24) % 24;
    if (part === 'minute') minute = (minute + delta * step + 60) % 60;
    if (part === 'second') second = (second + delta * step + 60) % 60;
    this.setTime(hour, minute, second);
  }
  toggleMeridiem(): void {
    const current = this.timeParts();
    this.setTime((current.hour + 12) % 24, current.minute, current.second);
  }
  private setTime(hour: number, minute: number, second: number): void {
    if (this.disabled() || this.cvaDisabled()) return;
    const current = this.value();
    const first = Array.isArray(current) ? current[0] : current;
    const date =
      parseDateTime(first, this.timeOnly()) ??
      (this.timeOnly() ? parseDate('1970-01-01')! : new Date());
    date.setHours(hour, minute, second, 0);
    if (!this.isDateSelectable(date)) return;
    const text = timeString({ hour, minute, second }, this.showSeconds());
    const next =
      this.dataType() === 'date'
        ? date
        : this.timeOnly()
          ? text
          : `${dateKey(date)}T${text}`;
    const value = Array.isArray(current) ? [next, ...current.slice(1)] : next;
    this.invalidInput.set(false);
    this.value.set(value);
    this.onChange(value);
    this.onInput.emit(value);
  }
  private dateConstraint(
    date: Date | null | undefined,
    fallback: string,
  ): string {
    return date instanceof Date && !Number.isNaN(date.valueOf())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : fallback;
  }
  clear(): void {
    if (this.disabled() || this.cvaDisabled()) return;
    this.invalidInput.set(false);
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.onInput.emit('');
    this.onClear.emit();
    this.onClearClick.emit();
  }
  today(): void {
    if (this.disabled() || this.cvaDisabled()) return;
    const today = new Date();
    const day = parseDate(dateKey(today))!;
    if (this.showTime()) {
      const time = this.timeParts();
      day.setHours(time.hour, time.minute, time.second);
    }
    if (!this.isDateSelectable(day)) return;
    this.selectCalendarDate(dateKey(today));
    this.onTodayClick.emit(today);
  }
}
