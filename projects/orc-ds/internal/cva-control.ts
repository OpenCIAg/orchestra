import { computed, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * Signal-idiomatic ControlValueAccessor base shared by the form controls.
 * It owns callback registration and the forms disabled handshake so concrete
 * controls only implement `writeValue` and surface their own `disabled`
 * input. Emitted values stay safe before Angular registers its callbacks.
 */
export abstract class CvaControl implements ControlValueAccessor {
  /** Set by Angular forms through `setDisabledState`. */
  protected readonly cvaDisabled = signal(false);

  /** The control's own disabled input OR the forms-API disabled state. */
  readonly effectiveDisabled = computed(
    () => this.isSelfDisabled() || this.cvaDisabled(),
  );

  /** Registered by Angular forms; callable at any lifecycle stage. */
  protected cvaOnChange: (value: any) => void = () => {};
  protected cvaOnTouched: () => void = () => {};

  /** Reads the concrete control's `disabled` input inside the computed. */
  protected abstract isSelfDisabled(): boolean;

  abstract writeValue(value: any): void;

  registerOnChange(fn: (value: any) => void): void {
    this.cvaOnChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.cvaOnTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
