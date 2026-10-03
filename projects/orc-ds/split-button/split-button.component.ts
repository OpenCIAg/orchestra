import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {
  normalizeSize,
  P2_SHARED_VARS,
  SizeInput,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-split-button',
  standalone: true,
  template: `<div
    class="orc-p2-split"
    [class]="
      'orc-p2-split ' +
      styleClass() +
      (resolvedSize() === 'sm' ? ' size-small' : '') +
      (resolvedSize() === 'lg' ? ' size-large' : '') +
      (severity() ? ' severity-' + severity() : '')
    "
    [style]="style()"
    (focusout)="onFocusOut($event)"
  >
    <button
      type="button"
      class="orc-p2-split__primary"
      [class.icon-right]="iconPos() === 'right'"
      [disabled]="buttonDisabled() || disabled() || loading()"
      [autofocus]="autofocus()"
      [attr.tabindex]="tabindex()"
      [attr.title]="tooltip() || null"
      [attr.aria-label]="label() ? null : ariaLabel() || tooltip() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="onDefaultButtonClick($event)"
    >
      @if (loading()) {
        <span aria-hidden="true">…</span>
      } @else {
        @if (icon() && iconPos() === 'left') {
          <span aria-hidden="true">{{ icon() }}</span>
        }
        @if (label()) {
          <span>{{ label() }}</span>
        }
        @if (icon() && iconPos() === 'right') {
          <span aria-hidden="true">{{ icon() }}</span>
        }
      }</button
    ><button
      type="button"
      class="arrow"
      [disabled]="menuButtonDisabled() || disabled() || loading()"
      [attr.tabindex]="tabindex()"
      (click)="toggleOpen($event)"
      (keydown)="onTriggerKeydown($event)"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="isMenuOpen()"
      [attr.aria-controls]="menuId"
      [attr.aria-label]="expandAriaLabel() || 'More options'"
    >
      ⌄
    </button>
    @if (isMenuOpen()) {
      <div
        class="orc-p2-split__menu"
        [class]="'orc-p2-split__menu ' + menuStyleClass()"
        [style]="menuStyle()"
        [attr.id]="menuId"
        role="menu"
        (keydown)="onMenuKeydown($event)"
      >
        @for (item of effectiveModel(); track $index) {
          @if (item.visible !== false) {
            <button
              type="button"
              role="menuitem"
              [attr.tabindex]="-1"
              [disabled]="item.disabled"
              (click)="activate(item)"
            >
              @if (item.icon) {
                <span aria-hidden="true">{{ item.icon }}</span>
              }
              <span>{{ item.label }}</span>
            </button>
          }
        }
        <ng-content />
      </div>
    }
  </div>`,
  styles: [
    P2_SHARED_VARS +
      `.orc-p2-split{position:relative;display:inline-flex}.orc-p2-split>button{border:1px solid var(--orc-component-interactive);padding:.55rem .8rem;background:var(--orc-component-interactive);color:var(--orc-component-on-interactive)}.orc-p2-split__primary{display:inline-flex;align-items:center;gap:.4rem}.orc-p2-split__primary.icon-right{flex-direction:row-reverse}.orc-p2-split.size-small>button{font-size:.875rem;padding:.4rem .6rem}.orc-p2-split.size-large>button{font-size:1.125rem;padding:.7rem .9rem}.orc-p2-split.severity-secondary>button{border-color:var(--orc-component-border-strong);background:var(--orc-component-surface-subtle);color:var(--orc-component-text)}.orc-p2-split.severity-success>button{border-color:var(--orc-component-status-success-fg);background:var(--orc-component-status-success-bg);color:var(--orc-component-status-success-fg)}.orc-p2-split.severity-info>button{border-color:var(--orc-component-status-info-fg);background:var(--orc-component-status-info-bg);color:var(--orc-component-status-info-fg)}.orc-p2-split.severity-warning>button,.orc-p2-split.severity-warn>button{border-color:var(--orc-component-status-warning-fg);background:var(--orc-component-status-warning-bg);color:var(--orc-component-status-warning-fg)}.orc-p2-split.severity-danger>button{border-color:var(--orc-component-status-danger-fg);background:var(--orc-component-status-danger-bg);color:var(--orc-component-status-danger-fg)}.orc-p2-split>.arrow{border-left-color:var(--orc-component-interactive-hover);border-radius:0 .4rem .4rem 0}.orc-p2-split>button:first-child{border-radius:.4rem 0 0 .4rem}.orc-p2-split__menu{position:absolute;z-index:3;top:calc(100% + .25rem);inset-inline-end:0;min-width:10rem;padding:.35rem;border:1px solid var(--orc-component-border);border-radius:.4rem;background:var(--orc-component-surface);box-shadow:0 8px 20px var(--orc-component-shadow-color)}.orc-p2-split__menu [role=menuitem]{display:flex;align-items:center;gap:.4rem;width:100%;border:0;border-radius:.25rem;background:transparent;color:var(--orc-component-text);text-align:start}.orc-p2-split__menu [role=menuitem]:hover:not(:disabled),.orc-p2-split__menu [role=menuitem]:focus-visible{background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitButtonComponent implements AfterViewInit, OnDestroy {
  private static nextMenuId = 0;
  readonly menuId = `orc-p2-split-menu-${++SplitButtonComponent.nextMenuId}`;
  readonly model = input<
    Array<{
      label: string;
      icon?: string;
      disabled?: boolean;
      visible?: boolean;
      command?: () => void;
    }>
  >([]);
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly icon = input('');
  readonly iconPos = input<'left' | 'right'>('left');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly menuStyle = input<Record<string, any> | null | undefined>(undefined);
  readonly menuStyleClass = input('');
  /** @deprecated Compatibility-only input; SplitButton renders its menu in place and does not portal to an append target. */
  readonly appendTo = input<unknown>(undefined);
  readonly expandAriaLabel = input<string | undefined>(undefined);
  readonly tooltip = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly buttonDisabled = input(false, { transform: booleanAttribute });
  readonly menuButtonDisabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /**
   * Visual size on the canonical `sm | md | lg` scale (`md` renders as the
   * default middle size). Deprecated legacy values (removed at the 23.0.0
   * gate): `small` → `sm`, `large` → `lg`.
   */
  readonly size = input<SizeInput>(undefined);
  /** Canonical form of the public `size` input (legacy aliases resolved). */
  readonly resolvedSize = computed(() => normalizeSize(this.size()));
  readonly severity = input<string | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly open = model(false);
  readonly primaryClick = output<Event>();
  readonly onClick = output<Event>();
  readonly dropdownClick = output<Event>();
  readonly onDropdownClick = output<Event>();
  readonly onMenuShow = output<void>();
  readonly onMenuHide = output<void>();
  private ownerDocument: Document | null = null;
  private readonly documentPointerDown = (event: PointerEvent): void =>
    this.onOutsidePointer(event);
  private readonly documentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.onEscape();
  };

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    this.ownerDocument = ownerDocument;
    ownerDocument.addEventListener('pointerdown', this.documentPointerDown);
    ownerDocument.addEventListener('keydown', this.documentKeydown);
  }

  ngOnDestroy(): void {
    this.ownerDocument?.removeEventListener(
      'pointerdown',
      this.documentPointerDown,
    );
    this.ownerDocument?.removeEventListener('keydown', this.documentKeydown);
    this.ownerDocument = null;
  }

  isMenuOpen(): boolean {
    return (
      this.open() &&
      !this.disabled() &&
      !this.menuButtonDisabled() &&
      !this.loading()
    );
  }
  effectiveModel(): Array<{
    label: string;
    icon?: string;
    disabled?: boolean;
    visible?: boolean;
    command?: () => void;
  }> {
    return this.model();
  }

  activate(item: {
    disabled?: boolean;
    visible?: boolean;
    command?: () => void;
  }): void {
    if (!this.isMenuOpen() || item.disabled || item.visible === false) return;
    try {
      item.command?.();
    } finally {
      this.closeMenu(true);
    }
  }

  onDefaultButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.buttonDisabled() || this.loading()) return;
    this.closeMenu();
    this.primaryClick.emit(event);
    this.onClick.emit(event);
  }

  toggleOpen(event?: Event): void {
    if (this.disabled() || this.menuButtonDisabled() || this.loading()) return;
    if (this.isMenuOpen()) this.closeMenu();
    else this.openMenu();
    if (event) {
      this.dropdownClick.emit(event);
      this.onDropdownClick.emit(event);
    }
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (
      (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') ||
      this.disabled() ||
      this.menuButtonDisabled() ||
      this.loading()
    )
      return;
    event.preventDefault();
    this.openMenu();
    this.changeDetector.detectChanges();
    this.focusMenuItem(
      event.key === 'ArrowDown' ? 0 : this.menuItems().length - 1,
    );
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    if (!items.length) return;
    const index = items.indexOf(event.target as HTMLElement);
    let next = index;
    if (event.key === 'ArrowDown')
      next = index < 0 ? 0 : (index + 1) % items.length;
    else if (event.key === 'ArrowUp')
      next =
        index < 0
          ? items.length - 1
          : (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    items[next]?.focus();
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.isMenuOpen() && (!next || !this.host.nativeElement.contains(next)))
      this.closeMenu();
  }

  onOutsidePointer(event: PointerEvent): void {
    const target = event.target;
    const isNodeTarget =
      !!target && typeof (target as Node).nodeType === 'number';
    if (
      this.isMenuOpen() &&
      (!isNodeTarget || !this.host.nativeElement.contains(target as Node))
    )
      this.closeMenu();
  }

  onEscape(): void {
    if (!this.isMenuOpen() || !this.closeOnEscape()) return;
    this.closeMenu(true);
  }

  private openMenu(): void {
    if (this.open()) return;
    this.open.set(true);
    this.onMenuShow.emit();
  }

  private closeMenu(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onMenuHide.emit();
    if (restoreFocus)
      this.host.nativeElement
        .querySelector<HTMLButtonElement>('.orc-p2-split__primary')
        ?.focus();
  }

  private menuItems(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
      ),
    );
  }

  private focusMenuItem(index: number): void {
    this.menuItems()[index]?.focus();
  }
}
