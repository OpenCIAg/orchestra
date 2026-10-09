import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  ORC_SHARED_VARS,
  listenForOutsideInteraction,
  menuFocusTargets,
  stepMenuIndex,
} from '@ciag/orchestra/internal';
import type { OrcOption } from '@ciag/orchestra/internal';
import { isElementTarget } from '@ciag/orchestra/internal';

export type { OrcOption };

export interface ContextMenuItem extends OrcOption<string> {
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
        class="orc-p2-context-menu"
        [class]="'orc-p2-context-menu ' + styleClass()"
        [style]="style()"
        [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null"
        [attr.id]="id()"
        role="menu"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.tabindex]="tabindex()"
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
    ORC_SHARED_VARS +
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
    if (this.open()) this.hide();
    else this.show(event);
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
