import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  constructor(private readonly host: ElementRef<HTMLInputElement>) {}
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
