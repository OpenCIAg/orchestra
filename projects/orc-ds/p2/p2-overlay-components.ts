import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Injector,
  input,
  model,
  output,
  signal,
  inject,
  effect,
  OnDestroy,
  AfterViewInit,
  afterNextRender,
} from '@angular/core';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';
import { isElementTarget } from './p2-dom-target';
import {
  listenForOutsideInteraction,
  menuFocusTargets,
  stepMenuIndex,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-floating-action-button',
  standalone: true,
  template: `<button
    type="button"
    class="orc-p2-fab"
    [class.extended]="extended()"
    [class.loading]="loading()"
    [disabled]="disabled() || loading()"
    [attr.aria-label]="ariaLabel() || label() || 'Create'"
    [attr.aria-busy]="loading() ? 'true' : null"
    (click)="clicked.emit($event)"
  >
    @if (loading()) {
      <span aria-hidden="true">…</span>
    } @else {
      <span aria-hidden="true">{{ icon() }}</span>
    }
    @if (extended() && label()) {
      <span>{{ label() }}</span>
    }
  </button>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-fab { display: inline-flex; gap: .5rem; align-items: center; justify-content: center; min-width: 3rem; min-height: 3rem; border: 0; border-radius: 999px; background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); box-shadow: 0 8px 18px var(--orc-component-interactive-shadow); font-weight: 700; } .orc-p2-fab.extended { padding-inline: 1rem; } .orc-p2-fab:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 3px; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionButtonComponent {
  readonly label = input('');
  readonly icon = input('+');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly extended = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clicked = output<MouseEvent>();
}

@Component({
  selector: 'orc-close-button',
  standalone: true,
  template: `<button
    type="button"
    class="orc-p2-close-button"
    [class]="'orc-p2-close-button orc-p2-close-button--' + size()"
    [disabled]="disabled()"
    [attr.aria-label]="ariaLabel() || 'Close'"
    (click)="close.emit()"
  >
    <span aria-hidden="true">{{ icon() }}</span>
  </button>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-close-button { display: inline-grid; place-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text-secondary); line-height: 1; } .orc-p2-close-button:hover:not(:disabled) { background: var(--orc-component-surface-muted); color: var(--orc-component-text); } .orc-p2-close-button:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; } .orc-p2-close-button--sm { width: 1.5rem; height: 1.5rem; } .orc-p2-close-button--md { width: 2rem; height: 2rem; } .orc-p2-close-button--lg { width: 2.5rem; height: 2.5rem; font-size: 1.3rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly icon = input('×');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly close = output<void>();
}

export interface ContextMenuItem extends P2Option<string> {
  danger?: boolean;
  shortcut?: string;
  visible?: boolean;
  badge?: string;
}

