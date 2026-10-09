import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';
import type { PrimeMenuItem } from '@ciag/orchestra/internal';

export type { PrimeMenuItem };

let nextPanelMenuId = 0;
interface PanelTreeEntry {
  item: PrimeMenuItem;
  parent: PrimeMenuItem | null;
}

@Component({
  selector: 'orc-panel-menu',
  standalone: true,
  template: `
    <div
      class="orc-panel-menu"
      [class]="'orc-panel-menu ' + styleClass()"
      [style]="style()"
      [attr.id]="id()"
      role="tree"
      [attr.aria-label]="ariaLabel()"
      [attr.tabindex]="-1"
      (focusin)="onFocusIn($event)"
      (keydown)="onKeydown($event)"
    >
      <ng-container>
        @for (item of effectiveItems(); track $index) {
          @if (item.visible !== false) {
            @if (item.separator) {
              <hr role="separator" />
            } @else {
              @if (isLeafLink(item)) {
                <a
                  role="treeitem"
                  [class.active]="isActive(item)"
                  [attr.id]="hasVisibleChildren(item) ? parentId($index) : null"
                  [attr.tabindex]="
                    isActive(item) && !disabled() ? tabindex() : -1
                  "
                  [attr.aria-level]="1"
                  [attr.href]="item.disabled || disabled() ? null : item.url"
                  [attr.target]="item.target || null"
                  [attr.rel]="
                    item.target === '_blank' ? 'noopener noreferrer' : null
                  "
                  [attr.aria-disabled]="
                    item.disabled || disabled() ? 'true' : null
                  "
                  (click)="select(item)"
                  ><span class="menu-item-content"
                    ><span class="menu-item-icon" aria-hidden="true">{{
                      item.icon
                    }}</span
                    ><span>{{ item.label }}</span></span
                  >
                  @if (item.badge) {
                    <span class="badge">{{ item.badge }}</span>
                  }
                </a>
              } @else {
                <button
                  type="button"
                  role="treeitem"
                  [class.active]="isActive(item)"
                  [attr.id]="hasVisibleChildren(item) ? parentId($index) : null"
                  [attr.tabindex]="
                    isActive(item) && !disabled() ? tabindex() : -1
                  "
                  [attr.aria-level]="1"
                  [attr.aria-expanded]="
                    hasVisibleChildren(item)
                      ? open().has(item)
                        ? 'true'
                        : 'false'
                      : null
                  "
                  [attr.aria-controls]="
                    hasVisibleChildren(item) && open().has(item)
                      ? childrenId($index)
                      : null
                  "
                  [attr.aria-owns]="
                    hasVisibleChildren(item) && open().has(item)
                      ? childrenId($index)
                      : null
                  "
                  [disabled]="item.disabled || disabled()"
                  (click)="toggle(item)"
                >
                  <span class="menu-item-content"
                    ><span class="menu-item-icon" aria-hidden="true">{{
                      item.icon
                    }}</span
                    ><span>{{ item.label }}</span></span
                  >
                  @if (item.badge) {
                    <span class="badge">{{ item.badge }}</span>
                  }
                  @if (hasVisibleChildren(item)) {
                    <span>{{ open().has(item) ? '−' : '+' }}</span>
                  }
                </button>
              }
              @if (open().has(item) && hasVisibleChildren(item)) {
                <div
                  class="children"
                  role="group"
                  [attr.id]="childrenId($index)"
                  [attr.aria-labelledby]="parentId($index)"
                  [attr.data-panel-index]="$index"
                >
                  @for (child of item.items; track $index) {
                    @if (child.visible !== false) {
                      @if (child.separator) {
                        <hr role="separator" />
                      } @else if (isLeafLink(child)) {
                        <a
                          role="treeitem"
                          [class.active]="isActiveChild(item, child)"
                          [attr.tabindex]="
                            isActiveChild(item, child) && !disabled()
                              ? tabindex()
                              : -1
                          "
                          [attr.aria-level]="2"
                          [attr.href]="
                            child.disabled || item.disabled || disabled()
                              ? null
                              : child.url
                          "
                          [attr.target]="child.target || null"
                          [attr.rel]="
                            child.target === '_blank'
                              ? 'noopener noreferrer'
                              : null
                          "
                          [attr.aria-disabled]="
                            child.disabled || item.disabled || disabled()
                              ? 'true'
                              : null
                          "
                          (click)="select(child, item)"
                          ><span class="menu-item-content"
                            ><span class="menu-item-icon" aria-hidden="true">{{
                              child.icon
                            }}</span
                            ><span>{{ child.label }}</span></span
                          >
                          @if (child.badge) {
                            <span class="badge">{{ child.badge }}</span>
                          }
                        </a>
                      } @else {
                        <button
                          type="button"
                          role="treeitem"
                          [class.active]="isActiveChild(item, child)"
                          [attr.tabindex]="
                            isActiveChild(item, child) && !disabled()
                              ? tabindex()
                              : -1
                          "
                          [attr.aria-level]="2"
                          [disabled]="
                            child.disabled || item.disabled || disabled()
                          "
                          (click)="select(child, item)"
                        >
                          <span class="menu-item-content"
                            ><span class="menu-item-icon" aria-hidden="true">{{
                              child.icon
                            }}</span
                            ><span>{{ child.label }}</span></span
                          >
                          @if (child.badge) {
                            <span class="badge">{{ child.badge }}</span>
                          }
                        </button>
                      }
                    }
                  }
                </div>
              }
            }
          }
        }
      </ng-container>
    </div>
  `,
  styles: [
    ORC_SHARED_VARS +
      `.orc-panel-menu{display:grid;width:100%;border:1px solid var(--orc-component-border);border-radius:.5rem;overflow:hidden}.orc-panel-menu>button,.orc-panel-menu> a,.children button,.children a{display:flex;justify-content:space-between;gap:.5rem;border:0;border-bottom:1px solid var(--orc-component-border);background:var(--orc-component-surface);padding:.65rem .8rem;text-align:start;color:inherit;text-decoration:none}.children{display:grid;padding-inline-start:1rem;background:var(--orc-component-surface-subtle)}.children button,.children a{background:transparent}.menu-item-content{display:inline-flex;align-items:center;gap:.5rem;min-width:0}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMenuComponent {
  /** Root items and one child level are rendered; recursive grandchildren remain unsupported. */
  readonly items = input<PrimeMenuItem[]>([]);
  readonly model = input<PrimeMenuItem[] | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly id = input<string | undefined>(undefined);
  /** @deprecated Compatibility-only input; PanelMenu does not animate expansion transitions. */
  readonly transitionOptions = input('');
  readonly tabindex = input(0);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly open = model<ReadonlySet<PrimeMenuItem>>(new Set());
  readonly itemSelect = output<PrimeMenuItem>();
  readonly onItemExpand = output<PrimeMenuItem>();
  readonly onItemCollapse = output<PrimeMenuItem>();
  readonly onNodeSelect = output<PrimeMenuItem>();
  readonly onNodeExpand = output<PrimeMenuItem>();
  readonly onNodeCollapse = output<PrimeMenuItem>();
  readonly activeIndex = signal(0);
  readonly childActiveIndex = signal(0);
  readonly childParent = signal<PrimeMenuItem | null>(null);
  private readonly instanceId = ++nextPanelMenuId;
  effectiveItems(): PrimeMenuItem[] {
    return this.model() ?? this.items();
  }
  isLeafLink(item: PrimeMenuItem): boolean {
    return !!item.url && !item.items?.length;
  }
  hasVisibleChildren(item: PrimeMenuItem): boolean {
    return !!item.items?.some((child) => child.visible !== false);
  }
  rootItems(): PrimeMenuItem[] {
    return this.disabled()
      ? []
      : this.effectiveItems().filter(
          (item) => item.visible !== false && !item.separator && !item.disabled,
        );
  }
  childItems(item: PrimeMenuItem | null): PrimeMenuItem[] {
    return this.disabled()
      ? []
      : (item?.items?.filter(
          (child) =>
            child.visible !== false && !child.separator && !child.disabled,
        ) ?? []);
  }
  treeItems(): PanelTreeEntry[] {
    return this.rootItems().flatMap((item) => [
      { item, parent: null },
      ...(this.open().has(item)
        ? this.childItems(item).map((child) => ({ item: child, parent: item }))
        : []),
    ]);
  }
  isActive(item: PrimeMenuItem): boolean {
    return (
      !this.disabled() &&
      !this.childParent() &&
      this.rootItems()[this.activeIndex()] === item
    );
  }
  isActiveChild(parent: PrimeMenuItem, item: PrimeMenuItem): boolean {
    return (
      !this.disabled() &&
      this.childParent() === parent &&
      this.childItems(parent)[this.childActiveIndex()] === item
    );
  }
  parentId(index: number): string {
    return `${this.id() || `orc-panelmenu-${this.instanceId}`}-parent-${index}`;
  }
  childrenId(index: number): string {
    return `${this.id() || `orc-panelmenu-${this.instanceId}`}-children-${index}`;
  }
  onFocusIn(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    const target = event.target as HTMLElement | null;
    const children = target?.closest<HTMLElement>('.children');
    if (children && target?.matches('[role="treeitem"]')) {
      const index = Array.from(
        children.querySelectorAll<HTMLElement>(
          '[role="treeitem"]:not(:disabled):not([aria-disabled="true"])',
        ),
      ).indexOf(target);
      const parentIndex = Number(children.dataset['panelIndex']);
      const parent = Number.isInteger(parentIndex)
        ? this.effectiveItems()[parentIndex]
        : undefined;
      if (parent && index >= 0) {
        this.childParent.set(parent);
        this.childActiveIndex.set(index);
      }
    } else if (
      host &&
      target?.parentElement === host &&
      target.matches('[role="treeitem"]')
    ) {
      const index = Array.from(
        host.querySelectorAll<HTMLElement>(
          ':scope > [role="treeitem"]:not(:disabled):not([aria-disabled="true"])',
        ),
      ).indexOf(target);
      if (index >= 0) {
        this.activeIndex.set(index);
        this.childParent.set(null);
      }
    }
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const host = event.currentTarget as HTMLElement | null;
    const target = event.target as HTMLElement | null;
    const entries = this.treeItems();
    const buttons = host
      ? Array.from(
          host.querySelectorAll<HTMLElement>(
            '[role="treeitem"]:not(:disabled):not([aria-disabled="true"])',
          ),
        )
      : [];
    const targetIndex = buttons.indexOf(target as HTMLElement);
    const currentIndex =
      targetIndex >= 0 ? targetIndex : this.currentTreeIndex(entries);
    const current = entries[currentIndex];
    if (!current) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.focusTreeIndex(
        host,
        Math.max(0, Math.min(entries.length - 1, currentIndex + delta)),
        entries,
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.focusTreeIndex(
        host,
        event.key === 'Home' ? 0 : entries.length - 1,
        entries,
      );
    } else if (
      event.key === 'ArrowRight' &&
      !current.parent &&
      this.hasVisibleChildren(current.item)
    ) {
      event.preventDefault();
      if (!this.open().has(current.item)) {
        this.toggle(current.item);
        this.childParent.set(null);
        this.focusRootItem(host);
      } else if (this.childItems(current.item).length) {
        this.focusTreeIndex(
          host,
          entries.findIndex((entry) => entry.parent === current.item),
          entries,
        );
      } else {
        this.childParent.set(null);
        this.focusRootItem(host);
      }
    } else if (event.key === 'ArrowLeft' && current.parent) {
      event.preventDefault();
      this.focusParent(current.parent, host);
    } else if (event.key === 'Escape' && current.parent) {
      event.preventDefault();
      this.closeParent(current.parent, host);
    } else if (
      (event.key === 'ArrowLeft' || event.key === 'Escape') &&
      !current.parent &&
      this.hasVisibleChildren(current.item) &&
      this.open().has(current.item)
    ) {
      event.preventDefault();
      this.closeParent(current.item, host);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (event.key === 'Enter' && target?.tagName === 'A') return;
      event.preventDefault();
      if (current.parent) this.select(current.item);
      else this.toggle(current.item);
    }
  }
  private currentTreeIndex(entries: PanelTreeEntry[]): number {
    const parent = this.childParent();
    const item = parent
      ? this.childItems(parent)[this.childActiveIndex()]
      : this.rootItems()[this.activeIndex()];
    return Math.max(
      0,
      entries.findIndex(
        (entry) => entry.item === item && entry.parent === (parent || null),
      ),
    );
  }
  private focusTreeIndex(
    host: HTMLElement | null,
    index: number,
    entries: PanelTreeEntry[],
  ): void {
    const entry = entries[index];
    if (!entry) return;
    if (entry.parent) {
      this.childParent.set(entry.parent);
      this.childActiveIndex.set(
        this.childItems(entry.parent).indexOf(entry.item),
      );
    } else {
      this.childParent.set(null);
      this.activeIndex.set(this.rootItems().indexOf(entry.item));
    }
    host
      ?.querySelectorAll<HTMLElement>(
        '[role="treeitem"]:not(:disabled):not([aria-disabled="true"])',
      )
      [index]?.focus();
  }
  private focusRootItem(host: HTMLElement | null): void {
    host
      ?.querySelectorAll<HTMLElement>(
        ':scope > [role="treeitem"]:not(:disabled):not([aria-disabled="true"])',
      )
      [this.activeIndex()]?.focus();
  }
  private focusParent(parent: PrimeMenuItem, host: HTMLElement | null): void {
    this.childParent.set(null);
    const index = this.rootItems().indexOf(parent);
    if (index >= 0) {
      this.activeIndex.set(index);
      this.focusRootItem(host);
    }
  }
  private closeParent(parent: PrimeMenuItem, host: HTMLElement | null): void {
    if (!this.open().has(parent)) return;
    this.toggle(parent);
    this.childParent.set(null);
    const index = this.rootItems().indexOf(parent);
    if (index >= 0) {
      this.activeIndex.set(index);
      this.focusRootItem(host);
    }
  }
  toggle(item: PrimeMenuItem): void {
    if (item.disabled || this.disabled()) return;
    if (!this.hasVisibleChildren(item)) return this.select(item);
    const next = new Set(this.open());
    const expanded = next.has(item);
    if (expanded) {
      next.delete(item);
      this.onItemCollapse.emit(item);
      this.onNodeCollapse.emit(item);
      if (this.childParent() === item) this.childParent.set(null);
    } else {
      if (!this.multiple()) {
        for (const previous of next) {
          if (previous !== item) {
            this.onItemCollapse.emit(previous);
            this.onNodeCollapse.emit(previous);
          }
        }
        next.clear();
      }
      next.add(item);
      this.childActiveIndex.set(0);
      this.onItemExpand.emit(item);
      this.onNodeExpand.emit(item);
    }
    this.open.set(next);
  }
  select(item: PrimeMenuItem, parent?: PrimeMenuItem): void {
    if (!item.disabled && !parent?.disabled && !this.disabled()) {
      item.command?.();
      this.itemSelect.emit(item);
      this.onNodeSelect.emit(item);
    }
  }
}
