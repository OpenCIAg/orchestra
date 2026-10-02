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
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

let nextMultiSelectId = 0;

@Component({
  selector: 'orc-multi-select',
  standalone: true,
  template: `
    <div
      class="p-multiselect p-component orc-p2-multi-select"
      [class]="'p-multiselect p-component orc-p2-multi-select ' + styleClass()"
      [style]="style()"
      [class.fluid]="fluid()"
      [attr.data-pc-name]="'multiselect'"
    >
      @if (label()) {
        <label [for]="effectiveId()">{{ label() }}</label>
      }
      <button
        type="button"
        class="p-multiselect-label p-multiselect-trigger trigger"
        role="combobox"
        [disabled]="disabled() || cvaDisabled()"
        [attr.id]="effectiveId()"
        [attr.tabindex]="tabindex()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="effectiveId() + '-panel'"
        [attr.aria-activedescendant]="activeOptionId()"
        [attr.aria-readonly]="readonly()"
        (click)="toggleOpen()"
        (keydown)="onKeydown($event)"
        (focus)="onFocus.emit($event)"
        (blur)="onBlur.emit($event)"
      >
        <span>{{ selectedLabels() || placeholder() }}</span
        ><span aria-hidden="true">⌄</span>
      </button>
      @if (showClear() && value().length && !readonly()) {
        <button
          type="button"
          class="clear"
          [disabled]="disabled() || cvaDisabled()"
          (click)="clear($event)"
          [attr.aria-label]="clearAriaLabel() || 'Clear selection'"
        >
          ×
        </button>
      }
      @if (open()) {
        @if (
          showToggleAll() &&
          showHeader() &&
          !readonly() &&
          (allOptionsSelected() ? clearAllLabel() : selectAllLabel())
        ) {
          <button
            type="button"
            class="toggle-all"
            [disabled]="disabled() || cvaDisabled()"
            (click)="selectAll($event)"
          >
            {{ allOptionsSelected() ? clearAllLabel() : selectAllLabel() }}
          </button>
        }
        @if (filter()) {
          <input
            [value]="filterValue()"
            [disabled]="disabled() || cvaDisabled()"
            [attr.placeholder]="filterPlaceholder() || null"
            (input)="onFilterInput($event)"
            [attr.aria-label]="ariaFilterLabel() || null"
            [autofocus]="autofocusFilter()"
          />
        }
        <ul
          class="p-multiselect-panel p-component options"
          [class]="
            'p-multiselect-panel p-component options ' + panelStyleClass()
          "
          [style]="panelStyle()"
          [id]="effectiveId() + '-panel'"
          role="listbox"
          aria-multiselectable="true"
        >
          @if (loading()) {
            <li class="empty" aria-live="polite">
              {{ loadingMessage() || 'Loading…' }}
            </li>
          } @else {
            @for (
              option of filteredOptions();
              track getOptionValue(option);
              let index = $index
            ) {
              <li
                role="option"
                [id]="effectiveId() + '-option-' + index"
                [attr.aria-selected]="isSelected(option)"
                [attr.aria-disabled]="
                  isOptionDisabled(option) || disabled() || cvaDisabled()
                "
                [class.is-disabled]="
                  isOptionDisabled(option) || disabled() || cvaDisabled()
                "
                [class.is-active]="activeIndex() === index"
                (click)="select(option, $event)"
              >
                <span class="check">{{ isSelected(option) ? '✓' : '' }}</span
                >{{ getOptionLabel(option) }}
              </li>
            } @empty {
              @if (filterValue() ? emptyFilterMessage() : emptyMessage()) {
                <li class="empty">
                  {{ filterValue() ? emptyFilterMessage() : emptyMessage() }}
                </li>
              }
            }
          }
        </ul>
      }
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    .orc-p2-multi-select { position: relative; display: grid; gap: .35rem; color: var(--orc-component-text); } .orc-p2-multi-select.fluid { width: 100%; } label { font-size: .875rem; font-weight: 600; }
    .trigger { display: flex; justify-content: space-between; align-items: center; min-height: 2.5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; padding: .5rem .75rem; background: var(--orc-component-control); color: var(--orc-component-text); text-align: left; }
    .options { position: absolute; z-index: 2; top: 4.2rem; right: 0; left: 0; max-height: 15rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-surface-raised); color: var(--orc-component-text); box-shadow: var(--orc-component-overlay-shadow); list-style: none; }
    li { display: flex; gap: .5rem; align-items: center; padding: .55rem .65rem; border-radius: .35rem; cursor: pointer; } li:hover, li.is-active { background: var(--orc-component-interactive-soft); } li.is-disabled { color: var(--orc-component-text-muted); cursor: not-allowed; } .check { width: 1rem; color: var(--orc-component-interactive); } .empty { color: var(--orc-component-text-muted); cursor: default; }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T = unknown> implements ControlValueAccessor {
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
  protected cvaDisabled = signal(false);
  private onModelChange: (value: T[]) => void = () => {};
  private onModelTouched: () => void = () => {};
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly activeOptionId = computed(() =>
    this.activeIndex() >= 0
      ? `${this.effectiveId()}-option-${this.activeIndex()}`
      : null,
  );
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
    return this.options().filter((option) => {
      const values = fields?.length
        ? fields.map((field) => String((option as any)?.[field] ?? ''))
        : [this.getOptionLabel(option)];
      const locale = this.filterLocale() || undefined;
      const query = term.toLocaleLowerCase(locale);
      return values.some((value) => {
        const normalized = value.toLocaleLowerCase(locale);
        switch (this.filterMatchMode()) {
          case 'startsWith':
            return normalized.startsWith(query);
          case 'endsWith':
            return normalized.endsWith(query);
          case 'equals':
            return normalized === query;
          case 'notEquals':
            return normalized !== query;
          case 'in':
            return query
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
              .includes(normalized);
          case 'lt':
            return this.compareNumericFilter(
              value,
              term,
              (left, right) => left < right,
            );
          case 'lte':
            return this.compareNumericFilter(
              value,
              term,
              (left, right) => left <= right,
            );
          case 'gt':
            return this.compareNumericFilter(
              value,
              term,
              (left, right) => left > right,
            );
          case 'gte':
            return this.compareNumericFilter(
              value,
              term,
              (left, right) => left >= right,
            );
          default:
            return normalized.includes(query);
        }
      });
    });
  });

  writeValue(value: T[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
  }
  registerOnChange(fn: (value: T[]) => void): void {
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
  getOptionLabel(option: any): string {
    const key = this.optionLabel();
    return String(
      key ? (option?.[key] ?? '') : (option?.label ?? option ?? ''),
    );
  }
  private compareNumericFilter(
    value: string,
    term: string,
    compare: (value: number, query: number) => boolean,
  ): boolean {
    const numericValue = Number(value);
    const numericQuery = Number(term);
    return (
      Number.isFinite(numericValue) &&
      Number.isFinite(numericQuery) &&
      compare(numericValue, numericQuery)
    );
  }
  isOptionDisabled(option: any): boolean {
    const key = this.optionDisabled();
    return Boolean(key ? option?.[key] : option?.disabled);
  }

  private sameValue(left: any, right: any): boolean {
    const key = this.dataKey();
    if (key && left != null && right != null) {
      const leftKey = left?.[key];
      const rightKey = right?.[key];
      if (leftKey !== undefined && rightKey !== undefined)
        return leftKey === rightKey;
    }
    return left === right;
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
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    this.open.update((value) => !value);
    if (!this.open()) {
      if (this.resetFilterOnHide()) this.filterValue.set('');
      this.activeIndex.set(-1);
    }
    if (this.open()) this.onPanelShow.emit();
    else this.onPanelHide.emit();
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const options = this.filteredOptions();
    const enabledIndexes = options
      .map((option, index) => (this.isOptionDisabled(option) ? -1 : index))
      .filter((index) => index >= 0);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open()) {
        this.toggleOpen();
      }
      if (!enabledIndexes.length) return;
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const currentPosition = enabledIndexes.indexOf(this.activeIndex());
      const position =
        currentPosition < 0 ? (delta > 0 ? -1 : 0) : currentPosition;
      this.activeIndex.set(
        enabledIndexes[
          (position + delta + enabledIndexes.length) % enabledIndexes.length
        ],
      );
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
      this.disabled() ||
      this.cvaDisabled() ||
      this.readonly()
    )
      return;
    const current = [...this.value()];
    const candidate = this.getOptionValue(option);
    const index = current.findIndex((item) => this.sameValue(item, candidate));
    if (index >= 0) current.splice(index, 1);
    else if (
      this.selectionLimit() === undefined ||
      current.length < this.selectionLimit()!
    )
      current.push(candidate);
    else return;
    const originalEvent = event ?? new Event('change');
    this.value.set(current);
    this.onModelChange(current);
    this.onModelTouched();
    this.onChange.emit({ originalEvent, value: current });
    if (index >= 0) this.onRemove.emit({ value: candidate, originalEvent });
    else this.optionSelected.emit(option);
  }
  clear(event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const originalEvent = event ?? new Event('clear');
    this.value.set([]);
    this.onModelChange([]);
    this.onModelTouched();
    this.onChange.emit({ originalEvent, value: [] });
    this.onClear.emit(originalEvent);
  }
  selectAll(event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const selectable = this.toggleAllOptions();
    const checked = !selectable.every((option) => this.isSelected(option));
    const next = checked
      ? selectable.map((option) => this.getOptionValue(option))
      : [];
    const originalEvent = event ?? new Event('selectAll');
    this.value.set(next);
    this.onModelChange(next);
    this.onModelTouched();
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
