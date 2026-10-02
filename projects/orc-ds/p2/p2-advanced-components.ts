import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export interface PrimeMenuItem {
  /** Menu destinations apply to leaf items; items with children remain disclosure buttons. */
  label: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  url?: string;
  target?: string;
  badge?: string;
  separator?: boolean;
  items?: PrimeMenuItem[];
  command?: () => void;
}

let nextMenuId = 0;

function getOwnedActiveHTMLElement(
  ownerDocument: Document | null,
): HTMLElement | null {
  const active = ownerDocument?.activeElement ?? null;
  const HTMLElementConstructor = ownerDocument?.defaultView?.HTMLElement;
  if (
    !ownerDocument ||
    !active ||
    !HTMLElementConstructor ||
    !(active instanceof HTMLElementConstructor) ||
    active === ownerDocument.body
  ) {
    return null;
  }
  return active;
}

@Component({
  selector: 'orc-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #renderItems let-menuItems>
      @for (item of menuItems; track $index) {
        @if (item.visible !== false) {
          @if (item.separator) {
            <hr />
          } @else {
            <div class="menu-entry">
              @if (isLeafLink(item)) {
                <a
                  role="menuitem"
                  [attr.data-orc-menu-item]="itemDomId(item)"
                  [class.active]="isActive(item)"
                  [attr.tabindex]="
                    isActive(item) && !disabled() ? tabindex() : -1
                  "
                  [attr.href]="item.disabled || disabled() ? null : item.url"
                  [attr.target]="item.target || null"
                  [attr.rel]="
                    item.target === '_blank' ? 'noopener noreferrer' : null
                  "
                  [attr.aria-disabled]="
                    item.disabled || disabled() ? 'true' : null
                  "
                  (click)="activate(item)"
                  (keydown)="onKeydown($event, item)"
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
                  role="menuitem"
                  [attr.data-orc-menu-item]="itemDomId(item)"
                  [class.active]="isActive(item)"
                  [attr.tabindex]="
                    isActive(item) && !disabled() ? tabindex() : -1
                  "
                  [attr.aria-haspopup]="
                    hasVisibleChildren(item) ? 'true' : null
                  "
                  [attr.aria-expanded]="
                    hasVisibleChildren(item)
                      ? isExpanded(item)
                        ? 'true'
                        : 'false'
                      : null
                  "
                  [attr.aria-controls]="
                    hasVisibleChildren(item) ? submenuId(item) : null
                  "
                  [disabled]="disabled() || item.disabled"
                  (click)="activate(item)"
                  (keydown)="onKeydown($event, item)"
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
                    <span aria-hidden="true">{{
                      isExpanded(item) ? '−' : '›'
                    }}</span>
                  }
                </button>
              }
              @if (hasVisibleChildren(item)) {
                <ul
                  role="menu"
                  [attr.id]="submenuId(item)"
                  [attr.aria-label]="item.label"
                  [attr.aria-hidden]="isExpanded(item) ? null : 'true'"
                  [class.menu-submenu-hidden]="!isExpanded(item)"
                >
                  <ng-container
                    *ngTemplateOutlet="
                      renderItems;
                      context: { $implicit: item.items }
                    "
                  />
                </ul>
              }
            </div>
          }
        }
      }
    </ng-template>
    @if (!popup() || visible()) {
      <nav
        #menuHost
        class="p-menu p-component orc-menu"
        [attr.id]="id()"
        [class]="'p-menu p-component orc-menu ' + styleClass()"
        [style]="style()"
        [style.z-index]="popup() && autoZIndex() ? baseZIndex() + 1 : null"
        role="menu"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.tabindex]="-1"
        [attr.data-pc-name]="'menu'"
        [class.p-menu-overlay]="popup()"
        (focusin)="onFocusIn($event)"
        (focusout)="onFocusOut($event)"
        (keydown)="onKeydown($event)"
      >
        <ng-container
          *ngTemplateOutlet="
            renderItems;
            context: { $implicit: effectiveModel() }
          "
        />
      </nav>
    }
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-menu{display:grid;min-width:12rem;padding:.35rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color)}.menu-entry{position:relative}.menu-item-content{display:inline-flex;align-items:center;gap:.5rem;min-width:0}.orc-menu button,.orc-menu a{display:flex;justify-content:space-between;gap:1rem;width:100%;border:0;border-radius:.35rem;background:transparent;padding:.55rem .7rem;text-align:start;color:inherit;text-decoration:none}.orc-menu button:hover:not(:disabled),.orc-menu a:hover:not([aria-disabled="true"]){background:var(--orc-component-interactive-soft)}.orc-menu hr{width:100%;border:0;border-top:1px solid var(--orc-component-border)}.orc-menu ul{position:absolute;z-index:2;top:0;inset-inline-start:calc(100% - .25rem);display:grid;min-width:12rem;margin:0;padding:.35rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color);list-style:none}.menu-submenu-hidden{display:none}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnDestroy {
  readonly model = input<PrimeMenuItem[] | undefined>(undefined);
  readonly items = input<PrimeMenuItem[]>([]);
  readonly popup = input(false, { transform: booleanAttribute });
  readonly visible = model(false);
  readonly id = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  /** @deprecated Compatibility-only input; Menu renders inline and ignores attachment requests. */
  readonly appendTo = input<HTMLElement | string | null | undefined>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  /** @deprecated Compatibility-only input; Menu does not animate visibility transitions. */
  readonly showTransitionOptions = input('');
  /** @deprecated Compatibility-only input; Menu does not animate visibility transitions. */
  readonly hideTransitionOptions = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly itemSelect = output<PrimeMenuItem>();
  readonly onItemClick = output<PrimeMenuItem>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly activeIndex = signal(0);
  readonly activeItem = signal<PrimeMenuItem | null>(null);
  readonly openItems = signal<ReadonlySet<PrimeMenuItem>>(new Set());
  readonly menuHost = viewChild<ElementRef<HTMLElement>>('menuHost');
  private readonly injector = inject(Injector);
  private readonly componentHost = inject(ElementRef<HTMLElement>);
  private readonly itemIds = new WeakMap<PrimeMenuItem, string>();
  private readonly itemsById = new Map<string, PrimeMenuItem>();
  private restoreFocus: HTMLElement | null = null;
  private handledVisible = false;
  private restoreOnHide = true;
  private outsideDocument: Document | null = null;
  private outsidePointerHandler: ((event: PointerEvent) => void) | null = null;
  private readonly instanceId = ++nextMenuId;
  private nextItemId = 0;
  constructor() {
    effect(() => {
      const visible = this.visible();
      const popup = this.popup();
      this.syncVisibility(visible);
      if (visible && !popup) this.unbindOutsideDismissal();
      else if (visible && popup) this.bindOutsideDismissal();
    });
  }
  effectiveModel(): PrimeMenuItem[] {
    return this.model() ?? this.items();
  }
  onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const id = target
      ?.closest<HTMLElement>('[data-orc-menu-item]')
      ?.getAttribute('data-orc-menu-item');
    const item = id ? this.itemsById.get(id) : undefined;
    if (item && !this.disabled() && !item.disabled) {
      const context = this.menuContext(item);
      if (context?.parent) this.activeItem.set(item);
      else {
        this.activeItem.set(null);
        const index = this.navigableItems().indexOf(item);
        if (index >= 0) this.activeIndex.set(index);
      }
    }
    const host = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (!host || !related || !host.contains(related)) this.onFocus.emit(event);
  }
  onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (!host || !related || !host.contains(related)) {
      this.onBlur.emit(event);
      if (this.popup() && this.visible() && related) this.hide(false);
    }
  }
  navigableItems(): PrimeMenuItem[] {
    return this.disabled()
      ? []
      : this.effectiveModel().filter(
          (item) => item.visible !== false && !item.separator && !item.disabled,
        );
  }
  visibleChildren(item: PrimeMenuItem): PrimeMenuItem[] {
    return item.items?.filter((child) => child.visible !== false) ?? [];
  }
  hasVisibleChildren(item: PrimeMenuItem): boolean {
    return this.visibleChildren(item).length > 0;
  }
  isLeafLink(item: PrimeMenuItem): boolean {
    return !!item.url && !item.items?.length;
  }
  isExpanded(item: PrimeMenuItem): boolean {
    return this.openItems().has(item);
  }
  submenuId(item: PrimeMenuItem): string {
    return `${this.id() || `orc-menu-${this.instanceId}`}-${this.itemDomId(item)}-submenu`;
  }
  itemDomId(item: PrimeMenuItem): string {
    let id = this.itemIds.get(item);
    if (!id) {
      id = `menu-item-${++this.nextItemId}`;
      this.itemIds.set(item, id);
    }
    this.itemsById.set(id, item);
    return id;
  }
  isActive(item: PrimeMenuItem): boolean {
    return (
      !this.disabled() &&
      (this.activeItem() === item ||
        (!this.activeItem() &&
          this.navigableItems()[this.activeIndex()] === item))
    );
  }
  private menuContext(
    item: PrimeMenuItem,
    items = this.effectiveModel(),
    parent: PrimeMenuItem | null = null,
  ): { parent: PrimeMenuItem | null; siblings: PrimeMenuItem[] } | null {
    if (items.includes(item)) return { parent, siblings: items };
    for (const candidate of items) {
      const found =
        candidate.items && this.menuContext(item, candidate.items, candidate);
      if (found) return found;
    }
    return null;
  }
  private containsMenuItem(
    root: PrimeMenuItem,
    target: PrimeMenuItem,
  ): boolean {
    return !!root.items?.some(
      (child) => child === target || this.containsMenuItem(child, target),
    );
  }
  private toggleSubmenu(item: PrimeMenuItem, focusChild: boolean): void {
    const next = new Set(this.openItems());
    if (next.has(item)) {
      next.delete(item);
      for (const candidate of next)
        if (this.containsMenuItem(item, candidate)) next.delete(candidate);
    } else {
      const context = this.menuContext(item);
      for (const sibling of context?.siblings ?? [])
        if (sibling !== item && next.has(sibling)) {
          next.delete(sibling);
          for (const candidate of next)
            if (this.containsMenuItem(sibling, candidate))
              next.delete(candidate);
        }
      next.add(item);
    }
    this.openItems.set(next);
    if (focusChild && next.has(item))
      afterNextRender(
        () => {
          if (!this.visible() && this.popup()) return;
          const host = this.menuHost()?.nativeElement;
          const submenu = Array.from(
            host?.querySelectorAll<HTMLElement>('ul[role="menu"]') ?? [],
          ).find((candidate) => candidate.id === this.submenuId(item));
          const first = submenu?.querySelector<HTMLElement>(
            ':scope > .menu-entry > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
          );
          if (first) this.focusMenuItem(first, false);
        },
        { injector: this.injector },
      );
  }
  activate(item: PrimeMenuItem): void {
    if (
      this.disabled() ||
      item.visible === false ||
      item.disabled ||
      item.separator
    )
      return;
    if (this.hasVisibleChildren(item)) {
      this.toggleSubmenu(item, true);
      return;
    }
    const index = this.navigableItems().indexOf(item);
    if (index >= 0) {
      this.activeIndex.set(index);
      this.activeItem.set(null);
    } else this.activeItem.set(item);
    item.command?.();
    this.itemSelect.emit(item);
    this.onItemClick.emit(item);
    if (this.popup()) this.hide();
  }
  private syncVisibility(visible: boolean): void {
    if (visible === this.handledVisible) return;
    this.handledVisible = visible;
    if (visible) {
      this.restoreFocus = getOwnedActiveHTMLElement(this.ownerDocument());
      this.activeItem.set(null);
      this.openItems.set(new Set());
      this.onShow.emit();
      this.bindOutsideDismissal();
      afterNextRender(
        () => {
          if (this.visible()) {
            const host = this.menuHost()?.nativeElement;
            if (host) this.focusActiveItem(host);
          }
        },
        { injector: this.injector },
      );
    } else {
      this.openItems.set(new Set());
      this.onHide.emit();
      this.unbindOutsideDismissal();
      const restore = this.restoreOnHide ? this.restoreFocus : null;
      this.restoreFocus = null;
      this.restoreOnHide = true;
      if (restore) queueMicrotask(() => restore.isConnected && restore.focus());
    }
  }
  private bindOutsideDismissal(): void {
    if (!this.popup() || this.outsidePointerHandler) return;
    const ownerDocument = this.ownerDocument();
    if (!ownerDocument) return;
    this.outsideDocument = ownerDocument;
    this.outsidePointerHandler = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const host = this.menuHost()?.nativeElement;
      if (host?.contains(target) || this.restoreFocus?.contains(target)) return;
      this.hide();
    };
    ownerDocument.addEventListener(
      'pointerdown',
      this.outsidePointerHandler,
      true,
    );
  }
  private unbindOutsideDismissal(): void {
    if (this.outsideDocument && this.outsidePointerHandler)
      this.outsideDocument.removeEventListener(
        'pointerdown',
        this.outsidePointerHandler,
        true,
      );
    this.outsideDocument = null;
    this.outsidePointerHandler = null;
  }
  private ownerDocument(): Document | null {
    return (
      this.menuHost()?.nativeElement.ownerDocument ??
      this.componentHost.nativeElement.ownerDocument ??
      null
    );
  }
  show(): void {
    if (!this.visible()) {
      this.visible.set(true);
      this.syncVisibility(true);
    }
  }
  hide(restoreFocus = true): void {
    if (this.visible()) {
      this.restoreOnHide = restoreFocus;
      this.visible.set(false);
      this.syncVisibility(false);
    }
  }
  toggle(): void {
    if (this.visible()) this.hide();
    else this.show();
  }
  ngOnDestroy(): void {
    this.unbindOutsideDismissal();
  }
  onKeydown(event: KeyboardEvent, item?: PrimeMenuItem): void {
    const target = event.target as HTMLElement | null;
    const current = target?.closest<HTMLElement>('[role="menuitem"]');
    const host =
      (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(
        'nav',
      ) ?? (event.currentTarget as HTMLElement | null);
    if (item && current) event.stopPropagation();
    if (item && current) {
      const submenu = current.closest('ul[role="menu"]');
      const siblings = Array.from(
        (submenu ?? host)?.querySelectorAll<HTMLElement>(
          ':scope > .menu-entry > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
        ) ?? [],
      );
      const currentIndex = siblings.indexOf(current);
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault();
        if (siblings.length) {
          const nextIndex =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? siblings.length - 1
                : (currentIndex +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    siblings.length) %
                  siblings.length;
          this.focusMenuItem(siblings[nextIndex], submenu === null);
        }
        return;
      }
      if (event.key === 'ArrowRight') {
        const child = current.parentElement?.querySelector<HTMLElement>(
          ':scope > ul[role="menu"] > .menu-entry > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
        );
        if (child) {
          event.preventDefault();
          const owner = current.parentElement?.querySelector<HTMLElement>(
            ':scope > [role="menuitem"]',
          );
          const ownerItem =
            owner &&
            this.itemsById.get(owner.getAttribute('data-orc-menu-item') || '');
          if (ownerItem && !this.isExpanded(ownerItem)) {
            this.toggleSubmenu(ownerItem, false);
            afterNextRender(() => this.focusMenuItem(child, false), {
              injector: this.injector,
            });
          } else this.focusMenuItem(child, false);
        }
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (submenu) {
          const parent = submenu.parentElement?.querySelector<HTMLElement>(
            ':scope > [role="menuitem"]',
          );
          if (parent) {
            event.preventDefault();
            const parentItem = this.itemsById.get(
              parent.getAttribute('data-orc-menu-item') || '',
            );
            if (parentItem) this.toggleSubmenu(parentItem, false);
            this.focusMenuItem(parent, !parent.closest('ul[role="menu"]'));
          }
        } else if (item && this.isExpanded(item)) {
          event.preventDefault();
          this.toggleSubmenu(item, false);
        }
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === 'Enter' && current.tagName === 'A') return;
        event.preventDefault();
        this.activate(item);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        const parent = submenu?.parentElement?.querySelector<HTMLElement>(
          ':scope > [role="menuitem"]',
        );
        const parentItem =
          parent &&
          this.itemsById.get(parent.getAttribute('data-orc-menu-item') || '');
        if (parentItem) {
          this.toggleSubmenu(parentItem, false);
          this.focusMenuItem(parent, !parent.closest('ul[role="menu"]'));
        } else if (item && this.isExpanded(item))
          this.toggleSubmenu(item, false);
        else this.hide();
        return;
      }
      return;
    }
    const items = this.navigableItems();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
      return;
    }
    if (item && this.hasVisibleChildren(item) && event.key === 'ArrowLeft') {
      event.preventDefault();
      this.toggleSubmenu(item, false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeItem.set(null);
      this.activeIndex.update((index) =>
        items.length ? (index + delta + items.length) % items.length : 0,
      );
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      this.activeItem.set(null);
      this.activeIndex.set(0);
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      this.activeItem.set(null);
      this.activeIndex.set(Math.max(0, items.length - 1));
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const currentItem = items[this.activeIndex()];
      if (currentItem) this.activate(currentItem);
    }
  }
  private focusMenuItem(element: HTMLElement, root: boolean): void {
    const item = this.itemsById.get(
      element.getAttribute('data-orc-menu-item') || '',
    );
    if (item) {
      if (root) {
        this.activeItem.set(null);
        this.activeIndex.set(this.navigableItems().indexOf(item));
      } else this.activeItem.set(item);
    }
    element.focus();
  }
  private focusActiveItem(host: HTMLElement): void {
    host
      .querySelectorAll<HTMLElement>(
        ':scope > .menu-entry > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
      )
      [this.activeIndex()]?.focus();
  }
}

export { BlockUiComponent } from './p2-block-ui-component';
export type { BlockUiTarget } from './p2-block-ui-component';

export {
  ConfirmDialogComponent,
  ConfirmationService,
} from './p2-confirm-dialog-component';
export type { ConfirmationRequest } from './p2-confirm-dialog-component';

export { DataViewComponent } from './p2-data-view-component';
