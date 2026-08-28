import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, forwardRef, HostListener, inject, input, model, output, signal, booleanAttribute, numberAttribute, viewChildren } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextDatePickerId = 0;

@Component({selector:'orc-date-picker-calendar',standalone:true,template:`<section class="orc-date-picker-calendar" [class.orc-date-picker-calendar--embedded]="embedded()" [attr.aria-label]="ariaLabel() || null"><header><button type="button" [attr.aria-label]="previousMonthLabel() || null" (click)="shift(-1)">‹</button><strong>{{ monthLabel() }}</strong><button type="button" [attr.aria-label]="nextMonthLabel() || null" (click)="shift(1)">›</button></header>@if(view() === 'month'){<div class="month-grid" role="grid">@for (month of months(); track month.index) {<button type="button" [class.selected]="isSelected(month.iso)" (click)="select(month.iso)">{{ month.label }}</button>}</div>}@else if(view() === 'year'){<div class="year-grid" role="grid">@for (year of years(); track year) {<button type="button" [class.selected]="isSelected(year + '-01-01')" (click)="select(year + '-01-01')">{{ year }}</button>}</div>}@else {<div class="weekdays" [class.with-week]="showWeek()">@if(showWeek()){<span aria-hidden="true"></span>}@for (day of weekdayLabels(); track day) { <span>{{ day }}</span> }</div><div class="days" [class.with-week]="showWeek()" role="grid">@for (day of days(); track day.iso) { @if(showWeek() && day.weekNumber !== undefined){<span class="week-number" [attr.aria-label]="weekLabel() ? weekLabel() + ' ' + day.weekNumber : null">{{ day.weekNumber }}</span>} @if (showOtherMonths() || day.inCurrentMonth) { <button type="button" [disabled]="day.disabled" [class.outside]="!day.inCurrentMonth" [class.selected]="isSelected(day.iso)" [attr.aria-selected]="isSelected(day.iso)" (click)="select(day.iso)">{{ day.day }}</button> } }</div>}</section>`,styles:[`.orc-date-picker-calendar{width:20rem;padding:.75rem;border:1px solid var(--orc-border-default,#cbd5e1);border-radius:.5rem;background:var(--orc-surface-raised,#fff);color:var(--orc-text,#0f172a);box-sizing:border-box}.orc-date-picker-calendar--embedded{border:0;border-radius:0;background:transparent}.orc-date-picker-calendar header,.weekdays,.days,.month-grid,.year-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.2rem;align-items:center}.orc-date-picker-calendar header{grid-template-columns:2rem 1fr 2rem;text-align:center}.orc-date-picker-calendar header button{border:0;background:transparent;color:inherit;font-size:1.2rem}.weekdays{color:var(--orc-text-muted,#64748b);font-size:.7rem;text-align:center}.weekdays.with-week,.days.with-week{grid-template-columns:2rem repeat(7,1fr)}.month-grid,.year-grid{grid-template-columns:repeat(3,1fr);padding:.5rem}.month-grid button,.year-grid button{min-height:2.5rem;border:0;border-radius:.3rem;background:transparent;color:inherit}.week-number{color:var(--orc-text-muted,#94a3b8);font-size:.7rem;text-align:center}.days button{min-height:2rem;border:0;border-radius:.3rem;background:transparent;color:inherit}.days button.selected,.month-grid button.selected,.year-grid button.selected{background:var(--orc-interactive,#2563eb);color:var(--orc-on-interactive,#fff)}.days button.outside{color:var(--orc-text-muted,#94a3b8)}`],changeDetection:ChangeDetectionStrategy.OnPush})
export class DatePickerCalendarComponent {
  private readonly document = inject(DOCUMENT);
  readonly viewDateChange=output<{ month: number; year: number }>();
  readonly value=model(''); readonly selectedValues=input<string[]>([]); readonly currentMonth=model(this.monthKey(new Date())); readonly min=input(''); readonly max=input(''); readonly disabled=input(false,{transform:booleanAttribute}); readonly disabledDates=input<Date[]>([]); readonly disabledDays=input<number[]>([]); readonly firstDayOfWeek=input(0,{transform:numberAttribute}); readonly showOtherMonths=input(true,{transform:booleanAttribute}); readonly selectOtherMonths=input(false,{transform:booleanAttribute}); readonly showWeek=input(false,{transform:booleanAttribute}); readonly embedded=input(false,{transform:booleanAttribute}); readonly view=input<'date' | 'month' | 'year'>('date'); readonly locale=input<string | undefined>(undefined); readonly ariaLabel=input<string | undefined>(undefined); readonly previousMonthLabel=input<string | undefined>(undefined); readonly nextMonthLabel=input<string | undefined>(undefined); readonly weekLabel=input<string | undefined>(undefined); readonly dateSelected=output<string>(); readonly weekdayLabels=computed(() => { const locale = this.locale() || this.document.documentElement.lang || undefined; const formatter = new Intl.DateTimeFormat(locale,{weekday:'short'}); const labels = Array.from({length:7},(_,index) => formatter.format(new Date(2021,7,1 + index))); const first = ((this.firstDayOfWeek() % 7) + 7) % 7; return [...labels.slice(first), ...labels.slice(0, first)]; });
  readonly monthOffset=input(0,{transform:numberAttribute});
  private monthKey(date:Date):string{return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;} private monthDate():Date{const [year,month]=this.currentMonth().split('-').map(Number);return new Date(year,month-1+this.monthOffset(),1);} private effectiveLocale():string | undefined{return this.locale() || this.document.documentElement.lang || undefined;} monthLabel():string{return this.monthDate().toLocaleDateString(this.effectiveLocale(),{month:'long',year:'numeric'});} shift(delta:number):void{const [year,month]=this.currentMonth().split('-').map(Number);const next=new Date(year,month-1+delta,1);this.currentMonth.set(this.monthKey(next));this.viewDateChange.emit({month:next.getMonth()+1,year:next.getFullYear()});}
  readonly days=computed(()=>{const month=this.monthDate();const offset=(month.getDay()-this.firstDayOfWeek()+7)%7;const start=new Date(month.getFullYear(),month.getMonth(),1-offset);return Array.from({length:42},(_,index)=>{const date=new Date(start.getFullYear(),start.getMonth(),start.getDate()+index);const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;return {iso,day:date.getDate(),weekNumber:index%7===0?this.weekNumber(date):undefined,inCurrentMonth:date.getMonth()===month.getMonth(),disabled:this.disabled()||!!(this.min()&&iso<this.min())||!!(this.max()&&iso>this.max())||this.disabledDays().includes(date.getDay())||this.disabledDates().some(item=>item.toDateString()===date.toDateString())||(!this.selectOtherMonths()&&date.getMonth()!==month.getMonth())};});});
  private weekNumber(date:Date):number { const thursday=new Date(date.getFullYear(),date.getMonth(),date.getDate()+((4-date.getDay()+7)%7)); const yearStart=new Date(thursday.getFullYear(),0,1); return Math.ceil((((thursday.getTime()-yearStart.getTime())/86400000)+1)/7); }
  readonly months=computed(() => Array.from({length:12}, (_, index) => ({index, label:new Date(2000,index,1).toLocaleDateString(this.effectiveLocale(),{month:'long'}), iso:`${this.monthDate().getFullYear()}-${String(index+1).padStart(2,'0')}-01`})));
  readonly years=computed(() => { const year=this.monthDate().getFullYear(); return Array.from({length:12}, (_, index) => year-5+index); });
  isSelected(iso: string): boolean { return this.selectedValues().includes(iso) || this.value() === iso; }
  select(iso:string):void{if(!this.days().find(day=>day.iso===iso)?.disabled){this.value.set(iso);this.dateSelected.emit(iso);}}
}

