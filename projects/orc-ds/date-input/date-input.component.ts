import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CvaControl,
  P2_SHARED_STYLES,
  calendarParseDate,
} from '@ciag/orchestra/internal';

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
export class DateInputComponent extends CvaControl {
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
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);

  writeValue(value: string | null): void {
    this.value.set(this.normalizeDate(value));
  }
  /** The control's own disabled input, for the shared CVA base. */
  protected isSelfDisabled(): boolean {
    return this.disabled();
  }
  onInput(event: Event): void {
    const value = this.normalizeDate((event.target as HTMLInputElement).value);
    this.value.set(value);
    this.cvaOnChange(value);
  }
  onTouched(): void {
    this.cvaOnTouched();
  }
  /** Keep only bare, real ISO calendar dates in the model. */
  private normalizeDate(value: string | null): string {
    return value && calendarParseDate(value) ? value : '';
  }
}