@Component({
  selector: 'orc-context-menu',
  standalone: true,
  template: `<div
    class="orc-p2-context-menu-host"
    (contextmenu)="onHostContextMenu($event)"
  >
    <ng-content />
    @if (open()) {
      <div
        class="p-contextmenu p-component orc-p2-context-menu"
        [class]="
          'p-contextmenu p-component orc-p2-context-menu ' + styleClass()
        "
        [style]="style()"
        [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null"
        [attr.id]="id()"
        role="menu"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.tabindex]="tabindex()"
        [attr.data-pc-name]="'contextmenu'"
        [style.left.px]="position().x"
        [style.top.px]="position().y"
        (keydown)="onKeydown($event)"
      >
        @for (item of effectiveItems(); track item.value || $index) {
          @if (item.visible !== false) {
            <button
              type="button"
              role="menuitem"
              [disabled]="item.disabled"
              [class.active]="isActive(item)"
              [class.danger]="item.danger"
              [attr.tabindex]="isActive(item) ? 0 : -1"
              (click)="activate(item)"
            >
              {{ item.label }}
              @if (item.badge) {
                <span>{{ item.badge }}</span>
              }
              @if (item.shortcut) {
                <small>{{ item.shortcut }}</small>
              }
            </button>
          }
        }
      </div>
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-context-menu-host { position: relative; min-height: 2rem; } .orc-p2-context-menu { position: fixed; z-index: 10; display: grid; min-width: 12rem; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .55rem; background: var(--orc-component-surface); box-shadow: 0 12px 28px var(--orc-component-shadow-color); } .orc-p2-context-menu button { display: flex; justify-content: space-between; border: 0; border-radius: .35rem; background: transparent; padding: .55rem .7rem; text-align: left; } .orc-p2-context-menu button:hover, .orc-p2-context-menu button.active { background: var(--orc-component-interactive-soft); } .orc-p2-context-menu button.danger { color: var(--orc-component-danger); } small { color: var(--orc-component-text-muted); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  readonly items = input<ContextMenuItem[]>([]);
  readonly model = input<ContextMenuItem[] | undefined>(undefined);
  readonly open = model(false);
  readonly visible = this.open;
  /** @deprecated Compatibility-only input; this component exposes only its contextual popup behavior. */
  readonly popup = input(true, { transform: booleanAttribute });
  readonly target = input<HTMLElement | string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  /** @deprecated Compatibility-only input; the menu remains in its declared host. */
  readonly appendTo = input<HTMLElement | string | null | undefined>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly id = input<string | undefined>(undefined);
  /** @deprecated Responsive breakpoint mode is not implemented. */
  readonly breakpoint = input('');
  readonly tabindex = input(0);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly position = signal({ x: 0, y: 0 });
  readonly activeIndex = signal(0);
  readonly itemSelect = output<ContextMenuItem>();
  readonly opened = output<{ x: number; y: number }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  private targetElement: HTMLElement | null = null;
  private readonly outsideDismissals = new Map<Document, () => void>();
  private focusReturnTarget: HTMLElement | null = null;
  private readonly targetContextMenu = (event: Event): void =>
    this.openAt(event as MouseEvent);
  constructor() {
    effect(() => this.bindTarget(this.target()));
  }
  ngAfterViewInit(): void {
    this.syncOutsideDocuments();
  }
  private resolveTarget(
    target: HTMLElement | string | undefined,
  ): HTMLElement | null {
    if (isElementTarget(target)) return target;
    if (typeof target !== 'string') return null;
    try {
      return (this.host.nativeElement.ownerDocument as Document).querySelector(
        target,
      );
    } catch {
      return null;
    }
  }
  private bindTarget(target: HTMLElement | string | undefined): void {
    const next = this.resolveTarget(target);
    if (next === this.targetElement) return;
    this.targetElement?.removeEventListener(
      'contextmenu',
      this.targetContextMenu,
    );
    this.targetElement = next;
    if (next && !this.host.nativeElement.contains(next))
      next.addEventListener('contextmenu', this.targetContextMenu);
    this.syncOutsideDocuments();
  }
  onHostContextMenu(event: MouseEvent): void {
    const eventTarget = event.target as Node | null;
    if (
      this.targetElement &&
      this.targetElement !== this.host.nativeElement &&
      (!eventTarget || !this.targetElement.contains(eventTarget))
    )
      return;
    this.openAt(event);
  }
  effectiveItems(): ContextMenuItem[] {
    return this.model() ?? this.items();
  }
  private selectableItems(): ContextMenuItem[] {
    return this.effectiveItems().filter(
      (item) => item.visible !== false && !item.disabled,
    );
  }
  isActive(item: ContextMenuItem): boolean {
    return this.selectableItems()[this.activeIndex()] === item;
  }
  openAt(event: MouseEvent): void {
    event.preventDefault();
    this.focusReturnTarget = this.focusTargetFor(event);
    this.position.set(this.positionInHostViewport(event));
    this.activeIndex.set(0);
    this.open.set(true);
    this.focusActiveItemAfterRender();
    this.opened.emit(this.position());
    this.onShow.emit();
  }
  show(event?: MouseEvent): void {
    if (event) {
      this.focusReturnTarget = this.focusTargetFor(event);
      this.position.set(this.positionInHostViewport(event));
    } else {
      this.focusReturnTarget = this.host.nativeElement.ownerDocument
        .activeElement as HTMLElement | null;
    }
    if (!this.open()) {
      this.activeIndex.set(0);
      this.open.set(true);
      this.focusActiveItemAfterRender();
      this.onShow.emit();
    }
  }
  hide(restoreFocus = false): void {
    if (this.open()) {
      this.open.set(false);
      this.onHide.emit();
      if (restoreFocus) this.focusReturnTarget?.focus({ preventScroll: true });
      this.focusReturnTarget = null;
    }
  }
  toggle(event?: MouseEvent): void {
    this.open() ? this.hide() : this.show(event);
  }
  activate(item: ContextMenuItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
    this.hide(true);
  }
  onKeydown(event: KeyboardEvent): void {
    const items = this.selectableItems();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex.update((index) =>
        stepMenuIndex(index, delta, items.length),
      );
      this.focusActiveItemAfterRender();
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(
        event.key === 'Home' ? 0 : Math.max(0, items.length - 1),
      );
      this.focusActiveItemAfterRender();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const item = items[this.activeIndex()];
      if (item) this.activate(item);
    }
  }
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node | null;
    const menu = this.host.nativeElement.querySelector('.orc-p2-context-menu');
    if (target && !menu?.contains(target)) this.hide();
  }
  /** Outside dismissal runs through the shared overlay lifecycle helper; the
   * menu keeps only the bookkeeping for which owner documents to observe. */
  private syncOutsideDocuments(): void {
    const required = new Set<Document>([
      this.host.nativeElement.ownerDocument,
      ...(this.targetElement ? [this.targetElement.ownerDocument] : []),
    ]);
    for (const [ownerDocument, release] of this.outsideDismissals) {
      if (!required.has(ownerDocument)) {
        release();
        this.outsideDismissals.delete(ownerDocument);
      }
    }
    for (const ownerDocument of required) {
      if (!this.outsideDismissals.has(ownerDocument)) {
        this.outsideDismissals.set(
          ownerDocument,
          listenForOutsideInteraction(
            ownerDocument,
            () => [
              this.host.nativeElement.querySelector(
                '.orc-p2-context-menu',
              ) as HTMLElement | null,
            ],
            (event) => this.onDocumentClick(event),
          ),
        );
      }
    }
  }
  private focusTargetFor(event: MouseEvent): HTMLElement | null {
    const eventTarget = event.target;
    if (
      isElementTarget(eventTarget) &&
      (eventTarget.tabIndex >= 0 ||
        eventTarget.matches(
          'button, a[href], input, select, textarea, [contenteditable="true"]',
        ))
    )
      return eventTarget;
    return this.host.nativeElement.ownerDocument
      .activeElement as HTMLElement | null;
  }
  private positionInHostViewport(event: MouseEvent): { x: number; y: number } {
    const hostDocument = this.host.nativeElement.ownerDocument;
    let eventDocument = (event.target as Node | null)?.ownerDocument;
    let x = event.clientX;
    let y = event.clientY;
    while (eventDocument && eventDocument !== hostDocument) {
      let frame: Element | null = null;
      try {
        frame = eventDocument.defaultView?.frameElement ?? null;
      } catch {
        break;
      }
      if (!frame) break;
      const iframe = frame as HTMLIFrameElement;
      const rectangle = iframe.getBoundingClientRect();
      const scaleX = iframe.offsetWidth
        ? rectangle.width / iframe.offsetWidth
        : 1;
      const scaleY = iframe.offsetHeight
        ? rectangle.height / iframe.offsetHeight
        : 1;
      x = rectangle.left + iframe.clientLeft * scaleX + x * scaleX;
      y = rectangle.top + iframe.clientTop * scaleY + y * scaleY;
      eventDocument = iframe.ownerDocument;
    }
    return { x, y };
  }
  private focusActiveItemAfterRender(): void {
    afterNextRender(
      () => {
        if (!this.open()) return;
        const menu = this.host.nativeElement.querySelector(
          '.orc-p2-context-menu',
        ) as HTMLElement | null;
        const [activeItem] = menuFocusTargets(
          menu,
          '[role="menuitem"][tabindex="0"]:not(:disabled)',
        );
        (activeItem ?? menu)?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
  ngOnDestroy(): void {
    for (const release of this.outsideDismissals.values()) release();
    this.outsideDismissals.clear();
    this.targetElement?.removeEventListener(
      'contextmenu',
      this.targetContextMenu,
    );
    this.targetElement = null;
  }
}

export {
  SplitterComponent,
  SplitterPanelContentDirective,
} from './p2-splitter-component';
export type { SplitterPanel } from './p2-splitter-component';
export { OverlayPanelComponent } from '@ciag/orchestra/overlay-panel';

@Component({
  selector: 'orc-overlay',
  standalone: true,
  template: `<section
    class="orc-p2-overlay"
    [class]="styleClass()"
    [style]="style()"
    [hidden]="!visible()"
    role="presentation"
    (keydown.escape)="onEscape()"
  >
    <ng-content />
  </section>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-overlay{position:absolute;z-index:1000}.orc-p2-overlay[hidden]{display:none}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayComponent {
  readonly visible = model(false);
  private lastVisible = false;
  private hasObservedVisibility = false;
  /** @deprecated Compatibility-only input; it does not affect this lightweight overlay shell. */
  readonly mode = input<string>('overlay');
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');
  /** @deprecated Compatibility-only input; projected content remains in its original container. Use OverlayPanelComponent when target attachment is needed. */
  readonly contentStyle = input<Record<string, string> | null>(null);
  /** @deprecated Compatibility-only input; projected content remains in its original container. Use OverlayPanelComponent when target attachment is needed. */
  readonly contentStyleClass = input('');
  /** @deprecated Compatibility-only input; this shell is not positioned relative to a target. Use OverlayPanelComponent for target positioning. */
  readonly target = input<string | HTMLElement | null>(null);
  /** @deprecated Compatibility-only input; this shell does not move or append projected nodes. Use OverlayPanelComponent for portal attachment. */
  readonly appendTo = input<'body' | HTMLElement | undefined>(undefined);
  /** @deprecated Compatibility-only input; this shell uses its stylesheet z-index. */
  readonly autoZIndex = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility-only input; this shell uses its stylesheet z-index. */
  readonly baseZIndex = input(0);
  /** @deprecated Compatibility-only input; this shell does not animate visibility transitions. */
  readonly showTransitionOptions = input('');
  /** @deprecated Compatibility-only input; this shell does not animate visibility transitions. */
  readonly hideTransitionOptions = input('');
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  constructor() {
    effect(() => {
      const next = this.visible();
      if (!this.hasObservedVisibility) {
        this.hasObservedVisibility = true;
        this.lastVisible = next;
        return;
      }
      if (next === this.lastVisible) return;
      this.lastVisible = next;
      if (next) this.onShow.emit();
      else this.onHide.emit();
    });
  }

  show(): void {
    if (!this.visible()) {
      this.lastVisible = true;
      this.visible.set(true);
      this.onShow.emit();
    }
  }
  hide(): void {
    if (this.visible()) {
      this.lastVisible = false;
      this.visible.set(false);
      this.onHide.emit();
    }
  }
  toggle(): void {
    this.visible() ? this.hide() : this.show();
  }
  onEscape(): void {
    this.hide();
  }
}

export { PopoverComponent } from '@ciag/orchestra/popover';

export { SpeedDialComponent } from './p2-speed-dial-component';
export type { SpeedDialAction } from './p2-speed-dial-component';
export { PortalComponent } from './p2-portal-component';
