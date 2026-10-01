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
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

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
  template: `
    <div
      class="p-autocomplete p-component orc-p2-field"
      [class]="'p-autocomplete p-component orc-p2-field ' + styleClass()"
      [style]="style()"
      [attr.data-pc-name]="'autocomplete'"
    >
      @if (label()) {
        <label [for]="inputId">{{ label() }}</label>
      }
      <div class="p-autocomplete-input-wrapper orc-p2-combobox">
        <input
          [id]="inputId"
          role="combobox"
          [value]="query()"
          [attr.placeholder]="placeholder() || null"
          [disabled]="effectiveDisabled()"
          [attr.aria-autocomplete]="'list'"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="listId"
          [attr.aria-activedescendant]="
            activeOptionIndex() >= 0 ? optionId(activeOptionIndex()) : null
          "
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeydown($event)"
        />
        @if (query() && clearAriaLabel()) {
          <button
            type="button"
            class="orc-p2-clear"
            [attr.aria-label]="clearAriaLabel()"
            [disabled]="effectiveDisabled()"
            (click)="clear()"
          >
            ×
          </button>
        }
      </div>
      @if (open()) {
        <ul
          class="p-autocomplete-panel p-component orc-p2-options"
          [id]="listId"
          role="listbox"
        >
          @for (option of filteredOptions(); track option.value) {
            <li
              class="p-autocomplete-option"
              [id]="optionId($index)"
              role="option"
              [attr.aria-selected]="isSelected(option)"
              [class.is-active]="$index === activeOptionIndex()"
              [class.is-disabled]="option.disabled"
              [attr.aria-disabled]="option.disabled || null"
              (mousedown)="$event.preventDefault()"
              (click)="select(option)"
            >
              <strong>{{ option.label }}</strong>
              @if (option.description) {
                <small>{{ option.description }}</small>
              }
            </li>
          } @empty {
            @if (emptyText()) {
              <li class="orc-p2-empty">{{ emptyText() }}</li>
            }
          }
        </ul>
      }
      @if (helperText()) {
        <small class="orc-p2-muted">{{ helperText() }}</small>
      }
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    .orc-p2-field { position: relative; display: grid; gap: .35rem; width: 100%; color: var(--orc-component-text); }
    label { font-size: .875rem; font-weight: 600; }
    .orc-p2-combobox { position: relative; display: flex; align-items: center; }
    input { width: 100%; min-height: 2.5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; padding: .5rem .75rem; background: var(--orc-component-control); color: var(--orc-component-text); }
    .orc-p2-clear { position: absolute; right: .25rem; border: 0; background: transparent; font-size: 1.2rem; }
    .orc-p2-options { position: absolute; z-index: 2; top: 4.3rem; right: 0; left: 0; max-height: 15rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-surface-raised); box-shadow: var(--orc-component-overlay-shadow); list-style: none; }
    .orc-p2-options li { display: grid; gap: .1rem; padding: .55rem .65rem; border-radius: .35rem; cursor: pointer; }
    .orc-p2-options li:hover, .orc-p2-options .is-active { background: var(--orc-component-interactive-soft); }
    .orc-p2-options .is-disabled { color: var(--orc-component-text-muted); cursor: not-allowed; }
    .orc-p2-options small { color: var(--orc-component-text-muted); }
    .orc-p2-empty { color: var(--orc-component-text-muted); cursor: default !important; }
  `,
  ],
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
