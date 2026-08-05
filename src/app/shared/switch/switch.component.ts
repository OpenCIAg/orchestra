import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  computed,
  signal,
  ElementRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  SwitchChangeEvent,
  SwitchLabelPosition,
  SwitchSize,
} from './switch.types';

let nextSwitchUniqueId = 0;

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  // Inputs (Signals API)
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly value = input<any>(undefined);
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly size = input<SwitchSize>('md');
  readonly labelPosition = input<SwitchLabelPosition>('end');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledby = input<string>('');
  readonly ariaDescribedby = input<string>('');

  // Two-way Model (Signals API)
  readonly checked = model<boolean>(false);

  // Output (Signals API)
  readonly change = output<SwitchChangeEvent>();

  // Element reference do botão interativo
  readonly buttonElement = viewChild<ElementRef<HTMLButtonElement>>('switchButton');

  // Identificador único interno
  readonly uniqueId = `orc-switch-${++nextSwitchUniqueId}`;

  // Estado interno para ControlValueAccessor
  private readonly cvaDisabled = signal<boolean>(false);

  // Identificadores e estados derivados (Signals)
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly labelId = computed(() => `${this.effectiveId()}-label`);
  readonly descriptionId = computed(() => `${this.effectiveId()}-desc`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly isError = computed(() => this.error() || !!this.errorMessage());

  readonly computedAriaLabelledBy = computed(() => {
    if (this.ariaLabelledby()) return this.ariaLabelledby();
    if (this.label()) return this.labelId();
    return null;
  });

  readonly computedAriaDescribedBy = computed(() => {
    if (this.ariaDescribedby()) return this.ariaDescribedby();
    if (this.errorMessage()) return this.errorId();
    if (this.description()) return this.descriptionId();
    return null;
  });

  readonly hasContent = computed(() => {
    return !!this.label() || !!this.description() || !!this.errorMessage();
  });

  // Callbacks do ControlValueAccessor
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  // ── ControlValueAccessor Implementation ───────────────────
  writeValue(val: any): void {
    this.checked.set(Boolean(val));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ── Event Handlers ────────────────────────────────────────
  onToggle(event: Event): void {
    event.preventDefault();
    if (this.isDisabled()) {
      return;
    }

    const newChecked = !this.checked();
    this.checked.set(newChecked);
    this.onChange(newChecked);
    this.onTouched();

    this.change.emit({
      checked: newChecked,
      value: this.value(),
    });
  }

  onBlur(): void {
    this.onTouched();
  }

  // ── Public API Methods ────────────────────────────────────
  toggle(): void {
    if (this.isDisabled()) return;

    const newChecked = !this.checked();
    this.checked.set(newChecked);
    this.onChange(newChecked);
    this.onTouched();

    this.change.emit({
      checked: newChecked,
      value: this.value(),
    });
  }

  focus(): void {
    this.buttonElement()?.nativeElement.focus();
  }
}
