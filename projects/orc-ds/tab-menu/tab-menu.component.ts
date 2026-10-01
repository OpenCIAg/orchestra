import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';
import { RouterModule } from '@angular/router';

export interface TabMenuItem {
  label?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  command?: (event?: Event) => void;
  routerLink?: string | unknown[];
  [key: string]: unknown;
}

@Component({
  selector: 'orc-tab-menu',
  standalone: true,
  imports: [RouterModule],
  template: `<nav
    class="orc-tab-menu"
    [class.scrollable]="scrollable()"
    [class]="styleClass()"
    [style]="style()"
    [attr.aria-label]="effectiveAriaLabel()"
    [attr.aria-labelledby]="ariaLabelledBy()"
  >
    <ul role="tablist" aria-orientation="horizontal">
      @for (
        item of visibleItems();
        track trackItem(item, $index);
        let i = $index
      ) {
        <li role="presentation">
          @if (hasRouterLink(item) && !item.disabled) {
            <a
              #tabItem
              role="tab"
              [attr.aria-selected]="isActive(item)"
              [attr.tabindex]="isActive(item) ? 0 : -1"
              [routerLink]="item.routerLink"
              (click)="activate(item, $event)"
              (keydown)="onKeydown($event, i)"
            >
              @if (item.icon) {
                <span aria-hidden="true">{{ item.icon }}</span>
              }
              {{ item.label }}</a
            >
          } @else {
            <button
              #tabItem
              type="button"
              role="tab"
              [disabled]="!!item.disabled"
              [attr.aria-selected]="isActive(item)"
              [attr.tabindex]="isActive(item) ? 0 : -1"
              (click)="activate(item, $event)"
              (keydown)="onKeydown($event, i)"
            >
              @if (item.icon) {
                <span aria-hidden="true">{{ item.icon }}</span>
              }
              {{ item.label }}
            </button>
          }
        </li>
      }
    </ul>
  </nav>`,
  styles: [
    `
      .orc-tab-menu {
        display: block;
        overflow: auto;
      }
      .orc-tab-menu ul {
        display: flex;
        gap: 0.25rem;
        margin: 0;
        padding: 0;
        border-bottom: 1px solid var(--orc-border-default, #e2e8f0);
        list-style: none;
      }
      .orc-tab-menu button,
      .orc-tab-menu a {
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        padding: 0.65rem 0.85rem;
        color: var(--orc-text-secondary, #475569);
        text-decoration: none;
      }
      .orc-tab-menu button[aria-selected='true'],
      .orc-tab-menu a[aria-selected='true'] {
        border-bottom-color: var(--orc-interactive, #2563eb);
        color: var(--orc-interactive-hover, var(--orc-interactive, #1d4ed8));
        font-weight: 600;
      }
      .orc-tab-menu button:focus-visible,
      .orc-tab-menu a:focus-visible {
        outline: 2px solid var(--orc-interactive, #2563eb);
        outline-offset: 2px;
      }
      .orc-tab-menu button:disabled {
        opacity: 0.5;
      }
      .orc-tab-menu.scrollable ul {
        min-width: max-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabMenuComponent {
  readonly model = input<TabMenuItem[]>([]);
  readonly activeItem = model<TabMenuItem | undefined>(undefined);
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly itemSelect = output<TabMenuItem>();
  readonly effectiveAriaLabel = computed(() => {
    if (this.ariaLabelledBy()?.trim()) return undefined;
    return this.ariaLabel()?.trim() || 'Tab menu';
  });
  readonly visibleItems = computed(() =>
    this.model().filter((item) => item.visible !== false),
  );
  readonly enabledItems = computed(() =>
    this.visibleItems().filter((item) => !item.disabled),
  );
  // Kept as a button ElementRef for source compatibility; routed entries are
  // anchors, which expose the same focus/click methods used below.
  readonly tabItems = viewChildren<ElementRef<HTMLButtonElement>>('tabItem');
  readonly selectedItem = computed(() => {
    const active = this.activeItem();
    const enabled = this.enabledItems();
    return active && enabled.includes(active) ? active : enabled[0];
  });

  isActive(item: TabMenuItem): boolean {
    return this.selectedItem() === item;
  }

  /**
   * @deprecated Popup mode has no trigger or open-state API and therefore has no effect.
   * Use MenuComponent for popup navigation.
   */
  readonly popup = input(false, { transform: booleanAttribute });

  hasRouterLink(item: TabMenuItem): boolean {
    return item.routerLink !== undefined && item.routerLink !== null;
  }

  trackItem(item: TabMenuItem, index: number): unknown {
    const id = item['id'];
    return id === undefined || id === null
      ? `${item.label ?? ''}:${index}`
      : id;
  }

  activate(item: TabMenuItem, event: Event): void {
    if (
      item.disabled ||
      item.visible === false ||
      !this.visibleItems().includes(item)
    )
      return;
    this.activeItem.set(item);
    item.command?.(event);
    this.itemSelect.emit(item);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const key = event.key;
    if (
      key !== 'ArrowRight' &&
      key !== 'ArrowLeft' &&
      key !== 'Home' &&
      key !== 'End'
    )
      return;

    const visible = this.visibleItems();
    const enabled = this.enabledItems();
    const currentItem = visible[index];
    const current = enabled.indexOf(currentItem);
    if (!currentItem || current < 0 || !enabled.length) return;

    if (event.cancelable) event.preventDefault();

    const rtl = this.isRtl(event.currentTarget);
    const direction = key === 'ArrowRight' ? (rtl ? -1 : 1) : rtl ? 1 : -1;
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? enabled.length - 1
          : (current + direction + enabled.length) % enabled.length;
    const nextItem = enabled[next];
    const targetIndex = visible.indexOf(nextItem);
    const target = this.tabItems()[targetIndex]?.nativeElement;
    target?.focus();
    if (this.hasRouterLink(nextItem)) {
      target?.click();
    } else {
      this.activate(nextItem, event);
    }
  }

  private isRtl(target: EventTarget | null): boolean {
    const ownerDocument = (target as { ownerDocument?: Document | null } | null)
      ?.ownerDocument;
    const HTMLElementConstructor = ownerDocument?.defaultView?.HTMLElement;
    if (!HTMLElementConstructor || !(target instanceof HTMLElementConstructor))
      return false;
    const explicitDirection = target.closest('[dir]')?.getAttribute('dir');
    if (explicitDirection) return explicitDirection.toLowerCase() === 'rtl';
    const view = target.ownerDocument.defaultView;
    return view?.getComputedStyle(target).direction === 'rtl';
  }
}
