import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES, isIsoDate } from '@ciag/orchestra/internal';

let nextDateInputId = 0;

@Component({
  selector: 'orc-date-input',
  standalone: true,
  templateUrl: './date-input.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-date-input-${++nextDateInputId}`;
  readonly value = model('');
  readonly label = input('');
  readonly name = input('');
  readonly min = input('');
  readonly max = input('');
  readonly helperText = input('');
  readonly error = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly tabindex = input<number | undefined>(0);
  readonly cvaDisabled = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouchedCallback: () => void = () => undefined;
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);

  writeValue(value: string | null): void {
    this.value.set(this.normalizeDate(value));
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  onInput(event: Event): void {
    const value = this.normalizeDate((event.target as HTMLInputElement).value);
    this.value.set(value);
    this.onChange(value);
  }
  onTouched(): void {
    this.onTouchedCallback();
  }
  private normalizeDate(value: string | null): string {
    return value && isIsoDate(value) ? value : '';
  }
}
