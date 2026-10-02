import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-order-list',
  standalone: true,
  template: `
    <section
      class="p-orderlist p-component orc-order-list"
      [class]="'p-orderlist p-component orc-order-list ' + styleClass()"
      [style]="style()"
      [attr.aria-label]="label() || null"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.aria-disabled]="effectiveDisabled()"
      [attr.tabindex]="effectiveDisabled() ? -1 : tabindex()"
      [attr.data-pc-name]="'orderlist'"
      (focusin)="onCompositeFocusIn($event)"
      (focusout)="onCompositeFocusOut($event)"
    >
      <header>
        {{ header() }}
        <span>
          @if (moveUpLabel()) {
            <button
              type="button"
              [disabled]="effectiveDisabled() || !canMove(-1)"
              (click)="move(-1)"
              [attr.aria-label]="moveUpLabel()"
            >
              ↑
            </button>
          }
          @if (moveDownLabel()) {
            <button
              type="button"
              [disabled]="effectiveDisabled() || !canMove(1)"
              (click)="move(1)"
              [attr.aria-label]="moveDownLabel()"
            >
              ↓
            </button>
          }
        </span>
      </header>
      @if (filterBy()) {
        <input
          [value]="filter()"
          [disabled]="effectiveDisabled()"
          [attr.placeholder]="filterPlaceholder() || null"
          [attr.aria-label]="ariaFilterLabel() || null"
          (input)="setFilter($any($event.target).value)"
        />
      }
      <ol
        role="listbox"
        [style]="listStyle()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.aria-label]="label() || header() || null"
        [attr.aria-multiselectable]="selectionMode() === 'multiple'"
      >
        @for (item of filteredValue(); track $index; let index = $index) {
          <li
            role="option"
            [attr.tabindex]="optionTabIndex(index)"
            [attr.aria-selected]="selectedItems().has(item)"
            [attr.aria-disabled]="
              effectiveDisabled() || itemDisabled(item) ? 'true' : null
            "
            [class.selected]="selectedItems().has(item)"
            (click)="selectFiltered(index)"
            (mousedown)="onOptionMouseDown($event, index)"
            (focus)="onOptionFocus(index)"
            (keydown)="onOptionKeydown($event, index)"
          >
            {{ itemLabel(item) }}
          </li>
        } @empty {
          @if (emptyText()) {
            <li class="empty">{{ emptyText() }}</li>
          }
        }
      </ol>
    </section>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-order-list{border:1px solid var(--orc-component-border);border-radius:.5rem;overflow:hidden;background:var(--orc-component-surface)}.orc-order-list header{display:flex;justify-content:space-between;padding:.65rem .8rem;background:var(--orc-component-surface-subtle);font-weight:700}.orc-order-list header button{margin-left:.2rem;border:1px solid var(--orc-component-border-strong);border-radius:.3rem;background:var(--orc-component-surface)}.orc-order-list ol{min-height:8rem;margin:0;padding:.35rem;list-style:none}.orc-order-list li{padding:.55rem .65rem;border-radius:.35rem;cursor:pointer}.orc-order-list li:focus,.orc-order-list li:focus-visible{outline:2px solid var(--orc-component-interactive);outline-offset:2px}.orc-order-list li.selected{background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive-hover)}.orc-order-list .empty{color:var(--orc-component-text-muted)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrderListComponent),
      multi: true,
    },
  ],
})
export class OrderListComponent<T = unknown>
  implements ControlValueAccessor, OnDestroy
{
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly focusedIndex = signal(0);
  private focusRequest = 0;
  private destroyed = false;
  readonly value = model<T[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly header = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly tabindex = input(0);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaFilterLabel = input<string | undefined>(undefined);
  readonly moveUpLabel = input<string | undefined>(undefined);
  readonly moveDownLabel = input<string | undefined>(undefined);
  readonly listStyle = input<Record<string, any> | null | undefined>(undefined);
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filter = model('');
  /** @deprecated Compatibility input; drag-and-drop reordering is not implemented by this component. */
  readonly dragdrop = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input; multiple selection uses direct toggles and ignores modifier keys. */
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly cvaDisabled = signal(false);
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  readonly selectionMode = input<'single' | 'multiple'>('single');
  readonly selectedIndex = model(-1);
  readonly selected = model<T | T[] | null>(null, { alias: 'selection' });
  readonly valueChangeEvent = output<T[]>();
  readonly reorder = output<{ value: T[]; direction: 'up' | 'down' }>();
  readonly onReorder = output<{ value: T[]; direction: 'up' | 'down' }>();
  readonly onFilterEvent = output<{ filter: string }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();

  private onModelChange: (value: T[]) => void = () => {};
  private onModelTouched: () => void = () => {};
  private touchedPending = false;

  readonly filteredEntries = computed(() => {
    const query = this.filter()
      .trim()
      .toLocaleLowerCase(this.filterLocale() || undefined);
    if (!query) return this.value().map((item, index) => ({ item, index }));
    const field = this.filterBy();
    return this.value()
      .map((item, index) => ({ item, index }))
      .filter(({ item }) =>
        String(field ? ((item as any)?.[field] ?? '') : this.itemLabel(item))
          .toLocaleLowerCase(this.filterLocale() || undefined)
          .includes(query),
      );
  });
  readonly filteredValue = computed(() =>
    this.filteredEntries().map(({ item }) => item),
  );
  readonly selectedItems = computed(() => {
    const selected = this.selected();
    return new Set(
      Array.isArray(selected) ? selected : selected == null ? [] : [selected],
    );
  });
  readonly normalizedFocusedIndex = computed(() => {
    const entries = this.filteredEntries();
    if (!entries.length) return -1;
    const desired = Math.max(
      0,
      Math.min(this.focusedIndex(), entries.length - 1),
    );
    if (!this.itemDisabled(entries[desired].item)) return desired;
    const nextEnabled = entries.findIndex(
      ({ item }, index) => index >= desired && !this.itemDisabled(item),
    );
    return nextEnabled >= 0
      ? nextEnabled
      : entries.findIndex(({ item }) => !this.itemDisabled(item));
  });

  itemLabel(item: T): string {
    return item && typeof item === 'object'
      ? String((item as Record<string, unknown>)['label'] ?? '')
      : String(item ?? '');
  }

  itemDisabled(item: T): boolean {
    return !!(
      item &&
      typeof item === 'object' &&
      (item as Record<string, unknown>)['disabled'] === true
    );
  }

  optionTabIndex(index: number): number {
    const item = this.filteredValue()[index];
    return this.effectiveDisabled() ||
      item === undefined ||
      this.itemDisabled(item)
      ? -1
      : this.normalizedFocusedIndex() === index
        ? 0
        : -1;
  }

  canMove(delta: number): boolean {
    const index = this.selectedIndex();
    return (
      !this.effectiveDisabled() &&
      index >= 0 &&
      index < this.value().length &&
      index + delta >= 0 &&
      index + delta < this.value().length
    );
  }

  selection(): T | T[] | null {
    return this.selected();
  }

  select(index: number): void {
    if (this.effectiveDisabled() || index < 0 || index >= this.value().length)
      return;
    const item = this.value()[index];
    if (item === undefined || this.itemDisabled(item)) return;
    this.selectedIndex.set(index);
    if (this.selectionMode() === 'multiple') {
      const current = Array.isArray(this.selected())
        ? [...(this.selected() as T[])]
        : this.selected() != null
          ? [this.selected() as T]
          : [];
      const position = current.indexOf(item);
      if (position >= 0) current.splice(position, 1);
      else current.push(item);
      this.selected.set(current);
    } else {
      this.selected.set(item);
    }
  }

  selectFiltered(index: number): void {
    const entry = this.filteredEntries()[index];
    if (!entry) return;
    this.focusedIndex.set(index);
    this.select(entry.index);
  }

  onOptionFocus(index: number): void {
    this.focusedIndex.set(index);
  }

  onOptionMouseDown(event: MouseEvent, index: number): void {
    const item = this.filteredValue()[index];
    if (
      this.effectiveDisabled() ||
      item === undefined ||
      this.itemDisabled(item)
    ) {
      event.preventDefault();
      return;
    }
    this.focusedIndex.set(index);
    (event.currentTarget as HTMLElement).focus();
  }

  setFilter(value: string): void {
    this.filter.set(value);
    this.onFilterEvent.emit({ filter: value });
  }

  onOptionKeydown(event: KeyboardEvent, index: number): void {
    if (this.effectiveDisabled()) return;
    const entries = this.filteredEntries().filter(
      ({ item }) => !this.itemDisabled(item),
    );
    const current = entries.findIndex(
      (entry) => entry.index === this.filteredEntries()[index]?.index,
    );
    if (current < 0) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectFiltered(index);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? entries.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + entries.length) %
            entries.length;
    const targetIndex = this.filteredEntries().indexOf(entries[next]);
    this.focusedIndex.set(targetIndex);
    this.focusOption(event, targetIndex);
  }

  move(delta: number): void {
    if (this.effectiveDisabled() || !this.canMove(delta)) return;
    const next = [...this.value()];
    const index = this.selectedIndex();
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    this.value.set(next);
    this.selectedIndex.set(index + delta);
    this.onModelChange(next);
    this.deferTouchedUntilFocusLeaves();
    this.valueChangeEvent.emit(next);
    const event = {
      value: next,
      direction: delta < 0 ? ('up' as const) : ('down' as const),
    };
    this.reorder.emit(event);
    this.onReorder.emit(event);
  }

  writeValue(value: T[] | null): void {
    const next = Array.isArray(value) ? [...value] : [];
    this.value.set(next);
    if (this.selectedIndex() >= next.length) this.selectedIndex.set(-1);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  onCompositeFocusIn(event: FocusEvent): void {
    const related = event.relatedTarget as Node | null;
    if (!related || !this.host.nativeElement.contains(related)) {
      this.onFocus.emit(event);
    }
  }

  onCompositeFocusOut(event: FocusEvent): void {
    const related = event.relatedTarget as Node | null;
    if (!related || !this.host.nativeElement.contains(related)) {
      this.onBlur.emit(event);
      this.flushTouched();
    }
  }

  private deferTouchedUntilFocusLeaves(): void {
    this.touchedPending = true;
    queueMicrotask(() => {
      if (!this.touchedPending || this.destroyed) return;
      const active = this.host.nativeElement.ownerDocument.activeElement;
      if (!active || !this.host.nativeElement.contains(active)) {
        this.flushTouched();
      }
    });
  }

  private flushTouched(): void {
    if (!this.touchedPending) return;
    this.touchedPending = false;
    this.onModelTouched();
  }

  private focusOption(event: KeyboardEvent, index: number): void {
    const origin = event.currentTarget as HTMLElement | null;
    const request = ++this.focusRequest;
    afterNextRender(
      () => {
        if (
          this.destroyed ||
          request !== this.focusRequest ||
          this.effectiveDisabled() ||
          !origin?.isConnected ||
          origin.ownerDocument.activeElement !== origin
        )
          return;
        const option = origin
          .closest('ol')
          ?.querySelectorAll<HTMLElement>('[role="option"]')
          .item(index);
        if (!option || this.optionTabIndex(index) < 0) return;
        option.focus();
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.touchedPending = false;
    this.focusRequest++;
  }
}
