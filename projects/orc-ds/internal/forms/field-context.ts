import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  isDevMode,
  Provider,
  Signal,
  signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { OrcControlState } from './control-state';

/** Reactive sources the field component (orc-form-field) binds to its context. */
export interface OrcFieldSources {
  /** Stable base id (SSR). Default: generated `orc-field-N`. */
  id?: () => string | null | undefined;
  /** A visible `<label>` is rendered with `labelId`. */
  label?: () => boolean;
  /** A hint is rendered with `hintId`. */
  hint?: () => boolean;
  /** Explicit error message. Non-empty means invalid and is rendered with `errorId`. */
  error?: () => string | null | undefined;
  /** Field marked required by the field itself. */
  required?: () => boolean;
  /** Field-level disabled. */
  disabled?: () => boolean;
}

/** What a control exposes to its field. Created by `injectFieldControl()`. */
export interface OrcFieldControlHandle {
  readonly state: OrcControlState;
}

/**
 * Field context: the single source of label/hint/error wiring for one
 * control. `orc-form-field` provides it (`providers: [provideOrcField()]`),
 * binds its inputs with `bind()` and renders `<label [for]="controlId()">`,
 * hint and error with the ids below. Controls consume it through
 * `injectFieldControl()` and apply `id`, `aria-describedby`, `aria-invalid`
 * and `required` to their native element.
 *
 * Invalid = explicit error message OR (control invalid AND (touched OR the
 * parent form was submitted)).
 */
@Injectable()
export class OrcFieldContext {
  private readonly generatedId = inject(_IdGenerator).getId('orc-field-');
  private readonly sources = signal<OrcFieldSources>({});
  private readonly registered = signal<OrcFieldControlHandle | null>(null);

  /** Base id; every other id derives from it. */
  readonly baseId: Signal<string> = computed(
    () => this.sources().id?.() || this.generatedId,
  );
  readonly controlId = computed(() => `${this.baseId()}-control`);
  readonly labelId = computed(() => `${this.baseId()}-label`);
  readonly hintId = computed(() => `${this.baseId()}-hint`);
  readonly errorId = computed(() => `${this.baseId()}-error`);

  /** State of the registered control's NgControl (null without forms). */
  readonly controlState = computed(() => this.registered()?.state ?? null);
  readonly hasControl = computed(() => !!this.registered());
  readonly hasLabel = computed(() => !!this.sources().label?.());
  readonly hasHint = computed(() => !!this.sources().hint?.());
  readonly errorMessage = computed(() => this.sources().error?.() || null);

  readonly required: Signal<boolean> = computed(
    () => !!this.sources().required?.() || !!this.controlState()?.required(),
  );
  readonly disabled: Signal<boolean> = computed(
    () => !!this.sources().disabled?.() || !!this.controlState()?.disabled(),
  );
  readonly invalid: Signal<boolean> = computed(
    () => !!this.errorMessage() || !!this.controlState()?.invalidShown(),
  );
  /** Render the error element (and reference it) only when there is something to say. */
  readonly errorVisible = computed(
    () => this.invalid() && !!this.errorMessage(),
  );
  /** Value for the control's `aria-describedby`. */
  readonly describedBy: Signal<string | null> = computed(() => {
    const ids = [
      this.hasHint() ? this.hintId() : null,
      this.errorVisible() ? this.errorId() : null,
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  /** Value for the control's `aria-labelledby` (when it cannot use `<label for>`). */
  readonly labelledBy: Signal<string | null> = computed(() =>
    this.hasLabel() ? this.labelId() : null,
  );

  /** Called once by the field component with getters over its inputs. */
  bind(sources: OrcFieldSources): void {
    this.sources.set(sources);
  }

  /** Registers the field's control; returns the unregister function. */
  registerControl(handle: OrcFieldControlHandle): () => void {
    if (this.registered() && this.registered() !== handle && isDevMode()) {
      console.warn(
        'orc-form-field: more than one control registered; the last one wins.',
      );
    }
    this.registered.set(handle);
    return () => {
      if (this.registered() === handle) this.registered.set(null);
    };
  }
}

/** Providers for the field component. */
export function provideOrcField(): Provider[] {
  return [OrcFieldContext];
}

/** Wiring a control gets from `injectFieldControl()`. */
export interface OrcFieldControl extends OrcFieldControlHandle {
  readonly ngControl: NgControl | null;
  /** Enclosing field, or null. */
  readonly field: OrcFieldContext | null;
  /** `id` for the native element (field's `controlId` or a generated one). */
  readonly id: Signal<string>;
  readonly labelledBy: Signal<string | null>;
  readonly describedBy: Signal<string | null>;
  /** Show invalid styling and `aria-invalid`. */
  readonly invalid: Signal<boolean>;
  /** Field or validators say required. */
  readonly required: Signal<boolean>;
  /** Field or forms API say disabled. */
  readonly disabled: Signal<boolean>;
  /** Re-reads the NgControl; call from `registerOnChange` (the CVA base does). */
  syncNgControl(): void;
}

/**
 * Connects a form control to its `NgControl` and its enclosing field.
 * Must run in an injection context of the control component.
 *
 * - With `valueAccessor`, sets `ngControl.valueAccessor` (the Material
 *   pattern), so the component must NOT also provide `NG_VALUE_ACCESSOR`.
 * - Registers with the enclosing `OrcFieldContext` (unless `field: false`).
 *
 * ```ts
 * protected readonly fieldControl = injectFieldControl({ valueAccessor: this });
 * // template:
 * // <input [id]="fieldControl.id()"
 * //        [attr.aria-describedby]="fieldControl.describedBy()"
 * //        [attr.aria-invalid]="fieldControl.invalid() || null"
 * //        [required]="fieldControl.required()" />
 * ```
 */
export function injectFieldControl(
  options: {
    valueAccessor?: ControlValueAccessor;
    field?: boolean;
    idPrefix?: string;
  } = {},
): OrcFieldControl {
  const ngControl = inject(NgControl, { self: true, optional: true });
  if (ngControl && options.valueAccessor) {
    ngControl.valueAccessor = options.valueAccessor;
  }
  const destroyRef = inject(DestroyRef);
  const field =
    options.field === false
      ? null
      : inject(OrcFieldContext, { optional: true });
  const state = new OrcControlState(ngControl, destroyRef);
  const ownId = inject(_IdGenerator).getId(options.idPrefix ?? 'orc-control-');

  const handle: OrcFieldControl = {
    ngControl,
    field,
    state,
    id: field ? field.controlId : signal(ownId).asReadonly(),
    labelledBy: field ? field.labelledBy : signal(null).asReadonly(),
    describedBy: field ? field.describedBy : signal(null).asReadonly(),
    invalid: field ? field.invalid : state.invalidShown,
    required: computed(() => !!field?.required() || state.required()),
    disabled: computed(() => !!field?.disabled() || state.disabled()),
    syncNgControl: () => state.sync(),
  };
  if (field) destroyRef.onDestroy(field.registerControl(handle));
  return handle;
}
