import {
  AfterViewInit,
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CvaControl, P2_SHARED_VARS } from '@ciag/orchestra/internal';
import { filterTreeNodes } from '@ciag/orchestra/internal';
import type { P2Option } from '@ciag/orchestra/internal';

let nextTreeSelectId = 0;

export interface TreeSelectNode extends P2Option<string> {
  data?: unknown;
  children?: TreeSelectNode[];
}

interface VisibleTreeSelectNode {
  node: TreeSelectNode;
  level: number;
}

@Component({
  selector: 'orc-tree-select',
  standalone: true,
  templateUrl: './tree-select.component.html',
  styles: [P2_SHARED_VARS],
  styleUrl: './tree-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeSelectComponent),
      multi: true,
    },
  ],
})
export class TreeSelectComponent
  extends CvaControl
  implements AfterViewInit, OnDestroy
{
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly uniqueId = `orc-treeselect-${++nextTreeSelectId}`;
  readonly styleClass = input('');
  readonly nodes = input<TreeSelectNode[]>([]);
  readonly value = model<string | string[] | null>(null);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<string | number | undefined>(undefined);
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly variant = input<'filled' | 'outlined'>('outlined');
  /** @deprecated Compatibility input only; selected values always render comma-separated. */
  readonly display = input<'comma' | 'chip'>('comma');
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly panelStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly panelStyleClass = input('');
  readonly panelClass = input('');
  /** @deprecated Compatibility input only; the panel is rendered in place. */
  readonly appendTo = input<unknown>(undefined);
  /** @deprecated Compatibility input only; overlay options are not interpreted. */
  readonly overlayOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  private ownerDocument: Document | null = null;
  private readonly documentClick = (event: MouseEvent): void =>
    this.onDocumentClick(event);

  ngAfterViewInit(): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    this.ownerDocument = ownerDocument;
    ownerDocument.addEventListener('click', this.documentClick);
  }

  ngOnDestroy(): void {
    this.ownerDocument?.removeEventListener('click', this.documentClick);
    this.ownerDocument = null;
  }
  readonly scrollHeight = input('16rem');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterBy = input('label');
  readonly filterMode = input('lenient');
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly expandAriaLabel = input<string | undefined>(undefined);
  readonly collapseAriaLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; the filter is not autofocus-enabled. */
  readonly filterInputAutoFocus = input(false, { transform: booleanAttribute });
  readonly filterValue = model('');
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly resetFilterOnHide = input(true, { transform: booleanAttribute });
  /** Applies to checkbox selection; multiple mode keeps each node independent. */
  readonly propagateSelectionDown = input(true, {
    transform: booleanAttribute,
  });
  /** Applies to checkbox selection; multiple mode keeps each node independent. */
  readonly propagateSelectionUp = input(true, { transform: booleanAttribute });
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
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly selectionMode = input<'single' | 'multiple' | 'checkbox'>('single');
  /** @deprecated Compatibility input only; selection does not inspect modifier keys. */
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly open = model(false);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<TreeSelectNode>();
  readonly onChange = output<{
    originalEvent: Event;
    value: string | string[] | null;
  }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClear = output<Event>();
  readonly onFilter = output<{ originalEvent: Event; filter: string }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onNodeExpand = output<TreeSelectNode>();
  readonly onNodeCollapse = output<TreeSelectNode>();
  readonly nodeUnselect = output<TreeSelectNode>();
  protected isSelfDisabled(): boolean {
    return this.disabled();
  }
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly effectiveLabel = computed(() => this.label()?.trim() || null);
  readonly effectiveAriaLabel = computed(
    () => this.ariaLabel()?.trim() || null,
  );
  readonly effectiveAriaLabelledBy = computed(
    () => this.ariaLabelledBy()?.trim() || null,
  );
  readonly effectiveFilterAriaLabel = computed(
    () => this.filterAriaLabel()?.trim() || 'Filter options',
  );
  readonly effectiveClearAriaLabel = computed(
    () => this.clearAriaLabel()?.trim() || 'Clear selection',
  );
  readonly effectiveExpandAriaLabel = computed(
    () => this.expandAriaLabel()?.trim() || 'Expand',
  );
  readonly effectiveCollapseAriaLabel = computed(
    () => this.collapseAriaLabel()?.trim() || 'Collapse',
  );
  readonly panelClasses = computed(() =>
    [
      ...new Set(
        [this.panelStyleClass(), this.panelClass()]
          .flatMap((value) => value.split(/\s+/))
          .filter(Boolean),
      ),
    ].join(' '),
  );
  readonly treeLabelledBy = computed(() => {
    const externalLabel = this.effectiveAriaLabelledBy();
    if (externalLabel) return externalLabel;
    const triggerName =
      this.effectiveAriaLabel() ||
      this.effectiveLabel() ||
      this.selectedLabel().trim() ||
      this.placeholder()?.trim();
    return triggerName ? this.effectiveId() : null;
  });
  readonly treeAriaLabel = computed(() =>
    this.treeLabelledBy() ? null : 'Options',
  );
  readonly activeTreeIndex = signal(0);
  private controlFocused = false;
  readonly enabledTreeOptionIndexes = computed(() =>
    this.filteredVisibleNodes().flatMap((item, index) =>
      item.node.disabled ? [] : [index],
    ),
  );
  readonly resolvedActiveTreeIndex = computed(() => {
    const enabledIndexes = this.enabledTreeOptionIndexes();
    if (!enabledIndexes.length) return null;
    const current = this.activeTreeIndex();
    return enabledIndexes.includes(current)
      ? current
      : (enabledIndexes.find((index) => index > current) ?? enabledIndexes[0]);
  });
  readonly activeTreeOptionId = computed(() => {
    const index = this.resolvedActiveTreeIndex();
    return index === null ? null : this.treeOptionId(index);
  });
  private readonly activeTreeIndexEffect = effect(() => {
    const enabledIndexes = this.enabledTreeOptionIndexes();
    const current = this.activeTreeIndex();
    if (!enabledIndexes.length) {
      if (current !== 0) this.activeTreeIndex.set(0);
      return;
    }
    if (!enabledIndexes.includes(current)) {
      this.activeTreeIndex.set(
        enabledIndexes.find((index) => index > current) ?? enabledIndexes[0],
      );
    }
  });

  readonly visibleNodes = computed<VisibleTreeSelectNode[]>(() => {
    const result: VisibleTreeSelectNode[] = [];
    const visit = (nodes: TreeSelectNode[], level: number): void => {
      for (const node of nodes) {
        result.push({ node, level });
        if (node.children?.length && this.expanded().has(node.value))
          visit(node.children, level + 1);
      }
    };
    visit(this.nodes(), 1);
    return result;
  });
  readonly filteredVisibleNodes = computed(() => {
    return this.filterValue().trim()
      ? filterTreeNodes(
          this.nodes(),
          this.filterValue(),
          this.filterBy(),
          this.filterMode(),
          this.filterLocale(),
        )
      : this.visibleNodes();
  });
  writeValue(value: string | string[] | null): void {
    this.value.set(value);
  }
  selectedLabel(): string {
    const value = this.value();
    const values = Array.isArray(value) ? value : value === null ? [] : [value];
    return values
      .map((item) => this.findNode(this.nodes(), item)?.label)
      .filter(Boolean)
      .join(', ');
  }
  isNodeSelected(node: TreeSelectNode): boolean {
    const value = this.value();
    return Array.isArray(value)
      ? value.includes(node.value)
      : value === node.value;
  }
  toggleOpen(): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    if (this.open()) {
      this.closePanel();
      return;
    }
    this.open.set(true);
    this.onShow.emit();
    afterNextRender(
      () => {
        if (this.open()) this.focusTree();
      },
      { injector: this.injector },
    );
  }
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target;
    const NodeConstructor =
      this.host.nativeElement.ownerDocument.defaultView?.Node;
    if (
      NodeConstructor &&
      target instanceof NodeConstructor &&
      this.host.nativeElement.contains(target)
    )
      return;
    this.closePanel();
    this.cvaOnTouched();
  }
  onHostFocusIn(event: FocusEvent): void {
    if (this.controlFocused) return;
    this.controlFocused = true;
    this.onFocus.emit(event);
  }
  onHostFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.host.nativeElement.contains(nextTarget)) return;
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      const activeElement = this.host.nativeElement.ownerDocument.activeElement;
      if (activeElement && this.host.nativeElement.contains(activeElement))
        return;
      this.controlFocused = false;
      if (this.open()) this.closePanel();
      this.cvaOnTouched();
      this.onBlur.emit(event);
    });
  }
  private closePanel(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (this.resetFilterOnHide()) {
      this.filterValue.set('');
      this.activeTreeIndex.set(0);
    }
    this.onHide.emit();
    if (restoreFocus) {
      const trigger = (this.host.nativeElement as HTMLElement).querySelector(
        '.trigger',
      ) as HTMLButtonElement | null;
      trigger?.focus();
    }
  }
  toggle(node: TreeSelectNode): void {
    if (
      !node.children?.length ||
      this.filterValue().trim() ||
      this.isTreeItemDisabled(node)
    )
      return;
    this.expanded.update((current) => {
      const next = new Set(current);
      const wasExpanded = next.has(node.value);
      if (wasExpanded) next.delete(node.value);
      else next.add(node.value);
      if (wasExpanded) this.onNodeCollapse.emit(node);
      else this.onNodeExpand.emit(node);
      return next;
    });
  }
  private focusTree(): void {
    const tree = (this.host.nativeElement as HTMLElement).querySelector(
      '[role="tree"]',
    ) as HTMLElement | null;
    tree?.focus({ preventScroll: true });
  }
  onTreeFocusIn(event: FocusEvent): void {
    const tree = event.currentTarget as HTMLElement;
    const target = event.target as HTMLElement | null;
    if (!target || target === tree) return;
    const treeItem = target.closest<HTMLElement>('[role="treeitem"]');
    if (treeItem) {
      const index = Array.from(
        tree.querySelectorAll<HTMLElement>('[role="treeitem"]'),
      ).indexOf(treeItem);
      if (index >= 0) this.activeTreeIndex.set(index);
    }
    tree.focus({ preventScroll: true });
  }
  onTreeToggleClick(node: TreeSelectNode, index: number): void {
    this.activeTreeIndex.set(index);
    this.focusTree();
    this.toggle(node);
  }
  onTreeItemClick(node: TreeSelectNode, index: number, event: Event): void {
    this.activeTreeIndex.set(index);
    this.focusTree();
    this.select(node, event);
  }
  select(node: TreeSelectNode, event?: Event): void {
    if (this.isTreeItemDisabled(node)) return;
    const originalEvent = event ?? new Event('change');
    const mode = this.selectionMode();
    if (mode === 'single') {
      this.value.set(node.value);
      this.cvaOnChange(node.value);
      this.nodeSelect.emit(node);
      this.onChange.emit({ originalEvent, value: node.value });
      this.closePanel(true);
    } else {
      const current = Array.isArray(this.value())
        ? [...(this.value() as string[])]
        : [];
      const explicitlySelected = current.includes(node.value);
      const selected = explicitlySelected || this.nodeCheckState(node) === true;
      const checkboxMode = mode === 'checkbox';
      const descendants =
        (checkboxMode && this.propagateSelectionDown()) ||
        (selected && !explicitlySelected)
          ? this.descendantValues(node)
          : [node.value];
      let next = selected
        ? current.filter((value) => !descendants.includes(value))
        : [...new Set([...current, ...descendants])];
      if (checkboxMode && this.propagateSelectionUp()) {
        for (const ancestor of this.ancestorValues(node)) {
          const parent = this.findNode(this.nodes(), ancestor);
          if (!parent) continue;
          const branch = this.descendantValues(parent).filter(
            (value) => value !== parent.value,
          );
          if (branch.length && branch.every((value) => next.includes(value))) {
            if (!next.includes(parent.value)) next.push(parent.value);
          } else {
            next = next.filter((value) => value !== parent.value);
          }
        }
      }
      this.value.set(next);
      this.cvaOnChange(next);
      (selected ? this.nodeUnselect : this.nodeSelect).emit(node);
      this.onChange.emit({ originalEvent, value: next });
    }
  }
  private descendantValues(node: TreeSelectNode): string[] {
    return [
      ...(node.disabled ? [] : [node.value]),
      ...(node.children ?? []).flatMap((child) => this.descendantValues(child)),
    ];
  }
  private ancestorValues(
    target: TreeSelectNode,
    nodes = this.nodes(),
    path: string[] = [],
  ): string[] {
    for (const node of nodes) {
      if (node.children?.some((child) => child.value === target.value))
        return [node.value, ...path];
      if (node.children) {
        const nested = this.ancestorValues(target, node.children, [
          node.value,
          ...path,
        ]);
        if (nested.length) return nested;
      }
    }
    return [];
  }
  clear(event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const originalEvent = event ?? new Event('clear');
    this.value.set(null);
    this.cvaOnChange(null);
    this.cvaOnTouched();
    this.onChange.emit({ originalEvent, value: null });
    this.onClear.emit(originalEvent);
  }
  onFilterInput(event: Event): void {
    if (this.isTreeControlDisabled()) return;
    const filter = (event.target as HTMLInputElement).value;
    this.activeTreeIndex.set(0);
    this.filterValue.set(filter);
    this.onFilter.emit({ originalEvent: event, filter });
  }
  nodeCheckState(node: TreeSelectNode): boolean | 'mixed' {
    if (this.isNodeSelected(node)) return true;
    if (this.selectionMode() !== 'checkbox' || !node.children?.length)
      return false;
    const selected = new Set(
      Array.isArray(this.value())
        ? this.value()
        : this.value() === null
          ? []
          : [this.value() as string],
    );
    const descendants = node.children.flatMap((child) =>
      this.descendantValues(child),
    );
    const selectedCount = descendants.filter((value) =>
      selected.has(value),
    ).length;
    if (!selectedCount) return false;
    return selectedCount === descendants.length ? true : 'mixed';
  }
  isExpandedForView(node: TreeSelectNode): boolean {
    if (this.expanded().has(node.value)) return true;
    const term = this.filterValue().trim();
    if (!term) return false;
    const visible = this.filteredVisibleNodes();
    const index = visible.findIndex((item) => item.node.value === node.value);
    return (
      index >= 0 &&
      visible.slice(index + 1).some((item) => item.level > visible[index].level)
    );
  }
  isTreeInteractionDisabled(): boolean {
    return this.isTreeControlDisabled() || this.loading();
  }
  isTreeControlDisabled(): boolean {
    return this.disabled() || this.cvaDisabled() || this.readonly();
  }
  isTreeItemDisabled(node: TreeSelectNode): boolean {
    return node.disabled === true || this.isTreeInteractionDisabled();
  }
  treeOptionId(index: number): string {
    return `${this.effectiveId()}-tree-option-${index}`;
  }
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (event.key === 'Escape') {
      if (this.open()) {
        event.preventDefault();
        this.closePanel(true);
      }
      return;
    }
    if (
      this.disabled() ||
      this.cvaDisabled() ||
      this.readonly() ||
      this.loading()
    )
      return;
    if (
      target.closest(
        'input, textarea, select, [contenteditable="true"], .trigger',
      )
    )
      return;
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      target.closest('button')
    )
      return;
    const nodes = this.filteredVisibleNodes();
    const enabledIndexes = this.enabledTreeOptionIndexes();
    if (!enabledIndexes.length) return;
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      if (event.key === 'Home') {
        this.activeTreeIndex.set(enabledIndexes[0]);
      } else if (event.key === 'End') {
        this.activeTreeIndex.set(enabledIndexes[enabledIndexes.length - 1]);
      } else {
        const activeIndex = this.resolvedActiveTreeIndex() ?? enabledIndexes[0];
        const currentPosition = enabledIndexes.indexOf(activeIndex);
        const nextPosition =
          (currentPosition +
            (event.key === 'ArrowDown' ? 1 : -1) +
            enabledIndexes.length) %
          enabledIndexes.length;
        this.activeTreeIndex.set(enabledIndexes[nextPosition]);
      }
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const activeIndex = this.resolvedActiveTreeIndex();
      if (activeIndex === null || !nodes[activeIndex]) return;
      const activeItem = nodes[activeIndex];
      if (event.key === 'ArrowRight') {
        if (!activeItem.node.children?.length) return;
        event.preventDefault();
        if (!this.isExpandedForView(activeItem.node)) {
          this.toggle(activeItem.node);
        } else {
          const childIndex = enabledIndexes.find(
            (index) =>
              index > activeIndex && nodes[index].level > activeItem.level,
          );
          if (childIndex !== undefined) this.activeTreeIndex.set(childIndex);
        }
      } else {
        const parentIndex = [...enabledIndexes]
          .reverse()
          .find(
            (index) =>
              index < activeIndex && nodes[index].level < activeItem.level,
          );
        if (
          activeItem.node.children?.length &&
          this.isExpandedForView(activeItem.node) &&
          !this.filterValue().trim()
        ) {
          event.preventDefault();
          this.toggle(activeItem.node);
        } else if (parentIndex !== undefined) {
          event.preventDefault();
          this.activeTreeIndex.set(parentIndex);
        }
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const activeIndex = this.resolvedActiveTreeIndex();
      if (
        activeIndex !== null &&
        nodes[activeIndex] &&
        !nodes[activeIndex].node.disabled
      ) {
        event.preventDefault();
        this.select(nodes[activeIndex].node, event);
      }
    }
  }
  private findNode(
    nodes: TreeSelectNode[],
    value: string | null,
  ): TreeSelectNode | undefined {
    for (const node of nodes) {
      if (node.value === value) return node;
      const nested = node.children
        ? this.findNode(node.children, value)
        : undefined;
      if (nested) return nested;
    }
    return undefined;
  }
}
