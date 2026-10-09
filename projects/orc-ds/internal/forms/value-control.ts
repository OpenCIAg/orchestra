import {
  booleanAttribute,
  computed,
  Directive,
  input,
  ModelSignal,
  signal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectFieldControl, OrcFieldControl } from './field-context';

/**
 * The single ControlValueAccessor base of Orchestra form controls.
 *
 * - Two-way state is the subclass's `value = model<T>(…)`, so the control
 *   works with `[(value)]`, `[formControl]`/`formControlName` and `ngModel`.
 * - The base registers itself as the `NgControl` value accessor (do **not**
 *   provide `NG_VALUE_ACCESSOR` in the subclass) and connects to the
 *   enclosing `orc-form-field` through `injectFieldControl()`.
 * - `isDisabled()` merges the `disabled` input, the forms API and the field;
 *   `isRequired()` merges the `required` input, validators and the field.
 * - Signal-only and zoneless: no NgZone, no manual change detection.
 *
 * ```ts
 * @Component({
 *   selector: 'orc-input',
 *   host: { '(focusout)': 'markAsTouched()' },
 *   template: `<input [id]="field.id()" [value]="value()"
 *     [disabled]="isDisabled()" [required]="isRequired()"
 *     [attr.aria-describedby]="field.describedBy()"
 *     [attr.aria-invalid]="field.invalid() || null"
 *     (input)="commitValue($any($event.target).value)" />`,
 * })
 * export class InputComponent extends OrcValueControl<string> {
 *   readonly value = model('');
 *   protected override coerceValue(raw: unknown) { return raw == null ? '' : String(raw); }
 * }
 * ```
 *
 * Note: `writeValue` goes through `value.set()`, so `(valueChange)` also
 * fires for programmatic form writes; listen to the form control instead
 * when only user edits matter.
 */
@Directive()
export abstract class OrcValueControl<T> implements ControlValueAccessor {
  /** Two-way value; declare it in the subclass with its default. */
  abstract readonly value: ModelSignal<T>;

  /** Disables the control (merged with the forms API and the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Marks the control required (merged with validators and the field). */
  readonly required = input(false, { transform: booleanAttribute });

  /** NgControl/field wiring: ids, aria-describedby, invalid. */
  protected readonly field: OrcFieldControl = injectFieldControl({
    valueAccessor: this,
  });

  private readonly formsDisabled = signal(false);
  private readonly touchedState = signal(false);
  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  /** The user left the control at least once. */
  readonly touched = this.touchedState.asReadonly();
  readonly isDisabled = computed(
    () => this.disabled() || this.formsDisabled() || this.field.disabled(),
  );
  readonly isRequired = computed(
    () => this.required() || this.field.required(),
  );

  /** Normalizes values written by the forms API (null on reset, etc.). */
  protected coerceValue(raw: unknown): T {
    return raw as T;
  }

  /** Call on every user edit: updates the model and notifies the forms API. */
  protected commitValue(next: T): void {
    this.value.set(next);
    this.onChange(next);
  }

  /** Call when the user leaves the control (blur/focusout, overlay closed). */
  markAsTouched(): void {
    this.touchedState.set(true);
    this.onTouched();
  }

  writeValue(raw: unknown): void {
    this.value.set(this.coerceValue(raw));
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
    // Forms calls this when it sets up (or replaces) the control.
    this.field.syncNgControl();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
