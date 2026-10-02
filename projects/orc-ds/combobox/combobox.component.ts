import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';
import type { P2Option } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-combobox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
  templateUrl: './combobox.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxComponent<T = unknown> implements ControlValueAccessor {
  private static nextId = 0;
  readonly inputId = `orc-combobox-${++ComboboxComponent.nextId}`;
  readonly listId = `${this.inputId}-listbox`;
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly query = model('');
  readonly open = model(false);
  readonly label = input('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input('');
  readonly emptyText = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly cvaDisabled = signal(false);
  private onModelChange: (value: T | null) => void = () => {};
  private onModelTouched: () => void = () => {};
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly optionSelected = output<P2Option<T>>();
  readonly activeIndex = signal(-1);
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  readonly activeOptionIndex = computed(() => {
    const index = this.activeIndex();
    const option = this.filteredOptions()[index];
    return option && !option.disabled ? index : -1;
  });

  private inputHasFocus = false;
  private userQueryEdited = false;
  private lastSynchronizedValue: T | null = null;

  constructor() {
    effect(() => {
      const value = this.value();
      const options = this.options();
      if (this.userQueryEdited && Object.is(value, this.lastSynchronizedValue))
        return;
      this.userQueryEdited = false;
      this.lastSynchronizedValue = value;
      this.query.set(
        value == null
          ? ''
          : (options.find((option) => Object.is(option.value, value))?.label ??
              ''),
      );
    });
    effect(() => {
      if (this.effectiveDisabled()) {
        this.open.set(false);
        this.activeIndex.set(-1);
      }
    });
  }

  readonly filteredOptions = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    return this.options().filter(
      (option) => !term || option.label.toLocaleLowerCase().includes(term),
    );
  });

  optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  writeValue(value: T | null): void {
    this.userQueryEdited = false;
    this.lastSynchronizedValue = value;
    this.value.set(value);
    this.query.set(
      value == null
        ? ''
        : (this.options().find((option) => Object.is(option.value, value))
            ?.label ?? ''),
    );
  }
  registerOnChange(fn: (value: T | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  onInput(event: Event): void {
    if (this.effectiveDisabled()) return;
    const previousValue = this.value();
    this.userQueryEdited = true;
    this.lastSynchronizedValue = null;
    this.query.set((event.target as HTMLInputElement).value);
    if (previousValue !== null) {
      this.value.set(null);
      this.onModelChange(null);
    }
    this.open.set(true);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  onFocus(): void {
    if (this.effectiveDisabled()) return;
    this.inputHasFocus = true;
    this.open.set(true);
    const selectedIndex = this.filteredOptions().findIndex(
      (option) => !option.disabled && Object.is(option.value, this.value()),
    );
    this.activeIndex.set(selectedIndex);
  }

  onBlur(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
    if (!this.inputHasFocus) return;
    this.inputHasFocus = false;
    this.onModelTouched();
  }

  select(option: P2Option<T>): void {
    if (
      option.disabled ||
      this.effectiveDisabled() ||
      !this.options().includes(option)
    )
      return;
    const previousValue = this.value();
    this.userQueryEdited = false;
    this.lastSynchronizedValue = option.value;
    this.value.set(option.value);
    this.query.set(option.label);
    this.open.set(false);
    this.activeIndex.set(-1);
    if (!Object.is(previousValue, option.value))
      this.onModelChange(option.value);
    this.optionSelected.emit(option);
  }

  clear(): void {
    if (this.effectiveDisabled()) return;
    const previousValue = this.value();
    this.userQueryEdited = false;
    this.lastSynchronizedValue = null;
    this.value.set(null);
    this.query.set('');
    this.open.set(false);
    this.activeIndex.set(-1);
    if (previousValue !== null) this.onModelChange(null);
  }

  isSelected(option: P2Option<T>): boolean {
    return Object.is(this.value(), option.value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.open()) {
        event.preventDefault();
        this.dismiss();
      }
      return;
    }
    if (this.effectiveDisabled()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.open.set(true);
      this.moveActive(delta);
    } else if (
      event.key === 'Enter' &&
      this.open() &&
      this.activeOptionIndex() >= 0
    ) {
      event.preventDefault();
      const option = this.filteredOptions()[this.activeOptionIndex()];
      if (option) this.select(option);
    }
  }

  private firstEnabledIndex(): number {
    return this.filteredOptions().findIndex((option) => !option.disabled);
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.filteredOptions();
    const enabledIndices = options.flatMap((option, index) =>
      option.disabled ? [] : [index],
    );
    if (!enabledIndices.length) {
      this.activeIndex.set(-1);
      return;
    }
    const activePosition = enabledIndices.indexOf(this.activeOptionIndex());
    const nextPosition =
      activePosition < 0
        ? delta > 0
          ? 0
          : enabledIndices.length - 1
        : Math.max(
            0,
            Math.min(enabledIndices.length - 1, activePosition + delta),
          );
    this.activeIndex.set(enabledIndices[nextPosition]);
  }

  private dismiss(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }
}
