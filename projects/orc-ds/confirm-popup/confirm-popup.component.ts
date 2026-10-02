import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Injectable,
  Injector,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

export interface PopupConfirmation {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptAriaLabel?: string;
  rejectAriaLabel?: string;
  accept?: () => void;
  reject?: () => void;
  /** Optional same-document element to anchor the popup to. Defaults to the active element when omitted. */
  target?: HTMLElement | ElementRef<HTMLElement>;
  /** Absolute viewport coordinate override. When omitted, placement is derived from the target or centered. */
  x?: number;
  /** Absolute viewport coordinate override. When omitted, placement is derived from the target or centered. */
  y?: number;
}
@Injectable({ providedIn: 'root' })
export class ConfirmPopupService {
  readonly request = signal<PopupConfirmation | null>(null);
  /**
   * ConfirmPopup has one visible request. A newer request owns that slot and
   * explicitly cancels the request it supersedes so its caller cannot remain
   * unresolved when several confirmations are submitted together.
   */
  confirm(request: PopupConfirmation): void {
    const previous = this.request();
    this.request.set(request);
    if (previous && previous !== request) previous.reject?.();
  }
  close(): void {
    this.request.set(null);
  }
}
let nextConfirmationPopupId = 0;
@Component({
  selector: 'orc-confirm-popup',
  standalone: true,
  template: `@if (request()) {
    <aside
      #popup
      class="popup"
      role="alertdialog"
      tabindex="-1"
      [attr.aria-label]="request()?.header ? null : 'Confirmation'"
      [attr.aria-labelledby]="request()?.header ? headerId : null"
      [attr.aria-describedby]="messageId"
      [style.left.px]="positionLeftStyle()"
      [style.top.px]="positionTopStyle()"
      (keydown.escape)="onEscape($event)"
    >
      @if (request()?.header) {
        <strong [id]="headerId">{{ request()?.header }}</strong>
      }
      <p [id]="messageId">{{ request()?.message }}</p>
      <div>
        <button
          #rejectButton
          type="button"
          [attr.aria-label]="request()?.rejectAriaLabel || rejectLabel()"
          (click)="reject()"
        >
          {{ request()?.rejectLabel || rejectLabel() }}</button
        ><button
          #acceptButton
          type="button"
          class="accept"
          [attr.aria-label]="request()?.acceptAriaLabel || acceptLabel()"
          (click)="accept()"
        >
          {{ request()?.acceptLabel || acceptLabel() }}
        </button>
      </div>
    </aside>
  }`,
  styles: [
    P2_SHARED_STYLES +
      `.popup{position:fixed;z-index:100;box-sizing:border-box;width:max-content;max-width:calc(100vw - 1rem);max-height:calc(100vh - 1rem);overflow:auto;padding:.8rem;border:1px solid var(--orc-component-border);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 10px 25px var(--orc-component-shadow-color)}.popup p{max-width:18rem;margin:.45rem 0;color:var(--orc-component-text-secondary)}.popup button{margin-left:.35rem;border:1px solid var(--orc-component-border-strong);border-radius:.3rem;background:var(--orc-component-surface);padding:.35rem .6rem}.popup .accept{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive);color:var(--orc-component-on-interactive)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPopupComponent {
  readonly headerId = `orc-confirm-popup-header-${++nextConfirmationPopupId}`;
  readonly messageId = `orc-confirm-popup-message-${nextConfirmationPopupId}`;
  readonly request: ConfirmPopupService['request'];
  readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  readonly acceptButton =
    viewChild<ElementRef<HTMLButtonElement>>('acceptButton');
  readonly rejectButton =
    viewChild<ElementRef<HTMLButtonElement>>('rejectButton');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformDocument = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  readonly positionLeft = signal(0);
  readonly positionTop = signal(0);
  readonly positionLeftStyle = computed(() => {
    const coordinate = this.request()?.x;
    return Number.isFinite(coordinate) ? coordinate! : this.positionLeft();
  });
  readonly positionTopStyle = computed(() => {
    const coordinate = this.request()?.y;
    return Number.isFinite(coordinate) ? coordinate! : this.positionTop();
  });
  private restoreFocus: HTMLElement | null = null;
  private wasOpen = false;
  private lastPositionRequest: PopupConfirmation | null = null;
  private outsidePointerListener: ((event: PointerEvent) => void) | null = null;
  private outsidePointerDocument: Document | null = null;
  private positionListener: (() => void) | null = null;
  private positionWindow: Window | null = null;
  private popupResizeObserver: ResizeObserver | null = null;
  constructor(private readonly service: ConfirmPopupService) {
    this.request = service.request;
    effect(() => {
      const request = this.request();
      const opened = !!request && !this.wasOpen;
      if (request) {
        if (opened) {
          const ownerDocument = this.ownerDocument();
          const target = this.resolveTarget(request, ownerDocument);
          this.restoreFocus =
            this.activeHTMLElement(ownerDocument) ??
            (target && this.isFocusable(target) ? target : null);
          this.listenForOutsidePointer();
        }
        if (request !== this.lastPositionRequest) {
          this.lastPositionRequest = request;
          this.updatePosition(request);
          afterNextRender(
            () => {
              if (this.request() !== request) return;
              this.updatePosition(request);
              this.observePopupSize();
              if (opened) this.acceptButton()?.nativeElement.focus();
            },
            { injector: this.injector },
          );
        }
      } else if (this.wasOpen) {
        this.stopListeningForOutsidePointer();
        this.restorePreviousFocus();
        this.lastPositionRequest = null;
      }
      this.wasOpen = Boolean(request);
    });
  }
  private listenForOutsidePointer(): void {
    if (this.outsidePointerListener) return;
    const ownerDocument = this.ownerDocument();
    this.outsidePointerListener = (event: PointerEvent) => {
      const popup = this.popup()?.nativeElement;
      if (!popup) return;
      const path = event.composedPath();
      const NodeConstructor = ownerDocument.defaultView?.Node;
      const targetIsNode =
        !!NodeConstructor && event.target instanceof NodeConstructor;
      if (
        path.includes(popup) ||
        (targetIsNode && popup.contains(event.target as Node))
      ) {
        return;
      }
      const opener = this.restoreFocus;
      const outsideTargetIsFocusable = path.some(
        (entry) =>
          this.isOwnedHTMLElement(entry, ownerDocument) &&
          entry !== popup &&
          this.isFocusable(entry),
      );
      this.reject(false);
      // Pointer capture runs before the browser focuses a button or link. Do not
      // queue the opener when the click itself has a focusable destination.
      if (!outsideTargetIsFocusable) this.restoreFocusTo(opener);
    };
    this.outsidePointerDocument = ownerDocument;
    this.positionWindow = ownerDocument.defaultView;
    this.positionListener = () => {
      const request = this.request();
      if (request) this.updatePosition(request);
    };
    this.positionWindow?.addEventListener('resize', this.positionListener, {
      passive: true,
    });
    this.positionWindow?.addEventListener('scroll', this.positionListener, {
      capture: true,
      passive: true,
    });
    ownerDocument.addEventListener(
      'pointerdown',
      this.outsidePointerListener,
      true,
    );
  }
  private ownerDocument(): Document {
    return (
      this.popup()?.nativeElement.ownerDocument ??
      this.host.nativeElement.ownerDocument ??
      this.platformDocument
    );
  }
  private resolveTarget(
    request: PopupConfirmation,
    ownerDocument: Document,
  ): HTMLElement | null {
    const candidate =
      request.target instanceof ElementRef
        ? request.target.nativeElement
        : request.target;
    if (
      candidate &&
      candidate.ownerDocument === ownerDocument &&
      candidate.isConnected
    ) {
      return candidate;
    }
    return request.target
      ? null
      : this.restoreFocus && this.isFocusable(this.restoreFocus)
        ? this.restoreFocus
        : null;
  }
  private updatePosition(request: PopupConfirmation): void {
    const popup = this.popup()?.nativeElement;
    const ownerDocument = this.ownerDocument();
    const view = ownerDocument.defaultView;
    if (!view) return;

    const viewportWidth =
      ownerDocument.documentElement.clientWidth || view.innerWidth;
    const viewportHeight =
      ownerDocument.documentElement.clientHeight || view.innerHeight;
    const target = this.resolveTarget(request, ownerDocument);
    const targetRect = target?.getBoundingClientRect();
    const popupRect = popup?.getBoundingClientRect();
    if (!popupRect) {
      this.positionLeft.set(
        Number.isFinite(request.x)
          ? request.x!
          : (targetRect?.left ?? viewportWidth / 2),
      );
      this.positionTop.set(
        Number.isFinite(request.y)
          ? request.y!
          : targetRect?.bottom !== undefined
            ? targetRect.bottom + 8
            : viewportHeight / 2,
      );
      return;
    }
    const margin = 8;
    const suppliedX = Number.isFinite(request.x);
    const suppliedY = Number.isFinite(request.y);
    let left = suppliedX
      ? request.x!
      : targetRect
        ? targetRect.left
        : (viewportWidth - popupRect.width) / 2;
    let top = suppliedY
      ? request.y!
      : targetRect
        ? targetRect.bottom + margin
        : (viewportHeight - popupRect.height) / 2;

    if (!suppliedX) {
      left = Math.max(
        margin,
        Math.min(left, viewportWidth - popupRect.width - margin),
      );
    }
    if (!suppliedY) {
      if (
        targetRect &&
        top + popupRect.height > viewportHeight - margin &&
        targetRect.top - popupRect.height - margin >= margin
      ) {
        top = targetRect.top - popupRect.height - margin;
      }
      top = Math.max(
        margin,
        Math.min(top, viewportHeight - popupRect.height - margin),
      );
    }
    this.positionLeft.set(left);
    this.positionTop.set(top);
  }
  private observePopupSize(): void {
    if (this.popupResizeObserver) return;
    const popup = this.popup()?.nativeElement;
    const ResizeObserverConstructor =
      this.ownerDocument().defaultView?.ResizeObserver;
    if (!popup || !ResizeObserverConstructor) return;
    this.popupResizeObserver = new ResizeObserverConstructor(() => {
      const request = this.request();
      if (request) this.updatePosition(request);
    });
    this.popupResizeObserver.observe(popup);
  }
  private activeHTMLElement(ownerDocument: Document): HTMLElement | null {
    const active = ownerDocument.activeElement;
    return this.isOwnedHTMLElement(active, ownerDocument) &&
      this.isFocusable(active)
      ? active
      : null;
  }
  private isOwnedHTMLElement(
    value: EventTarget | null,
    ownerDocument: Document,
  ): value is HTMLElement {
    const HTMLElementConstructor = ownerDocument.defaultView?.HTMLElement;
    return !!HTMLElementConstructor && value instanceof HTMLElementConstructor;
  }
  private isFocusable(element: HTMLElement): boolean {
    return (
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.hasAttribute('inert')
    );
  }
  private stopListeningForOutsidePointer(): void {
    if (this.outsidePointerListener) {
      this.outsidePointerDocument?.removeEventListener(
        'pointerdown',
        this.outsidePointerListener,
        true,
      );
    }
    if (this.positionListener) {
      this.positionWindow?.removeEventListener('resize', this.positionListener);
      this.positionWindow?.removeEventListener(
        'scroll',
        this.positionListener,
        true,
      );
    }
    this.popupResizeObserver?.disconnect();
    this.popupResizeObserver = null;
    this.outsidePointerDocument = null;
    this.outsidePointerListener = null;
    this.positionWindow = null;
    this.positionListener = null;
  }
  acceptLabel(): string {
    return this.request()?.acceptLabel || 'Accept';
  }
  rejectLabel(): string {
    return this.request()?.rejectLabel || 'Reject';
  }
  private restoreFocusTo(target: HTMLElement | null): void {
    this.restoreFocus = null;
    queueMicrotask(() => target?.isConnected && target.focus());
  }
  private restorePreviousFocus(): void {
    this.restoreFocusTo(this.restoreFocus);
  }
  accept(): void {
    this.stopListeningForOutsidePointer();
    this.request()?.accept?.();
    this.service.close();
    this.restorePreviousFocus();
  }
  reject(restoreOpener = true): void {
    const opener = this.restoreFocus;
    this.stopListeningForOutsidePointer();
    this.request()?.reject?.();
    this.service.close();
    if (restoreOpener) this.restoreFocusTo(opener);
    else this.restoreFocus = null;
  }
  onEscape(event?: Event): void {
    event?.preventDefault();
    this.reject();
  }
  ngOnDestroy(): void {
    this.stopListeningForOutsidePointer();
    if (this.wasOpen && this.request()) this.service.close();
    this.restoreFocus = null;
  }
}
