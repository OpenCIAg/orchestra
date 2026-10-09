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
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

const DEFAULT_INPUT_COLOR = '#3b82f6';

@Component({
  selector: 'orc-input-color',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputColorComponent),
      multi: true,
    },
  ],
  template: `<label
    class="orc-input-color"
    [attr.aria-label]="ariaLabel() || null"
    (focusout)="onFocusOut($event)"
    ><input
      type="color"
      [value]="value()"
      [disabled]="isDisabled()"
      [attr.aria-label]="colorInputLabel()"
      (input)="onInput($event)" /><input
      class="text"
      type="text"
      [value]="value()"
      [disabled]="isDisabled()"
      [attr.aria-label]="textInputLabel()"
      (input)="onTextInput($event)"
  /></label>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-input-color{display:inline-flex;align-items:center;gap:.5rem}.orc-input-color input[type=color]{width:2.5rem;height:2.5rem;padding:.15rem;border:1px solid var(--orc-component-border-strong);border-radius:.4rem;background:var(--orc-component-surface)}.orc-input-color .text{width:7rem;padding:.5rem;border:1px solid var(--orc-component-border-strong);border-radius:.4rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputColorComponent implements ControlValueAccessor {
  readonly value = model(DEFAULT_INPUT_COLOR);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly valueChangeEvent = output<string>();
  readonly colorInputLabel = computed(
    () => `${this.ariaLabel() || 'Color'} picker`,
  );
  readonly textInputLabel = computed(
    () => `${this.ariaLabel() || 'Color'} value`,
  );
  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private touched = false;

  onInput(event: Event): void {
    this.update((event.target as HTMLInputElement).value);
  }
  onTextInput(event: Event): void {
    this.update((event.target as HTMLInputElement).value);
  }
  writeValue(value: string | null): void {
    this.value.set(this.normalize(value) ?? DEFAULT_INPUT_COLOR);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if ((!host || !related || !host.contains(related)) && !this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  private update(value: string): void {
    if (this.isDisabled()) return;
    const normalized = this.normalize(value);
    if (!normalized) return;
    this.value.set(normalized);
    this.valueChangeEvent.emit(normalized);
    this.onChange(normalized);
  }

  private normalize(value: string | null | undefined): string | null {
    const trimmed = value?.trim().toLowerCase() ?? '';
    if (/^#[0-9a-f]{3}$/.test(trimmed)) {
      return `#${trimmed
        .slice(1)
        .split('')
        .map((channel) => channel + channel)
        .join('')}`;
    }
    return /^#[0-9a-f]{6}$/.test(trimmed) ? trimmed : null;
  }
}
