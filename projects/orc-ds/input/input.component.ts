import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  computed,
  signal,
  linkedSignal,
  ElementRef,
  viewChild,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputSize, InputStatus, InputType } from './input.types';
import { applyMask, cleanMask } from './input-mask.util';

let nextInputUniqueId = 0;

@Component({
  selector: 'orc-input, orc-input-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-input-${++nextInputUniqueId}`;

  // ── Native Input Element Reference ────────────────────────
  readonly nativeInputRef = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly id = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string>('');
  readonly type = input<InputType>('text');
  readonly size = input<InputSize>('md');
  readonly status = input<InputStatus>('default');
  readonly placeholder = input<string>('Digite algo...');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly mask = input<string>('');
  readonly unmaskValue = input(false, { transform: booleanAttribute });
  readonly maxLength = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly minLength = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly min = input<number | string | undefined>(undefined);
  readonly max = input<number | string | undefined>(undefined);
  readonly step = input<number | string | undefined>(undefined);
  readonly showCharCount = input(false, { transform: booleanAttribute });
  readonly prefixText = input<string>('');
  readonly suffixText = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly variant = input<'filled' | 'outlined' | undefined>(undefined);
  readonly fluid = input(false, { transform: booleanAttribute });

  // Acessibilidade WCAG
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedby = input<string>('');

  // ── Two-Way Model ─────────────────────────────────────────
  readonly value = model<string | number>('');

  // ── Outputs (Signals API) ─────────────────────────────────
  readonly inputChange = output<string | number>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();
  readonly clear = output<void>();

  // ── Estado Interno ────────────────────────────────────────
  protected readonly isFocused = signal<boolean>(false);
  protected readonly isPasswordVisible = signal<boolean>(false);
  protected readonly cvaDisabled = signal<boolean>(false);
  /**
   * Keeps browser editing state independent from the public model input.
   * Angular may re-apply a parent model value during the same input event;
   * binding the native control to this writable state prevents keystrokes
   * from being visually rolled back before the parent receives valueChange.
   */
  protected readonly viewValue = linkedSignal<string | number>(() => this.value());

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveId = computed(() => this.inputId() || this.id() || this.uniqueId);
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  readonly currentType = computed(() => {
    if (this.type() === 'password') {
      return this.isPasswordVisible() ? 'text' : 'password';
    }
    return this.type();
  });

  readonly stringValue = computed(() => {
    const v = this.viewValue();
    const str = v !== null && v !== undefined ? String(v) : '';
    if (this.mask()) {
      return applyMask(str, this.mask());
    }
    return str;
  });

  readonly charCount = computed(() => this.stringValue().length);

  readonly effectiveMaxLength = computed(() => {
    if (this.mask()) {
      return this.mask().length;
    }
    return this.maxLength();
  });

  readonly isClearVisible = computed(() => {
    const hasVal = this.stringValue().length > 0;
    const canClear = this.clearable() || this.type() === 'search';
    return hasVal && canClear && !this.effectiveDisabled() && !this.readonly();
  });

  readonly isPasswordToggleVisible = computed(() => {
    return this.type() === 'password' && !this.effectiveDisabled();
  });

  readonly computedAriaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.ariaDescribedby()) {
      ids.push(this.ariaDescribedby());
    }
    if (this.status() === 'error' && this.errorMessage()) {
      ids.push(this.errorId());
    } else if (this.helperText()) {
      ids.push(this.helperId());
    }
    return ids.length ? ids.join(' ') : null;
  });

  // ── ControlValueAccessor ──────────────────────────────────
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    const val = value ?? '';
    if (this.mask() && val) {
      const masked = applyMask(String(val), this.mask());
      const nextValue = this.unmaskValue() ? cleanMask(masked, this.mask()) : masked;
      this.viewValue.set(nextValue);
      this.value.set(nextValue);
    } else {
      this.viewValue.set(val);
      this.value.set(val);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ── Handlers de Eventos ───────────────────────────────────
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let rawVal = target.value;

    if (this.mask()) {
      const maskedVal = applyMask(rawVal, this.mask());
      target.value = maskedVal;
      const emittedVal = this.unmaskValue() ? cleanMask(maskedVal, this.mask()) : maskedVal;
      this.viewValue.set(emittedVal);
      this.value.set(emittedVal);
      this.onChange(emittedVal);
      this.inputChange.emit(emittedVal);
      return;
    }

    const val = this.type() === 'number' && rawVal !== ''
      ? (target.valueAsNumber || rawVal)
      : rawVal;

    this.viewValue.set(val);
    this.value.set(val);
    this.onChange(val);
    this.inputChange.emit(val);
  }

  protected onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focus.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blur.emit(event);
  }

  protected onClear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.viewValue.set('');
    this.value.set('');
    this.onChange('');
    this.inputChange.emit('');
    this.clear.emit();
    this.focusNative();
  }

  protected togglePasswordVisibility(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPasswordVisible.update(visible => !visible);
  }

  focusNative(): void {
    this.nativeInputRef()?.nativeElement.focus();
  }

  select(): void {
    this.nativeInputRef()?.nativeElement.select();
  }
}
