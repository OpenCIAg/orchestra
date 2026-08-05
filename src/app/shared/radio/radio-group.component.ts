import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  signal,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ORC_RADIO_GROUP, RadioButtonItem, RadioGroupContext } from './radio.types';

let nextGroupUniqueId = 0;

@Component({
  selector: 'app-radio-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
    {
      provide: ORC_RADIO_GROUP,
      useExisting: forwardRef(() => RadioGroupComponent),
    },
  ],
})
export class RadioGroupComponent implements ControlValueAccessor, RadioGroupContext {
  // Inputs (Signals API)
  readonly name = input<string>(`orc-radio-group-${++nextGroupUniqueId}`);
  readonly layout = input<'vertical' | 'horizontal'>('vertical');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly ariaLabel = input<string>('');

  // Model & Outputs (Signals API)
  readonly value = model<any>(null);
  readonly valueChange = output<any>();

  // Estado interno
  private readonly cvaDisabled = signal<boolean>(false);
  private readonly radios = signal<RadioButtonItem[]>([]);

  // Identificadores de acessibilidade
  readonly groupId = `orc-radio-group-${nextGroupUniqueId}`;
  readonly labelId = `${this.groupId}-label`;
  readonly hintId = `${this.groupId}-hint`;
  readonly errorId = `${this.groupId}-error`;

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly isError = computed(() => this.error());

  // Callbacks do ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value.set(val);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  registerRadio(radio: RadioButtonItem): void {
    this.radios.update((list) => [...list, radio]);
  }

  unregisterRadio(radio: RadioButtonItem): void {
    this.radios.update((list) => list.filter((r) => r !== radio));
  }

  select(val: any): void {
    if (this.isDisabled()) return;

    if (this.value() !== val) {
      this.value.set(val);
      this.onChange(val);
      this.valueChange.emit(val);
    }
    this.onTouched();
  }

  hasSelectedRadio(): boolean {
    const currentVal = this.value();
    return this.radios().some((r) => r.value() === currentVal);
  }

  isFirstEnabled(radio: RadioButtonItem): boolean {
    const enabledRadios = this.radios().filter((r) => !r.isDisabled());
    return enabledRadios.length > 0 && enabledRadios[0] === radio;
  }

  // Navegação WCAG por setas do teclado
  handleKeydown(event: KeyboardEvent, currentRadio: RadioButtonItem): void {
    const enabledRadios = this.radios().filter((r) => !r.isDisabled());
    if (enabledRadios.length <= 1) return;

    const currentIndex = enabledRadios.indexOf(currentRadio);
    if (currentIndex === -1) return;

    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % enabledRadios.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + enabledRadios.length) % enabledRadios.length;
        break;
      default:
        return;
    }

    event.preventDefault();
    const targetRadio = enabledRadios[nextIndex];
    if (targetRadio) {
      this.select(targetRadio.value());
      targetRadio.focus();
    }
  }
}
