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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CvaControl,
  P2_SHARED_STYLES,
  calendarDateKey,
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
  /** ISO string or Date; the native picker bound honors both spellings. */
  readonly min = input<string | Date>('');
  /** ISO string or Date; the native picker bound honors both spellings. */
  readonly max = input<string | Date>('');
  readonly helperText = input('');
  readonly error = input('');
  /** Message surfaced when a typed value falls outside `[min]`/`[max]`. */
  readonly invalidRangeMessage = input('Date outside the allowed range');
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
  protected readonly minKey = computed(() => calendarDateKey(this.min()));
  protected readonly maxKey = computed(() => calendarDateKey(this.max()));
  /** True while the last typed value sat outside the min/max bounds. */
  readonly rangeInvalid = signal(false);

  writeValue(value: string | null): void {
    this.rangeInvalid.set(false);
    this.value.set(this.normalizeDate(value));
  }
  /** The control's own disabled input, for the shared CVA base. */
  protected isSelfDisabled(): boolean {
    return this.disabled();
  }
  onInput(event: Event): void {
    const value = this.normalizeDate((event.target as HTMLInputElement).value);
    const key = calendarDateKey(value);
    const min = this.minKey();
    const max = this.maxKey();
    const outOfRange =
      key !== '' && ((min !== '' && key < min) || (max !== '' && key > max));
    this.rangeInvalid.set(outOfRange);
    // Native date fields accept typed values outside min/max, so the
    // constraint is enforced here: an out-of-range value surfaces the
    // validity state and never reaches the model silently.
    if (outOfRange) return;
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
