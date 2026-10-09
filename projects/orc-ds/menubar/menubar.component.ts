import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { ORC_SHARED_VARS, type OrcOption } from '@ciag/orchestra/internal';
import {
  crossedFocusBoundary,
  menuFocusTargets,
  stepMenuIndex,
} from '@ciag/orchestra/internal';

export interface MenubarItem extends OrcOption<string> {
  shortcut?: string;
  /** One child level is supported for the menubar disclosure; deeper descendants are not rendered. */
  children?: MenubarItem[];
  visible?: boolean;
  badge?: string;
}

let menubarInstanceId = 0;

@Component({
  selector: 'orc-menubar',
  standalone: true,
  template: `
    <nav
      class="orc-p2-menubar"
      [attr.id]="id()"
      [class]="'orc-p2-menubar ' + styleClass()"
      [style]="style()"
      [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null"
      role="menubar"
      aria-orientation="horizontal"
      [attr.aria-label]="label() || null"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      tabindex="-1"
      (keydown)="onKeydown($event)"
      (focusin)="onFocusIn($event)"
      (focusout)="onFocusOut($event)"
    >
      @for (item of effectiveItems(); track item.value ?? $index) {
        @if (item.visible !== false) {
          <div class="menu-item">
            <button
              type="button"
              data-menubar-item
              role="menuitem"
              [attr.tabindex]="isActive(item) ? tabindex() : -1"
              [attr.aria-haspopup]="hasVisibleChildren(item) ? 'menu' : null"
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
              [class.is-active]="isActive(item)"
              (click)="activate(item, $event)"
            >
              @if (item.icon) {
                <span class="menu-icon" aria-hidden="true">{{
                  item.icon
                }}</span>
              }
              <span class="menu-label">{{ item.label }}</span>
              @if (item.badge) {
                <span class="menu-badge">{{ item.badge }}</span>
              }
              @if (item.shortcut) {
                <small>{{ item.shortcut }}</small>
              }
            </button>
            @if (openItem() === item && hasVisibleChildren(item)) {
              <div
                class="submenu"
                role="menu"
                [attr.id]="submenuId($index)"
                [attr.aria-label]="item.label"
              >
                @for (child of item.children; track child.value ?? $index) {
                  @if (child.visible !== false) {
                    <button
                      type="button"
                      data-menubar-child
                      role="menuitem"
                      [attr.tabindex]="isActiveChild(child) ? tabindex() : -1"
                      [disabled]="child.disabled || disabled()"
                      (click)="activateChild(child, $event)"
                    >
                      @if (child.icon) {
                        <span class="menu-icon" aria-hidden="true">{{
                          child.icon
                        }}</span>
                      }
                      <span class="menu-label">{{ child.label }}</span>
                      @if (child.badge) {
                        <span class="menu-badge">{{ child.badge }}</span>
                      }
                      @if (child.shortcut) {
                        <small>{{ child.shortcut }}</small>
                      }
                    </button>
                  }
                }
              </div>
            }
          </div>
        }
      }
    </nav>
  `,
  styles: [
    ORC_SHARED_VARS +
      `
    .orc-p2-menubar { display: flex; gap: .2rem; align-items: center; padding: .25rem; border: 1px solid var(--orc-component-border); border-radius: .6rem; background: var(--orc-component-surface); }
    .menu-item { position: relative; }
    .orc-p2-menubar button { display: inline-flex; gap: .5rem; align-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text); padding: .5rem .7rem; }
    .orc-p2-menubar button:hover, .orc-p2-menubar button.is-active { background: var(--orc-component-interactive-soft); color: var(--orc-component-interactive-hover); }
    .menu-badge { border-radius: 999px; padding: .05rem .4rem; background: var(--orc-component-interactive-soft); }
    .orc-p2-menubar small { color: var(--orc-component-text-muted); }
    .submenu { position: absolute; z-index: 2; top: 100%; inset-inline-start: 0; display: grid; min-width: 10rem; padding: .3rem; border: 1px solid var(--orc-component-border); border-radius: .4rem; background: var(--orc-component-surface); box-shadow: 0 10px 24px var(--orc-component-shadow-color); }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenubarComponent {
  private readonly injector = inject(Injector);
  private readonly instanceId = ++menubarInstanceId;
  readonly items = input<MenubarItem[]>([]);
  readonly model = input<MenubarItem[] | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly tabindex = input(0);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly loop = input(true, { transform: booleanAttribute });
  readonly activeIndex = signal(0);
  readonly openItem = signal<MenubarItem | null>(null);
  readonly activeChild = signal<MenubarItem | null>(null);
  readonly childIndex = signal(0);
  readonly itemSelect = output<MenubarItem>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly menuKeydown = output<KeyboardEvent>();

  constructor() {
    effect(() => {
      const items = this.navigableItems();
      const index = this.activeIndex();
      if (items.length === 0 && index !== 0) this.activeIndex.set(0);
      else if (items.length > 0 && index >= items.length)
        this.activeIndex.set(items.length - 1);

      const openItem = this.openItem();
      if (!openItem) return;
      const currentItem = items.find(
        (item) => item === openItem || item.value === openItem.value,
      );
      if (!currentItem) {
        this.openItem.set(null);
        this.activeChild.set(null);
        this.childIndex.set(0);
        return;
      }
      if (currentItem !== openItem) this.openItem.set(currentItem);

      const children = this.visibleChildren(currentItem);
      const activeChild = this.activeChild();
      const currentChild =
        activeChild &&
        children.find(
          (child) => child === activeChild || child.value === activeChild.value,
        );
      if (children.length === 0) {
        this.openItem.set(null);
        this.activeChild.set(null);
        this.childIndex.set(0);
      } else if (!currentChild) {
        this.activeChild.set(children[0]);
        this.childIndex.set(0);
      } else if (currentChild !== activeChild) {
        this.activeChild.set(currentChild);
        this.childIndex.set(children.indexOf(currentChild));
      }
    });
  }

  onFocusOut(event: FocusEvent): void {
    if (crossedFocusBoundary(event)) {
      this.closeSubmenu(event.currentTarget as HTMLElement | null, false);
      this.onBlur.emit(event);
    }
  }

  effectiveItems(): MenubarItem[] {
    return this.model() ?? this.items();
  }
  navigableItems(): MenubarItem[] {
    return this.disabled()
      ? []
      : this.effectiveItems().filter(
          (item) => item.visible !== false && !item.disabled,
        );
  }

  visibleChildren(item: MenubarItem | null): MenubarItem[] {
    return this.disabled() || !item
      ? []
      : (item.children ?? []).filter(
          (child) => child.visible !== false && !child.disabled,
        );
  }

  hasVisibleChildren(item: MenubarItem): boolean {
    return this.visibleChildren(item).length > 0;
  }

  private activeRootIndex(): number {
    const count = this.navigableItems().length;
    return count ? Math.max(0, Math.min(count - 1, this.activeIndex())) : 0;
  }

  isActive(item: MenubarItem): boolean {
    return (
      !this.activeChild() &&
      this.navigableItems()[this.activeRootIndex()] === item
    );
  }
  isActiveChild(item: MenubarItem): boolean {
    return this.activeChild() === item;
  }
  submenuId(index: number): string {
    return `${this.id() || `orc-menubar-${this.instanceId}`}-submenu-${index}`;
  }

  private rootButtons(host: HTMLElement | null): HTMLButtonElement[] {
    return menuFocusTargets(
      host,
      ':scope > .menu-item > [data-menubar-item]',
    ) as HTMLButtonElement[];
  }

  private childButtons(host: HTMLElement | null): HTMLButtonElement[] {
    return menuFocusTargets(
      host,
      ':scope > .menu-item > .submenu[role="menu"] [data-menubar-child]',
    ) as HTMLButtonElement[];
  }

  private focusRoot(host: HTMLElement, index = this.activeRootIndex()): void {
    const buttons = this.rootButtons(host);
    buttons[index]?.focus();
  }

  private focusChild(host: HTMLElement, index = this.childIndex()): void {
    const buttons = this.childButtons(host);
    buttons[index]?.focus();
  }

  private hostFor(event: Event): HTMLElement | null {
    const target = event.currentTarget as HTMLElement | null;
    return target?.closest('[role="menubar"]') as HTMLElement | null;
  }

  private openSubmenu(
    item: MenubarItem,
    host: HTMLElement | null,
    last = false,
  ): void {
    const children = this.visibleChildren(item);
    if (!children.length) return;
    const rootIndex = this.navigableItems().indexOf(item);
    if (rootIndex >= 0) this.activeIndex.set(rootIndex);
    this.openItem.set(item);
    const childIndex = last ? children.length - 1 : 0;
    this.childIndex.set(childIndex);
    this.activeChild.set(children[childIndex]);
    if (host) {
      afterNextRender(
        () => {
          if (this.openItem() === item) this.focusChild(host, childIndex);
        },
        { injector: this.injector },
      );
    }
  }

  private closeSubmenu(host: HTMLElement | null, focusParent = true): void {
    const parent = this.openItem();
    if (parent && focusParent && host)
      this.focusRoot(host, this.navigableItems().indexOf(parent));
    this.openItem.set(null);
    this.activeChild.set(null);
    this.childIndex.set(0);
  }

  private moveRoot(delta: number, host: HTMLElement | null): void {
    const count = this.navigableItems().length;
    if (!count) return;
    this.closeSubmenu(host, false);
    this.activeChild.set(null);
    this.activeIndex.update((index) =>
      stepMenuIndex(index, delta, count, this.loop()),
    );
    if (host) this.focusRoot(host);
  }

  onFocusIn(event: FocusEvent): void {
    const host = this.hostFor(event);
    const target = event.target as HTMLElement | null;
    if (host && target) {
      const child = target.closest(
        '[data-menubar-child]',
      ) as HTMLButtonElement | null;
      if (child && host.contains(child) && this.openItem()) {
        const index = this.childButtons(host).indexOf(child);
        if (index >= 0) {
          this.childIndex.set(index);
          this.activeChild.set(
            this.visibleChildren(this.openItem())[index] ?? null,
          );
        }
      } else if (target.closest('[data-menubar-item]')) {
        const rootButton = target.closest(
          '[data-menubar-item]',
        ) as HTMLButtonElement;
        const index = this.rootButtons(host).indexOf(rootButton);
        if (index >= 0) {
          const rootItem = this.navigableItems()[index];
          if (this.openItem() && this.openItem() !== rootItem)
            this.closeSubmenu(host, false);
          this.activeIndex.set(index);
          this.activeChild.set(null);
        }
      }
    }
    if (crossedFocusBoundary(event)) this.onFocus.emit(event);
  }

  activate(item: MenubarItem, event?: Event): void {
    if (item.visible === false || item.disabled || this.disabled()) return;
    const index = this.navigableItems().indexOf(item);
    if (index >= 0) this.activeIndex.set(index);
    this.activeChild.set(null);
    const host = event ? this.hostFor(event) : null;
    if (this.hasVisibleChildren(item)) {
      if (this.openItem() === item) this.closeSubmenu(host, true);
      else this.openSubmenu(item, host);
      return;
    }
    this.closeSubmenu(host, false);
    this.itemSelect.emit(item);
  }

  activateChild(item: MenubarItem, event?: Event): void {
    if (item.visible === false || item.disabled || this.disabled()) return;
    const children = this.visibleChildren(this.openItem());
    const index = children.indexOf(item);
    if (index >= 0) {
      this.childIndex.set(index);
      this.activeChild.set(item);
    }
    this.closeSubmenu(event ? this.hostFor(event) : null, true);
    this.itemSelect.emit(item);
  }

  onKeydown(event: KeyboardEvent): void {
    this.menuKeydown.emit(event);
    if (this.disabled() || event.defaultPrevented) return;
    const host = this.hostFor(event);
    const target = event.target as HTMLElement | null;
    const childTarget = target?.closest(
      '[data-menubar-child]',
    ) as HTMLButtonElement | null;
    const open = this.openItem();
    const children = this.visibleChildren(open);
    if (childTarget && open && children.length) {
      const currentIndex = Math.max(
        0,
        this.childButtons(host ?? (target as HTMLElement)).indexOf(childTarget),
      );
      const current = children[currentIndex] ?? children[this.childIndex()];
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const next = stepMenuIndex(
          currentIndex,
          delta,
          children.length,
          this.loop(),
        );
        this.childIndex.set(next);
        this.activeChild.set(children[next]);
        if (host) this.focusChild(host, next);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : children.length - 1;
        this.childIndex.set(next);
        this.activeChild.set(children[next]);
        if (host) this.focusChild(host, next);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.closeSubmenu(host, true);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.moveRoot(event.key === 'ArrowRight' ? 1 : -1, host);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (current) this.activateChild(current, event);
      }
      return;
    }

    const items = this.navigableItems();
    const count = items.length;
    if (!count) return;
    const current = items[Math.max(0, Math.min(count - 1, this.activeIndex()))];
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      this.closeSubmenu(host, true);
      return;
    }
    if (
      event.key === 'ArrowDown' &&
      current &&
      this.hasVisibleChildren(current)
    ) {
      event.preventDefault();
      if (open !== current || !this.activeChild())
        this.openSubmenu(current, host);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.moveRoot(event.key === 'ArrowRight' ? 1 : -1, host);
    } else if (
      event.key === 'ArrowUp' &&
      current &&
      this.hasVisibleChildren(current)
    ) {
      event.preventDefault();
      if (open !== current || !this.activeChild())
        this.openSubmenu(current, host, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.closeSubmenu(host, false);
      this.activeChild.set(null);
      this.activeIndex.set(0);
      if (host) this.focusRoot(host, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.closeSubmenu(host, false);
      this.activeChild.set(null);
      this.activeIndex.set(count - 1);
      if (host) this.focusRoot(host, count - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (current) this.activate(current, event);
    }
  }
}
