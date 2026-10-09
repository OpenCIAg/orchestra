import { Injector, Signal, signal } from '@angular/core';
import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import {
  OrcCompareWith,
  OrcOption,
  orcDefaultCompareWith,
} from '@ciag/orchestra/core';

/**
 * Value selection for option lists (select, listbox, autocomplete,
 * segmented-control, tags-input) over the CDK `SelectionModel`, with
 * `compareWith` so object values match by identity key instead of reference.
 *
 * ```ts
 * readonly selection = new OrcSelection<Project>({ multiple: true, compareWith: (a, b) => a.id === b.id });
 * this.selection.setValue(this.value());       // from the model
 * this.selection.toggle(option.value);         // on user choice
 * this.commitValue(this.selection.value());    // T | T[] | null
 * ```
 */
export class OrcSelection<T> {
  private readonly model: SelectionModel<T>;
  private readonly selectedState = signal<readonly T[]>([]);

  /** Selected values in selection order. */
  readonly selected: Signal<readonly T[]> = this.selectedState.asReadonly();
  readonly multiple: boolean;
  readonly compareWith: OrcCompareWith<T>;

  constructor(
    options: { multiple?: boolean; compareWith?: OrcCompareWith<T> } = {},
  ) {
    this.multiple = !!options.multiple;
    this.compareWith =
      options.compareWith ?? (orcDefaultCompareWith as OrcCompareWith<T>);
    this.model = new SelectionModel<T>(
      this.multiple,
      [],
      false,
      this.compareWith,
    );
  }

  isSelected(value: T): boolean {
    return this.model.isSelected(value);
  }

  select(...values: T[]): void {
    this.model.select(...values);
    this.publish();
  }

  deselect(...values: T[]): void {
    this.model.deselect(...values);
    this.publish();
  }

  /** Toggles in multiple mode; selects (never deselects) in single mode. */
  toggle(value: T): void {
    if (this.multiple) this.model.toggle(value);
    else this.model.select(value);
    this.publish();
  }

  clear(): void {
    this.model.clear();
    this.publish();
  }

  /** Replaces the selection from a model value (`T`, `T[]`, null/undefined). */
  setValue(value: T | readonly T[] | null | undefined): void {
    const values =
      value == null
        ? []
        : Array.isArray(value)
          ? [...(value as readonly T[])]
          : [value as T];
    this.model.setSelection(...(this.multiple ? values : values.slice(0, 1)));
    this.publish();
  }

  /** Model value: an array in multiple mode, the value or null otherwise. */
  value(): T | T[] | null {
    const selected = this.selectedState();
    return this.multiple ? [...selected] : (selected[0] ?? null);
  }

  /** Options whose value is selected, in option order. */
  selectedOptions(options: readonly OrcOption<T>[]): OrcOption<T>[] {
    return options.filter((option) => this.isSelected(option.value));
  }

  private publish(): void {
    this.selectedState.set([...this.model.selected]);
  }
}

/** Finds the option for `value` using `compareWith`. */
export function findOrcOption<T>(
  options: readonly OrcOption<T>[],
  value: T,
  compareWith: OrcCompareWith<T> = orcDefaultCompareWith as OrcCompareWith<T>,
): OrcOption<T> | undefined {
  return options.find((option) => compareWith(option.value, value));
}

/** Item contract for `createOptionKeyManager` (an option component/directive). */
export interface OrcHighlightableOption extends Highlightable {
  disabled?: boolean;
  /** Text used by typeahead. */
  getLabel(): string;
}

/**
 * `ActiveDescendantKeyManager` preconfigured for listbox-like popups: focus
 * stays on the trigger/input, arrows move the active option (skipping
 * disabled ones), Home/End, wrap and typeahead.
 *
 * ```ts
 * readonly options = viewChildren(OptionComponent);
 * private readonly keys = createOptionKeyManager(this.options, inject(Injector));
 * onKeydown(event: KeyboardEvent) { this.keys.onKeydown(event); }
 * // [attr.aria-activedescendant]="keys.activeItem?.id"
 * ```
 */
export function createOptionKeyManager<T extends OrcHighlightableOption>(
  items: Signal<readonly T[]>,
  injector: Injector,
  options: { wrap?: boolean; typeahead?: boolean; horizontal?: boolean } = {},
): ActiveDescendantKeyManager<T> {
  const manager = new ActiveDescendantKeyManager<T>(items, injector)
    .withWrap(options.wrap ?? true)
    .withHomeAndEnd()
    .skipPredicate((item) => !!item.disabled);
  if (options.typeahead !== false) manager.withTypeAhead();
  if (options.horizontal) manager.withHorizontalOrientation('ltr');
  else manager.withVerticalOrientation();
  return manager;
}
