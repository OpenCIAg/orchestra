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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CvaControl,
  listPickerActiveId,
  listPickerActiveIndex,
  listPickerEnabledIndexes,
  listPickerFirstEnabled,
  listPickerValueMatchesFilter,
  P2_SHARED_STYLES,
  stepListPickerActive,
} from '@ciag/orchestra/internal';
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
export class ComboboxComponent<T = unknown> extends CvaControl {
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
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly optionSelected = output<P2Option<T>>();
  readonly activeIndex = signal(-1);
  readonly activeOptionIndex = computed(() =>
    listPickerActiveIndex(
      this.activeIndex(),
      this.filteredOptions().length,
      (index) => !!this.filteredOptions()[index].disabled,
    ),
  );

  private inputHasFocus = false;
  private userQueryEdited = false;
  private lastSynchronizedValue: T | null = null;

  constructor() {
    super();
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
    const term = this.query().trim();
    if (!term) return this.options();
    return this.options().filter((option) =>
      listPickerValueMatchesFilter(option.label, term, 'contains'),
    );
  });

  optionId(index: number): string {
    return listPickerActiveId(this.listId, index) as string;
  }

  protected override isSelfDisabled(): boolean {
    return this.disabled();
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

  onInput(event: Event): void {
    if (this.effectiveDisabled()) return;
    const previousValue = this.value();
    this.userQueryEdited = true;
    this.lastSynchronizedValue = null;
    this.query.set((event.target as HTMLInputElement).value);
    if (previousValue !== null) {
      this.value.set(null);
      this.cvaOnChange(null);
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
    this.cvaOnTouched();
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
    if (!Object.is(previousValue, option.value)) this.cvaOnChange(option.value);
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
    if (previousValue !== null) this.cvaOnChange(null);
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
    return listPickerFirstEnabled(
      this.filteredOptions().length,
      (index) => !!this.filteredOptions()[index].disabled,
    );
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.filteredOptions();
    const enabled = listPickerEnabledIndexes(
      options.length,
      (index) => !!options[index].disabled,
    );
    const next = stepListPickerActive(this.activeIndex(), delta, enabled, true);
    this.activeIndex.set(next ?? -1);
  }

  private dismiss(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }
}
