import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-select-button',
  standalone: true,
  template: `<div
    class="p-selectbutton p-component orc-select-button"
    [class]="'p-selectbutton p-component orc-select-button ' + styleClass()"
    [class.orc-select-button--small]="size() === 'small'"
    [class.orc-select-button--large]="size() === 'large'"
    [style]="style()"
    role="group"
    [attr.aria-label]="label() || null"
    [attr.aria-labelledby]="ariaLabelledBy()"
    [attr.data-pc-name]="'selectbutton'"
    (focusout)="onContainerFocusOut($event)"
  >
    @for (option of options(); track getOptionValue(option)) {
      <button
        type="button"
        [disabled]="disabled() || cvaDisabled() || isOptionDisabled(option)"
        [attr.tabindex]="tabindex()"
        [autofocus]="autofocus() && $index === 0"
        [class.selected]="isSelected(option)"
        [attr.aria-pressed]="isSelected(option)"
        (focus)="onFocus.emit($event)"
        (blur)="onBlur.emit()"
        (click)="select(option, $event)"
      >
        {{ getOptionLabel(option) }}
      </button>
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-select-button{display:inline-flex;gap:0}.orc-select-button button{border:1px solid var(--orc-component-border-strong);background:var(--orc-component-surface);padding:.55rem .8rem}.orc-select-button--small button{padding:.35rem .6rem;font-size:.875rem}.orc-select-button--large button{padding:.7rem 1rem;font-size:1.125rem}.orc-select-button button:first-child{border-radius:.4rem 0 0 .4rem}.orc-select-button button:last-child{border-radius:0 .4rem .4rem 0}.orc-select-button button.selected{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive);color:var(--orc-component-on-interactive)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectButtonComponent),
      multi: true,
    },
  ],
})
export class SelectButtonComponent<
  T = unknown,
> implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly options = input<any[]>([]);
  readonly value = model<T | T[] | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  readonly unselectable = input(false, { transform: booleanAttribute });
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly styleClass = input('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly valueChangeEvent = output<T | T[] | null>();
  readonly onOptionClick = output<{
    originalEvent: Event;
    option: any;
    index: number;
  }>();
  readonly onChange = output<{ originalEvent: Event; value: T | T[] | null }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<void>();
  readonly cvaDisabled = signal(false);
  private onModelChange: (value: T | T[] | null) => void = () => {};
  private onModelTouched: () => void = () => {};
  writeValue(value: T | T[] | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  getOptionValue(option: any): any {
    const key = this.optionValue();
    return key ? option?.[key] : (option?.value ?? option);
  }
  getOptionLabel(option: any): string {
    const key = this.optionLabel();
    return String(
      key ? (option?.[key] ?? '') : (option?.label ?? option ?? ''),
    );
  }
  isOptionDisabled(option: any): boolean {
    const key = this.optionDisabled();
    return Boolean(key ? option?.[key] : option?.disabled);
  }
  isSelected(option: any): boolean {
    const candidate = this.getOptionValue(option);
    const current = this.value();
    return this.multiple()
      ? Array.isArray(current) &&
          current.some((value) => this.sameValue(value, candidate))
      : this.sameValue(current, candidate);
  }
  private sameValue(left: any, right: any): boolean {
    const key = this.dataKey();
    return key && left && right ? left?.[key] === right?.[key] : left === right;
  }
  onContainerFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    const NodeConstructor =
      this.host.nativeElement.ownerDocument.defaultView?.Node;
    if (
      !NodeConstructor ||
      !(next instanceof NodeConstructor) ||
      !(event.currentTarget as HTMLElement).contains(next as Node)
    )
      this.onModelTouched();
  }
  select(option: any, event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.isOptionDisabled(option))
      return;
    if (event) {
      this.onOptionClick.emit({
        originalEvent: event,
        option,
        index: this.options().indexOf(option),
      });
    }
    const candidate = this.getOptionValue(option);
    const current = this.value();
    let next: T | T[] | null;
    if (this.multiple()) {
      const items: any[] = Array.isArray(current) ? [...current] : [];
      const index = items.findIndex((value) =>
        this.sameValue(value, candidate),
      );
      if (index >= 0) {
        if (this.unselectable() || (!this.allowEmpty() && items.length === 1))
          return;
        items.splice(index, 1);
      } else items.push(candidate);
      next = items as T[];
    } else {
      if (this.sameValue(current, candidate) && !this.allowEmpty()) return;
      next = this.sameValue(current, candidate) ? null : (candidate as T);
    }
    this.value.set(next);
    this.onModelChange(next);
    this.valueChangeEvent.emit(next);
    if (event) {
      this.onChange.emit({ originalEvent: event, value: next });
    }
  }
}

@Component({
  selector: 'orc-toggle-button',
  standalone: true,
  template: `<button
    type="button"
    class="p-togglebutton p-component orc-toggle-button"
    [class]="'p-togglebutton p-component orc-toggle-button ' + styleClass()"
    [class.orc-toggle-button--small]="size() === 'small'"
    [class.orc-toggle-button--large]="size() === 'large'"
    [class.orc-toggle-button--fluid]="fluid()"
    [style]="style()"
    [class.checked]="checked()"
    [disabled]="disabled() || cvaDisabled()"
    [attr.id]="inputId()"
    [attr.tabindex]="tabindex()"
    [autofocus]="autofocus()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-labelledby]="ariaLabelledBy()"
    [attr.aria-pressed]="checked()"
    [attr.data-pc-name]="'togglebutton'"
    (click)="toggle($event)"
    (blur)="onBlur.emit(); onModelTouched()"
  >
    {{ checked() ? onIcon() : offIcon() }}
    {{ checked() ? onLabel() : offLabel() }}<ng-content />
  </button>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-toggle-button{border:1px solid var(--orc-component-border-strong);border-radius:.4rem;background:var(--orc-component-surface);padding:.55rem .85rem}.orc-toggle-button.checked{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive);color:var(--orc-component-on-interactive)}.orc-toggle-button--small{padding:.35rem .6rem;font-size:.875rem}.orc-toggle-button--large{padding:.7rem 1rem;font-size:1.125rem}.orc-toggle-button--fluid{width:100%}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleButtonComponent),
      multi: true,
    },
  ],
})
export class ToggleButtonComponent implements ControlValueAccessor {
  readonly checked = model(false);
  readonly onLabel = input<string | undefined>(undefined);
  readonly offLabel = input<string | undefined>(undefined);
  readonly onIcon = input('');
  readonly offIcon = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly allowEmpty = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly change = output<boolean>();
  readonly onChange = output<{ originalEvent: Event; checked: boolean }>();
  readonly onBlur = output<void>();
  protected cvaDisabled = signal(false);
  private onModelChange: (value: boolean) => void = () => {};
  protected onModelTouched: () => void = () => {};
  writeValue(value: boolean | null): void {
    this.checked.set(Boolean(value));
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  toggle(event?: Event): void {
    if (
      this.disabled() ||
      this.cvaDisabled() ||
      (this.checked() && !this.allowEmpty())
    )
      return;
    if (this.allowEmpty() && this.checked()) this.checked.set(false);
    else this.checked.update((value) => !value);
    this.onModelChange(this.checked());
    this.change.emit(this.checked());
    if (event)
      this.onChange.emit({ originalEvent: event, checked: this.checked() });
  }
}

@Directive({ selector: '[orcKeyFilter],[pKeyFilter]', standalone: true })
export class KeyFilterDirective {
  readonly pattern = input<string | RegExp>('[0-9]');
  readonly validateOnly = input(false, {
    transform: booleanAttribute,
    alias: 'pValidateOnly',
  });
  readonly ngModelChange = output<string | number>();
  private matches(value: string): boolean {
    try {
      const regex =
        this.pattern() instanceof RegExp
          ? (this.pattern() as RegExp)
          : new RegExp(this.pattern());
      return [...value].every((character) => {
        regex.lastIndex = 0;
        return regex.test(character);
      });
    } catch {
      return true;
    }
  }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (
      this.validateOnly() ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    )
      return;
    if (!this.matches(event.key)) event.preventDefault();
  }
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent): void {
    if (this.validateOnly()) return;
    const value = event.clipboardData?.getData('text') ?? '';
    if (!this.matches(value)) event.preventDefault();
  }
  @HostListener('input', ['$event']) onInput(event: Event): void {
    if (!this.validateOnly()) return;
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.ngModelChange.emit(value);
  }
}

