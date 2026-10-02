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
import {
  crossedFocusBoundary,
  focusMenuTarget,
  listenForOutsideInteraction,
  menuFocusTargets,
  P2_SHARED_STYLES,
  stepMenuIndex,
} from '@ciag/orchestra/internal';
import type { PrimeMenuItem } from '@ciag/orchestra/internal';

export type { PrimeMenuItem };

/** Enabled roving-focus targets for the menu family DOM contract. */
const TIERED_ROOT_ITEMS =
  ':scope > [role="menuitem"]:not(:disabled):not([aria-disabled="true"])';
const TIERED_CHILD_ITEMS =
  '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])';
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
    this.visible() ? this.hide() : this.show();
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
      this.openItem() ? this.closeSubmenu(host) : this.hide();
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
