import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2Option, P2_SHARED_STYLES, P2Size } from './p2-shared';

let nextMultiSelectId = 0;
let nextTagsInputId = 0;
let nextCalendarId = 0;

export interface CalendarDay {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
  today: boolean;
  disabled: boolean;
}

const pad = (value: number): string => String(value).padStart(2, '0');
const toIso = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toMonthKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const fromMonthKey = (value: string): Date => {
  const [year, month] = value.split('-').map(Number);
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month - 1 : new Date().getMonth();
  return new Date(safeYear, safeMonth, 1);
};

@Component({
  selector: 'orc-calendar',
  standalone: true,
  template: `
    <section class="p-datepicker p-component orc-p2-calendar" [class]="'p-datepicker p-component orc-p2-calendar ' + styleClass()" [style]="style()" [attr.data-pc-name]="'calendar'" [attr.data-pc-section]="'root'" [attr.aria-label]="ariaLabel()">
      <header class="orc-p2-calendar__header">
        <button type="button" aria-label="Mês anterior" (click)="previousMonth()">‹</button>
        <strong>{{ monthLabel() }}</strong>
        <button type="button" aria-label="Próximo mês" (click)="nextMonth()">›</button>
      </header>
      <div class="orc-p2-calendar__weekdays" aria-hidden="true">
        @for (weekday of weekdays; track weekday) { <span>{{ weekday }}</span> }
      </div>
      <div class="p-datepicker-calendar orc-p2-calendar__grid" [id]="effectiveId() + '-grid'" role="grid" [attr.aria-label]="monthLabel()">
        @for (day of days(); track day.iso) {
          @if (showOtherMonths() || day.inCurrentMonth) { <button
            type="button"
            role="gridcell"
            class="p-datepicker-day p-datepicker-calendar-container orc-p2-calendar__day"
            [class.orc-p2-calendar__day--outside]="!day.inCurrentMonth"
            [class.orc-p2-calendar__day--today]="day.today"
            [class.orc-p2-calendar__day--selected]="value() === day.iso"
            [disabled]="day.disabled"
            [attr.aria-selected]="value() === day.iso"
            [attr.aria-label]="day.iso"
            (click)="selectDay(day)">
            {{ day.day }}
          </button> }
        }
      </div>
    </section>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-calendar { width: min(100%, 320px); padding: 1rem; border: 1px solid #e2e8f0; border-radius: .875rem; background: #fff; color: #0f172a; }
    .orc-p2-calendar__header, .orc-p2-calendar__weekdays, .orc-p2-calendar__grid { display: grid; grid-template-columns: repeat(7, 1fr); align-items: center; gap: .25rem; }
    .orc-p2-calendar__header { grid-template-columns: 2rem 1fr 2rem; margin-bottom: .75rem; text-align: center; }
    .orc-p2-calendar__header button { border: 0; border-radius: .375rem; background: transparent; font-size: 1.35rem; line-height: 2rem; }
    .orc-p2-calendar__header button:hover { background: #f1f5f9; }
    .orc-p2-calendar__weekdays { margin-bottom: .25rem; color: #64748b; font-size: .7rem; font-weight: 700; text-align: center; text-transform: uppercase; }
    .orc-p2-calendar__day { min-height: 2.2rem; border: 0; border-radius: .5rem; background: transparent; color: inherit; }
    .orc-p2-calendar__day:hover:not(:disabled), .orc-p2-calendar__day--selected { background: #2563eb; color: #fff; }
    .orc-p2-calendar__day--outside { color: #94a3b8; }
    .orc-p2-calendar__day--today { box-shadow: inset 0 0 0 1px #2563eb; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CalendarComponent), multi: true }],
})
export class CalendarComponent {
  private readonly uniqueId = `orc-calendar-${++nextCalendarId}`;
  readonly value = model('');
  readonly currentMonth = model(toMonthKey(new Date()));
  readonly min = input('');
  readonly max = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly ariaLabel = input('Calendar');
  readonly inline = input(true, { transform: booleanAttribute }); readonly showTime = input(false, { transform: booleanAttribute }); readonly dateFormat = input('yy-mm-dd'); readonly showButtonBar = input(false, { transform: booleanAttribute }); readonly selectionMode = input<'single' | 'multiple' | 'range'>('single'); readonly disabledDates = input<Date[]>([]); readonly disabledDays = input<number[]>([]); readonly showOtherMonths = input(true, { transform: booleanAttribute }); readonly selectOtherMonths = input(false, { transform: booleanAttribute });
  readonly dateSelected = output<string>();
  readonly onSelect = output<{ value: string }>(); readonly onClear = output<void>(); readonly onTodayClick = output<string>();
  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);

  readonly monthLabel = computed(() => fromMonthKey(this.currentMonth()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
  readonly days = computed<CalendarDay[]>(() => {
    const month = fromMonthKey(this.currentMonth());
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());
    const today = toIso(new Date());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const iso = toIso(date);
      return {
        iso,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
        today: iso === today,
        disabled: this.disabled() || (!!this.min() && iso < this.min()) || (!!this.max() && iso > this.max()) || this.disabledDays().includes(date.getDay()) || this.disabledDates().some(disabled => disabled.toDateString() === date.toDateString()) || (!this.selectOtherMonths() && date.getMonth() !== month.getMonth()),
      };
    });
  });

  previousMonth(): void { this.shiftMonth(-1); }
  nextMonth(): void { this.shiftMonth(1); }

  selectDay(day: CalendarDay): void {
    if (day.disabled) return;
    this.value.set(day.iso);
    this.dateSelected.emit(day.iso);
    this.onSelect.emit({ value: day.iso });
  }

  clear(): void { if (this.disabled()) return; this.value.set(''); this.onClear.emit(); }
  today(): void { const iso = toIso(new Date()); this.value.set(iso); this.onTodayClick.emit(iso); this.onSelect.emit({ value: iso }); }

  private shiftMonth(delta: number): void {
    const current = fromMonthKey(this.currentMonth());
    this.currentMonth.set(toMonthKey(new Date(current.getFullYear(), current.getMonth() + delta, 1)));
  }
}

@Component({
  selector: 'orc-combobox',
  standalone: true,
  template: `
    <div class="orc-p2-field">
      @if (label()) { <label [for]="inputId">{{ label() }}</label> }
      <div class="orc-p2-combobox">
        <input
          [id]="inputId"
          role="combobox"
          [value]="query()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="listId"
          [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
          (input)="onInput($event)"
          (focus)="open.set(true)"
          (keydown)="onKeydown($event)" />
        @if (query()) { <button type="button" class="orc-p2-clear" aria-label="Limpar" [disabled]="disabled()" (click)="clear()">×</button> }
      </div>
      @if (open()) {
        <ul class="orc-p2-options" [id]="listId" role="listbox">
          @for (option of filteredOptions(); track option.value) {
            <li [id]="optionId($index)" role="option" [attr.aria-selected]="value() === option.value" [class.is-active]="$index === activeIndex()" [class.is-disabled]="option.disabled" (mousedown)="$event.preventDefault()" (click)="select(option)">
              <strong>{{ option.label }}</strong>
              @if (option.description) { <small>{{ option.description }}</small> }
            </li>
          } @empty { <li class="orc-p2-empty">{{ emptyText() }}</li> }
        </ul>
      }
      @if (helperText()) { <small class="orc-p2-muted">{{ helperText() }}</small> }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-field { position: relative; display: grid; gap: .35rem; width: 100%; color: #0f172a; }
    label { font-size: .875rem; font-weight: 600; }
    .orc-p2-combobox { position: relative; display: flex; align-items: center; }
    input { width: 100%; min-height: 2.5rem; border: 1px solid #cbd5e1; border-radius: .5rem; padding: .5rem .75rem; }
    .orc-p2-clear { position: absolute; right: .25rem; border: 0; background: transparent; font-size: 1.2rem; }
    .orc-p2-options { position: absolute; z-index: 2; top: 4.3rem; right: 0; left: 0; max-height: 15rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #fff; box-shadow: 0 10px 25px #0f172a1a; list-style: none; }
    .orc-p2-options li { display: grid; gap: .1rem; padding: .55rem .65rem; border-radius: .35rem; cursor: pointer; }
    .orc-p2-options li:hover, .orc-p2-options .is-active { background: #eff6ff; }
    .orc-p2-options .is-disabled { color: #94a3b8; cursor: not-allowed; }
    .orc-p2-options small { color: #64748b; }
    .orc-p2-empty { color: #64748b; cursor: default !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxComponent<T = unknown> {
  private static nextId = 0;
  readonly inputId = `orc-combobox-${++ComboboxComponent.nextId}`;
  readonly listId = `${this.inputId}-listbox`;
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly query = model('');
  readonly open = model(false);
  readonly label = input('');
  readonly placeholder = input('Search…');
  readonly helperText = input('');
  readonly emptyText = input('No results');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly optionSelected = output<P2Option<T>>();
  readonly activeIndex = signal(-1);

  readonly filteredOptions = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    return this.options().filter(option => !term || option.label.toLocaleLowerCase().includes(term));
  });

  optionId(index: number): string { return `${this.listId}-option-${index}`; }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activeIndex.set(0);
  }

  select(option: P2Option<T>): void {
    if (option.disabled || this.disabled()) return;
    this.value.set(option.value);
    this.query.set(option.label);
    this.open.set(false);
    this.optionSelected.emit(option);
  }

  clear(): void { this.value.set(null); this.query.set(''); this.open.set(false); }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();
    if (event.key === 'Escape') { this.open.set(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex.update(index => options.length ? (index + delta + options.length) % options.length : -1);
    } else if (event.key === 'Enter' && this.open() && this.activeIndex() >= 0) {
      event.preventDefault();
      const option = options[this.activeIndex()];
      if (option) this.select(option);
    }
  }
}

@Component({
  selector: 'orc-date-input',
  standalone: true,
  template: `
    <label class="orc-p2-date-input">
      @if (label()) { <span>{{ label() }} @if (required()) { <sup>*</sup> }</span> }
      <input type="date" [value]="value()" [min]="min() || null" [max]="max() || null" [disabled]="effectiveDisabled()" [readonly]="readonly()" [attr.aria-invalid]="!!error()" (input)="onInput($event)" (blur)="onTouched()" />
      @if (error()) { <small class="error" role="alert">{{ error() }}</small> }
      @if (!error() && helperText()) { <small>{{ helperText() }}</small> }
    </label>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-date-input { display: grid; gap: .35rem; color: #0f172a; font-size: .875rem; font-weight: 600; }
    input { min-height: 2.5rem; border: 1px solid #cbd5e1; border-radius: .5rem; padding: .5rem .65rem; font-weight: 400; }
    small { color: #64748b; font-weight: 400; } .error { color: #b91c1c; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateInputComponent), multi: true }],
})
export class DateInputComponent implements ControlValueAccessor {
  readonly value = model('');
  readonly label = input('');
  readonly name = input('');
  readonly min = input('');
  readonly max = input('');
  readonly helperText = input('');
  readonly error = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly cvaDisabled = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouchedCallback: () => void = () => undefined;
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  writeValue(value: string | null): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouchedCallback = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }
  onInput(event: Event): void { const value = (event.target as HTMLInputElement).value; this.value.set(value); this.onChange(value); }
  onTouched(): void { this.onTouchedCallback(); }
}

@Component({
  selector: 'orc-input-group',
  standalone: true,
  template: `<div class="orc-p2-input-group" role="group" [attr.aria-label]="label() || null"><span class="prefix" [class.empty]="!prefix()">{{ prefix() }}</span><div class="control"><ng-content /></div><span class="suffix" [class.empty]="!suffix()">{{ suffix() }}</span></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-input-group { display: flex; align-items: stretch; width: 100%; min-height: 2.5rem; border: 1px solid #cbd5e1; border-radius: .5rem; overflow: hidden; background: #fff; } .prefix, .suffix { display: inline-flex; align-items: center; padding-inline: .7rem; background: #f8fafc; color: #475569; font-size: .875rem; } .prefix.empty, .suffix.empty { display: none; } .control { display: flex; flex: 1; align-items: center; min-width: 0; } .control ::ng-deep input, .control ::ng-deep textarea, .control ::ng-deep select { width: 100%; border: 0; outline: 0; padding: .5rem .7rem; background: transparent; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupComponent {
  readonly label = input('');
  readonly prefix = input('');
  readonly suffix = input('');
}

@Component({
  selector: 'orc-listbox',
  standalone: true,
  template: `
    <div class="p-listbox p-component orc-p2-listbox-wrap" [class]="'p-listbox p-component orc-p2-listbox-wrap ' + styleClass()" [style]="style()" [attr.data-pc-name]="'listbox'">
      @if (label()) { <label>{{ label() }}</label> }
      @if (filter()) { <input [value]="filterValue()" [placeholder]="filterPlaceholder()" (input)="onFilterInput($event)" [attr.aria-label]="ariaFilterLabel() || 'Filter options'" /> }
      <ul class="p-listbox-list orc-p2-listbox" [id]="id()" [class]="'p-listbox-list orc-p2-listbox ' + listStyleClass()" [style]="listStyle()" [style.max-height]="scrollHeight()" role="listbox" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-multiselectable]="multiple()" [attr.tabindex]="tabindex()" [attr.aria-disabled]="disabled() || cvaDisabled()" (keydown)="onKeydown($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event); onModelTouched()">
        @for (option of filteredOptions(); track getOptionValue(option)) {
          <li class="p-listbox-option" role="option" [attr.aria-selected]="isSelected(option)" [class.is-selected]="isSelected(option)" [class.is-disabled]="isOptionDisabled(option)" (click)="select(option, $event)" (dblclick)="onDblClick.emit({ originalEvent: $event, option })">
            <span>{{ getOptionLabel(option) }}</span>@if (option.description) { <small>{{ option.description }}</small> }
          </li>
        } @empty { <li class="empty">{{ filterValue() ? emptyFilterMessage() : emptyText() }}</li> }
      </ul>
    </div>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-listbox-wrap { display: grid; gap: .35rem; color: #0f172a; } label { font-size: .875rem; font-weight: 600; }
    .orc-p2-listbox { max-height: 16rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .5rem; list-style: none; outline: none; }
    li { display: grid; gap: .1rem; padding: .55rem .65rem; border-radius: .35rem; cursor: pointer; } li:hover, li.is-selected { background: #eff6ff; color: #1d4ed8; } li.is-disabled { color: #94a3b8; cursor: not-allowed; } small, .empty { color: #64748b; } .empty { cursor: default; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxComponent<T = unknown> implements ControlValueAccessor {
  readonly options = input<any[]>([]);
  readonly value = model<T | T[] | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly label = input('');
  readonly ariaLabel = input('Listbox');
  readonly id = input<string | undefined>(undefined); readonly readonly = input(false, { transform: booleanAttribute }); readonly dataKey = input<string | undefined>(undefined); readonly selectOnFocus = input(false, { transform: booleanAttribute }); readonly focusOnHover = input(false, { transform: booleanAttribute }); readonly autoOptionFocus = input(false, { transform: booleanAttribute });
  readonly emptyText = input('No options'); readonly emptyFilterMessage = input('No results found'); readonly searchMessage = input<string | undefined>(undefined); readonly selectionMessage = input<string | undefined>(undefined); readonly style = input<Record<string, string> | undefined>(undefined); readonly listStyle = input<Record<string, string> | undefined>(undefined); readonly listStyleClass = input(''); readonly striped = input(false, { transform: booleanAttribute }); readonly checkbox = input(false, { transform: booleanAttribute }); readonly checkmark = input(false, { transform: booleanAttribute }); readonly highlightOnSelect = input(false, { transform: booleanAttribute }); readonly showToggleAll = input(false, { transform: booleanAttribute }); readonly group = input(false, { transform: booleanAttribute }); readonly lazy = input(false, { transform: booleanAttribute }); readonly virtualScroll = input(false, { transform: booleanAttribute }); readonly virtualScrollItemSize = input<number | undefined>(undefined); readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(undefined); readonly scrollHeight = input('16rem');
  readonly optionLabel = input<string | undefined>(undefined); readonly optionValue = input<string | undefined>(undefined); readonly optionDisabled = input<string | ((option: any) => boolean) | undefined>(undefined); readonly optionGroupLabel = input<string | undefined>(undefined); readonly optionGroupChildren = input<string | undefined>(undefined); readonly filter = input(false, { transform: booleanAttribute }); readonly filterPlaceholder = input('Filter'); readonly filterValue = model(''); readonly filterBy = input<string | undefined>(undefined); readonly filterFields = input<string[] | undefined>(undefined); readonly filterMatchMode = input<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | string>('contains'); readonly filterLocale = input<string | undefined>(undefined); readonly ariaFilterLabel = input<string | undefined>(undefined); readonly disabled = input(false, { transform: booleanAttribute }); readonly tabindex = input(0); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly styleClass = input('');
  readonly optionSelected = output<any>(); readonly onChange = output<{ originalEvent: Event; value: T | T[] | null }>(); readonly onClick = output<{ originalEvent: Event; option: any }>(); readonly onDblClick = output<{ originalEvent: Event; option: any }>(); readonly onFilter = output<{ originalEvent: Event; filter: string }>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly onSelectAllChange = output<{ originalEvent: Event; checked: boolean }>(); readonly onLazyLoad = output<{ first: number; last: number }>(); readonly onDrop = output<unknown>();
  readonly activeIndex = signal(0);
  protected readonly cvaDisabled = signal(false); private onModelChange: (value: T | T[] | null) => void = () => {}; protected onModelTouched: () => void = () => {};
  readonly filteredOptions = computed(() => { const term = this.filterValue().trim(); if (!term) return this.options(); const fields = this.filterFields() ?? (this.filterBy() ? this.filterBy()!.split(',').map(field => field.trim()).filter(Boolean) : undefined); const locale = this.filterLocale() || undefined; const query = term.toLocaleLowerCase(locale); return this.options().filter(option => (fields?.length ? fields.map(field => String((option as any)?.[field] ?? '')) : [this.getOptionLabel(option)]).some(value => { const normalized = value.toLocaleLowerCase(locale); switch (this.filterMatchMode()) { case 'startsWith': return normalized.startsWith(query); case 'endsWith': return normalized.endsWith(query); case 'equals': return normalized === query; case 'notEquals': return normalized !== query; default: return normalized.includes(query); } })); });

  writeValue(value: T | T[] | null): void { this.value.set(value ?? null); }
  registerOnChange(fn: (value: T | T[] | null) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  getOptionValue(option: any): any { const key = this.optionValue(); return key ? option?.[key] : option?.value ?? option; }
  getOptionLabel(option: any): string { const key = this.optionLabel(); return String(key ? option?.[key] ?? '' : option?.label ?? option ?? ''); }
  isOptionDisabled(option: any): boolean { const key = this.optionDisabled(); return typeof key === 'function' ? key(option) : Boolean(key ? option?.[key] : option?.disabled); }

  isSelected(option: any): boolean {
    const current = this.value();
    const candidate = this.getOptionValue(option); return this.multiple() ? (Array.isArray(current) && current.includes(candidate)) : current === candidate;
  }

  select(option: any, event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly() || this.isOptionDisabled(option)) return;
    const candidate = this.getOptionValue(option); let next: T | T[] | null;
    if (this.multiple()) {
      const value = this.value();
      const current = Array.isArray(value) ? [...value] : [];
      const index = current.indexOf(candidate);
      index >= 0 ? current.splice(index, 1) : current.push(candidate);
      next = current as T[];
    } else next = candidate;
    this.value.set(next); this.onModelChange(next); this.onModelTouched(); this.optionSelected.emit(option); if (event) { this.onChange.emit({ originalEvent: event, value: next }); this.onClick.emit({ originalEvent: event, option }); }
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions().filter(option => !this.isOptionDisabled(option));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex.update(index => options.length ? (index + delta + options.length) % options.length : 0);
    } else if (event.key === 'Enter' && options[this.activeIndex()]) {
      this.select(options[this.activeIndex()]);
    }
  }
  onFilterInput(event: Event): void { const filter = (event.target as HTMLInputElement).value; this.filterValue.set(filter); this.onFilter.emit({ originalEvent: event, filter }); }
}

@Component({
  selector: 'orc-multi-select',
  standalone: true,
  template: `
    <div class="p-multiselect p-component orc-p2-multi-select" [class]="'p-multiselect p-component orc-p2-multi-select ' + styleClass()" [style]="style()" [class.fluid]="fluid()" [attr.data-pc-name]="'multiselect'">
      @if (label()) { <label [for]="effectiveId()">{{ label() }}</label> }
      <button type="button" class="p-multiselect-label p-multiselect-trigger trigger" [disabled]="disabled() || cvaDisabled()" [attr.id]="effectiveId()" [attr.tabindex]="tabindex()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-expanded]="open()" [attr.aria-controls]="effectiveId() + '-panel'" (click)="toggleOpen()" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event)">
        <span>{{ selectedLabels() || placeholder() }}</span><span aria-hidden="true">⌄</span>
      </button>
      @if (showClear() && value().length) { <button type="button" class="clear" (click)="clear($event)" aria-label="Clear">×</button> }
      @if (open()) {
        @if (showToggleAll()) { <button type="button" class="toggle-all" (click)="selectAll($event)">{{ allOptionsSelected() ? 'Clear all' : 'Select all' }}</button> }
        @if (filter()) { <input [value]="filterValue()" [placeholder]="filterPlaceholder()" (input)="onFilterInput($event)" [attr.aria-label]="ariaFilterLabel() || 'Filter options'" [autofocus]="autofocusFilter()" /> }
        <ul class="p-multiselect-panel p-component options" [class]="'p-multiselect-panel p-component options ' + panelStyleClass()" [style]="panelStyle()" [id]="effectiveId() + '-panel'" role="listbox" aria-multiselectable="true">
          @if (loading()) { <li class="empty" aria-live="polite">{{ loadingIcon() || 'Loading…' }}</li> } @else {
          @for (option of filteredOptions(); track getOptionValue(option)) { <li role="option" [attr.aria-selected]="isSelected(option)" [class.is-disabled]="isOptionDisabled(option)" (click)="select(option, $event)"><span class="check">{{ isSelected(option) ? '✓' : '' }}</span>{{ getOptionLabel(option) }}</li> }
          @empty { <li class="empty">{{ filterValue() ? emptyFilterMessage() : emptyMessage() }}</li> }
          }
        </ul>
      }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-multi-select { position: relative; display: grid; gap: .35rem; color: #0f172a; } label { font-size: .875rem; font-weight: 600; }
    .trigger { display: flex; justify-content: space-between; align-items: center; min-height: 2.5rem; border: 1px solid #cbd5e1; border-radius: .5rem; padding: .5rem .75rem; background: #fff; text-align: left; }
    .options { position: absolute; z-index: 2; top: 4.2rem; right: 0; left: 0; max-height: 15rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #fff; box-shadow: 0 10px 25px #0f172a1a; list-style: none; }
    li { display: flex; gap: .5rem; align-items: center; padding: .55rem .65rem; border-radius: .35rem; cursor: pointer; } li:hover { background: #eff6ff; } .check { width: 1rem; color: #2563eb; } .empty { color: #64748b; cursor: default; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent<T = unknown> implements ControlValueAccessor {
  private readonly uniqueId = `orc-multiselect-${++nextMultiSelectId}`;
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T[]>([]);
  readonly label = input('');
  readonly placeholder = input('Select options');
  readonly emptyText = input('No options');
  readonly disabled = input(false, { transform: booleanAttribute }); readonly readonly = input(false, { transform: booleanAttribute }); readonly fluid = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined); readonly ariaLabel = input<string | undefined>(undefined); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly tabindex = input<number | undefined>(undefined); readonly name = input<string | undefined>(undefined); readonly variant = input<'filled' | 'outlined'>('outlined'); readonly styleClass = input(''); readonly style = input<Record<string, string> | undefined>(undefined); readonly panelStyle = input<Record<string, string> | undefined>(undefined); readonly panelStyleClass = input(''); readonly appendTo = input<unknown>(undefined); readonly overlayOptions = input<Record<string, unknown> | undefined>(undefined);
  readonly optionLabel = input<string | undefined>(undefined); readonly optionValue = input<string | undefined>(undefined); readonly optionDisabled = input<string | undefined>(undefined); readonly optionGroupLabel = input<string | undefined>(undefined); readonly optionGroupChildren = input('items'); readonly dataKey = input<string | undefined>(undefined); readonly group = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute }); readonly filterPlaceholder = input('Filter'); readonly filterValue = model(''); readonly filterBy = input<string | undefined>(undefined); readonly filterFields = input<string[] | undefined>(undefined); readonly filterLocale = input<string | undefined>(undefined); readonly filterMatchMode = input<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte'>('contains'); readonly ariaFilterLabel = input<string | undefined>(undefined); readonly showClear = input(false, { transform: booleanAttribute }); readonly showToggleAll = input(true, { transform: booleanAttribute }); readonly showHeader = input(true, { transform: booleanAttribute }); readonly maxSelectedLabels = input<number | undefined>(undefined); readonly selectedItemsLabel = input('{0} items selected'); readonly selectionLimit = input<number | undefined>(undefined); readonly emptyFilterMessage = input('No results found'); readonly emptyMessage = input('No options'); readonly resetFilterOnHide = input(true, { transform: booleanAttribute }); readonly loading = input(false, { transform: booleanAttribute }); readonly loadingIcon = input<string | undefined>(undefined); readonly lazy = input(false, { transform: booleanAttribute }); readonly virtualScroll = input(false, { transform: booleanAttribute }); readonly virtualScrollItemSize = input<number | undefined>(undefined); readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(undefined); readonly autofocus = input(false, { transform: booleanAttribute }); readonly autofocusFilter = input(false, { transform: booleanAttribute }); readonly focusOnHover = input(true, { transform: booleanAttribute }); readonly selectOnFocus = input(false, { transform: booleanAttribute }); readonly autoOptionFocus = input(false, { transform: booleanAttribute }); readonly dropdownIcon = input(''); readonly chipIcon = input<string | undefined>(undefined); readonly display = input<'comma' | 'chip'>('comma'); readonly autocomplete = input('off'); readonly size = input<'small' | 'large' | undefined>(undefined); readonly tooltip = input(''); readonly tooltipPosition = input<'top' | 'left' | 'right' | 'bottom'>('right'); readonly tooltipPositionStyle = input('absolute'); readonly tooltipStyleClass = input<string | undefined>(undefined); readonly autoZIndex = input(true, { transform: booleanAttribute }); readonly baseZIndex = input(0);
  readonly open = model(false);
  readonly optionSelected = output<P2Option<T>>(); readonly onChange = output<{ originalEvent: Event; value: T[] }>(); readonly onFilter = output<{ originalEvent: Event; filter: string }>(); readonly onSelectAllChange = output<{ originalEvent: Event; checked: boolean }>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly onClear = output<Event>(); readonly onPanelShow = output<void>(); readonly onPanelHide = output<void>(); readonly onRemove = output<{ value: T; originalEvent: Event }>();
  protected cvaDisabled = signal(false); private onModelChange: (value: T[]) => void = () => {}; private onModelTouched: () => void = () => {};
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly filteredOptions = computed(() => { const term = this.filterValue().trim(); if (!term) return this.options(); const fields = this.filterFields() ?? (this.filterBy() ? this.filterBy()!.split(',').map(field => field.trim()).filter(Boolean) : undefined); return this.options().filter(option => { const values = (fields?.length ? fields.map(field => String((option as any)?.[field] ?? '')) : [this.getOptionLabel(option)]); const locale = this.filterLocale() || undefined; const query = term.toLocaleLowerCase(locale); return values.some(value => { const normalized = value.toLocaleLowerCase(locale); switch (this.filterMatchMode()) { case 'startsWith': return normalized.startsWith(query); case 'endsWith': return normalized.endsWith(query); case 'equals': return normalized === query; case 'notEquals': return normalized !== query; default: return normalized.includes(query); } }); }); });

  writeValue(value: T[] | null): void { this.value.set(Array.isArray(value) ? [...value] : []); }
  registerOnChange(fn: (value: T[]) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  getOptionValue(option: any): any { const key = this.optionValue(); return key ? option?.[key] : option?.value ?? option; }
  getOptionLabel(option: any): string { const key = this.optionLabel(); return String(key ? option?.[key] ?? '' : option?.label ?? option ?? ''); }
  isOptionDisabled(option: any): boolean { const key = this.optionDisabled(); return Boolean(key ? option?.[key] : option?.disabled); }

  isSelected(option: P2Option<T>): boolean { return this.value().includes(this.getOptionValue(option)); }
  selectedLabels(): string { const labels = this.options().filter(option => this.isSelected(option)).map(option => this.getOptionLabel(option)); const max = this.maxSelectedLabels(); return max !== undefined && labels.length > max ? this.selectedItemsLabel().replace('{0}', String(labels.length)) : labels.join(', '); }
  toggleOpen(): void { if (this.disabled() || this.cvaDisabled() || this.readonly()) return; this.open.update(value => !value); if (!this.open() && this.resetFilterOnHide()) this.filterValue.set(''); this.open() ? this.onPanelShow.emit() : this.onPanelHide.emit(); }
  select(option: P2Option<T>, event?: Event): void {
    if (this.isOptionDisabled(option) || this.disabled() || this.cvaDisabled()) return;
    const current = [...this.value()];
    const candidate = this.getOptionValue(option); const index = current.indexOf(candidate);
    if (index >= 0) current.splice(index, 1); else if (this.selectionLimit() === undefined || current.length < this.selectionLimit()!) current.push(candidate);
    this.value.set(current); this.onModelChange(current); this.onModelTouched(); this.optionSelected.emit(option); if (event) { this.onChange.emit({ originalEvent: event, value: current }); if (index >= 0) this.onRemove.emit({ value: candidate, originalEvent: event }); }
  }
  clear(event: Event): void { if (this.disabled() || this.cvaDisabled()) return; this.value.set([]); this.onModelChange([]); this.onClear.emit(event); }
  selectAll(event: Event): void { if (this.disabled() || this.cvaDisabled()) return; const selectable = this.options().filter(option => !this.isOptionDisabled(option)); const checked = !selectable.every(option => this.isSelected(option)); const limit = this.selectionLimit(); const next = checked ? selectable.slice(0, limit === undefined ? selectable.length : limit).map(option => this.getOptionValue(option)) : []; this.value.set(next); this.onModelChange(next); this.onSelectAllChange.emit({ originalEvent: event, checked }); }
  allOptionsSelected(): boolean { const selectable = this.options().filter(option => !this.isOptionDisabled(option)); return selectable.length > 0 && selectable.every(option => this.isSelected(option)); }
  onFilterInput(event: Event): void { const filter = (event.target as HTMLInputElement).value; this.filterValue.set(filter); this.onFilter.emit({ originalEvent: event, filter }); }
}

@Component({
  selector: 'orc-tags-input, orc-chips, orc-input-chips',
  standalone: true,
  template: `
    <div class="p-chips p-component orc-p2-tags-input" [class]="'p-chips p-component orc-p2-tags-input ' + styleClass()" [style]="style()" [attr.data-pc-name]="'chips'">
      @if (label()) { <label [for]="effectiveId()">{{ label() }}</label> }
      <div class="p-chips-multiple-container input-shell" [class.is-disabled]="disabled()">
        @for (tag of value(); track $index) { <span class="p-chips-token tag" (click)="onChipClick.emit({ value: tag, index: $index, originalEvent: $event })">{{ tag }} <button type="button" [disabled]="effectiveDisabled()" [attr.aria-label]="'Remove ' + tag" (click)="removeTag($index); $event.stopPropagation()">×</button></span> }
        <input [id]="effectiveId()" [placeholder]="value().length ? '' : placeholder()" [disabled]="effectiveDisabled()" [value]="draft()" [attr.maxlength]="maxLength() || null" [attr.aria-label]="ariaLabel() || null" (input)="draft.set(($any($event.target)).value)" (keydown)="onKeydown($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event); onBlurCommit()" />
      </div>
      @if (suggestions().length && draft()) { <ul class="p-chips-panel p-component suggestions" [id]="effectiveId() + '-panel'" role="listbox">@for (suggestion of filteredSuggestions(); track suggestion) { <li class="p-chips-option" role="option" (mousedown)="$event.preventDefault()" (click)="addTag(suggestion)">{{ suggestion }}</li> }</ul> }
      @if (showClear() && value().length) { <button type="button" (click)="clear($event)" aria-label="Clear">×</button> }
      @if (helperText()) { <small>{{ helperText() }}</small> }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `
    .orc-p2-tags-input { position: relative; display: grid; gap: .35rem; color: #0f172a; } label { font-size: .875rem; font-weight: 600; } .input-shell { display: flex; flex-wrap: wrap; gap: .35rem; align-items: center; min-height: 2.5rem; padding: .35rem .5rem; border: 1px solid #cbd5e1; border-radius: .5rem; } .input-shell.is-disabled { background: #f8fafc; } input { min-width: 6rem; flex: 1; border: 0; outline: 0; } .tag { display: inline-flex; align-items: center; gap: .2rem; padding: .2rem .45rem; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: .8rem; } .tag button { border: 0; padding: 0; background: transparent; color: inherit; } small { color: #64748b; font-weight: 400; } .suggestions { position: absolute; z-index: 2; top: 4.2rem; right: 0; left: 0; margin: 0; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #fff; box-shadow: 0 10px 25px #0f172a1a; list-style: none; } .suggestions li { padding: .5rem .65rem; cursor: pointer; } .suggestions li:hover { background: #eff6ff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagsInputComponent), multi: true }],
})
export class TagsInputComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-chips-${++nextTagsInputId}`;
  readonly value = model<string[]>([]);
  readonly draft = signal('');
  readonly label = input('');
  readonly placeholder = input('Add a tag…');
  readonly helperText = input('');
  readonly suggestions = input<string[]>([]);
  readonly maxTags = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined, { alias: 'max' });
  readonly maxLength = input<number | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly allowDuplicate = input(false, { transform: booleanAttribute });
  readonly caseSensitiveDuplication = input(false, { transform: booleanAttribute });
  readonly addOnTab = input(false, { transform: booleanAttribute });
  readonly addOnBlur = input(false, { transform: booleanAttribute });
  readonly separator = input<string | RegExp | undefined>(undefined);
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input('');
  readonly tagAdded = output<string>();
  readonly tagRemoved = output<string>();
  readonly onAdd = output<{ value: string }>();
  readonly onRemove = output<{ value: string; index: number }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onChipClick = output<{ value: string; index: number; originalEvent: Event }>();
  readonly onClear = output<Event>();
  protected readonly cvaDisabled = signal(false);
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  private onChange: (value: string[]) => void = () => undefined;
  private onTouchedCallback: () => void = () => undefined;

  readonly filteredSuggestions = computed(() => this.suggestions().filter(item => item.toLocaleLowerCase().includes(this.draft().toLocaleLowerCase()) && !this.value().includes(item)).slice(0, 8));

  writeValue(value: string[] | null): void { this.value.set(Array.isArray(value) ? [...value] : []); }
  registerOnChange(fn: (value: string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouchedCallback = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  onKeydown(event: KeyboardEvent): void {
    const separator = this.separator();
    const separatorPressed = typeof separator === 'string' ? event.key === separator : separator instanceof RegExp && separator.test(event.key);
    if (event.key === 'Enter' || (event.key === 'Tab' && this.addOnTab()) || separatorPressed) { event.preventDefault(); this.addTag(this.draft().trim()); }
    if (event.key === 'Backspace' && !this.draft() && this.value().length) this.removeTag(this.value().length - 1);
  }
  onBlurCommit(): void { if (this.addOnBlur()) this.addTag(this.draft().trim()); }
  addTag(tag: string): void {
    const normalized = tag.trim();
    const duplicate = this.value().some(item => this.caseSensitiveDuplication() ? item === normalized : item.toLowerCase() === normalized.toLowerCase());
    const max = this.max() ?? this.maxTags();
    if (!normalized || this.effectiveDisabled() || (!this.allowDuplicate() && duplicate) || (max !== undefined && this.value().length >= max)) return;
    const next = [...this.value(), normalized]; this.value.set(next); this.draft.set(''); this.onChange(next); this.tagAdded.emit(normalized);
    this.onAdd.emit({ value: normalized });
  }
  removeTag(index: number): void {
    if (this.effectiveDisabled()) return;
    const removed = this.value()[index]; if (removed === undefined) return;
    const next = this.value().filter((_, current) => current !== index); this.value.set(next); this.onChange(next); this.tagRemoved.emit(removed); this.onRemove.emit({ value: removed, index });
  }
  clear(event: Event): void { if (this.effectiveDisabled()) return; this.value.set([]); this.draft.set(''); this.onChange([]); this.onClear.emit(event); }
  onTouched(): void { this.onTouchedCallback(); }
}
