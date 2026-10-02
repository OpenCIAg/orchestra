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
import type { PrimeMenuItem } from './p2-advanced-components';
import {
  crossedFocusBoundary,
  focusMenuTarget,
  listenForOutsideInteraction,
  menuFocusTargets,
  stepMenuIndex,
} from '@ciag/orchestra/internal';

/** Enabled roving-focus targets for the menu family DOM contract. */
const TIERED_ROOT_ITEMS =
  ':scope > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])';
const TIERED_CHILD_ITEMS =
  '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])';
const MEGA_ITEMS = '[data-mega-item]:not(:disabled):not([data-mega-disabled])';

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

let nextTieredMenuId = 0;

@Component({
  selector: 'orc-tiered-menu',
  standalone: true,
  template: `
    @if (!popup() || visible()) {
      <nav
        #tieredHost
        class="p-tieredmenu p-component orc-advanced-menu"
        [attr.id]="id()"
        [class]="'p-tieredmenu p-component orc-advanced-menu ' + styleClass()"
        [style]="style()"
        [style.z-index]="popup() && autoZIndex() ? baseZIndex() + 1 : null"
        role="menu"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.tabindex]="-1"
        [attr.data-pc-name]="'tieredmenu'"
        [class.p-menu-overlay]="popup()"
        (focusin)="onFocusIn($event)"
        (focusout)="onFocusOut($event)"
        (keydown)="onKeydown($event)"
      >
        @for (item of effectiveItems(); track $index) {
          @if (item.visible !== false) {
            @if (item.separator) {
              <hr />
            } @else {
              @if (isLeafLink(item)) {
                <a
                  role="menuitem"
                  [class.active]="isActiveItem(item)"
                  [attr.tabindex]="
                    isActiveItem(item) && !disabled() ? tabindex() : -1
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
                  [class.active]="isActiveItem(item)"
                  [attr.tabindex]="
                    isActiveItem(item) && !disabled() ? tabindex() : -1
                  "
                  [attr.aria-haspopup]="
                    hasVisibleChildren(item) ? 'true' : null
                  "
                  [attr.aria-expanded]="
                    hasVisibleChildren(item)
                      ? openItem() === item
                        ? 'true'
                        : 'false'
                      : null
                  "
                  [attr.aria-controls]="
                    hasVisibleChildren(item) ? submenuId($index) : null
                  "
                  [disabled]="item.disabled || disabled()"
                  (click)="activate(item)"
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
                    <span aria-hidden="true">›</span>
                  }
                </button>
              }
              @if (hasVisibleChildren(item)) {
                <div
                  class="submenu"
                  [class.submenu-hidden]="openItem() !== item"
                  role="menu"
                  [attr.id]="submenuId($index)"
                  [attr.aria-label]="item.label"
                  [attr.aria-hidden]="openItem() === item ? null : 'true'"
                >
                  @for (child of item.items; track $index) {
                    @if (child.visible !== false) {
                      @if (child.separator) {
                        <hr />
                      } @else if (isLeafLink(child)) {
                        <a
                          role="menuitem"
                          [class.active]="isActiveChild(child)"
                          [attr.tabindex]="
                            isActiveChild(child) && !disabled()
                              ? tabindex()
                              : -1
                          "
                          [attr.href]="
                            child.disabled || disabled() ? null : child.url
                          "
                          [attr.target]="child.target || null"
                          [attr.rel]="
                            child.target === '_blank'
                              ? 'noopener noreferrer'
                              : null
                          "
                          [attr.aria-disabled]="
                            child.disabled || disabled() ? 'true' : null
                          "
                          (click)="activateChild(child)"
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
                          role="menuitem"
                          [class.active]="isActiveChild(child)"
                          [attr.tabindex]="
                            isActiveChild(child) && !disabled()
                              ? tabindex()
                              : -1
                          "
                          [disabled]="child.disabled || disabled()"
                          (click)="activateChild(child)"
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
      </nav>
    }
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-advanced-menu{position:relative;display:grid;min-width:12rem;padding:.35rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color)}.orc-advanced-menu button,.orc-advanced-menu a{display:flex;justify-content:space-between;gap:1.5rem;border:0;border-radius:.35rem;background:transparent;padding:.55rem .7rem;text-align:start;color:inherit;text-decoration:none}.orc-advanced-menu button:hover:not(:disabled),.orc-advanced-menu a:hover:not([aria-disabled="true"]){background:var(--orc-component-interactive-soft)}.orc-advanced-menu hr{width:100%;border:0;border-top:1px solid var(--orc-component-border)}.submenu{position:absolute;z-index:2;inset-inline-start:calc(100% - .25rem);top:2rem;display:grid;min-width:12rem;padding:.35rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color)}.submenu-hidden{visibility:hidden;pointer-events:none}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TieredMenuComponent implements OnDestroy {
  /** Root items and one child level are rendered; recursive grandchildren remain unsupported. */
  readonly items = input<PrimeMenuItem[]>([]);
  readonly model = input<PrimeMenuItem[] | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  /** @deprecated Compatibility-only input; TieredMenu renders in its own host and ignores attachment requests. */
  readonly appendTo = input<HTMLElement | string | null | undefined>(undefined);
  /** @deprecated Compatibility-only input; responsive breakpoint handling is not implemented. */
  readonly breakpoint = input('');
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  /** @deprecated Compatibility-only input; TieredMenu always follows explicit visibility state. */
  readonly autoDisplay = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility-only input; TieredMenu does not animate visibility transitions. */
  readonly showTransitionOptions = input('');
  /** @deprecated Compatibility-only input; TieredMenu does not animate visibility transitions. */
  readonly hideTransitionOptions = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly popup = input(false, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly visible = model(false);
  readonly openItem = signal<PrimeMenuItem | null>(null);
  readonly activeIndex = signal(0);
  readonly childActiveIndex = signal(0);
  private readonly childFocusActive = signal(false);
  readonly itemSelect = output<PrimeMenuItem>();
  readonly onItemClick = output<PrimeMenuItem>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  private readonly instanceId = ++nextTieredMenuId;
  private readonly injector = inject(Injector);
  readonly tieredHost = viewChild<ElementRef<HTMLElement>>('tieredHost');
  private readonly componentHost = inject(ElementRef<HTMLElement>);
  private handledVisible = false;
  private restoreFocus: HTMLElement | null = null;
  private restoreOnHide = true;
  private releaseOutsideDismissal: (() => void) | null = null;
  constructor() {
    effect(() => {
      const visible = this.visible();
      const popup = this.popup();
      this.syncVisibility(visible);
      if (visible && popup) this.bindOutsideDismissal();
      else this.unbindOutsideDismissal();
    });
  }
  onFocusOut(event: FocusEvent): void {
    const related = event.relatedTarget as Node | null;
    if (crossedFocusBoundary(event)) {
      this.onBlur.emit(event);
      if (this.popup() && this.visible() && related) this.hide(false);
    }
  }
  onFocusIn(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    const target = event.target as HTMLElement | null;
    const submenu = target?.closest<HTMLElement>('.submenu');
    if (submenu && target?.matches('[role="menuitem"]')) {
      const index = menuFocusTargets(submenu, TIERED_CHILD_ITEMS).indexOf(
        target,
      );
      if (index >= 0) {
        this.childActiveIndex.set(index);
        this.childFocusActive.set(true);
      }
    } else if (
      host &&
      target?.parentElement === host &&
      target.matches('[role="menuitem"]')
    ) {
      const index = menuFocusTargets(host, TIERED_ROOT_ITEMS).indexOf(target);
      if (index >= 0) {
        this.activeIndex.set(index);
        this.childFocusActive.set(false);
      }
    }
    if (crossedFocusBoundary(event)) this.onFocus.emit(event);
  }
  effectiveItems(): PrimeMenuItem[] {
    return this.model() ?? this.items();
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
  isActiveItem(item: PrimeMenuItem): boolean {
    return (
      !this.disabled() &&
      !this.childFocusActive() &&
      this.effectiveItems()
        .filter(
          (entry) =>
            entry.visible !== false && !entry.separator && !entry.disabled,
        )
        .at(this.activeIndex()) === item
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
  isActiveChild(item: PrimeMenuItem): boolean {
    return (
      !this.disabled() &&
      this.childFocusActive() &&
      this.childItems(this.openItem())[this.childActiveIndex()] === item
    );
  }
  submenuId(index: number): string {
    return `${this.id() || `orc-tieredmenu-${this.instanceId}`}-submenu-${index}`;
  }
  activate(item: PrimeMenuItem): void {
    if (item.visible === false || item.disabled || this.disabled()) return;
    if (this.hasVisibleChildren(item)) {
      this.activeIndex.set(
        this.effectiveItems()
          .filter(
            (entry) =>
              entry.visible !== false && !entry.separator && !entry.disabled,
          )
          .indexOf(item),
      );
      this.openSubmenu(item, this.tieredHost()?.nativeElement ?? null);
      return;
    }
    item.command?.();
    this.itemSelect.emit(item);
    this.onItemClick.emit(item);
    if (this.popup()) this.hide();
  }
  activateChild(item: PrimeMenuItem): void {
    if (item.visible === false || item.disabled || this.disabled()) return;
    item.command?.();
    this.itemSelect.emit(item);
    this.onItemClick.emit(item);
    if (this.popup()) this.hide();
  }
  private openSubmenu(
    item: PrimeMenuItem,
    host: HTMLElement | null = null,
  ): void {
    this.openItem.set(item);
    this.childActiveIndex.set(0);
    this.childFocusActive.set(false);
    if (host)
      afterNextRender(
        () => {
          if (this.openItem() === item)
            this.focusChildItem(this.tieredHost()?.nativeElement ?? host);
        },
        { injector: this.injector },
      );
  }
  private closeSubmenu(host: HTMLElement | null): void {
    const owner = this.openItem();
    if (!owner) return;
    const items = this.effectiveItems().filter(
      (item) => item.visible !== false && !item.separator && !item.disabled,
    );
    const index = items.indexOf(owner);
    this.openItem.set(null);
    this.childActiveIndex.set(0);
    this.childFocusActive.set(false);
    if (index >= 0) {
      this.activeIndex.set(index);
      this.focusRootItem(host, index);
    }
  }
  private focusRootItem(
    host: HTMLElement | null,
    index = this.activeIndex(),
  ): void {
    focusMenuTarget(host, TIERED_ROOT_ITEMS, index);
  }
  private focusChildItem(host: HTMLElement | null): void {
    const submenu =
      host?.querySelector<HTMLElement>('.submenu:not(.submenu-hidden)') ?? null;
    const child = menuFocusTargets(submenu, TIERED_CHILD_ITEMS)[
      this.childActiveIndex()
    ];
    if (child) {
      this.childFocusActive.set(true);
      child.focus();
    }
  }
  private syncVisibility(visible: boolean): void {
    if (visible === this.handledVisible) return;
    this.handledVisible = visible;
    if (visible) {
      this.restoreFocus = getOwnedActiveHTMLElement(this.ownerDocument());
      this.openItem.set(null);
      this.childFocusActive.set(false);
      this.onShow.emit();
      this.bindOutsideDismissal();
      afterNextRender(
        () => {
          if (this.visible())
            this.focusRootItem(this.tieredHost()?.nativeElement ?? null);
        },
        { injector: this.injector },
      );
    } else {
      this.openItem.set(null);
      this.childFocusActive.set(false);
      this.onHide.emit();
      this.unbindOutsideDismissal();
      const restore = this.restoreOnHide ? this.restoreFocus : null;
      this.restoreFocus = null;
      this.restoreOnHide = true;
      if (restore)
        queueMicrotask(() =>
          queueMicrotask(() => restore.isConnected && restore.focus()),
        );
    }
  }
  private bindOutsideDismissal(): void {
    if (!this.popup() || this.releaseOutsideDismissal) return;
    const ownerDocument = this.ownerDocument();
    if (!ownerDocument) return;
    this.releaseOutsideDismissal = listenForOutsideInteraction(
      ownerDocument,
      () => [this.tieredHost()?.nativeElement ?? null, this.restoreFocus],
      () => this.hide(),
    );
  }
  private unbindOutsideDismissal(): void {
    this.releaseOutsideDismissal?.();
    this.releaseOutsideDismissal = null;
  }
  private ownerDocument(): Document | null {
    return (
      this.tieredHost()?.nativeElement.ownerDocument ??
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
  ngOnDestroy(): void {
    this.unbindOutsideDismissal();
  }
  toggle(): void {
    if (this.visible()) this.hide();
    else this.show();
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const host = event.currentTarget as HTMLElement | null;
    const target = event.target as HTMLElement | null;
    const submenu = target?.closest<HTMLElement>('.submenu');
    const items = this.effectiveItems().filter(
      (item) => item.visible !== false && !item.separator && !item.disabled,
    );
    if (submenu && this.openItem()) {
      const children = this.childItems(this.openItem());
      const currentChildIndex = menuFocusTargets(
        submenu,
        TIERED_CHILD_ITEMS,
      ).indexOf(target as HTMLElement);
      if (currentChildIndex >= 0) this.childActiveIndex.set(currentChildIndex);
      const currentChild = children[this.childActiveIndex()];
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault();
        if (event.key === 'Home') this.childActiveIndex.set(0);
        else if (event.key === 'End')
          this.childActiveIndex.set(Math.max(0, children.length - 1));
        else {
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          this.childActiveIndex.update((index) =>
            stepMenuIndex(index, delta, children.length),
          );
        }
        this.focusChildItem(host);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'Escape') {
        event.preventDefault();
        this.closeSubmenu(host);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === 'Enter' && target?.tagName === 'A') return;
        event.preventDefault();
        if (currentChild) this.activateChild(currentChild);
        return;
      }
      return;
    }
    if (event.key === 'Enter' && target?.tagName === 'A') return;
    const current = items[this.activeIndex()];
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.openItem()) this.closeSubmenu(host);
      else this.hide();
      return;
    }
    if (
      event.key === 'ArrowRight' &&
      current &&
      this.hasVisibleChildren(current)
    ) {
      event.preventDefault();
      this.openSubmenu(current, host);
      return;
    }
    if (event.key === 'ArrowLeft' && this.openItem()) {
      event.preventDefault();
      this.closeSubmenu(host);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex.update((index) =>
        stepMenuIndex(index, delta, items.length),
      );
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      this.activeIndex.set(0);
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(Math.max(0, items.length - 1));
      if (host) this.focusActiveItem(host);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (current) this.activate(current);
    }
  }
  private focusActiveItem(host: HTMLElement): void {
    focusMenuTarget(host, TIERED_ROOT_ITEMS, this.activeIndex());
  }
}

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
      class="p-panelmenu p-component orc-panel-menu"
      [class]="'p-panelmenu p-component orc-panel-menu ' + styleClass()"
      [style]="style()"
      [attr.id]="id()"
      role="tree"
      [attr.aria-label]="ariaLabel()"
      [attr.tabindex]="-1"
      [attr.data-pc-name]="'panelmenu'"
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
    P2_SHARED_STYLES +
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

@Component({
  selector: 'orc-mega-menu',
  standalone: true,
  template: `<nav
    class="p-megamenu p-component orc-mega-menu"
    [class]="'p-megamenu p-component orc-mega-menu ' + styleClass()"
    [style]="style()"
    [attr.id]="id()"
    [attr.data-pc-name]="'megamenu'"
    [attr.aria-label]="ariaLabel()"
    [attr.aria-labelledby]="ariaLabelledBy()"
    [attr.aria-orientation]="orientation()"
    [attr.aria-disabled]="disabled() ? 'true' : null"
    [attr.tabindex]="navigableItems().length || disabled() ? -1 : tabindex()"
    [class.vertical]="orientation() === 'vertical'"
    role="menubar"
    (keydown)="onKeydown($event)"
    (focusin)="onFocusIn($event)"
    (focusout)="onFocusOut($event)"
  >
    @for (group of effectiveItems(); track $index) {
      @if (group.visible !== false) {
        <section role="group" [attr.aria-label]="group.label">
          <h3>{{ group.label }}</h3>
          @for (item of group.items || []; track $index) {
            @if (item.visible !== false) {
              @if (item.url) {
                <a
                  role="menuitem"
                  data-mega-item
                  [attr.data-mega-disabled]="
                    itemDisabled(group, item) ? 'true' : null
                  "
                  [attr.href]="itemDisabled(group, item) ? null : item.url"
                  [attr.target]="item.target || null"
                  [attr.rel]="
                    item.target === '_blank' ? 'noopener noreferrer' : null
                  "
                  [attr.aria-disabled]="
                    itemDisabled(group, item) ? 'true' : null
                  "
                  [attr.tabindex]="
                    !itemDisabled(group, item) && isActive(item)
                      ? tabindex()
                      : -1
                  "
                  (click)="select(item)"
                >
                  @if (item.icon) {
                    <span class="item-icon" aria-hidden="true">{{
                      item.icon
                    }}</span>
                  }
                  <span class="item-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="badge">{{ item.badge }}</span>
                  }
                </a>
              } @else {
                <button
                  type="button"
                  role="menuitem"
                  data-mega-item
                  [attr.data-mega-disabled]="
                    itemDisabled(group, item) ? 'true' : null
                  "
                  [attr.tabindex]="
                    !itemDisabled(group, item) && isActive(item)
                      ? tabindex()
                      : -1
                  "
                  [disabled]="itemDisabled(group, item)"
                  (click)="select(item)"
                >
                  @if (item.icon) {
                    <span class="item-icon" aria-hidden="true">{{
                      item.icon
                    }}</span>
                  }
                  <span class="item-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="badge">{{ item.badge }}</span>
                  }
                </button>
              }
            }
          }
        </section>
      }
    }
  </nav>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-mega-menu{display:flex;flex-wrap:wrap;gap:1.5rem;padding:1rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface)}.orc-mega-menu.vertical{flex-direction:column;align-items:stretch}.orc-mega-menu section{display:grid;align-content:start;min-width:10rem;gap:.25rem}.orc-mega-menu.vertical section{width:100%}.orc-mega-menu h3{margin:0 0 .35rem;font-size:.85rem}.orc-mega-menu [data-mega-item]{display:flex;align-items:center;gap:.5rem;width:100%;border:0;border-radius:.35rem;background:transparent;color:inherit;padding:.4rem;text-align:start;text-decoration:none}.orc-mega-menu [data-mega-item]:hover:not(:disabled):not([aria-disabled="true"]){background:var(--orc-component-interactive-soft)}.orc-mega-menu [data-mega-item]:focus-visible{outline:2px solid var(--orc-component-interactive);outline-offset:2px}.orc-mega-menu .item-label{flex:1}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MegaMenuComponent {
  readonly items = input<PrimeMenuItem[]>([]);
  readonly model = input<PrimeMenuItem[] | undefined>(undefined);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly itemSelect = output<PrimeMenuItem>();
  readonly onItemClick = output<PrimeMenuItem>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly activeIndex = signal(0);

  effectiveItems(): PrimeMenuItem[] {
    return this.model() ?? this.items();
  }

  navigableItems(): PrimeMenuItem[] {
    if (this.disabled()) return [];
    return this.effectiveItems()
      .filter((group) => group.visible !== false && !group.disabled)
      .flatMap((group) =>
        (group.items ?? []).filter(
          (item) => item.visible !== false && !item.disabled,
        ),
      );
  }

  isActive(item: PrimeMenuItem): boolean {
    const items = this.navigableItems();
    const index = Math.min(this.activeIndex(), Math.max(0, items.length - 1));
    return items[index] === item;
  }

  onFocusIn(event: FocusEvent): void {
    if (crossedFocusBoundary(event)) this.onFocus.emit(event);
  }

  onFocusOut(event: FocusEvent): void {
    if (crossedFocusBoundary(event)) this.onBlur.emit(event);
  }

  private focusActive(host: HTMLElement): void {
    focusMenuTarget(host, MEGA_ITEMS, this.activeIndex());
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const items = this.navigableItems();
    if (!items.length) return;
    const forwardKey =
      this.orientation() === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const backwardKey =
      this.orientation() === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const host = event.currentTarget as HTMLElement | null;
    if (event.key === forwardKey || event.key === backwardKey) {
      event.preventDefault();
      const delta = event.key === forwardKey ? 1 : -1;
      this.activeIndex.update((index) =>
        stepMenuIndex(index, delta, items.length),
      );
      if (host) this.focusActive(host);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(event.key === 'Home' ? 0 : items.length - 1);
      if (host) this.focusActive(host);
    }
  }

  itemDisabled(group: PrimeMenuItem, item: PrimeMenuItem): boolean {
    return this.disabled() || !!group.disabled || !!item.disabled;
  }

  select(item: PrimeMenuItem): void {
    const allowed = this.effectiveItems()
      .filter(
        (group) =>
          group.visible !== false && !group.disabled && !this.disabled(),
      )
      .some((group) => (group.items ?? []).includes(item));
    if (
      !this.disabled() &&
      allowed &&
      item.visible !== false &&
      !item.disabled
    ) {
      item.command?.();
      this.itemSelect.emit(item);
      this.onItemClick.emit(item);
    }
  }
}
