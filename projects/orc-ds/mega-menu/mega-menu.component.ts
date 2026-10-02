import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import {
  crossedFocusBoundary,
  focusMenuTarget,
  P2_SHARED_STYLES,
  stepMenuIndex,
} from '@ciag/orchestra/internal';
import type { PrimeMenuItem } from '@ciag/orchestra/internal';

export type { PrimeMenuItem };

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
