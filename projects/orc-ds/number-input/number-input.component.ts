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
  readonly ariaLabel = input('');

  readonly value = model<number | null>(null);
  readonly blur = output<FocusEvent>();
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

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    if (raw.trim() === '') {
      this.update(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) this.update(this.clamp(parsed));
  }

  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (this.value() !== null) input.value = this.displayValue();
    this.onTouched();
    this.blur.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') { event.preventDefault(); this.increment(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); this.decrement(); }
  }

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
