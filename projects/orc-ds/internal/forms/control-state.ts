import { DestroyRef, inject, Signal, computed, signal } from '@angular/core';
import {
  AbstractControl,
  FormResetEvent,
  FormSubmittedEvent,
  NgControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Signal view over the `NgControl` of a form control: validity, interaction
 * and submit state, kept in sync through `AbstractControl.events` (and the
 * root form's events, which carry submit/reset).
 *
 * `sync()` must run once the forms directive has created its control; the
 * shared CVA base calls it from `registerOnChange`, which Angular forms
 * invokes exactly when the control is set up (and again if it is replaced).
 */
export class OrcControlState {
  private readonly version = signal(0);
  private readonly submittedState = signal(false);
  private bound: AbstractControl | null = null;
  private subscription = new Subscription();

  /** The forms `AbstractControl`, if any (re-read on every control event). */
  readonly control = computed(() => this.read((control) => control), {
    equal: () => false,
  });
  readonly invalid: Signal<boolean> = computed(() =>
    this.read((control) => !!control?.invalid),
  );
  readonly touched: Signal<boolean> = computed(() =>
    this.read((control) => !!control?.touched),
  );
  readonly dirty: Signal<boolean> = computed(() =>
    this.read((control) => !!control?.dirty),
  );
  readonly disabled: Signal<boolean> = computed(() =>
    this.read((control) => !!control?.disabled),
  );
  readonly errors = computed(() =>
    this.read((control) => control?.errors ?? null),
  );
  /** The parent form was submitted (reset clears it). */
  readonly submitted: Signal<boolean> = this.submittedState.asReadonly();
  /** A required validator is attached (reactive `Validators.required` or template `required`). */
  readonly required: Signal<boolean> = computed(() =>
    this.read((control) => isRequired(control)),
  );
  /** Invalid state the UI should show: invalid and (touched or submitted). */
  readonly invalidShown: Signal<boolean> = computed(
    () => this.invalid() && (this.touched() || this.submitted()),
  );

  constructor(
    readonly ngControl: NgControl | null,
    destroyRef?: DestroyRef,
  ) {
    destroyRef?.onDestroy(() => this.subscription.unsubscribe());
  }

  /** (Re)subscribes to the current `ngControl.control`. Idempotent. */
  sync(): void {
    const control = this.ngControl?.control ?? null;
    if (control === this.bound) {
      this.refresh();
      return;
    }
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.bound = control;
    this.submittedState.set(false);
    if (control) {
      this.subscription.add(control.events.subscribe(() => this.refresh()));
      const root = control.root;
      if (root !== control) {
        this.subscription.add(
          root.events.subscribe((event) => {
            if (event instanceof FormSubmittedEvent) {
              this.submittedState.set(true);
            } else if (event instanceof FormResetEvent) {
              this.submittedState.set(false);
            }
            this.refresh();
          }),
        );
      }
    }
    this.refresh();
  }

  private read<T>(project: (control: AbstractControl | null) => T): T {
    this.version();
    return project(this.bound);
  }

  /** Re-reads the control (validators added later, manual status changes). */
  refresh(): void {
    this.version.update((value) => value + 1);
  }
}

function isRequired(control: AbstractControl | null): boolean {
  if (!control) return false;
  if (
    control.hasValidator(Validators.required) ||
    control.hasValidator(Validators.requiredTrue)
  ) {
    return true;
  }
  if (!control.validator) return false;
  try {
    // Template `required` registers a RequiredValidator directive, not the
    // `Validators.required` function: probe the composed validator instead.
    const errors = control.validator({ value: null } as AbstractControl);
    return !!errors?.['required'];
  } catch {
    return false;
  }
}

/** Creates an `OrcControlState` for the `NgControl` on the current element. */
export function injectControlState(): OrcControlState {
  return new OrcControlState(
    inject(NgControl, { self: true, optional: true }),
    inject(DestroyRef),
  );
}
