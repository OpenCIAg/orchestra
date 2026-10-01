import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  afterNextRender,
  inject,
  Injector,
  OnDestroy,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}
interface TreeNodeItem {
  node: TreeNode;
  index?: number;
  level?: number;
  expandable?: boolean;
  position?: number;
  setSize?: number;
  parentId?: string | null;
}
interface VisibleTreeNode extends TreeNodeItem {
  index: number;
  level: number;
  expandable: boolean;
  position: number;
  setSize: number;
  parentId: string | null;
}
let nextTreeViewId = 0;
@Component({
  selector: 'orc-tree-view',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeViewComponent implements OnDestroy {
  readonly nodes = input<TreeNode[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly expandLabel = input<string | undefined>(undefined);
  readonly nodeSelect = output<TreeNode>();
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly activeIndex = signal(0);
  private readonly injector = inject(Injector);
  private readonly treeElement = viewChild<ElementRef<HTMLElement>>('tree');
  readonly treeId = `orc-tree-view-${++nextTreeViewId}`;
  readonly visibleNodes = computed(() => {
    const result: VisibleTreeNode[] = [];
    const visit = (nodes: TreeNode[], level: number, parentId: string | null) =>
      nodes.forEach((node, position) => {
        const expandable = !!node.children?.length;
        result.push({
          node,
          index: result.length,
          level,
          expandable,
          position,
          setSize: nodes.length,
          parentId,
        });
        if (expandable && this.expanded().has(node.id))
          visit(node.children!, level + 1, node.id);
      });
    visit(this.nodes(), 1, null);
    return result;
  });
  readonly normalizedActiveIndex = computed(() => {
    const count = this.visibleNodes().length;
    return count ? Math.max(0, Math.min(this.activeIndex(), count - 1)) : 0;
  });
  readonly visibleNodeById = computed(
    () => new Map(this.visibleNodes().map((item) => [item.node.id, item])),
  );
  /** All rendered treeitems, including descendants rendered by the recursive template. */
  readonly treeItems = (): ElementRef<HTMLElement>[] =>
    this.itemElements().map((element) => new ElementRef(element));
  private previousVisibleIds: string[] = [];
  private previousActiveIndex = 0;
  private typeahead = '';
  private typeaheadAt = 0;
  private focusRequest = 0;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const ids = new Set<string>();
      const collect = (nodes: TreeNode[]): void =>
        nodes.forEach((node) => {
          ids.add(node.id);
          if (node.children?.length) collect(node.children);
        });
      collect(this.nodes());
      const current = this.expanded();
      const next = new Set([...current].filter((id) => ids.has(id)));
      if (next.size !== current.size) this.expanded.set(next);
      const count = this.visibleNodes().length;
      const visibleIds = this.visibleNodes().map((item) => item.node.id);
      const activeIndexChanged =
        this.activeIndex() !== this.previousActiveIndex;
      const previousActiveId = activeIndexChanged
        ? undefined
        : this.previousVisibleIds[this.activeIndex()];
      const preservedIndex = previousActiveId
        ? visibleIds.indexOf(previousActiveId)
        : -1;
      const index = count
        ? preservedIndex >= 0
          ? preservedIndex
          : Math.max(0, Math.min(this.activeIndex(), count - 1))
        : 0;
      const tree = this.treeElement()?.nativeElement;
      const shouldRestoreFocus =
        this.previousVisibleIds.length > 0 &&
        index !== this.activeIndex() &&
        !!tree &&
        this.hasFocusWithin(tree);
      this.previousVisibleIds = visibleIds;
      if (index !== this.activeIndex()) this.activeIndex.set(index);
      this.previousActiveIndex = index;
      if (shouldRestoreFocus && visibleIds[index]) {
        afterNextRender(() => this.focusNode(visibleIds[index]), {
          injector: this.injector,
        });
      }
    });
  }

  visibleItem(node: TreeNode): VisibleTreeNode | undefined {
    return this.visibleNodeById().get(node.id);
  }
  itemId(node: TreeNode): string {
    return this.itemDomId(node.id);
  }
  groupId(node: TreeNode): string {
    return `${this.itemId(node)}-group`;
  }
  labelId(node: TreeNode): string {
    return `${this.itemId(node)}-label`;
  }
  toggle(node: TreeNode): void {
    if (node.disabled || !node.children?.length) return;
    const wasExpanded = this.expanded().has(node.id);
    const nodeIndex = this.visibleNodeById().get(node.id)?.index ?? -1;
    const element = nodeIndex >= 0 ? this.itemElements()[nodeIndex] : undefined;
    const activeItem = this.visibleNodes()[this.activeIndex()];
    const focusWithinNode = !!element && this.hasFocusWithin(element);
    const activeDescendant =
      !!activeItem && this.isDescendant(node, activeItem.node.id);
    this.expanded.update((current) => {
      const next = new Set(current);
      wasExpanded ? next.delete(node.id) : next.add(node.id);
      return next;
    });
    if (nodeIndex >= 0) {
      this.activeIndex.set(nodeIndex);
      this.rememberCurrentVisibleState(nodeIndex);
      if (focusWithinNode || (wasExpanded && activeDescendant))
        this.focusNode(node.id);
    }
  }
  activate(node: TreeNode, index?: number, event?: Event): void {
    if (event) {
      const target = event.target as Element | null;
      const current = event.currentTarget as Element | null;
      if (target?.closest('[role="treeitem"]') !== current) return;
    }
    if (index !== undefined) this.setActiveIndex(index);
    if (!node.disabled) this.nodeSelect.emit(node);
  }
  keydown(event: KeyboardEvent, item: TreeNodeItem, index?: number): void {
    const targetTreeItem = (event.target as Element | null)?.closest(
      '[role="treeitem"]',
    );
    if (event.currentTarget && targetTreeItem !== event.currentTarget) return;
    if (
      event.isComposing ||
      event.key === 'Process' ||
      event.key === 'Unidentified'
    )
      return;
    const current = this.visibleNodeById().get(item.node.id);
    const resolvedIndex = index ?? item.index ?? current?.index ?? 0;
    const expandable = current?.expandable ?? item.expandable ?? false;
    const parentId = current?.parentId ?? item.parentId ?? null;
    const target = event.target as Element | null;
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      target?.closest('.orc-tree__toggle')
    ) {
      event.preventDefault();
      this.toggle(item.node);
      return;
    }
    if (item.node.disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowRight' && expandable) {
      event.preventDefault();
      if (!this.expanded().has(item.node.id)) this.toggle(item.node);
      else this.moveTo(resolvedIndex + 1);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (expandable && this.expanded().has(item.node.id))
        this.toggle(item.node);
      else if (parentId) {
        const parentIndex = this.visibleNodeById().get(parentId)?.index ?? -1;
        if (parentIndex >= 0) this.moveTo(parentIndex);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveTo(resolvedIndex + 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveTo(resolvedIndex - 1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      this.moveTo(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      this.moveTo(this.visibleNodes().length - 1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activate(item.node, index);
      return;
    }

    if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      const now = Date.now();
      const character = event.key.toLocaleLowerCase();
      this.typeahead =
        now - this.typeaheadAt > 500 ? character : this.typeahead + character;
      this.typeaheadAt = now;
      const visible = this.visibleNodes();
      const matches = (prefix: string) =>
        visible.filter((candidate) =>
          candidate.node.label.toLocaleLowerCase().startsWith(prefix),
        );
      let match = matches(this.typeahead);
      // Typing the same character repeatedly cycles through matching labels.
      if (!match.length && this.typeahead.length > 1) {
        this.typeahead = character;
        match = matches(this.typeahead);
      }
      if (match.length) {
        const matchIndexes = match.map((candidate) => candidate.index);
        const next =
          matchIndexes.find(
            (candidateIndex) => candidateIndex > resolvedIndex,
          ) ?? matchIndexes[0];
        event.preventDefault();
        this.moveTo(next);
      }
    }
  }
  setActiveIndex(index: number, focus = true): void {
    const count = this.visibleNodes().length;
    const next = count ? Math.max(0, Math.min(index, count - 1)) : 0;
    this.activeIndex.set(next);
    this.rememberCurrentVisibleState(next);
    if (focus) this.focusNode(this.visibleNodes()[next]?.node.id);
  }
  focusItem(event: FocusEvent, index: number): void {
    if (event.target !== event.currentTarget) return;
    this.setActiveIndex(index, false);
  }
  private moveTo(index: number): void {
    this.setActiveIndex(index);
  }
  private rememberCurrentVisibleState(activeIndex: number): void {
    this.previousVisibleIds = this.visibleNodes().map((item) => item.node.id);
    this.previousActiveIndex = activeIndex;
  }
  private isDescendant(parent: TreeNode, nodeId: string): boolean {
    return !!parent.children?.some(
      (child) => child.id === nodeId || this.isDescendant(child, nodeId),
    );
  }
  private hasFocusWithin(element: HTMLElement): boolean {
    const activeElement = element.ownerDocument.activeElement;
    return !!activeElement && element.contains(activeElement);
  }
  private focusNode(nodeId: string | undefined): void {
    if (!nodeId) return;
    const request = ++this.focusRequest;
    if (this.focusTimer !== null) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
    const focus = () => {
      const tree = this.treeElement()?.nativeElement;
      const element = tree?.ownerDocument.getElementById(
        this.itemDomId(nodeId),
      );
      return tree && element && tree.contains(element) ? element : undefined;
    };
    // Existing items can be focused synchronously, which keeps keyboard and
    // toggle interactions stable even before Angular renders a new subtree.
    const element = focus();
    if (element) {
      element.focus();
      return;
    }
    // A target can be newly revealed by an input update. Retry after Angular
    // renders the new subtree in that case.
    afterNextRender(
      () => {
        if (request !== this.focusRequest) return;
        const element = focus();
        if (element) element.focus();
        else {
          this.focusTimer = setTimeout(() => {
            this.focusTimer = null;
            if (request === this.focusRequest) focus()?.focus();
          }, 0);
        }
      },
      { injector: this.injector },
    );
  }
  private itemDomId(nodeId: string): string {
    return `${this.treeId}-node-${encodeURIComponent(nodeId)}`;
  }
  ngOnDestroy(): void {
    this.focusRequest++;
    if (this.focusTimer !== null) clearTimeout(this.focusTimer);
    this.focusTimer = null;
  }
  private itemElements(): HTMLElement[] {
    return this.treeElement()
      ? Array.from(
          this.treeElement()!.nativeElement.querySelectorAll<HTMLElement>(
            '[role="treeitem"]',
          ),
        )
      : [];
  }
}
