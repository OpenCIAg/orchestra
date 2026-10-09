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
  ORC_SHARED_STYLES,
  SizeInput,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-toggle-button',
  standalone: true,
  templateUrl: './toggle-button.component.html',
  styles: [ORC_SHARED_STYLES],
  styleUrl: './toggle-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleButtonComponent),
      multi: true,
    },
  ],
})
export class ToggleButtonComponent implements ControlValueAccessor {
  readonly checked = model(false);
  readonly onLabel = input<string | undefined>(undefined);
  readonly offLabel = input<string | undefined>(undefined);
  readonly onIcon = input('');
  readonly offIcon = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly autofocus = input(false, { transform: booleanAttribute });
  /**
   * Visual size on the canonical `sm | md | lg` scale (`md` renders as the
   * default middle size). Deprecated legacy values (removed at the 23.0.0
   * gate): `small` → `sm`, `large` → `lg`.
   */
  readonly size = input<SizeInput>(undefined);
  /** Canonical form of the public `size` input (legacy aliases resolved). */
  readonly resolvedSize = computed(() => normalizeSize(this.size()));
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly allowEmpty = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly change = output<boolean>();
  readonly onChange = output<{ originalEvent: Event; checked: boolean }>();
  readonly onBlur = output<void>();
  protected cvaDisabled = signal(false);
  private onModelChange: (value: boolean) => void = () => {};
  protected onModelTouched: () => void = () => {};
  writeValue(value: boolean | null): void {
    this.checked.set(Boolean(value));
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  toggle(event?: Event): void {
    if (
      this.disabled() ||
      this.cvaDisabled() ||
      (this.checked() && !this.allowEmpty())
    )
      return;
    if (this.allowEmpty() && this.checked()) this.checked.set(false);
    else this.checked.update((value) => !value);
    this.onModelChange(this.checked());
    this.change.emit(this.checked());
    if (event)
      this.onChange.emit({ originalEvent: event, checked: this.checked() });
  }
}
