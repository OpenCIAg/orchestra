import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  signal,
  computed,
  effect,
  viewChildren,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ORC_OTP_INPUT, OtpInputContext } from './otp.types';
import { OtpSlotComponent } from './otp-slot.component';
import { OtpSeparatorComponent } from './otp-separator.component';
import { OtpGroupComponent } from './otp-group.component';

@Component({
  selector: 'orc-otp-input',
  standalone: true,
  imports: [
    CommonModule,
    OtpSlotComponent,
    OtpSeparatorComponent,
    OtpGroupComponent,
  ],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true,
    },
    {
      provide: ORC_OTP_INPUT,
      useExisting: forwardRef(() => OtpInputComponent),
    },
  ],
})
export class OtpInputComponent implements ControlValueAccessor, OtpInputContext {
  // Inputs
  readonly length = input<number>(6);
  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly tabindex = input<number | null>(0);
  readonly styleClass = input<string | undefined>(undefined);
  readonly mask = input(false, { transform: booleanAttribute });
  readonly integerOnly = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly variant = input<'outlined' | 'filled' | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly inputMode = input<'numeric' | 'text'>('numeric');
  readonly ariaLabel = input<string>('Código de verificação');

  // Computed halves for grouped design
  readonly firstHalfIndices = computed(() => {
    const half = Math.ceil(this.length() / 2);
    return Array.from({ length: half }, (_, i) => i);
  });

  readonly secondHalfIndices = computed(() => {
    const half = Math.ceil(this.length() / 2);
    const len = this.length();
    return Array.from({ length: len - half }, (_, i) => half + i);
  });

  // Model & Outputs
  readonly value = model<string>('');
  readonly completed = output<string>();
  readonly onChange = output<{ value: string }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();

  // Internal state
  readonly inputValues = signal<string[]>([]);
  private readonly cvaDisabled = signal<boolean>(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // View children slots to manage focus
  private readonly slots = viewChildren(OtpSlotComponent);

  // Callbacks for ControlValueAccessor
  private onModelChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Sync external length change to inputValues array size
    effect(() => {
      const len = this.length();
      const currentVal = this.value() || '';
      const newValues = Array.from({ length: len }, (_, i) => currentVal[i] || '');
      this.inputValues.set(newValues);
    });

    // Sync model value changes to inputValues array
    effect(() => {
      const val = this.value() || '';
      const len = this.length();
      const newValues = Array.from({ length: len }, (_, i) => val[i] || '');
      const currentValuesStr = this.inputValues().join('');
      const newValStr = newValues.join('');
      if (currentValuesStr !== newValStr) {
        this.inputValues.set(newValues);
      }
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    const val = value || '';
    this.value.set(val);
    const len = this.length();
    const newValues = Array.from({ length: len }, (_, i) => val[i] || '');
    this.inputValues.set(newValues);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // Handle Input Changes from Slots
  onSlotInput(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    let val = target.value;

    if (this.inputMode() === 'numeric' || this.integerOnly()) {
      val = val.replace(/\D/g, '');
    }

    const currentValues = [...this.inputValues()];

    if (val.length > 1) {
      this.pasteCode(val, index);
      return;
    }

    currentValues[index] = val;
    this.updateValues(currentValues);

    if (val && index < this.length() - 1) {
      this.focusInput(index + 1);
    }
  }

  // Handle key events from Slots
  onSlotKeyDown(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;

    switch (event.key) {
      case 'Backspace':
        if (!target.value && index > 0) {
          const currentValues = [...this.inputValues()];
          currentValues[index - 1] = '';
          this.updateValues(currentValues);
          this.focusInput(index - 1);
          event.preventDefault();
        } else if (target.value) {
          const currentValues = [...this.inputValues()];
          currentValues[index] = '';
          this.updateValues(currentValues);
        }
        break;

      case 'ArrowLeft':
        if (index > 0) {
          this.focusInput(index - 1);
          event.preventDefault();
        }
        break;

      case 'ArrowRight':
        if (index < this.length() - 1) {
          this.focusInput(index + 1);
          event.preventDefault();
        }
        break;
    }
  }

  onSlotFocus(index: number): void {
    this.onTouched();
  }

  onSlotPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    let pastedText = clipboardData.getData('text') || '';
    if (this.inputMode() === 'numeric' || this.integerOnly()) {
      pastedText = pastedText.replace(/\D/g, '');
    }

    this.pasteCode(pastedText, index);
  }

  private pasteCode(code: string, startIndex: number): void {
    if (!code) return;

    const currentValues = [...this.inputValues()];
    const len = this.length();

    let pasteIndex = startIndex;
    for (let i = 0; i < code.length && pasteIndex < len; i++) {
      currentValues[pasteIndex] = code[i];
      pasteIndex++;
    }

    this.updateValues(currentValues);

    const nextFocusIndex = Math.min(pasteIndex, len - 1);
    this.focusInput(nextFocusIndex);
  }

  private updateValues(newValues: string[]): void {
    this.inputValues.set(newValues);
    const combinedValue = newValues.join('');
    this.value.set(combinedValue);
    this.onModelChange(combinedValue);
    this.onChange.emit({ value: combinedValue });

    if (combinedValue.length === this.length()) {
      this.completed.emit(combinedValue);
    }
  }

  focusInput(index: number): void {
    const slotRefs = this.slots();
    const slot = slotRefs[index];
    if (slot) {
      slot.focus();
    }
  }

  onSlotFocusEvent(event: Event): void { this.onFocus.emit(event); }
  onSlotBlur(event: Event): void { this.onBlur.emit(event); this.onTouched(); }
}
