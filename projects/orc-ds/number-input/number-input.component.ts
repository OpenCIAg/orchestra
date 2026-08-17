import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type NumberInputSize = 'sm' | 'md' | 'lg';
export type NumberInputStatus = 'default' | 'error' | 'success';

let nextNumberInputId = 0;

@Component({
  selector: 'orc-number-input',
  standalone: true,
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberInputComponent), multi: true }],
})
export class NumberInputComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-number-input-${++nextNumberInputId}`;
  readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  readonly id = input('');
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly helperText = input('');
  readonly errorMessage = input('');
  readonly status = input<NumberInputStatus>('default');
  readonly size = input<NumberInputSize>('md');
  readonly min = input<number | undefined, unknown>(undefined, { transform: (value: unknown) => value === undefined || value === null || value === '' ? undefined : numberAttribute(value) });
  readonly max = input<number | undefined, unknown>(undefined, { transform: (value: unknown) => value === undefined || value === null || value === '' ? undefined : numberAttribute(value) });
  readonly step = input(1, { transform: numberAttribute });
  readonly precision = input<number | undefined, unknown>(undefined, { transform: (value: unknown) => value === undefined || value === null || value === '' ? undefined : numberAttribute(value) });
  readonly prefix = input('');
  readonly suffix = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showControls = input(true, { transform: booleanAttribute });
  readonly showButtons = input(true, { transform: booleanAttribute });
  readonly buttonLayout = input<'stacked' | 'horizontal' | 'vertical'>('stacked');
  readonly inputId = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);
  readonly mode = input<'decimal' | 'currency'>('decimal');
  readonly currency = input<string | undefined>(undefined);
  readonly currencyDisplay = input<'symbol' | 'code' | 'name'>('symbol');
  readonly useGrouping = input(true, { transform: booleanAttribute });
  readonly minFractionDigits = input<number | undefined>(undefined);
  readonly maxFractionDigits = input<number | undefined>(undefined);
  readonly ariaLabel = input('');

  readonly value = model<number | null>(null);
  readonly blur = output<FocusEvent>();
  readonly onInput = output<{ originalEvent: Event; value: number | null }>(); readonly onFocus = output<Event>(); readonly onBlur = output<FocusEvent>(); readonly onKeyDown = output<KeyboardEvent>(); readonly onClear = output<void>();
  private readonly cvaDisabled = signal(false);
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly displayValue = computed(() => {
    const value = this.value();
    if (value === null || value === undefined) return '';
    return this.precision() === undefined ? String(value) : value.toFixed(this.precision()!);
  });
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);
  readonly describedBy = computed(() => this.errorMessage() ? this.errorId() : this.helperText() ? this.helperId() : null);

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    const parsed = value === null || value === undefined || value === '' ? null : Number(value);
    this.value.set(parsed !== null && Number.isFinite(parsed) ? this.clamp(parsed) : null);
  }
  registerOnChange(fn: (value: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    if (raw.trim() === '') {
      if (this.allowEmpty()) this.update(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) this.update(this.clamp(parsed));
    this.onInput.emit({ originalEvent: event, value: this.value() });
  }

  handleBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (this.value() !== null) input.value = this.displayValue();
    this.onTouched();
    this.blur.emit(event);
    this.onBlur.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    this.onKeyDown.emit(event);
    if (event.key === 'ArrowUp') { event.preventDefault(); this.increment(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); this.decrement(); }
  }

  clear(): void { if (this.effectiveDisabled() || this.readonly()) return; this.update(null); this.onClear.emit(); }

  increment(): void { this.update(this.clamp((this.value() ?? this.min() ?? 0) + this.step())); }
  decrement(): void { this.update(this.clamp((this.value() ?? this.min() ?? 0) - this.step())); }
  focus(): void { this.nativeInput()?.nativeElement.focus(); }

  private update(value: number | null): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.value.set(value);
    this.onChange(value);
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    let next = min === undefined ? value : Math.max(min, value);
    if (max !== undefined) next = Math.min(max, next);
    const precision = this.precision();
    return precision === undefined ? next : Number(next.toFixed(precision));
  }
}
