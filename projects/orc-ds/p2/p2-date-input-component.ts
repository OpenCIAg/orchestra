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
import { P2_SHARED_STYLES } from './p2-shared';
import { isIsoDate } from './p2-date-utils';

let nextDateInputId = 0;

@Component({
  selector: 'orc-date-input',
  standalone: true,
  template: `
    <label
      class="p-datepicker p-component orc-p2-date-input"
      [class]="'p-datepicker p-component orc-p2-date-input ' + styleClass()"
      [style]="style()"
      [class.p-datepicker-fluid]="fluid()"
      [attr.data-pc-name]="'datepicker'"
    >
      @if (label()) {
        <span [id]="effectiveId() + '-label'"
          >{{ label() }}
          @if (required()) {
            <sup>*</sup>
          }
        </span>
      }
      <input
        class="p-inputtext p-component"
        [id]="effectiveId()"
        [name]="name()"
        type="date"
        [value]="value()"
        [min]="min() || null"
        [max]="max() || null"
        [required]="required()"
        [disabled]="effectiveDisabled()"
        [readonly]="readonly()"
        [autofocus]="autofocus()"
        [attr.tabindex]="tabindex()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="
          ariaLabelledBy() || (label() ? effectiveId() + '-label' : null)
        "
        [attr.aria-describedby]="
          helperText() ? effectiveId() + '-helper' : null
        "
        [attr.aria-invalid]="!!error()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      @if (error()) {
        <small class="error" role="alert">{{ error() }}</small>
      }
      @if (!error() && helperText()) {
        <small [id]="effectiveId() + '-helper'">{{ helperText() }}</small>
      }
    </label>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    .orc-p2-date-input { display: grid; gap: .35rem; color: var(--orc-component-text); font-size: .875rem; font-weight: 600; }
    input { min-height: 2.5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; padding: .5rem .65rem; background: var(--orc-component-control); color: var(--orc-component-text); font-weight: 400; }
    small { color: var(--orc-component-text-muted); font-weight: 400; } .error { color: var(--orc-component-danger); }
  `,
  ],
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
