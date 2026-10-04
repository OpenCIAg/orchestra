import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  normalizeSize,
  P2_SHARED_STYLES,
  SizeInput,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-password, orc-input-password',
  standalone: true,
  templateUrl: './password.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './password.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordComponent),
      multi: true,
    },
  ],
})
export class PasswordComponent implements ControlValueAccessor {
  private static generatedIdSequence = 0;
  private readonly generatedInputId = `orc-password-${++PasswordComponent.generatedIdSequence}`;
  readonly value = model('');
  readonly visible = model(false);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly inputStyleClass = input('');
  readonly inputStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly variant = input<'filled' | 'outlined'>('outlined');
  /**
   * Visual size on the canonical `sm | md | lg` scale (`md` renders as the
   * default middle size). Deprecated legacy values (removed at the 23.0.0
   * gate): `small` → `sm`, `large` → `lg`.
   */
  readonly size = input<SizeInput>(undefined);
  /** Canonical form of the public `size` input (legacy aliases resolved). */
  readonly resolvedSize = computed(() => normalizeSize(this.size()));
  readonly maxLength = input<number | undefined>(undefined);
  readonly autocomplete = input('off');
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly tabindex = input<number | undefined>(undefined);
  readonly feedback = input(true, { transform: booleanAttribute });
  readonly toggleMask = input(true, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly hidePasswordLabel = input<string | undefined>('Hide password');
  readonly showPasswordLabel = input<string | undefined>('Show password');
  /** @deprecated Compatibility-only input; Password renders in place and does not portal to an append target. */
  readonly appendTo = input<unknown>(undefined);
  /** @deprecated Transition timing is fixed by the component stylesheet. */
  readonly showTransitionOptions = input('150ms ease');
  /** @deprecated Transition timing is fixed by the component stylesheet. */
  readonly hideTransitionOptions = input('150ms ease');
  readonly promptLabel = input<string | undefined>(undefined);
  readonly weakLabel = input<string | undefined>(undefined);
  readonly mediumLabel = input<string | undefined>(undefined);
  readonly strongLabel = input<string | undefined>(undefined);
  readonly mediumRegex = input('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$');
  readonly strongRegex = input(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$',
  );
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onClear = output<void>();
  readonly focused = signal(false);
  protected readonly cvaDisabled = signal(false);
  private onModelChange: (value: string) => void = () => {};
  private onModelTouched: () => void = () => {};
  readonly strength = computed<'weak' | 'medium' | 'strong'>(() => {
    const value = this.value();
    if (!value) return 'weak';
    try {
      if (new RegExp(this.strongRegex()).test(value)) return 'strong';
      if (new RegExp(this.mediumRegex()).test(value)) return 'medium';
    } catch {
      /* invalid custom expressions fall back to weak */
    }
    return 'weak';
  });
  readonly strengthLabel = computed(() =>
    this.strength() === 'strong'
      ? this.strongLabel()
      : this.strength() === 'medium'
        ? this.mediumLabel()
        : this.weakLabel(),
  );
  readonly effectiveInputId = computed(
    () => this.inputId() || this.generatedInputId,
  );
  readonly effectiveShowPasswordLabel = computed(
    () => this.showPasswordLabel() || 'Show password',
  );
  readonly effectiveHidePasswordLabel = computed(
    () => this.hidePasswordLabel() || 'Hide password',
  );
  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  onInput(event: Event): void {
    if (this.readonly() || this.disabled() || this.cvaDisabled()) return;
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onModelChange(value);
  }
  handleFocus(event: Event): void {
    this.focused.set(true);
    this.onFocus.emit(event);
  }
  handleBlur(event: Event): void {
    this.focused.set(false);
    this.onModelTouched();
    this.onBlur.emit(event);
  }
  toggleVisible(): void {
    if (!this.disabled() && !this.cvaDisabled())
      this.visible.update((value) => !value);
  }
  clear(): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    this.value.set('');
    this.onModelChange('');
    this.onModelTouched();
    this.onClear.emit();
  }
}