@Component({selector:'orc-date-picker',standalone:true,imports:[CommonModule, DatePickerCalendarComponent],templateUrl:'./date-picker.component.html',styleUrl:'./date-picker.component.scss',changeDetection:ChangeDetectionStrategy.OnPush,host:{'class':'p-datepicker p-component','[attr.data-pc-name]':"'datepicker'"},providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>DatePickerComponent),multi:true}]})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly uniqueId = `orc-date-picker-${++nextDatePickerId}`;
  readonly calendars = viewChildren(DatePickerCalendarComponent);
  readonly maxDateCount=input<number | undefined, unknown>(undefined, { transform: numberAttribute }); readonly hideOnDateTimeSelect=input(true, { transform: booleanAttribute });
  /** PrimeNG-compatible value and configuration surface. */
  readonly value=model<any>(''); readonly label=input(''); readonly min=input(''); readonly max=input(''); readonly helperText=input(''); readonly error=input(''); readonly required=input(false, { transform: booleanAttribute }); readonly disabled=input(false, { transform: booleanAttribute });
  readonly placeholder=input<string | undefined>(undefined); readonly dateFormat=input<string | undefined>(undefined); readonly selectionMode=input<'single' | 'multiple' | 'range'>('single'); readonly showIcon=input(false, { transform: booleanAttribute }); readonly showButtonBar=input(false, { transform: booleanAttribute }); readonly showClear=input(false, { transform: booleanAttribute }); readonly inline=input(false, { transform: booleanAttribute }); readonly showTime=input(false, { transform: booleanAttribute }); readonly timeOnly=input(false, { transform: booleanAttribute }); readonly showSeconds=input(false, { transform: booleanAttribute }); readonly touchUI=input(false, { transform: booleanAttribute }); readonly showWeek=input(false, { transform: booleanAttribute }); readonly showOtherMonths=input(true, { transform: booleanAttribute }); readonly selectOtherMonths=input(false, { transform: booleanAttribute }); readonly readonlyInput=input(false, { transform: booleanAttribute }); readonly autofocus=input(false, { transform: booleanAttribute }); readonly hourFormat=input('24'); readonly firstDayOfWeek=input(0, { transform: numberAttribute }); readonly numberOfMonths=input(1, { transform: numberAttribute }); readonly minDate=input<Date | null | undefined>(undefined); readonly maxDate=input<Date | null | undefined>(undefined); readonly disabledDates=input<Date[] | undefined>(undefined); readonly disabledDays=input<number[] | undefined>(undefined); readonly view=input<'date' | 'month' | 'year'>('date'); readonly ariaLabel=input<string | undefined>(undefined); readonly ariaLabelledBy=input<string | undefined>(undefined); readonly name=input<string | undefined>(undefined); readonly inputId=input<string | undefined>(undefined); readonly tabindex=input<number | undefined>(undefined); readonly panelStyleClass=input<string | undefined>(undefined); readonly panelStyle=input<Record<string, string | number> | undefined>(undefined); readonly style=input<Record<string, string | number> | undefined>(undefined); readonly styleClass=input<string | undefined>(undefined); readonly inputStyle=input<Record<string, string | number> | undefined>(undefined); readonly inputStyleClass=input<string | undefined>(undefined); readonly dataType=input<'date' | 'string'>('string'); readonly defaultDate=input<Date | null | undefined>(undefined); readonly viewDate=model<Date>(new Date()); readonly showOnFocus=input(true, { transform: booleanAttribute }); readonly keepInvalid=input(false, { transform: booleanAttribute }); readonly appendTo=input<unknown>(undefined); readonly autoZIndex=input(true, { transform: booleanAttribute }); readonly baseZIndex=input(0, { transform: numberAttribute }); readonly focusOnShow=input(true, { transform: booleanAttribute }); readonly focusTrap=input(true, { transform: booleanAttribute }); readonly fluid=input(false, { transform: booleanAttribute }); readonly variant=input<'outlined' | 'filled' | undefined>(undefined); readonly size=input<'small' | 'large' | undefined>(undefined); readonly mask=input(false, { transform: booleanAttribute }); readonly multipleSeparator=input(', '); readonly rangeSeparator=input(' - '); readonly yearNavigator=input(false, { transform: booleanAttribute }); readonly monthNavigator=input(false, { transform: booleanAttribute }); readonly yearRange=input<string | undefined>(undefined); readonly stepHour=input(1, { transform: numberAttribute }); readonly stepMinute=input(1, { transform: numberAttribute }); readonly stepSecond=input(1, { transform: numberAttribute }); readonly showTransitionOptions=input('150ms cubic-bezier(0, 0, 0.2, 1)'); readonly hideTransitionOptions=input('150ms cubic-bezier(0, 0, 0.2, 1)'); readonly clearButtonStyleClass=input<string | undefined>(undefined); readonly todayButtonStyleClass=input<string | undefined>(undefined); readonly icon=input<string | undefined>(undefined); readonly iconAriaLabel=input<string | undefined>(undefined); readonly iconDisplay=input<'input' | 'button'>('button'); readonly defaultViewDate=input<Date | null | undefined>(undefined); readonly locale=input<string | undefined>(undefined); readonly panelAriaLabel=input<string | undefined>(undefined); readonly previousMonthLabel=input<string | undefined>(undefined); readonly nextMonthLabel=input<string | undefined>(undefined); readonly timePickerAriaLabel=input<string | undefined>(undefined); readonly previousHourLabel=input<string | undefined>(undefined); readonly nextHourLabel=input<string | undefined>(undefined); readonly previousMinuteLabel=input<string | undefined>(undefined); readonly nextMinuteLabel=input<string | undefined>(undefined); readonly previousSecondLabel=input<string | undefined>(undefined); readonly nextSecondLabel=input<string | undefined>(undefined); readonly toggleMeridiemLabel=input<string | undefined>(undefined); readonly todayLabel=input<string | undefined>(undefined); readonly clearLabel=input<string | undefined>(undefined);
  readonly onFocus=output<Event>(); readonly onBlur=output<Event>(); readonly onClose=output<void>(); readonly onSelect=output<any>(); readonly onClear=output<void>(); readonly onInput=output<any>(); readonly onTodayClick=output<Date>(); readonly onClearClick=output<void>(); readonly onShow=output<void>(); readonly onViewDateChange=output<{ month: number; year: number }>(); readonly onMonthChange=output<{ month: number; year: number }>(); readonly onYearChange=output<{ month: number; year: number }>(); readonly onClickOutside=output<MouseEvent>();
  readonly overlayVisible = model(false);
  readonly effectiveInputId = computed(() => this.inputId() || this.uniqueId);
  readonly panelId = computed(() => `${this.effectiveInputId()}-panel`);
  private subscribedCalendars = new Set<DatePickerCalendarComponent>();
  private lastCalendarView: { month: number; year: number } | null = null;
  protected readonly cvaDisabled=signal(false);
  private onChange:(value:any)=>void=()=>{}; private onTouched:()=>void=()=>{};
  constructor() { effect(() => { for (const calendar of this.calendars()) { if (this.subscribedCalendars.has(calendar)) continue; this.subscribedCalendars.add(calendar); calendar.viewDateChange.subscribe(view => this.handleCalendarViewDateChange(view)); } }); }
  private handleCalendarViewDateChange(view: { month: number; year: number }): void { const previous = this.lastCalendarView; this.lastCalendarView = view; this.viewDate.set(new Date(view.year, view.month - 1, 1)); this.onViewDateChange.emit(view); if (!previous || previous.month !== view.month || previous.year !== view.year) this.onMonthChange.emit(view); if (!previous || previous.year !== view.year) this.onYearChange.emit(view); }
  readonly calendarValue = computed(() => { const value = this.value(); const first = Array.isArray(value) ? value[0] : value; return first instanceof Date ? first.toISOString().slice(0, 10) : String(first ?? ''); });
  readonly calendarValues = computed(() => { const value = this.value(); const values = Array.isArray(value) ? value : [value]; return values.map(item => item instanceof Date ? item.toISOString().slice(0, 10) : String(item ?? '')).filter(Boolean); });
  readonly timeParts = computed(() => { const raw = Array.isArray(this.value()) ? this.value()[0] : this.value(); const date = raw instanceof Date ? raw : new Date(String(raw || '1970-01-01T00:00:00')); return Number.isNaN(date.valueOf()) ? { hour: 0, minute: 0, second: 0 } : { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() }; });
  readonly calendarMin = computed(() => this.dateConstraint(this.minDate(), this.min()));
  readonly calendarMax = computed(() => this.dateConstraint(this.maxDate(), this.max()));
  readonly monthOffsets = computed(() => Array.from({ length: Math.max(1, this.numberOfMonths()) }, (_, index) => index));
  writeValue(value:any):void{this.value.set(value??'');} registerOnChange(fn:(value:any)=>void):void{this.onChange=fn;} registerOnTouched(fn:()=>void):void{this.onTouched=fn;} setDisabledState(value:boolean):void{this.cvaDisabled.set(value);}
  inputValue(): string {
    const value = this.value();
    const format = (item: unknown) => this.formatInputValue(item);
    if (Array.isArray(value)) {
      const separator = this.selectionMode() === 'range' ? this.rangeSeparator() : this.multipleSeparator();
      return value.map(format).join(separator);
    }
    return value === undefined || value === null ? '' : format(value);
  }
  private formatInputValue(value: unknown): string {
    if (value instanceof Date) return Number.isNaN(value.valueOf()) ? '' : this.formatInputDate(value);
    const raw = String(value ?? '');
    if (!this.showTime() && !this.timeOnly() && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return this.formatDateParts(...raw.split('-').map(Number) as [number, number, number]);
    return raw;
  }
  private formatInputDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    if (!this.showTime() && !this.timeOnly()) return this.formatDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${this.showSeconds() ? `:${pad(date.getSeconds())}` : ''}`;
    return this.timeOnly() ? time : `${day}T${time}`;
  }
  private formatDateParts(year: number, month: number, day: number): string {
    const format = this.dateFormat();
    const pad = (value: number) => String(value).padStart(2, '0');
    if (format) {
      const replacements: Record<string, string> = { dd: pad(day), d: String(day), mm: pad(month), m: String(month), yy: String(year), y: pad(year % 100) };
      return format.replace(/dd|d|mm|m|yy|y/g, token => replacements[token]);
    }
    return new Intl.DateTimeFormat(this.locale() || this.document.documentElement.lang || undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(year, month - 1, day));
  }
  private parseValue(raw: string): any {
    const separator = this.selectionMode() === 'range' ? this.rangeSeparator() : this.multipleSeparator();
    const values = raw.split(separator || ',').map(item => item.trim()).filter(Boolean).map(item => this.normalizeDateInput(item));
    const parsed = this.dataType() === 'date' ? values.map(item => this.timeOnly() ? new Date(`1970-01-01T${item}`) : new Date(this.showTime() ? item : `${item}T00:00:00`)) : values;
    return this.selectionMode() === 'single' ? (parsed[0] ?? '') : parsed;
  }
  private normalizeDateInput(value: string): string {
    if (this.showTime() || this.timeOnly() || /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const numbers = value.match(/\d+/g)?.map(Number);
    if (!numbers || numbers.length !== 3) return value;
    const configuredTokens = this.dateFormat()?.match(/dd|d|mm|m|yy|y/g);
    const localeTokens = new Intl.DateTimeFormat(this.locale() || this.document.documentElement.lang || undefined, { day: 'numeric', month: 'numeric', year: 'numeric' })
      .formatToParts(new Date(2006, 10, 22))
      .filter(part => part.type === 'day' || part.type === 'month' || part.type === 'year')
      .map(part => part.type === 'day' ? 'd' : part.type === 'month' ? 'm' : 'yy');
    const tokens = configuredTokens?.length === 3 ? configuredTokens : localeTokens;
    const parts: Record<'day' | 'month' | 'year', number> = { day: 0, month: 0, year: 0 };
    tokens.forEach((token, index) => { parts[token.startsWith('d') ? 'day' : token.startsWith('m') ? 'month' : 'year'] = numbers[index]; });
    if (parts.year < 100) parts.year += 2000;
    const date = new Date(parts.year, parts.month - 1, parts.day);
    if (date.getFullYear() !== parts.year || date.getMonth() !== parts.month - 1 || date.getDate() !== parts.day) return value;
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  }
  private isDateSelectable(date: Date): boolean { const min = this.minDate(); const max = this.maxDate(); const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; if (min && date < min) return false; if (max && date > max) return false; if (this.min() && iso < this.min()) return false; if (this.max() && iso > this.max()) return false; if (this.disabledDays()?.includes(date.getDay())) return false; return !(this.disabledDates() || []).some(disabled => disabled.toDateString() === date.toDateString()); }
  update(event:Event):void{const raw=(event.target as HTMLInputElement).value; const value = this.parseValue(raw); const values = Array.isArray(value) ? value : [value]; if (this.dataType() === 'date' && values.some(item => item instanceof Date && Number.isNaN(item.valueOf()))) { if (this.keepInvalid()) { this.value.set(raw); this.onChange(raw); } this.onInput.emit(raw); return; } if (this.dataType() === 'date' && values.some(item => item instanceof Date && !this.isDateSelectable(item))) { this.onInput.emit(value); return; } this.value.set(value); this.onChange(value); this.onInput.emit(value); this.onSelect.emit(value);}
  focus(event:Event):void{this.onFocus.emit(event); if (this.showOnFocus()) this.show();} touch(event?:Event):void{if(event)this.onBlur.emit(event);this.onTouched();}
  onInputKeydown(event: KeyboardEvent): void { if (event.key === 'Escape') { if (this.overlayVisible()) { event.preventDefault(); this.hide(); } } else if ((event.key === 'ArrowDown' || event.key === 'Enter') && !this.overlayVisible()) { event.preventDefault(); this.show(); } }
  show(): void { if (!this.inline() && !this.overlayVisible() && !this.disabled() && !this.cvaDisabled()) { this.overlayVisible.set(true); this.onShow.emit(); } }
  hide(): void { if (this.overlayVisible()) { this.overlayVisible.set(false); this.onClose.emit(); } }
  toggle(): void { this.overlayVisible() ? this.hide() : this.show(); }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.inline() && this.overlayVisible() && !this.host.nativeElement.contains(event.target as Node)) {
      this.onClickOutside.emit(event);
      this.hide();
    }
  }
  selectCalendarDate(iso: string): void {
    const selected = this.dataType() === 'date' ? new Date(`${iso}T00:00:00`) : iso;
    if (this.dataType() === 'date' && !this.isDateSelectable(selected as Date)) return;
    const mode = this.selectionMode();
    let next: any = selected;
    if (mode === 'multiple') {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const index = current.findIndex(item => this.calendarIso(item) === iso);
      if (index < 0 && this.maxDateCount() !== undefined && current.length >= this.maxDateCount()!) return;
      index >= 0 ? current.splice(index, 1) : current.push(selected);
      next = current;
    } else if (mode === 'range') {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      if (current.length !== 1 || this.calendarIso(current[0]) === iso) next = [selected];
      else next = this.calendarIso(current[0]) < iso ? [current[0], selected] : [selected, current[0]];
    }
    this.value.set(next); this.onChange(next); this.onInput.emit(next); this.onSelect.emit(next);
    if (this.hideOnDateTimeSelect() && (mode === 'single' || (mode === 'range' && Array.isArray(next) && next.length === 2))) this.hide();
  }
  private calendarIso(value: unknown): string { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ''); }
  displayHour(): number { const hour = this.timeParts().hour; return this.hourFormat() === '12' ? (hour % 12 || 12) : hour; }
  meridiem(): 'AM' | 'PM' { return this.timeParts().hour >= 12 ? 'PM' : 'AM'; }
  adjustTime(part: 'hour' | 'minute' | 'second', delta: number): void { const current = this.timeParts(); const step = part === 'hour' ? this.stepHour() : part === 'minute' ? this.stepMinute() : this.stepSecond(); let hour = current.hour; let minute = current.minute; let second = current.second; if (part === 'hour') hour = (hour + delta * step + 24) % 24; if (part === 'minute') minute = (minute + delta * step + 60) % 60; if (part === 'second') second = (second + delta * step + 60) % 60; this.setTime(hour, minute, second); }
  toggleMeridiem(): void { const current = this.timeParts(); this.setTime((current.hour + 12) % 24, current.minute, current.second); }
  private setTime(hour: number, minute: number, second: number): void { const current = this.value(); const first = Array.isArray(current) ? current[0] : current; let next: any; if (first instanceof Date) { next = new Date(first); next.setHours(hour, minute, second, 0); } else { const raw = String(first || (this.timeOnly() ? '00:00' : `${new Date().toISOString().slice(0, 10)}T00:00`)); const datePart = this.timeOnly() ? '' : raw.slice(0, 10); const pad = (value: number) => String(value).padStart(2, '0'); next = this.timeOnly() ? `${pad(hour)}:${pad(minute)}${this.showSeconds() ? `:${pad(second)}` : ''}` : `${datePart}T${pad(hour)}:${pad(minute)}${this.showSeconds() ? `:${pad(second)}` : ''}`; } if (Array.isArray(current)) { const values = [...current]; values[0] = next; this.value.set(values); this.onChange(values); this.onInput.emit(values); } else { this.value.set(next); this.onChange(next); this.onInput.emit(next); } }
  private dateConstraint(date: Date | null | undefined, fallback: string): string { return date instanceof Date && !Number.isNaN(date.valueOf()) ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : fallback; }
  clear():void{if (this.disabled() || this.cvaDisabled()) return; this.value.set('');this.onChange('');this.onInput.emit('');this.onClear.emit();this.onClearClick.emit();}
  today():void{const value=new Date(); if (!this.isDateSelectable(value)) return; const next=this.dataType()==='date'?value:value.toISOString().slice(0,10); this.value.set(next);this.onChange(next);this.onInput.emit(next);this.onTodayClick.emit(value);this.onSelect.emit(next);if(this.hideOnDateTimeSelect()&&!this.inline())this.hide();}
}
