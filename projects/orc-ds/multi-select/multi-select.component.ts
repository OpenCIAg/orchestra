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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CvaControl,
  listPickerActiveId,
  listPickerEnabledIndexes,
  listPickerEquality,
  listPickerFieldValues,
  listPickerFilterFields,
  listPickerOptionDisabled,
  listPickerOptionLabel,
  listPickerOptionValue,
  listPickerValueMatchesFilter,
  P2_SHARED_STYLES,
  stepListPickerActive,
  toggleListPickerValue,
} from '@ciag/orchestra/internal';
import type { P2Option } from '@ciag/orchestra/internal';

let nextMultiSelectId = 0;

@Component({
  selector: 'orc-multi-select',
  standalone: true,
  templateUrl: './multi-select.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T = unknown> extends CvaControl {
  private readonly uniqueId = `orc-multiselect-${++nextMultiSelectId}`;
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T[]>([]);
  readonly label = input('');
  readonly placeholder = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; use `emptyMessage` for empty-state text. */
  readonly emptyText = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; the trigger is a button and has no name attribute. */
  readonly name = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; this implementation has no variant styling. */
  readonly variant = input<'filled' | 'outlined'>('outlined');
  readonly styleClass = input('');
  readonly style = input<Record<string, string> | undefined>(undefined);
  readonly panelStyle = input<Record<string, string> | undefined>(undefined);
  readonly panelStyleClass = input('');
  /** @deprecated Compatibility input only; the panel is rendered in place. */
  readonly appendTo = input<unknown>(undefined);
  /** @deprecated Compatibility input only; overlay options are not interpreted. */
  readonly overlayOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; grouped option data is not rendered. */
  readonly optionGroupLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; grouped option data is not rendered. */
  readonly optionGroupChildren = input('items');
  readonly dataKey = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; option groups are not rendered. */
  readonly group = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterFields = input<string[] | undefined>(undefined);
  readonly filterLocale = input<string | undefined>(undefined);
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
  >('contains');
  readonly ariaFilterLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly selectAllLabel = input<string | undefined>(undefined);
  readonly clearAllLabel = input<string | undefined>(undefined);
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly showToggleAll = input(true, { transform: booleanAttribute });
  readonly showHeader = input(true, { transform: booleanAttribute });
  readonly maxSelectedLabels = input<number | undefined>(undefined);
  readonly selectedItemsLabel = input<string | undefined>(undefined);
  readonly selectionLimit = input<number | undefined>(undefined);
  readonly emptyFilterMessage = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly resetFilterOnHide = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; loading renders text only. */
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; lazy loading is not implemented. */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  /** @deprecated Compatibility input only; the trigger is not autofocus-enabled. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly autofocusFilter = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; hover does not alter selection focus. */
  readonly focusOnHover = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; focus does not select an option. */
  readonly selectOnFocus = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; options are not focused on open. */
  readonly autoOptionFocus = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; the dropdown icon is fixed. */
  readonly dropdownIcon = input('');
  /** @deprecated Compatibility input only; comma display has no chip icon slot. */
  readonly chipIcon = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; selected values always render comma-separated. */
  readonly display = input<'comma' | 'chip'>('comma');
  /** @deprecated Compatibility input only; no native autocomplete input is rendered. */
  readonly autocomplete = input('off');
  /** @deprecated Compatibility input only; this implementation has no size styling. */
  readonly size = input<'small' | 'large' | undefined>(undefined);
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltip = input('');
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipPosition = input<'top' | 'left' | 'right' | 'bottom'>(
    'right',
  );
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipPositionStyle = input('absolute');
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipStyleClass = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; in-place panels do not use z-index management. */
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; in-place panels do not use z-index management. */
  readonly baseZIndex = input(0);
  readonly open = model(false);
  readonly activeIndex = signal(-1);
  readonly optionSelected = output<P2Option<T>>();
  readonly onChange = output<{ originalEvent: Event; value: T[] }>();
  readonly onFilter = output<{ originalEvent: Event; filter: string }>();
  readonly onSelectAllChange = output<{
    originalEvent: Event;
    checked: boolean;
  }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onClear = output<Event>();
  readonly onPanelShow = output<void>();
  readonly onPanelHide = output<void>();
  readonly onRemove = output<{ value: T; originalEvent: Event }>();
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly activeOptionId = computed(() =>
    listPickerActiveId(this.effectiveId(), this.activeIndex()),
  );
  readonly filteredOptions = computed(() => {
    const term = this.filterValue().trim();
    if (!term) return this.options();
    const fields = listPickerFilterFields(this.filterFields(), this.filterBy());
    const locale = this.filterLocale() || undefined;
    return this.options().filter((option) => {
      const values = fields?.length
        ? listPickerFieldValues(option, fields)
        : [listPickerOptionLabel(option, this.optionLabel())];
      return values.some((value) =>
        listPickerValueMatchesFilter(
          value,
          term,
          this.filterMatchMode(),
          locale,
        ),
      );
    });
  });

  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  writeValue(value: T[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
  }
  getOptionValue(option: any): any {
    return listPickerOptionValue(option, this.optionValue());
  }
  getOptionLabel(option: any): string {
    return listPickerOptionLabel(option, this.optionLabel());
  }
  isOptionDisabled(option: any): boolean {
    return listPickerOptionDisabled(option, this.optionDisabled());
  }

  private sameValue(left: any, right: any): boolean {
    return listPickerEquality(this.dataKey(), 'both-sides')(left, right);
  }
  isSelected(option: P2Option<T>): boolean {
    return this.value().some((item) =>
      this.sameValue(item, this.getOptionValue(option)),
    );
  }
  selectedLabels(): string {
    const labels = this.options()
      .filter((option) => this.isSelected(option))
      .map((option) => this.getOptionLabel(option));
    const max = this.maxSelectedLabels();
    const template = this.selectedItemsLabel();
    return max !== undefined && labels.length > max
      ? (template || '{0} items selected').replace('{0}', String(labels.length))
      : labels.join(', ');
  }
  toggleOpen(): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.open.update((value) => !value);
    if (!this.open()) {
      if (this.resetFilterOnHide()) this.filterValue.set('');
      this.activeIndex.set(-1);
    }
    if (this.open()) {
      this.onPanelShow.emit();
    } else {
      this.onPanelHide.emit();
    }
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    const options = this.filteredOptions();
    const enabledIndexes = listPickerEnabledIndexes(options.length, (index) =>
      this.isOptionDisabled(options[index]),
    );
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open()) {
        this.toggleOpen();
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = stepListPickerActive(
        this.activeIndex(),
        delta,
        enabledIndexes,
      );
      if (next === null) return;
      this.activeIndex.set(next);
    } else if (
      (event.key === 'Enter' || event.key === ' ') &&
      this.open() &&
      this.activeIndex() >= 0
    ) {
      event.preventDefault();
      const option = options[this.activeIndex()];
      if (option) this.select(option, event);
    } else if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.toggleOpen();
    }
  }
  select(option: P2Option<T>, event?: Event): void {
    if (
      this.isOptionDisabled(option) ||
      this.effectiveDisabled() ||
      this.readonly()
    )
      return;
    const candidate = this.getOptionValue(option);
    const toggle = toggleListPickerValue(
      this.value(),
      candidate,
      (left, right) => this.sameValue(left, right),
      this.selectionLimit(),
    );
    if (!toggle) return;
    const originalEvent = event ?? new Event('change');
    this.value.set(toggle.next);
    this.cvaOnChange(toggle.next);
    this.cvaOnTouched();
    this.onChange.emit({ originalEvent, value: toggle.next });
    if (!toggle.added) {
      this.onRemove.emit({ value: candidate, originalEvent });
    } else {
      this.optionSelected.emit(option);
    }
  }
  clear(event?: Event): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    const originalEvent = event ?? new Event('clear');
    this.value.set([]);
    this.cvaOnChange([]);
    this.cvaOnTouched();
    this.onChange.emit({ originalEvent, value: [] });
    this.onClear.emit(originalEvent);
  }
  selectAll(event?: Event): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    const selectable = this.toggleAllOptions();
    const checked = !selectable.every((option) => this.isSelected(option));
    const next = checked
      ? selectable.map((option) => this.getOptionValue(option))
      : [];
    const originalEvent = event ?? new Event('selectAll');
    this.value.set(next);
    this.cvaOnChange(next);
    this.cvaOnTouched();
    this.onChange.emit({ originalEvent, value: next });
    this.onSelectAllChange.emit({ originalEvent, checked });
  }
  allOptionsSelected(): boolean {
    const selectable = this.toggleAllOptions();
    return (
      selectable.length > 0 &&
      selectable.every((option) => this.isSelected(option))
    );
  }
  private toggleAllOptions(): P2Option<T>[] {
    const selectable = this.options().filter(
      (option) => !this.isOptionDisabled(option),
    );
    const limit = this.selectionLimit();
    return limit === undefined ? selectable : selectable.slice(0, limit);
  }
  onFilterInput(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue.set(filter);
    this.activeIndex.set(-1);
    this.onFilter.emit({ originalEvent: event, filter });
  }
}
