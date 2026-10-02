import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-listbox',
  standalone: true,
  templateUrl: './listbox.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './listbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxComponent<T = unknown> implements ControlValueAccessor {
  private static nextId = 0;
  private readonly generatedId = `orc-listbox-${++ListboxComponent.nextId}`;
  readonly options = input<any[]>([]);
  readonly value = model<T | T[] | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly label = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly effectiveId = computed(() => this.id()?.trim() || this.generatedId);
  readonly effectiveAriaLabelledBy = computed(() => {
    const externalLabelId = this.ariaLabelledBy()?.trim();
    if (externalLabelId) return externalLabelId;
    return !this.ariaLabel()?.trim() && this.label().trim()
      ? `${this.effectiveId()}-label`
      : null;
  });
  readonly effectiveAriaLabel = computed(() => {
    if (this.ariaLabelledBy()?.trim()) return null;
    const explicitLabel = this.ariaLabel()?.trim();
    if (explicitLabel) return explicitLabel;
    return this.label().trim() ? null : 'Listbox';
  });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; focusing the listbox does not select an option. */
  readonly selectOnFocus = input(false, { transform: booleanAttribute });
  readonly focusOnHover = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; the active option is set through keyboard navigation. */
  readonly autoOptionFocus = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string | undefined>(undefined);
  readonly emptyFilterMessage = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; search status announcements are not implemented. */
  readonly searchMessage = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; selection status announcements are not implemented. */
  readonly selectionMessage = input<string | undefined>(undefined);
  readonly style = input<Record<string, string> | undefined>(undefined);
  readonly listStyle = input<Record<string, string> | undefined>(undefined);
  readonly listStyleClass = input('');
  /** @deprecated Compatibility input only; striped row styling is not implemented. */
  readonly striped = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; checkbox option rows are not implemented. */
  readonly checkbox = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; checkmark rendering is not implemented. */
  readonly checkmark = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; highlight-on-select styling is not implemented. */
  readonly highlightOnSelect = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; select-all controls are not implemented. */
  readonly showToggleAll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; option grouping is not implemented. */
  readonly group = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; lazy loading is not implemented. */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtualized rendering is not implemented. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtualized rendering is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; virtualized rendering is not implemented. */
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  readonly scrollHeight = input('16rem');
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<
    string | ((option: any) => boolean) | undefined
  >(undefined);
  /** @deprecated Compatibility input only; option grouping is not implemented. */
  readonly optionGroupLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; option grouping is not implemented. */
  readonly optionGroupChildren = input<string | undefined>(undefined);
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterFields = input<string[] | undefined>(undefined);
  readonly filterMatchMode = input<
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'equals'
    | 'notEquals'
    | 'in'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte'
    | string
  >('contains');
  readonly filterLocale = input<string | undefined>(undefined);
  readonly ariaFilterLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly effectiveFilterAriaLabel = computed(
    () => this.ariaFilterLabel()?.trim() || 'Filter options',
  );
  readonly styleClass = input('');
  readonly optionSelected = output<any>();
  readonly onChange = output<{ originalEvent: Event; value: T | T[] | null }>();
  readonly onClick = output<{ originalEvent: Event; option: any }>();
  readonly onDblClick = output<{ originalEvent: Event; option: any }>();
  readonly onFilter = output<{ originalEvent: Event; filter: string }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  /** @deprecated Compatibility output only; select-all controls are not implemented. */
  readonly onSelectAllChange = output<{
    originalEvent: Event;
    checked: boolean;
  }>();
  /** @deprecated Compatibility output only; lazy loading is not implemented. */
  readonly onLazyLoad = output<{ first: number; last: number }>();
  /** @deprecated Compatibility output only; drag-and-drop is not implemented. */
  readonly onDrop = output<unknown>();
  readonly activeIndex = signal(-1);
  protected readonly cvaDisabled = signal(false);
  private onModelChange: (value: T | T[] | null) => void = () => {};
  protected onModelTouched: () => void = () => {};
  readonly filteredOptions = computed(() => {
    const term = this.filterValue().trim();
    if (!term) return this.options();
    const fields =
      this.filterFields() ??
      (this.filterBy()
        ? this.filterBy()!
            .split(',')
            .map((field) => field.trim())
            .filter(Boolean)
        : undefined);
    const locale = this.filterLocale() || undefined;
    const query = term.toLocaleLowerCase(locale);
    return this.options().filter((option) => {
      const values = fields?.length
        ? fields.map((field) => (option as any)?.[field])
        : [this.getOptionLabel(option)];
      const normalizedValues = values.map((value) =>
        String(value ?? '').toLocaleLowerCase(locale),
      );
      switch (this.filterMatchMode()) {
        case 'notEquals':
          // A row matches only when none of its searchable fields equals the
          // query. Using `some` here makes a multi-field notEquals filter true
          // as soon as any other field differs, even if one field is equal.
          return normalizedValues.every((value) => value !== query);
        case 'in':
          // `in` is useful for options whose filter field is itself a list of
          // searchable values (for example, tags or aliases).
          return values.some(
            (value) =>
              Array.isArray(value) &&
              value.some(
                (item) =>
                  String(item ?? '').toLocaleLowerCase(locale) === query,
              ),
          );
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte': {
          const numericQuery = Number(query);
          if (!Number.isFinite(numericQuery)) return false;
          return values.some((value) => {
            const numericValue = Number(value);
            if (value == null || value === '' || !Number.isFinite(numericValue))
              return false;
            switch (this.filterMatchMode()) {
              case 'lt':
                return numericValue < numericQuery;
              case 'lte':
                return numericValue <= numericQuery;
              case 'gt':
                return numericValue > numericQuery;
              default:
                return numericValue >= numericQuery;
            }
          });
        }
        default:
          return normalizedValues.some((value) => {
            switch (this.filterMatchMode()) {
              case 'startsWith':
                return value.startsWith(query);
              case 'endsWith':
                return value.endsWith(query);
              case 'equals':
                return value === query;
              default:
                return value.includes(query);
            }
          });
      }
    });
  });
  readonly activeOptionIndex = computed(() => {
    const index = this.activeIndex();
    const option = this.filteredOptions()[index];
    return option && !this.isOptionDisabled(option) ? index : -1;
  });
  readonly activeOptionId = computed(() => {
    const index = this.activeOptionIndex();
    return index >= 0 ? this.optionId(index) : null;
  });

  writeValue(value: T | T[] | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  getOptionValue(option: any): any {
    const key = this.optionValue();
    return key ? option?.[key] : (option?.value ?? option);
  }
  optionId(index: number): string {
    return `${this.effectiveId()}-option-${index}`;
  }
  getOptionLabel(option: any): string {
    const key = this.optionLabel();
    return String(
      key ? (option?.[key] ?? '') : (option?.label ?? option ?? ''),
    );
  }
  isOptionDisabled(option: any): boolean {
    const key = this.optionDisabled();
    return typeof key === 'function'
      ? key(option)
      : Boolean(key ? option?.[key] : option?.disabled);
  }

  isSelected(option: any): boolean {
    const current = this.value();
    const candidate = this.getOptionValue(option);
    return this.multiple()
      ? Array.isArray(current) &&
          current.some((item) => this.sameValue(item, candidate))
      : this.sameValue(current, candidate);
  }

  private sameValue(left: any, right: any): boolean {
    const key = this.dataKey();
    return key &&
      left !== null &&
      right !== null &&
      typeof left === 'object' &&
      typeof right === 'object'
      ? left?.[key] === right?.[key]
      : left === right;
  }

  select(option: any, event?: Event): void {
    if (
      this.disabled() ||
      this.cvaDisabled() ||
      this.readonly() ||
      this.isOptionDisabled(option)
    )
      return;
    const candidate = this.getOptionValue(option);
    let next: T | T[] | null;
    if (this.multiple()) {
      const value = this.value();
      const current = Array.isArray(value) ? [...value] : [];
      const index = current.findIndex((item) =>
        this.sameValue(item, candidate),
      );
      index >= 0 ? current.splice(index, 1) : current.push(candidate);
      next = current as T[];
    } else next = candidate;
    const originalEvent = event ?? new Event('change');
    this.value.set(next);
    this.onModelChange(next);
    this.onModelTouched();
    this.optionSelected.emit(option);
    this.onChange.emit({ originalEvent, value: next });
    this.onClick.emit({ originalEvent, option });
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();
    const enabledIndexes = options
      .map((option, index) => (this.isOptionDisabled(option) ? -1 : index))
      .filter((index) => index >= 0);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      if (enabledIndexes.length) {
        const currentPosition = enabledIndexes.indexOf(this.activeIndex());
        const position =
          currentPosition < 0
            ? delta > 0
              ? -1
              : enabledIndexes.length
            : currentPosition;
        this.activeIndex.set(
          enabledIndexes[
            (position + delta + enabledIndexes.length) % enabledIndexes.length
          ],
        );
      }
    } else if (
      event.key === 'Enter' &&
      options[this.activeOptionIndex()] &&
      !this.isOptionDisabled(options[this.activeOptionIndex()])
    ) {
      event.preventDefault();
      this.select(options[this.activeOptionIndex()], event);
    }
  }
  onFilterInput(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue.set(filter);
    const firstEnabled = this.filteredOptions().findIndex(
      (option) => !this.isOptionDisabled(option),
    );
    this.activeIndex.set(firstEnabled);
    this.onFilter.emit({ originalEvent: event, filter });
  }
}
