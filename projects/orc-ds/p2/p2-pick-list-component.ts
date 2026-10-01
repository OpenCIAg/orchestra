import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-pick-list',
  standalone: true,
  template: `
    <section
      class="p-picklist p-component orc-pick-list"
      [class]="'p-picklist p-component orc-pick-list ' + styleClass()"
      [class.orc-pick-list--responsive]="responsive()"
      [class.orc-pick-list--compact]="responsive() && compactViewport()"
      [class.orc-pick-list--striped]="stripedRows()"
      [style]="style()"
      [attr.aria-label]="label()?.trim() || 'Pick list'"
      [attr.aria-disabled]="disabled() || null"
      [attr.data-pc-name]="'picklist'"
    >
      <div class="list-pane" [style]="sourceStyle()">
        @if (sourceHeader()?.trim(); as sourceTitle) {
          <header>{{ sourceTitle }}</header>
        }
        @if (filterBy()) {
          <input
            [value]="sourceFilter()"
            [disabled]="disabled()"
            [attr.placeholder]="sourceFilterPlaceholder()?.trim() || null"
            [attr.aria-label]="
              ariaSourceFilterLabel()?.trim() || 'Filter source list'
            "
            (input)="sourceFilter.set($any($event.target).value)"
          />
        }
        <ul
          role="listbox"
          aria-multiselectable="true"
          [attr.aria-label]="sourceHeader()?.trim() || 'Source list'"
          (dragover)="allowDrop($event)"
          (drop)="dropInPane($event, true)"
        >
          @for (item of filteredSource(); track item.value) {
            <li
              role="option"
              [attr.data-orc-option-value]="item.value"
              [attr.tabindex]="
                disabled() || item.disabled
                  ? -1
                  : sourceFocusValue() === item.value
                    ? 0
                    : -1
              "
              [attr.aria-disabled]="disabled() || item.disabled ? 'true' : null"
              [attr.aria-selected]="sourceSelected().has(item.value)"
              [attr.draggable]="
                dragdrop() && !disabled() && !item.disabled ? 'true' : null
              "
              [class.selected]="sourceSelected().has(item.value)"
              (click)="toggleSource(item, $event)"
              (focus)="onOptionFocus($event, item, true)"
              (blur)="onOptionBlur($event)"
              (keydown)="onSourceKeydown($event, item)"
              (dragstart)="startDrag(item, true, $event)"
              (dragover)="allowDrop($event)"
              (drop)="dropBefore($event, item, true)"
              (dragend)="clearDrag()"
            >
              {{ item.label }}
            </li>
          } @empty {
            @if (emptyText()?.trim(); as message) {
              <li class="empty">{{ message }}</li>
            }
          }
        </ul>
      </div>
      <div class="actions" role="group" aria-label="Transfer actions">
        <button
          type="button"
          (click)="transferSelected()"
          [disabled]="disabled() || !canTransferSelectedToTarget()"
          [attr.aria-label]="
            moveToTargetLabel().trim() || 'Move selected to target'
          "
        >
          {{ compactViewport() ? '↓' : '→' }}
        </button>
        <button
          type="button"
          (click)="transferAllToTarget()"
          [disabled]="disabled() || !canTransferAllToTarget()"
          [attr.aria-label]="
            moveAllToTargetLabel().trim() || 'Move all to target'
          "
        >
          {{ compactViewport() ? '⇓' : '≫' }}
        </button>
        <button
          type="button"
          (click)="transferBack()"
          [disabled]="disabled() || !canTransferSelectedToSource()"
          [attr.aria-label]="
            moveToSourceLabel().trim() || 'Move selected to source'
          "
        >
          {{ compactViewport() ? '↑' : '←' }}
        </button>
        <button
          type="button"
          (click)="transferAllToSource()"
          [disabled]="disabled() || !canTransferAllToSource()"
          [attr.aria-label]="
            moveAllToSourceLabel().trim() || 'Move all to source'
          "
        >
          {{ compactViewport() ? '⇑' : '≪' }}
        </button>
      </div>
      <div class="list-pane" [style]="targetStyle()">
        @if (targetHeader()?.trim(); as targetTitle) {
          <header>{{ targetTitle }}</header>
        }
        @if (filterBy()) {
          <input
            [value]="targetFilter()"
            [disabled]="disabled()"
            [attr.placeholder]="targetFilterPlaceholder()?.trim() || null"
            [attr.aria-label]="
              ariaTargetFilterLabel()?.trim() || 'Filter target list'
            "
            (input)="targetFilter.set($any($event.target).value)"
          />
        }
        <ul
          role="listbox"
          aria-multiselectable="true"
          [attr.aria-label]="targetHeader()?.trim() || 'Target list'"
          (dragover)="allowDrop($event)"
          (drop)="dropInPane($event, false)"
        >
          @for (item of filteredTarget(); track item.value) {
            <li
              role="option"
              [attr.data-orc-option-value]="item.value"
              [attr.tabindex]="
                disabled() || item.disabled
                  ? -1
                  : targetFocusValue() === item.value
                    ? 0
                    : -1
              "
              [attr.aria-disabled]="disabled() || item.disabled ? 'true' : null"
              [attr.aria-selected]="targetSelected().has(item.value)"
              [attr.draggable]="
                dragdrop() && !disabled() && !item.disabled ? 'true' : null
              "
              [class.selected]="targetSelected().has(item.value)"
              (click)="toggleTarget(item, $event)"
              (focus)="onOptionFocus($event, item, false)"
              (blur)="onOptionBlur($event)"
              (keydown)="onTargetKeydown($event, item)"
              (dragstart)="startDrag(item, false, $event)"
              (dragover)="allowDrop($event)"
              (drop)="dropBefore($event, item, false)"
              (dragend)="clearDrag()"
            >
              {{ item.label }}
            </li>
          } @empty {
            @if (emptyText()?.trim(); as message) {
              <li class="empty">{{ message }}</li>
            }
          }
        </ul>
      </div>
    </section>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-pick-list{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:.7rem;align-items:center}.list-pane{min-width:0;border:1px solid var(--orc-component-border);border-radius:.5rem;overflow:hidden;background:var(--orc-component-surface)}.list-pane header{padding:.6rem .75rem;background:var(--orc-component-surface-subtle);font-weight:700}.list-pane ul{min-height:10rem;max-height:16rem;overflow:auto;margin:0;padding:.35rem;list-style:none}.list-pane li{padding:.5rem .6rem;border-radius:.35rem;cursor:pointer}.list-pane li:focus,.list-pane li:focus-visible{outline:2px solid var(--orc-component-interactive);outline-offset:2px}.list-pane li.selected{background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive-hover)}.orc-pick-list--striped .list-pane li:nth-of-type(even){background:var(--orc-component-surface-subtle)}.orc-pick-list--striped .list-pane li.selected{background:var(--orc-component-interactive-soft)}.actions{display:grid;gap:.4rem}.actions button{border:1px solid var(--orc-component-border-strong);border-radius:.35rem;background:var(--orc-component-surface);padding:.45rem}.empty{color:var(--orc-component-text-muted)}.orc-pick-list--compact{grid-template-columns:minmax(0,1fr)}.orc-pick-list--compact .actions{grid-template-columns:repeat(4,minmax(0,1fr))}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickListComponent<
  T extends P2Option = P2Option,
> implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  readonly compactViewport = signal(false);
  readonly source = model<T[]>([]);
  readonly target = model<T[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly sourceHeader = input<string | undefined>(undefined);
  readonly targetHeader = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly responsive = input(false, { transform: booleanAttribute });
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterMatchMode = input<string>('contains');
  readonly sourceFilter = model('');
  readonly targetFilter = model('');
  readonly sourceFilterPlaceholder = input<string | undefined>(undefined);
  readonly targetFilterPlaceholder = input<string | undefined>(undefined);
  readonly ariaSourceFilterLabel = input<string | undefined>(undefined);
  readonly ariaTargetFilterLabel = input<string | undefined>(undefined);
  readonly moveToTargetLabel = input('Move selected to target');
  readonly moveToSourceLabel = input('Move selected to source');
  readonly moveAllToTargetLabel = input('Move all to target');
  readonly moveAllToSourceLabel = input('Move all to source');
  readonly sourceStyle = input<Record<string, any> | null | undefined>(
    undefined,
  );
  readonly targetStyle = input<Record<string, any> | null | undefined>(
    undefined,
  );
  readonly dragdrop = input(false, { transform: booleanAttribute });
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly breakpoint = input('960px');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly sourceSelected = model<ReadonlySet<T['value']>>(new Set());
  readonly targetSelected = model<ReadonlySet<T['value']>>(new Set());
  private responsiveMediaQuery: MediaQueryList | null = null;
  private readonly onResponsiveChange = (event: MediaQueryListEvent): void => {
    this.compactViewport.set(event.matches);
  };
  private draggedItem: {
    item: T;
    source: boolean;
    element: HTMLElement;
  } | null = null;
  readonly transfer = output<{ source: T[]; target: T[] }>();
  readonly selectionChange = output<{
    source: ReadonlySet<T['value']>;
    target: ReadonlySet<T['value']>;
  }>();
  readonly onMoveToTarget = output<{ items: T[]; source: T[]; target: T[] }>();
  readonly onMoveToSource = output<{ items: T[]; source: T[]; target: T[] }>();
  readonly onMoveAllToTarget = output<{
    items: T[];
    source: T[];
    target: T[];
  }>();
  readonly onMoveAllToSource = output<{
    items: T[];
    source: T[];
    target: T[];
  }>();
  readonly onSourceReorder = output<{ value: T[] }>();
  readonly onTargetReorder = output<{ value: T[] }>();
  readonly filteredSource = computed(() =>
    this.filterItems(this.source(), this.sourceFilter()),
  );
  readonly filteredTarget = computed(() =>
    this.filterItems(this.target(), this.targetFilter()),
  );
  private readonly sourceFocus = signal<T['value'] | null>(null);
  private readonly targetFocus = signal<T['value'] | null>(null);
  private readonly sourceFocusItem = computed(() =>
    this.recoverFocus(this.filteredSource(), this.sourceFocus()),
  );
  private readonly targetFocusItem = computed(() =>
    this.recoverFocus(this.filteredTarget(), this.targetFocus()),
  );
  private focusRequest = 0;
  private focusedPane: 'source' | 'target' | null = null;
  private ownedFocusElement: HTMLElement | null = null;
  private pendingTransferFocus = false;
  private transferFocusRequest = 0;
  private destroyed = false;

  constructor() {
    effect(() => {
      this.syncResponsiveQuery(this.responsive(), this.breakpoint());
    });
    effect(() => {
      const source = this.source();
      const target = this.target();
      this.pruneSelection(source, target);
      this.filteredSource();
      this.filteredTarget();
      this.disabled();
      this.scheduleFocusRecovery();
    });
  }

  sourceFocusValue(): T['value'] | null {
    return this.sourceFocusItem();
  }

  targetFocusValue(): T['value'] | null {
    return this.targetFocusItem();
  }

  private filterItems(items: T[], query: string): T[] {
    const term = this.normalizeForFilter(query);
    if (!term) return items;
    const fields = (this.filterBy() ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);
    return items.filter((item) => {
      const values = fields.length
        ? fields.map((field) => (item as any)?.[field])
        : [item.label ?? ''];
      const normalized = values.map((value) =>
        this.normalizeForFilter(String(value ?? '')),
      );
      switch (this.filterMatchMode()) {
        case 'startsWith':
          return normalized.some((value) => value.startsWith(term));
        case 'endsWith':
          return normalized.some((value) => value.endsWith(term));
        case 'equals':
          return normalized.some((value) => value === term);
        case 'notEquals':
          return normalized.every((value) => value !== term);
        case 'in':
          return values.some(
            (value) =>
              Array.isArray(value) &&
              value.some(
                (entry) => this.normalizeForFilter(String(entry)) === term,
              ),
          );
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte': {
          const queryValue = Number(term);
          if (!Number.isFinite(queryValue)) return false;
          return values.some((value) => {
            if (value == null || value === '') return false;
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) return false;
            switch (this.filterMatchMode()) {
              case 'lt':
                return numericValue < queryValue;
              case 'lte':
                return numericValue <= queryValue;
              case 'gt':
                return numericValue > queryValue;
              default:
                return numericValue >= queryValue;
            }
          });
        }
        default:
          return normalized.some((value) => value.includes(term));
      }
    });
  }

  private normalizeForFilter(value: string): string {
    const locale = this.filterLocale()?.trim() || undefined;
    try {
      return value.trim().toLocaleLowerCase(locale);
    } catch {
      return value.trim().toLocaleLowerCase();
    }
  }

  private syncResponsiveQuery(enabled: boolean, breakpoint: string): void {
    this.responsiveMediaQuery?.removeEventListener(
      'change',
      this.onResponsiveChange,
    );
    this.responsiveMediaQuery = null;
    if (!enabled || typeof window === 'undefined') {
      this.compactViewport.set(false);
      return;
    }
    const value = breakpoint.trim();
    if (!value) {
      this.compactViewport.set(false);
      return;
    }
    try {
      this.responsiveMediaQuery = window.matchMedia(`(max-width: ${value})`);
      this.compactViewport.set(this.responsiveMediaQuery.matches);
      this.responsiveMediaQuery.addEventListener(
        'change',
        this.onResponsiveChange,
      );
    } catch {
      this.compactViewport.set(false);
    }
  }

  private recoverFocus(
    items: T[],
    current: T['value'] | null,
  ): T['value'] | null {
    return (
      items.find((item) => !item.disabled && item.value === current)?.value ??
      items.find((item) => !item.disabled)?.value ??
      null
    );
  }

  private pruneSelection(source: T[], target: T[]): void {
    const sourceValues = new Set(
      source.filter((item) => !item.disabled).map((item) => item.value),
    );
    const targetValues = new Set(
      target.filter((item) => !item.disabled).map((item) => item.value),
    );
    const sourceSelection = this.pruneValues(
      this.sourceSelected(),
      sourceValues,
    );
    const targetSelection = this.pruneValues(
      this.targetSelected(),
      targetValues,
    );
    if (!this.sameValues(sourceSelection, this.sourceSelected()))
      this.sourceSelected.set(sourceSelection);
    if (!this.sameValues(targetSelection, this.targetSelected()))
      this.targetSelected.set(targetSelection);
  }

  private sameValues(
    left: ReadonlySet<T['value']>,
    right: ReadonlySet<T['value']>,
  ): boolean {
    return (
      left.size === right.size && [...left].every((value) => right.has(value))
    );
  }

  private pruneValues(
    values: ReadonlySet<T['value']>,
    valid: Set<T['value']>,
  ): Set<T['value']> {
    return new Set([...values].filter((value) => valid.has(value)));
  }

  private currentItem(items: T[], value: T['value']): T | undefined {
    return items.find((item) => item.value === value);
  }

  toggleSource(item: T, event?: MouseEvent | KeyboardEvent): void {
    if (this.disabled()) return;
    const current = this.currentItem(this.source(), item.value);
    if (!current || current.disabled) return;
    this.sourceFocus.set(current.value);
    const selected = this.sourceSelected();
    const next = this.selectionAfterActivation(selected, current.value, event);
    if (this.sameValues(selected, next)) return;
    this.sourceSelected.set(next);
    this.emitSelectionChange();
  }

  toggleTarget(item: T, event?: MouseEvent | KeyboardEvent): void {
    if (this.disabled()) return;
    const current = this.currentItem(this.target(), item.value);
    if (!current || current.disabled) return;
    this.targetFocus.set(current.value);
    const selected = this.targetSelected();
    const next = this.selectionAfterActivation(selected, current.value, event);
    if (this.sameValues(selected, next)) return;
    this.targetSelected.set(next);
    this.emitSelectionChange();
  }

  private toggleValue(
    values: ReadonlySet<T['value']>,
    value: T['value'],
  ): Set<T['value']> {
    const next = new Set(values);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  }

  private selectionAfterActivation(
    selected: ReadonlySet<T['value']>,
    value: T['value'],
    event?: MouseEvent | KeyboardEvent,
  ): Set<T['value']> {
    if (this.metaKeySelection() && !event?.ctrlKey && !event?.metaKey)
      return new Set([value]);
    return this.toggleValue(selected, value);
  }

  startDrag(item: T, source: boolean, event: DragEvent): void {
    const current = this.currentItem(
      source ? this.source() : this.target(),
      item.value,
    );
    if (!this.dragdrop() || this.disabled() || !current || current.disabled) {
      event.preventDefault();
      return;
    }
    this.draggedItem = {
      item: current,
      source,
      element: event.currentTarget as HTMLElement,
    };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(current.value));
    }
  }

  allowDrop(event: DragEvent): void {
    if (!this.dragdrop() || this.disabled() || !this.draggedItem) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  dropInPane(event: DragEvent, source: boolean): void {
    if (!this.draggedItem || !this.dragdrop() || this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    const items = source ? this.source() : this.target();
    this.moveDraggedItem(source, items.length);
  }

  dropBefore(event: DragEvent, item: T, source: boolean): void {
    if (!this.draggedItem || !this.dragdrop() || this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    const items = source ? this.source() : this.target();
    const index = items.findIndex(
      (candidate) => candidate.value === item.value,
    );
    if (index >= 0) this.moveDraggedItem(source, index);
  }

  clearDrag(): void {
    this.draggedItem = null;
  }

  private moveDraggedItem(
    destinationSource: boolean,
    destinationIndex: number,
  ): void {
    const drag = this.draggedItem;
    if (!drag || this.disabled()) return;
    const origin = drag.source ? this.source() : this.target();
    const originIndex = origin.findIndex(
      (item) => item.value === drag.item.value,
    );
    if (originIndex < 0 || origin[originIndex].disabled) {
      this.clearDrag();
      return;
    }

    if (drag.source === destinationSource) {
      const reordered = [...origin];
      const [moved] = reordered.splice(originIndex, 1);
      const insertion =
        originIndex < destinationIndex
          ? destinationIndex - 1
          : destinationIndex;
      reordered.splice(
        Math.max(0, Math.min(insertion, reordered.length)),
        0,
        moved,
      );
      if (
        reordered.every((item, index) => item.value === origin[index]?.value)
      ) {
        this.clearDrag();
        return;
      }
      if (destinationSource) {
        this.source.set(reordered);
        this.onSourceReorder.emit({ value: reordered });
        this.sourceFocus.set(moved.value);
      } else {
        this.target.set(reordered);
        this.onTargetReorder.emit({ value: reordered });
        this.targetFocus.set(moved.value);
      }
      this.clearDrag();
      return;
    }

    const destination = destinationSource ? this.source() : this.target();
    const nextOrigin = origin.filter((item) => item.value !== drag.item.value);
    const nextDestination = [...destination];
    nextDestination.splice(
      Math.max(0, Math.min(destinationIndex, nextDestination.length)),
      0,
      drag.item,
    );
    if (drag.source) {
      this.source.set(nextOrigin);
      this.target.set(nextDestination);
      this.sourceSelected.set(
        this.pruneValues(
          this.sourceSelected(),
          new Set(nextOrigin.map((item) => item.value)),
        ),
      );
      this.restoreFocusToTransferredItem(
        'target',
        drag.item.value,
        drag.element,
      );
      this.onMoveToTarget.emit({
        items: [drag.item],
        source: this.source(),
        target: this.target(),
      });
    } else {
      this.target.set(nextOrigin);
      this.source.set(nextDestination);
      this.targetSelected.set(
        this.pruneValues(
          this.targetSelected(),
          new Set(nextOrigin.map((item) => item.value)),
        ),
      );
      this.restoreFocusToTransferredItem(
        'source',
        drag.item.value,
        drag.element,
      );
      this.onMoveToSource.emit({
        items: [drag.item],
        source: this.source(),
        target: this.target(),
      });
    }
    this.emitTransfer();
    this.emitSelectionChange();
    this.clearDrag();
  }

  onSourceKeydown(event: KeyboardEvent, item: T): void {
    this.onOptionKeydown(
      event,
      item,
      this.filteredSource(),
      this.sourceFocus,
      true,
    );
  }

  onTargetKeydown(event: KeyboardEvent, item: T): void {
    this.onOptionKeydown(
      event,
      item,
      this.filteredTarget(),
      this.targetFocus,
      false,
    );
  }

  private onOptionKeydown(
    event: KeyboardEvent,
    item: T,
    items: T[],
    focus: ReturnType<typeof signal<T['value'] | null>>,
    source: boolean,
  ): void {
    if (this.disabled()) return;
    const enabled = items.filter((candidate) => !candidate.disabled);
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      source ? this.toggleSource(item, event) : this.toggleTarget(item, event);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    if (!enabled.length) return;
    event.preventDefault();
    const currentIndex = Math.max(
      0,
      enabled.findIndex((candidate) => candidate.value === item.value),
    );
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (currentIndex +
              (event.key === 'ArrowDown' ? 1 : -1) +
              enabled.length) %
            enabled.length;
    const next = enabled[nextIndex];
    focus.set(next.value);
    this.focusOption(event, next.value);
  }

  onOptionFocus(event: FocusEvent, item: T, source: boolean): void {
    if (this.disabled()) return;
    const current = this.currentItem(
      source ? this.source() : this.target(),
      item.value,
    );
    if (!current || current.disabled) return;
    this.focusedPane = source ? 'source' : 'target';
    this.ownedFocusElement = event.target as HTMLElement;
    (source ? this.sourceFocus : this.targetFocus).set(current.value);
  }

  onOptionBlur(event: FocusEvent): void {
    const option = event.target as HTMLElement | null;
    const ownerDocument = this.host.nativeElement.ownerDocument;
    queueMicrotask(() => {
      if (this.destroyed || this.ownedFocusElement !== option) return;
      const active = ownerDocument.activeElement;
      const movedWithinList =
        !!active &&
        active.nodeType === 1 &&
        this.host.nativeElement.contains(active) &&
        (active as Element).getAttribute('role') === 'option';
      if (movedWithinList || !option?.isConnected) return;
      this.clearFocusOwnership();
    });
  }

  private focusOption(event: KeyboardEvent, value: T['value']): void {
    const list = (event.currentTarget as HTMLElement | null)?.closest('ul');
    const origin = event.currentTarget as HTMLElement | null;
    const request = ++this.focusRequest;
    const ownerDocument = origin?.ownerDocument;
    afterNextRender(
      () => {
        if (
          this.destroyed ||
          this.disabled() ||
          request !== this.focusRequest ||
          !origin ||
          !ownerDocument ||
          ownerDocument.activeElement !== origin ||
          !this.host.nativeElement.isConnected
        )
          return;
        const option = [
          ...(list?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
        ].find(
          (candidate) => candidate.dataset['orcOptionValue'] === String(value),
        );
        if (
          !option ||
          option.getAttribute('aria-disabled') === 'true' ||
          option.tabIndex < 0
        )
          return;
        option.focus();
      },
      { injector: this.injector },
    );
  }

  private scheduleFocusRecovery(): void {
    if (!this.focusedPane || this.destroyed || this.pendingTransferFocus)
      return;
    const ownerDocument = this.host.nativeElement.ownerDocument;
    const active = ownerDocument.activeElement;
    const owner = this.ownedFocusElement;
    const request = ++this.focusRequest;
    if (
      this.disabled() ||
      !ownerDocument ||
      !this.host.nativeElement.isConnected
    )
      return;
    if (active !== ownerDocument.body) {
      if (active !== owner) {
        if (!active || !this.host.nativeElement.contains(active))
          this.clearFocusOwnership();
        return;
      }
    } else if (!owner || owner.isConnected) {
      this.clearFocusOwnership();
      return;
    }
    if (!owner) return;
    const pane = this.focusedPane;
    queueMicrotask(() => {
      if (
        this.destroyed ||
        this.disabled() ||
        request !== this.focusRequest ||
        ownerDocument.activeElement !== ownerDocument.body ||
        owner.isConnected ||
        !this.host.nativeElement.isConnected
      )
        return;
      const selector =
        pane === 'source' ? '.list-pane:first-child' : '.list-pane:last-child';
      const root = this.host.nativeElement.querySelector(selector);
      const value =
        pane === 'source' ? this.sourceFocusItem() : this.targetFocusItem();
      if (value == null) return;
      const option = [
        ...(root?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
      ].find(
        (candidate) => candidate.dataset['orcOptionValue'] === String(value),
      );
      if (
        !option ||
        option.getAttribute('aria-disabled') === 'true' ||
        option.tabIndex < 0
      )
        return;
      option.focus();
    });
  }

  private clearFocusOwnership(): void {
    this.focusRequest++;
    this.focusedPane = null;
    this.ownedFocusElement = null;
  }

  private focusedTransferAction(): HTMLElement | null {
    const active = this.host.nativeElement.ownerDocument.activeElement;
    return active &&
      this.host.nativeElement.querySelector('.actions')?.contains(active)
      ? (active as HTMLElement)
      : null;
  }

  private restoreFocusToTransferredItem(
    pane: 'source' | 'target',
    value: T['value'],
    action: HTMLElement,
  ): void {
    (pane === 'source' ? this.sourceFocus : this.targetFocus).set(value);
    this.pendingTransferFocus = true;
    const request = ++this.transferFocusRequest;
    const ownerDocument = this.host.nativeElement.ownerDocument;
    const paneSelector =
      pane === 'source' ? '.list-pane:first-child' : '.list-pane:last-child';

    afterNextRender(
      () => {
        if (request !== this.transferFocusRequest) return;
        this.pendingTransferFocus = false;
        const active = ownerDocument.activeElement;
        if (
          this.destroyed ||
          this.disabled() ||
          (active !== ownerDocument.body &&
            !(active === action && action.hasAttribute('disabled'))) ||
          !this.host.nativeElement.isConnected
        )
          return;

        const option = [
          ...(this.host.nativeElement
            .querySelector(paneSelector)
            ?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
        ].find(
          (candidate) => candidate.dataset['orcOptionValue'] === String(value),
        );
        if (
          !option ||
          option.getAttribute('aria-disabled') === 'true' ||
          option.tabIndex < 0
        )
          return;
        option.focus();
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.responsiveMediaQuery?.removeEventListener(
      'change',
      this.onResponsiveChange,
    );
    this.responsiveMediaQuery = null;
    this.draggedItem = null;
    this.focusRequest++;
    this.transferFocusRequest++;
    this.pendingTransferFocus = false;
    this.focusedPane = null;
    this.ownedFocusElement = null;
  }

  canTransferSelectedToTarget(): boolean {
    const selected = this.sourceSelected();
    return this.source().some(
      (item) => selected.has(item.value) && !item.disabled,
    );
  }

  canTransferSelectedToSource(): boolean {
    const selected = this.targetSelected();
    return this.target().some(
      (item) => selected.has(item.value) && !item.disabled,
    );
  }

  canTransferAllToTarget(): boolean {
    return this.source().some((item) => !item.disabled);
  }
  canTransferAllToSource(): boolean {
    return this.target().some((item) => !item.disabled);
  }

  transferSelected(): void {
    if (this.disabled()) return;
    const selected = this.sourceSelected();
    const moved = this.source().filter(
      (item) => selected.has(item.value) && !item.disabled,
    );
    if (!moved.length) return;
    const focusedAction = this.focusedTransferAction();
    this.source.set(
      this.source().filter(
        (item) => !selected.has(item.value) || item.disabled,
      ),
    );
    this.target.update((items) => [...items, ...moved]);
    this.sourceSelected.set(new Set());
    if (focusedAction)
      this.restoreFocusToTransferredItem(
        'target',
        moved[0].value,
        focusedAction,
      );
    this.emitTransfer();
    this.emitSelectionChange();
    this.onMoveToTarget.emit({
      items: moved,
      source: this.source(),
      target: this.target(),
    });
  }

  transferBack(): void {
    if (this.disabled()) return;
    const selected = this.targetSelected();
    const moved = this.target().filter(
      (item) => selected.has(item.value) && !item.disabled,
    );
    if (!moved.length) return;
    const focusedAction = this.focusedTransferAction();
    this.target.set(
      this.target().filter(
        (item) => !selected.has(item.value) || item.disabled,
      ),
    );
    this.source.update((items) => [...items, ...moved]);
    this.targetSelected.set(new Set());
    if (focusedAction)
      this.restoreFocusToTransferredItem(
        'source',
        moved[0].value,
        focusedAction,
      );
    this.emitTransfer();
    this.emitSelectionChange();
    this.onMoveToSource.emit({
      items: moved,
      source: this.source(),
      target: this.target(),
    });
  }

  transferAllToTarget(): void {
    if (this.disabled()) return;
    const moved = this.source().filter((item) => !item.disabled);
    if (!moved.length) return;
    const focusedAction = this.focusedTransferAction();
    this.source.set(this.source().filter((item) => item.disabled));
    this.target.update((items) => [...items, ...moved]);
    this.sourceSelected.set(new Set());
    if (focusedAction)
      this.restoreFocusToTransferredItem(
        'target',
        moved[0].value,
        focusedAction,
      );
    this.emitTransfer();
    this.emitSelectionChange();
    this.onMoveAllToTarget.emit({
      items: moved,
      source: this.source(),
      target: this.target(),
    });
  }

  transferAllToSource(): void {
    if (this.disabled()) return;
    const moved = this.target().filter((item) => !item.disabled);
    if (!moved.length) return;
    const focusedAction = this.focusedTransferAction();
    this.target.set(this.target().filter((item) => item.disabled));
    this.source.update((items) => [...items, ...moved]);
    this.targetSelected.set(new Set());
    if (focusedAction)
      this.restoreFocusToTransferredItem(
        'source',
        moved[0].value,
        focusedAction,
      );
    this.emitTransfer();
    this.emitSelectionChange();
    this.onMoveAllToSource.emit({
      items: moved,
      source: this.source(),
      target: this.target(),
    });
  }

  private emitSelectionChange(): void {
    this.selectionChange.emit({
      source: this.sourceSelected(),
      target: this.targetSelected(),
    });
  }

  private emitTransfer(): void {
    this.transfer.emit({ source: this.source(), target: this.target() });
  }
}
