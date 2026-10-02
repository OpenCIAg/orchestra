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
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CvaControl } from '@ciag/orchestra/internal';
import { CheckboxAriaChecked, CheckboxChangeEvent } from './checkbox.types';

let nextCheckboxUniqueId = 0;

@Component({
  selector: 'orc-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent extends CvaControl {
  // Inputs (Signals API)
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly value = input<any>(undefined);
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledby = input<string | undefined>(undefined);
  readonly ariaDescribedby = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly binary = input(false, { transform: booleanAttribute });
  readonly trueValue = input<any>(true);
  readonly falseValue = input<any>(false);
  readonly variant = input<'filled' | 'outlined'>('outlined');
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  // Two-way Models (Signals API)
  readonly checked = model<boolean>(false);
  readonly indeterminate = model<boolean>(false);

  // Outputs (Signals API)
  readonly change = output<CheckboxChangeEvent>();
  readonly onChange = output<CheckboxChangeEvent>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();

  // Element reference ao input nativo para controle de foco
  readonly inputElement =
    viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  // ID interno único
  readonly uniqueId = `orc-checkbox-${++nextCheckboxUniqueId}`;

  // Estado interno para ControlValueAccessor
  private readonly cvaValue = signal<any>(false);

  // Identificadores e estados derivados (Signals)
  readonly effectiveId = computed(
    () => this.inputId() || this.id() || this.uniqueId,
  );
  readonly labelId = computed(() => `${this.effectiveId()}-label`);
  readonly descriptionId = computed(() => `${this.effectiveId()}-desc`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  /** Historical Orchestra name for the shared effective-disabled state. */
  readonly isDisabled = this.effectiveDisabled;
  readonly isError = computed(() => this.error() || !!this.errorMessage());

  // Acessibilidade WCAG: aria-checked com suporte a "mixed" para indeterminate
  readonly ariaChecked = computed<CheckboxAriaChecked>(() => {
    if (this.indeterminate()) {
      return 'mixed';
    }
    return this.checked() ? 'true' : 'false';
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

  constructor() {
    super();
    effect(() => {
      const native = this.inputElement()?.nativeElement;
      if (native) native.indeterminate = this.indeterminate();
    });
  }

  // ── ControlValueAccessor Implementation ───────────────────
  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  override writeValue(val: any): void {
    this.cvaValue.set(val);
    this.checked.set(
      this.binary()
        ? val === this.trueValue()
        : Array.isArray(val)
          ? val.some((item) => item === this.value())
          : Boolean(val),
    );
  }

  // ── Event Handlers ────────────────────────────────────────
  onNativeChange(event: Event): void {
    // The component emits a structured change output below. Prevent the
    // native event from reaching a host listener a second time.
    event.stopPropagation();

    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;

    // Native checkboxes do not implement readonly behavior themselves. Keep
    // the input focusable, but restore its visual state and suppress updates.
    if (this.readonly()) {
      event.preventDefault();
      input.checked = this.checked();
      input.indeterminate = this.indeterminate();
      return;
    }

    // Se estava em estado indeterminado, alternar limpa o indeterminado e marca como checado
    if (this.indeterminate()) {
      this.indeterminate.set(false);
      this.checked.set(true);
    } else {
      this.checked.set(input.checked);
    }

    const newChecked = this.checked();
    const emittedValue = this.nextModelValue(newChecked);
    this.cvaValue.set(emittedValue);
    this.cvaOnChange(emittedValue);
    this.cvaOnTouched();

    const eventValue = {
      checked: newChecked,
      indeterminate: this.indeterminate(),
      value: this.value(),
    };
    this.change.emit(eventValue);
    this.onChange.emit(eventValue);
  }

  handleBlur(event?: Event): void {
    this.cvaOnTouched();
    if (event) this.onBlur.emit(event);
  }

  handleFocus(event: Event): void {
    this.onFocus.emit(event);
  }

  /*
    The output value follows PrimeNG's binary/trueValue/falseValue contract,
    while `checked` remains the visual boolean state used by Orchestra.
  */
  modelValue(): any {
    return this.nextModelValue(this.checked());
  }

  /* legacy method retained for callers that used the old boolean-only API */
  onLegacyBlur(): void {
    this.cvaOnTouched();
  }

  // ── Public API Methods ────────────────────────────────────
  toggle(): void {
    if (this.isDisabled() || this.readonly()) return;

    if (this.indeterminate()) {
      this.indeterminate.set(false);
      this.checked.set(true);
    } else {
      this.checked.update((c) => !c);
    }

    const newChecked = this.checked();
    const emittedValue = this.nextModelValue(this.checked());
    this.cvaValue.set(emittedValue);
    this.cvaOnChange(emittedValue);
    this.cvaOnTouched();

    const eventValue = {
      checked: newChecked,
      indeterminate: this.indeterminate(),
      value: this.value(),
    };
    this.change.emit(eventValue);
    this.onChange.emit(eventValue);
  }

  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }

  private nextModelValue(checked: boolean): any {
    if (this.binary()) return checked ? this.trueValue() : this.falseValue();
    const current = this.cvaValue();
    if (!Array.isArray(current) || this.value() === undefined) return checked;
    return checked
      ? current.some((item) => item === this.value())
        ? current
        : [...current, this.value()]
      : current.filter((item) => item !== this.value());
  }
}
