import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';
import { filterTreeNodes } from './tree-filter';

export interface HierarchyNode<T = Record<string, unknown>> {
  key: string;
  label: string;
  data?: T;
  children?: HierarchyNode<T>[];
  /** @deprecated Expansion is based on nonempty `children`; lazy leaf nodes are not supported. */
  leaf?: boolean;
  disabled?: boolean;
}
interface FlatHierarchyNode<T> {
  node: HierarchyNode<T>;
  level: number;
}

type TreeCheckboxState = boolean | 'mixed';

let nextTreeId = 0;

@Component({
  selector: 'orc-tree',
  standalone: true,
  templateUrl: './p2-tree-component.html',
  styles: [
    P2_SHARED_STYLES +
      `.orc-tree{width:100%;overflow:auto;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);color:var(--orc-component-text)}.tree-items{outline:none}.tree-items:focus-visible .tree-row.active{outline:2px solid var(--orc-component-interactive);outline-offset:-2px}.tree-row{display:flex;align-items:center;min-height:2.25rem}.tree-row.selected{background:var(--orc-component-interactive-soft)}.tree-row.disabled{opacity:.55}.toggle,.label{border:0;background:transparent}.toggle{width:1.5rem}.label{display:flex;align-items:center;gap:.5rem;flex:1;padding:.4rem;text-align:left}.tree-checkbox{display:inline-grid;flex:none;width:1rem;height:1rem;place-items:center;border:1px solid var(--orc-component-border-strong);border-radius:.2rem;color:var(--orc-component-on-interactive);font-size:.75rem;line-height:1}.tree-checkbox.checked{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive)}.tree-checkbox.mixed{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-tree p-component',
    '[attr.id]': 'id() || null',
    '[attr.data-pc-name]': "'tree'",
  },
})
export class TreeComponent<T = Record<string, unknown>> {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly generatedTreeId = `orc-tree-${++nextTreeId}`;
  readonly id = input<string | undefined>(undefined);
  readonly nodes = input<HierarchyNode<T>[]>([]);
  readonly value = input<HierarchyNode<T>[] | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly selectionMode = input<'single' | 'multiple' | 'checkbox'>('single');
  /** @deprecated Compatibility input only; selection does not inspect modifier keys. */
  readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly propagateSelectionUp = input(false, { transform: booleanAttribute });
  readonly propagateSelectionDown = input(false, {
    transform: booleanAttribute,
  });
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly filterBy = input('label');
  readonly filterMode = input('lenient');
  /** @deprecated Compatibility input only; the filter is not autofocus-enabled. */
  readonly filterInputAutoFocus = input(false, { transform: booleanAttribute });
  readonly filterLocale = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingMessage = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; loading renders the configured message. */
  readonly loadingMode = input<'mask' | 'icon'>('mask');
  /** @deprecated Compatibility input only; loading icons are not rendered. */
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly expandAriaLabel = input<string | undefined>(undefined);
  readonly collapseAriaLabel = input<string | undefined>(undefined);
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  /** @deprecated Compatibility input only; context-menu integration is not provided. */
  readonly contextMenu = input<unknown>(undefined);
  /** @deprecated Compatibility input only; drag-and-drop is not implemented. */
  readonly draggableScope = input<unknown>(undefined);
  /** @deprecated Compatibility input only; drag-and-drop is not implemented. */
  readonly droppableScope = input<unknown>(undefined);
  /** @deprecated Compatibility input only; drag-and-drop is not implemented. */
  readonly draggableNodes = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; drag-and-drop is not implemented. */
  readonly droppableNodes = input(false, { transform: booleanAttribute });
  readonly scrollHeight = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; lazy loading is not implemented. */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  readonly indentation = input(1);
  /** @deprecated Compatibility input only; selection highlighting is fixed by the selected state. */
  readonly highlightOnSelect = input(false, { transform: booleanAttribute });
  readonly selected = model<string | string[] | null>(null);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<HierarchyNode<T>>();
  readonly nodeUnselect = output<HierarchyNode<T>>();
  readonly nodeExpand = output<HierarchyNode<T>>();
  readonly nodeCollapse = output<HierarchyNode<T>>();
  readonly onNodeSelect = output<HierarchyNode<T>>();
  readonly onNodeUnselect = output<HierarchyNode<T>>();
  readonly onNodeExpand = output<HierarchyNode<T>>();
  readonly onNodeCollapse = output<HierarchyNode<T>>();
  readonly selectionChange = output<string | string[] | null>();
  readonly onNodeContextMenuSelect = output<HierarchyNode<T>>();
  readonly onNodeDoubleClick = output<HierarchyNode<T>>();
  /** @deprecated Compatibility output; tree drag/drop is not implemented. */
  readonly onNodeDrop = output<unknown>();
  /** @deprecated Compatibility output; tree lazy loading is not implemented. */
  readonly onLazyLoad = output<unknown>();
  readonly onScroll = output<Event>();
  /** @deprecated Compatibility output; virtual-scroll index changes are not emitted. */
  readonly onScrollIndexChange = output<number>();
  readonly onFilter = output<{ originalEvent: Event; filter: string }>();
  readonly treeId = computed(
    () => `${this.id()?.trim() || this.generatedTreeId}-tree`,
  );
  readonly treeAriaLabel = computed(() => {
    const ariaLabel = this.ariaLabel()?.trim();
    if (ariaLabel) return ariaLabel;
    if (this.ariaLabelledBy()?.trim()) return null;
    return this.label()?.trim() || 'Tree';
  });
  readonly treeAriaLabelledBy = computed(
    () => this.ariaLabelledBy()?.trim() || null,
  );
  readonly activeTreeIndex = signal(0);
  readonly enabledTreeItemIndexes = computed(() =>
    this.filteredVisibleNodes().flatMap((item, index) =>
      item.node.disabled ? [] : [index],
    ),
  );
  readonly resolvedActiveTreeIndex = computed(() => {
    const enabledIndexes = this.enabledTreeItemIndexes();
    if (!enabledIndexes.length) return null;
    const activeIndex = this.activeTreeIndex();
    return enabledIndexes.includes(activeIndex)
      ? activeIndex
      : (enabledIndexes.find((index) => index > activeIndex) ??
          enabledIndexes[0]);
  });
  readonly activeTreeItemId = computed(() => {
    const index = this.resolvedActiveTreeIndex();
    return index === null ? null : this.treeItemId(index);
  });
  readonly effectiveNodes = computed(() => this.value() ?? this.nodes());
  readonly checkboxStateByKey = computed(() => {
    const selected = this.selected();
    const selectedKeys = new Set<string>(
      Array.isArray(selected) ? selected : selected === null ? [] : [selected],
    );
    const states = new Map<string, TreeCheckboxState>();
    const visit = (node: HierarchyNode<T>): TreeCheckboxState => {
      const childStates = (node.children ?? []).map((child) => {
        const state = visit(child);
        return child.disabled ? false : state;
      });
      const state: TreeCheckboxState = selectedKeys.has(node.key)
        ? true
        : childStates.some((childState) => childState !== false)
          ? 'mixed'
          : false;
      states.set(node.key, state);
      return state;
    };
    this.effectiveNodes().forEach(visit);
    return states;
  });
  readonly visibleNodes = computed<FlatHierarchyNode<T>[]>(() => {
    const result: FlatHierarchyNode<T>[] = [];
    const visit = (nodes: HierarchyNode<T>[], level: number): void => {
      for (const node of nodes) {
        result.push({ node, level });
        if (node.children?.length && this.expanded().has(node.key))
          visit(node.children, level + 1);
      }
    };
    visit(this.effectiveNodes(), 1);
    return result;
  });
  readonly filteredVisibleNodes = computed(() =>
    this.filterValue().trim()
      ? filterTreeNodes(
          this.effectiveNodes(),
          this.filterValue(),
          this.filterBy(),
          this.filterMode(),
          this.filterLocale(),
        )
      : this.visibleNodes(),
  );
  isExpandedForView(node: HierarchyNode<T>): boolean {
    if (this.expanded().has(node.key)) return true;
    if (!this.filterValue().trim()) return false;
    const visible = this.filteredVisibleNodes();
    const index = visible.findIndex((item) => item.node.key === node.key);
    return (
      index >= 0 &&
      visible.slice(index + 1).some((item) => item.level > visible[index].level)
    );
  }
  toggle(node: HierarchyNode<T>): void {
    if (node.disabled || !node.children?.length || this.filterValue().trim())
      return;
    const wasOpen = this.expanded().has(node.key);
    this.expanded.update((current) => {
      const next = new Set(current);
      if (wasOpen) next.delete(node.key);
      else next.add(node.key);
      return next;
    });
    if (wasOpen) this.nodeCollapse.emit(node);
    else this.nodeExpand.emit(node);
    if (wasOpen) this.onNodeCollapse.emit(node);
    else this.onNodeExpand.emit(node);
  }
  isSelected(key: string): boolean {
    const selected = this.selected();
    return Array.isArray(selected) ? selected.includes(key) : selected === key;
  }
  checkboxState(node: HierarchyNode<T>): TreeCheckboxState {
    return this.checkboxStateByKey().get(node.key) ?? false;
  }
  select(node: HierarchyNode<T>, _event?: Event): void {
    if (node.disabled) return;
    const current = this.selected();
    let next: string | string[] | null;
    if (this.selectionMode() === 'single')
      next = current === node.key ? null : node.key;
    else {
      const values = Array.isArray(current)
        ? [...current]
        : current != null
          ? [current]
          : [];
      const affected = this.propagateSelectionDown()
        ? this.descendantKeys(node)
        : [node.key];
      const selected = values.includes(node.key);
      next = selected
        ? values.filter((value) => !affected.includes(value))
        : [...new Set([...values, ...affected])];
      if (this.propagateSelectionUp())
        next = this.normalizeParentSelection(next);
    }
    this.selected.set(next);
    this.selectionChange.emit(next);
    const output = this.isSelected(node.key)
      ? this.nodeSelect
      : this.nodeUnselect;
    const alias = this.isSelected(node.key)
      ? this.onNodeSelect
      : this.onNodeUnselect;
    output.emit(node);
    alias.emit(node);
  }
  private descendantKeys(node: HierarchyNode<T>): string[] {
    if (node.disabled) return [];
    return [
      node.key,
      ...(node.children || []).flatMap((child) => this.descendantKeys(child)),
    ];
  }
  private normalizeParentSelection(
    selection: string | string[] | null,
  ): string[] {
    const selected = new Set(
      Array.isArray(selection)
        ? selection
        : selection != null
          ? [selection]
          : [],
    );
    const visit = (nodes: HierarchyNode<T>[]): void =>
      nodes.forEach((node) => {
        if (node.children?.length) visit(node.children);
        if (node.disabled) {
          selected.delete(node.key);
          return;
        }
        if (!node.children?.length) return;
        const selectable = node.children.filter((child) => !child.disabled);
        if (
          selectable.length &&
          selectable.every((child) => selected.has(child.key))
        )
          selected.add(node.key);
        else selected.delete(node.key);
      });
    visit(this.effectiveNodes());
    return [...selected];
  }
  onFilterInput(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue.set(filter);
    this.onFilter.emit({ originalEvent: event, filter });
  }
  onContextMenu(event: MouseEvent, node: HierarchyNode<T>): void {
    event.preventDefault();
    if (node.disabled) return;
    this.onNodeContextMenuSelect.emit(node);
  }
  onTreeItemDoubleClick(node: HierarchyNode<T>): void {
    if (node.disabled) return;
    this.onNodeDoubleClick.emit(node);
  }
  treeItemId(index: number): string {
    return `${this.treeId()}-item-${index}`;
  }
  onTreeFocusIn(event: FocusEvent): void {
    const tree = event.currentTarget as HTMLElement;
    const target = event.target as HTMLElement | null;
    if (!target || target === tree) return;
    const row = target.closest<HTMLElement>('[role="treeitem"]');
    if (!row) return;
    const index = Array.from(
      tree.querySelectorAll<HTMLElement>('[role="treeitem"]'),
    ).indexOf(row);
    if (index < 0) return;
    this.activeTreeIndex.set(index);
    tree.focus({ preventScroll: true });
  }
  onTreeToggleClick(node: HierarchyNode<T>, index: number): void {
    this.activeTreeIndex.set(index);
    this.focusTree();
    this.toggle(node);
  }
  onTreeItemClick(node: HierarchyNode<T>, index: number, event: Event): void {
    this.activeTreeIndex.set(index);
    this.focusTree();
    this.select(node, event);
  }
  private focusTree(): void {
    const tree = this.host.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement | null;
    tree?.focus({ preventScroll: true });
  }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      !target ||
      target.closest('input, textarea, select, [contenteditable="true"]')
    )
      return;
    if (target.closest('button')) return;
    const visible = this.filteredVisibleNodes();
    const enabledIndexes = this.enabledTreeItemIndexes();
    if (!enabledIndexes.length) return;
    const current = this.resolvedActiveTreeIndex() ?? enabledIndexes[0];
    const item = visible[current];
    if (!item) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const position = enabledIndexes.indexOf(current);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextPosition = Math.max(
        0,
        Math.min(enabledIndexes.length - 1, position + delta),
      );
      this.activeTreeIndex.set(enabledIndexes[nextPosition]);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.activeTreeIndex.set(
        event.key === 'Home'
          ? enabledIndexes[0]
          : enabledIndexes[enabledIndexes.length - 1],
      );
      return;
    }
    if (event.key === 'ArrowRight') {
      if (!item.node.children?.length) return;
      event.preventDefault();
      if (!this.isExpandedForView(item.node)) {
        this.toggle(item.node);
      } else {
        const childIndex = enabledIndexes.find(
          (index) => index > current && visible[index].level > item.level,
        );
        if (childIndex !== undefined) this.activeTreeIndex.set(childIndex);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      const parentIndex = [...enabledIndexes]
        .reverse()
        .find((index) => index < current && visible[index].level < item.level);
      if (
        item.node.children?.length &&
        this.isExpandedForView(item.node) &&
        !this.filterValue().trim()
      ) {
        event.preventDefault();
        this.toggle(item.node);
      } else if (parentIndex !== undefined) {
        event.preventDefault();
        this.activeTreeIndex.set(parentIndex);
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(item.node, event);
    }
  }
}
