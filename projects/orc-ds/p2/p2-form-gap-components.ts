import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-select-button', standalone: true,
  template: `<div class="orc-select-button" [class]="styleClass()" role="group" [attr.aria-label]="label()" [attr.aria-labelledby]="ariaLabelledBy()">@for (option of options(); track getOptionValue(option)) { <button type="button" [disabled]="disabled() || isOptionDisabled(option)" [attr.tabindex]="tabindex()" [autofocus]="autofocus() && $index === 0" [class.selected]="isSelected(option)" [attr.aria-pressed]="isSelected(option)" (click)="select(option, $event)">{{ getOptionLabel(option) }}</button> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-select-button{display:inline-flex;gap:0}.orc-select-button button{border:1px solid #cbd5e1;background:#fff;padding:.55rem .8rem}.orc-select-button button:first-child{border-radius:.4rem 0 0 .4rem}.orc-select-button button:last-child{border-radius:0 .4rem .4rem 0}.orc-select-button button.selected{border-color:#2563eb;background:#2563eb;color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectButtonComponent), multi: true }],
})
export class SelectButtonComponent<T = unknown> implements ControlValueAccessor {
  readonly options = input<any[]>([]); readonly value = model<T | T[] | null>(null); readonly multiple = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly label = input('Select option');
  readonly optionLabel = input<string | undefined>(undefined); readonly optionValue = input<string | undefined>(undefined); readonly optionDisabled = input<string | undefined>(undefined); readonly unselectable = input(false, { transform: booleanAttribute }); readonly allowEmpty = input(true, { transform: booleanAttribute }); readonly tabindex = input(0); readonly styleClass = input(''); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly size = input<'small' | 'large' | undefined>(undefined); readonly autofocus = input(false, { transform: booleanAttribute }); readonly dataKey = input<string | undefined>(undefined);
  readonly valueChangeEvent = output<T | T[] | null>(); readonly onOptionClick = output<{ originalEvent: Event; option: any; index: number }>(); readonly onChange = output<{ originalEvent: Event; value: T | T[] | null }>();
  private onModelChange: (value: T | T[] | null) => void = () => {}; private onModelTouched: () => void = () => {};
  writeValue(value: T | T[] | null): void { this.value.set(value ?? null); }
  registerOnChange(fn: (value: T | T[] | null) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(value: boolean): void { /* external disabled input remains the source of truth */ }
  getOptionValue(option: any): any { const key = this.optionValue(); return key ? option?.[key] : option?.value ?? option; }
  getOptionLabel(option: any): string { const key = this.optionLabel(); return String(key ? option?.[key] ?? '' : option?.label ?? option ?? ''); }
  isOptionDisabled(option: any): boolean { const key = this.optionDisabled(); return Boolean(key ? option?.[key] : option?.disabled); }
  isSelected(option: any): boolean { const candidate = this.getOptionValue(option); const current = this.value(); return this.multiple() ? Array.isArray(current) && current.some(value => this.sameValue(value, candidate)) : this.sameValue(current, candidate); }
  private sameValue(left: any, right: any): boolean { const key = this.dataKey(); return key && left && right ? left?.[key] === right?.[key] : left === right; }
  select(option: any, event?: Event): void {
    if (this.disabled() || this.isOptionDisabled(option)) return;
    const candidate = this.getOptionValue(option); const current = this.value(); let next: T | T[] | null;
    if (this.multiple()) { const items: any[] = Array.isArray(current) ? [...current] : []; const index = items.findIndex(value => this.sameValue(value, candidate)); if (index >= 0) { if (!this.unselectable() && this.allowEmpty()) items.splice(index, 1); } else items.push(candidate); next = items as T[]; }
    else next = this.sameValue(current, candidate) && this.allowEmpty() ? null : candidate as T;
    this.value.set(next); this.onModelChange(next); this.onModelTouched(); this.valueChangeEvent.emit(next); if (event) { this.onOptionClick.emit({ originalEvent: event, option, index: this.options().indexOf(option) }); this.onChange.emit({ originalEvent: event, value: next }); }
  }
}

@Component({
  selector: 'orc-toggle-button', standalone: true,
  template: `<button type="button" class="orc-toggle-button" [class.checked]="checked()" [class]="styleClass()" [disabled]="disabled() || cvaDisabled()" [attr.id]="inputId()" [attr.tabindex]="tabindex()" [autofocus]="autofocus()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-pressed]="checked()" (click)="toggle($event)" (blur)="onBlur.emit(); onModelTouched()">{{ checked() ? onIcon() : offIcon() }} {{ checked() ? onLabel() : offLabel() }}<ng-content /></button>`,
  styles: [P2_SHARED_STYLES + `.orc-toggle-button{border:1px solid #cbd5e1;border-radius:.4rem;background:#fff;padding:.55rem .85rem}.orc-toggle-button.checked{border-color:#2563eb;background:#2563eb;color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleButtonComponent), multi: true }],
})
export class ToggleButtonComponent implements ControlValueAccessor { readonly checked = model(false); readonly onLabel = input('On'); readonly offLabel = input('Off'); readonly onIcon = input(''); readonly offIcon = input(''); readonly inputId = input<string | undefined>(undefined); readonly ariaLabel = input<string | undefined>(undefined); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly tabindex = input(0); readonly autofocus = input(false, { transform: booleanAttribute }); readonly size = input<'small' | 'large' | undefined>(undefined); readonly styleClass = input(''); readonly allowEmpty = input(false, { transform: booleanAttribute }); readonly fluid = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly change = output<boolean>(); readonly onChange = output<{ originalEvent: Event; checked: boolean }>(); readonly onBlur = output<void>(); protected cvaDisabled = signal(false); private onModelChange: (value: boolean) => void = () => {}; protected onModelTouched: () => void = () => {};
  writeValue(value: boolean | null): void { this.checked.set(Boolean(value)); } registerOnChange(fn: (value: boolean) => void): void { this.onModelChange = fn; } registerOnTouched(fn: () => void): void { this.onModelTouched = fn; } setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  toggle(event?: Event): void { if (this.disabled() || this.cvaDisabled()) return; if (this.allowEmpty() && this.checked()) this.checked.set(false); else this.checked.update(value => !value); this.onModelChange(this.checked()); this.onModelTouched(); this.change.emit(this.checked()); if (event) this.onChange.emit({ originalEvent: event, checked: this.checked() }); }
}

export interface CascadeOption extends P2Option<string> { children?: CascadeOption[]; }
@Component({
  selector: 'orc-cascade-select', standalone: true,
  template: `<div class="orc-cascade" [class]="styleClass()" [attr.aria-label]="ariaLabel() || label()"><button type="button" class="trigger" [id]="inputId()" [disabled]="disabled()" [attr.tabindex]="tabindex()" [autofocus]="autofocus()" [attr.aria-expanded]="open()" [attr.aria-required]="required()" (click)="toggle()">{{ selectedLabel() || placeholder() }}⌄</button>@if (showClear() && value() !== null) { <button type="button" (click)="clear()" aria-label="Clear">×</button> }@if (open()) { <div class="levels" [class]="panelStyleClass()">@for (level of levels(); track $index) { <ul role="listbox">@for (option of level; track getOptionValue(option)) { <li><button type="button" [disabled]="isOptionDisabled(option)" (click)="choose(option, $index)">{{ option.label }} @if (option.children?.length) { › }</button></li> }</ul> }</div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-cascade{position:relative;display:block;width:100%}.trigger{display:flex;justify-content:space-between;width:100%;min-height:2.5rem;border:1px solid #cbd5e1;border-radius:.45rem;background:#fff;padding:.55rem .7rem;text-align:left}.levels{position:absolute;z-index:5;display:flex;top:calc(100% + .25rem);left:0;max-width:100%;border:1px solid #e2e8f0;border-radius:.45rem;background:#fff;box-shadow:0 10px 24px #0f172a1a}.levels ul{min-width:11rem;max-height:16rem;overflow:auto;margin:0;padding:.35rem;list-style:none}.levels button{display:flex;justify-content:space-between;width:100%;border:0;background:transparent;padding:.55rem;text-align:left}.levels button:hover:not(:disabled){background:#eff6ff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CascadeSelectComponent { readonly options = input<CascadeOption[]>([]); readonly value = model<string | null>(null); readonly label = input('Cascade select'); readonly placeholder = input('Select an item'); readonly disabled = input(false, { transform: booleanAttribute }); readonly open = model(false); readonly selected = signal<CascadeOption[]>([]); readonly optionSelect = output<CascadeOption>();
  readonly optionLabel = input<string | undefined>(undefined); readonly optionValue = input<string | undefined>(undefined); readonly optionDisabled = input<string | undefined>(undefined); readonly inputId = input<string | undefined>(undefined); readonly ariaLabel = input<string | undefined>(undefined); readonly tabindex = input(0); readonly readonly = input(false, { transform: booleanAttribute }); readonly required = input(false, { transform: booleanAttribute }); readonly autofocus = input(false, { transform: booleanAttribute }); readonly styleClass = input(''); readonly panelStyleClass = input(''); readonly filter = input(false, { transform: booleanAttribute }); readonly filterPlaceholder = input('Filter'); readonly showClear = input(false, { transform: booleanAttribute }); readonly loading = input(false, { transform: booleanAttribute }); readonly size = input<'small' | 'large' | undefined>(undefined); readonly variant = input<'outlined' | 'filled' | undefined>(undefined); readonly onChange = output<{ value: string | null }>(); readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onClear = output<void>();
  readonly levels = computed(() => { const result: CascadeOption[][] = [this.options()]; const path = this.selected(); const last = path[path.length - 1]; if (last?.children?.length) result.push(last.children); return result; });
  selectedLabel(): string { return this.selected().map(item => item.label).join(' / '); }
  choose(option: CascadeOption, level: number): void { if (this.readonly() || this.isOptionDisabled(option)) return; const path = [...this.selected().slice(0, level), option]; this.selected.set(path); if (option.children?.length) return; const value = this.getOptionValue(option); this.value.set(value); this.optionSelect.emit(option); this.onChange.emit({ value }); this.open.set(false); this.onHide.emit(); }
  getOptionValue(option: CascadeOption): string { const key = this.optionValue(); return String(key ? (option as any)?.[key] ?? '' : option.value); }
  isOptionDisabled(option: CascadeOption): boolean { const key = this.optionDisabled(); return Boolean(key ? (option as any)?.[key] : option.disabled); }
  toggle(): void { if (this.disabled() || this.readonly()) return; const next = !this.open(); this.open.set(next); next ? this.onShow.emit() : this.onHide.emit(); }
  clear(): void { if (this.disabled()) return; this.value.set(null); this.selected.set([]); this.onClear.emit(); this.onChange.emit({ value: null }); }
}

@Directive({ selector: '[orcKeyFilter],[pKeyFilter]', standalone: true })
export class KeyFilterDirective { readonly pattern = input<string | RegExp>('[0-9]'); readonly validateOnly = input(false, { transform: booleanAttribute }); readonly ngModelChange = output<string | number>(); @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void { if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return; const regex = this.pattern() instanceof RegExp ? this.pattern() as RegExp : new RegExp(this.pattern()); if (!regex.test(event.key)) event.preventDefault(); } }

@Directive({ selector: '[orcInputMask],[pInputMask]', standalone: true, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputMaskDirective), multi: true }] })
export class InputMaskDirective implements ControlValueAccessor {
  readonly mask = input(''); readonly type = input(''); readonly slotChar = input('_'); readonly autoClear = input(true, { transform: booleanAttribute }); readonly showClear = input(false, { transform: booleanAttribute }); readonly unmask = input(false, { transform: booleanAttribute }); readonly characterPattern = input('[A-Za-z0-9]'); readonly onComplete = output<string>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly onInput = output<Event>(); readonly onKeydown = output<Event>(); readonly onClear = output<void>();
  private onModelChange: (value: string) => void = () => {};
  private onModelTouched: () => void = () => {};
  private cvaDisabled = false;
  constructor(private readonly host: ElementRef<HTMLInputElement>) {}
  writeValue(value: unknown): void { this.host.nativeElement.value = this.format(value == null ? '' : String(value)); }
  registerOnChange(fn: (value: string) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled = disabled; this.host.nativeElement.disabled = disabled; }
  private format(value: string): string { const raw = value.replace(/[^a-zA-Z0-9]/g, ''); let index = 0; return this.mask().split('').map(token => token === '9' || token === 'a' || token === '*' ? (raw[index++] || (this.autoClear() ? '' : this.slotChar())) : token).join(''); }
  @HostListener('input', ['$event']) handleInput(event: Event): void { if (this.cvaDisabled) return; const element = event.target as HTMLInputElement; const raw = element.value.replace(/[^a-zA-Z0-9]/g, ''); const formatted = this.format(raw); element.value = formatted; this.onModelChange(this.unmask() ? raw : formatted); this.onInput.emit(event); if (raw.length > 0 && raw.length >= this.mask().split('').filter(token => token === '9' || token === 'a' || token === '*').length) this.onComplete.emit(this.unmask() ? raw : formatted); }
  @HostListener('focus', ['$event']) handleFocus(event: Event): void { this.onFocus.emit(event); }
  @HostListener('blur', ['$event']) handleBlur(event: Event): void { this.onModelTouched(); this.onBlur.emit(event); }
  @HostListener('keydown', ['$event']) handleKeydown(event: Event): void { this.onKeydown.emit(event); }
  clear(): void { if (this.cvaDisabled) return; this.host.nativeElement.value = ''; this.onModelChange(''); this.onClear.emit(); }
}
