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
import {
  CvaControl,
  listPickerActiveIndex,
  listPickerEnabledIndexes,
  listPickerEquality,
  listPickerFilterFields,
  listPickerFirstEnabled,
  listPickerOptionDisabled,
  listPickerOptionLabel,
  listPickerOptionValue,
  listPickerReadField,
  listPickerRowMatchesFilter,
  ORC_SHARED_STYLES,
  stepListPickerActive,
  toggleListPickerValue,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-listbox',
  standalone: true,
  templateUrl: './listbox.component.html',
  styles: [ORC_SHARED_STYLES],
  styleUrl: './listbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxComponent<T = unknown> extends CvaControl {
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
  readonly filteredOptions = computed(() => {
    const term = this.filterValue().trim();
    if (!term) return this.options();
    const fields = listPickerFilterFields(this.filterFields(), this.filterBy());
    const locale = this.filterLocale() || undefined;
    return this.options().filter((option) => {
      const values = fields?.length
        ? fields.map((field) => listPickerReadField(option, field))
        : [this.getOptionLabel(option)];
      return listPickerRowMatchesFilter(
        values,
        term,
        this.filterMatchMode(),
        locale,
      );
    });
  });
  readonly activeOptionIndex = computed(() =>
    listPickerActiveIndex(
      this.activeIndex(),
      this.filteredOptions().length,
      (index) => this.isOptionDisabled(this.filteredOptions()[index]),
    ),
  );
  readonly activeOptionId = computed(() => {
    const index = this.activeOptionIndex();
    return index >= 0 ? this.optionId(index) : null;
  });

  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  writeValue(value: T | T[] | null): void {
    this.value.set(value ?? null);
  }
  getOptionValue(option: any): any {
    return listPickerOptionValue(option, this.optionValue());
  }
  optionId(index: number): string {
    return `${this.effectiveId()}-option-${index}`;
  }
  getOptionLabel(option: any): string {
    return listPickerOptionLabel(option, this.optionLabel());
  }
  isOptionDisabled(option: any): boolean {
    return listPickerOptionDisabled(option, this.optionDisabled());
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
    return listPickerEquality(this.dataKey(), 'objects')(left, right);
  }

  select(option: any, event?: Event): void {
    if (
      this.effectiveDisabled() ||
      this.readonly() ||
      this.isOptionDisabled(option)
    )
      return;
    const candidate = this.getOptionValue(option);
    let next: T | T[] | null;
    if (this.multiple()) {
      const value = this.value();
      const current: T[] = Array.isArray(value) ? [...value] : [];
      const toggle = toggleListPickerValue(current, candidate, (left, right) =>
        this.sameValue(left, right),
      );
      if (!toggle) return;
      next = toggle.next as T[];
    } else next = candidate;
    const originalEvent = event ?? new Event('change');
    this.value.set(next);
    this.cvaOnChange(next);
    this.cvaOnTouched();
    this.optionSelected.emit(option);
    this.onChange.emit({ originalEvent, value: next });
    this.onClick.emit({ originalEvent, option });
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();
    const enabledIndexes = listPickerEnabledIndexes(options.length, (index) =>
      this.isOptionDisabled(options[index]),
    );
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = stepListPickerActive(
        this.activeIndex(),
        delta,
        enabledIndexes,
      );
      if (next !== null) this.activeIndex.set(next);
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
    this.activeIndex.set(
      listPickerFirstEnabled(this.filteredOptions().length, (index) =>
        this.isOptionDisabled(this.filteredOptions()[index]),
      ),
    );
    this.onFilter.emit({ originalEvent: event, filter });
  }
}