@Directive({
  selector: '[orcInputMask],[pInputMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMaskDirective),
      multi: true,
    },
  ],
})
export class InputMaskDirective implements ControlValueAccessor {
  readonly mask = input('');
  readonly type = input('');
  readonly slotChar = input('_');
  readonly autoClear = input(true, { transform: booleanAttribute });
  /**
   * @deprecated Compatibility-only no-op. InputMaskDirective does not render
   * a clear action; wrap the native input and provide a clear button/action.
   */
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly unmask = input(false, { transform: booleanAttribute });
  readonly characterPattern = input<string | RegExp>('[A-Za-z0-9]');
  /**
   * @deprecated Compatibility-only no-op. Apply inline styles directly to
   * the native host input instead.
   */
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  /**
   * @deprecated Compatibility-only no-op. Add CSS classes directly to the
   * native host input instead.
   */
  readonly styleClass = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly maxlength = input<number | undefined>(undefined);
  readonly tabindex = input<string | number | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);
  readonly variant = input<'filled' | 'outlined' | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaRequired = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly autocomplete = input<string | undefined>(undefined);
  /** @deprecated Compatibility-only no-op; buffer retention has no effect. */
  readonly keepBuffer = input(false, { transform: booleanAttribute });
  readonly onComplete = output<string>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onInput = output<Event>();
  readonly onKeydown = output<Event>();
  readonly onClear = output<void>();
  private onModelChange: (value: string) => void = () => {};
  private onModelTouched: () => void = () => {};
  private cvaDisabled = false;
  private composing = false;
  private readonly host = inject<ElementRef<HTMLInputElement>>(ElementRef);
  @HostBinding('attr.id') get hostId(): string | null {
    return this.inputId() ?? null;
  }
  @HostBinding('attr.type') get hostType(): string | null {
    return this.type() || null;
  }
  @HostBinding('attr.placeholder') get hostPlaceholder(): string | null {
    return this.placeholder() ?? null;
  }
  @HostBinding('attr.maxlength') get hostMaxlength(): number | null {
    return this.maxlength() ?? null;
  }
  @HostBinding('attr.tabindex') get hostTabindex(): string | number | null {
    return this.tabindex() ?? null;
  }
  @HostBinding('attr.title') get hostTitle(): string | null {
    return this.title() ?? null;
  }
  @HostBinding('attr.aria-label') get hostAriaLabel(): string | null {
    return this.ariaLabel() ?? null;
  }
  @HostBinding('attr.aria-labelledby') get hostAriaLabelledBy(): string | null {
    return this.ariaLabelledBy() ?? null;
  }
  @HostBinding('attr.aria-required') get hostAriaRequired(): string | null {
    return this.ariaRequired() == null
      ? this.required()
        ? 'true'
        : null
      : String(this.ariaRequired());
  }
  @HostBinding('attr.name') get hostName(): string | null {
    return this.name() ?? null;
  }
  @HostBinding('attr.autocomplete') get hostAutocomplete(): string | null {
    return this.autocomplete() ?? null;
  }
  @HostBinding('attr.autofocus') get hostAutofocus(): string | null {
    return this.autofocus() ? '' : null;
  }
  @HostBinding('attr.required') get hostRequired(): string | null {
    return this.required() ? '' : null;
  }
  @HostBinding('attr.disabled') get hostDisabledAttr(): string | null {
    return this.hostDisabled ? '' : null;
  }
  @HostBinding('attr.readonly') get hostReadonlyAttr(): string | null {
    return this.hostReadonly ? '' : null;
  }
  @HostBinding('disabled') get hostDisabled(): boolean {
    return this.cvaDisabled || this.disabled();
  }
  @HostBinding('readonly') get hostReadonly(): boolean {
    return this.readonly();
  }
  @HostBinding('class.orc-input-mask--small') get hostSmall(): boolean {
    return this.size() === 'small';
  }
  @HostBinding('class.orc-input-mask--large') get hostLarge(): boolean {
    return this.size() === 'large';
  }
  @HostBinding('class.orc-input-mask--filled') get hostFilled(): boolean {
    return this.variant() === 'filled';
  }

  writeValue(value: unknown): void {
    this.host.nativeElement.value = this.format(
      value == null ? '' : String(value),
    );
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled = disabled;
    this.host.nativeElement.disabled = disabled;
  }
  private isToken(token: string): boolean {
    return ['9', 'a', '*'].includes(token);
  }
  private extractRaw(value: string): string {
    const literals = new Set(
      this.mask()
        .split('')
        .filter((token) => !this.isToken(token)),
    );
    return [...value].filter((character) => !literals.has(character)).join('');
  }
  private normalizeRaw(value: string): string {
    const raw = this.extractRaw(value);
    let rawIndex = 0;
    let normalized = '';
    for (const token of this.mask()) {
      if (!this.isToken(token)) continue;
      while (rawIndex < raw.length && !this.accepts(token, raw[rawIndex]))
        rawIndex += 1;
      if (rawIndex >= raw.length) break;
      normalized += raw[rawIndex++];
    }
    return normalized;
  }
  private accepts(token: string, value: string): boolean {
    if (token === '9') return /[0-9]/.test(value);
    if (token === 'a') return /[A-Za-z]/.test(value);
    if (token !== '*') return false;
    try {
      const regex =
        this.characterPattern() instanceof RegExp
          ? (this.characterPattern() as RegExp)
          : new RegExp(this.characterPattern());
      regex.lastIndex = 0;
      return regex.test(value);
    } catch {
      return false;
    }
  }
  private format(value: string): string {
    const raw = this.normalizeRaw(value);
    let index = 0;
    let result = '';
    for (const token of this.mask()) {
      if (!this.isToken(token)) {
        if (raw.length > index || !this.autoClear()) result += token;
        continue;
      }
      let accepted: string | undefined;
      while (raw[index]) {
        if (this.accepts(token, raw[index])) {
          accepted = raw[index++];
          break;
        }
        index += 1;
      }
      if (accepted) result += accepted;
      else if (this.autoClear()) break;
      else result += this.slotChar();
    }
    return result;
  }
  private isComplete(raw: string): boolean {
    let index = 0;
    for (const token of this.mask()) {
      if (!this.isToken(token)) continue;
      while (raw[index] && !this.accepts(token, raw[index])) index += 1;
      if (!raw[index]) return false;
      index += 1;
    }
    return true;
  }
  private caretForRawOffset(rawOffset: number, formatted: string): number {
    let rawCount = 0;
    for (let index = 0; index < this.mask().length; index += 1) {
      if (this.isToken(this.mask()[index])) {
        if (rawCount >= rawOffset) return index;
        rawCount += 1;
      }
    }
    return formatted.length;
  }
  @HostListener('input', ['$event']) handleInput(event: Event): void {
    const inputEvent = event as InputEvent;
    if (
      this.composing ||
      inputEvent.isComposing ||
      this.cvaDisabled ||
      this.disabled() ||
      this.readonly()
    )
      return;
    const element = event.target as HTMLInputElement;
    const caret = element.selectionStart ?? element.value.length;
    const rawBeforeCaret = this.normalizeRaw(element.value.slice(0, caret));
    const raw = this.normalizeRaw(element.value);
    const formatted = this.format(element.value);
    element.value = formatted;
    const nextCaret = this.caretForRawOffset(rawBeforeCaret.length, formatted);
    const emittedValue = this.unmask() ? raw : formatted;
    this.onModelChange(emittedValue);
    this.onInput.emit(event);
    queueMicrotask(() => {
      try {
        element.setSelectionRange(nextCaret, nextCaret);
      } catch {
        /* non-text inputs do not expose a selection */
      }
    });
    if (this.isComplete(raw)) this.onComplete.emit(emittedValue);
  }
  @HostListener('compositionstart') handleCompositionStart(): void {
    this.composing = true;
  }
  @HostListener('compositionend') handleCompositionEnd(): void {
    this.composing = false;
  }
  @HostListener('focus', ['$event']) handleFocus(event: Event): void {
    this.onFocus.emit(event);
  }
  @HostListener('blur', ['$event']) handleBlur(event: Event): void {
    const raw = this.normalizeRaw(this.host.nativeElement.value);
    if (this.autoClear() && raw.length > 0 && !this.isComplete(raw)) {
      this.host.nativeElement.value = '';
      this.onModelChange('');
      this.onClear.emit();
    }
    this.onModelTouched();
    this.onBlur.emit(event);
  }
  @HostListener('keydown', ['$event']) handleKeydown(
    event: KeyboardEvent,
  ): void {
    this.onKeydown.emit(event);
    if (
      this.cvaDisabled ||
      this.disabled() ||
      this.readonly() ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    )
      return;
    const input = this.host.nativeElement;
    const caret = input.selectionStart ?? input.value.length;
    let position = Math.min(caret, this.mask().length);
    while (
      position < this.mask().length &&
      !['9', 'a', '*'].includes(this.mask()[position])
    ) {
      if (event.key === this.mask()[position]) return;
      position += 1;
    }
    const token = this.mask()[position];
    if (token && !this.accepts(token, event.key)) event.preventDefault();
  }
  clear(): void {
    if (this.cvaDisabled || this.disabled() || this.readonly()) return;
    this.host.nativeElement.value = '';
    this.onModelChange('');
    this.onModelTouched();
    this.onClear.emit();
  }
}

export { CascadeSelectComponent } from './p2-cascade-select-component';
export type { CascadeOption } from './p2-cascade-select-component';
