import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injectable,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FocusTrapDirective } from './p2-utility-more';
import { P2_SHARED_STYLES } from './p2-shared';
import { lockDocumentScroll } from '@ciag/orchestra/internal';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly request = signal<ConfirmationRequest | null>(null);
  /**
   * ConfirmDialog has one visible request. A newer request owns that slot and
   * explicitly cancels the request it supersedes so its caller cannot remain
   * unresolved when several confirmations are submitted together.
   */
  confirm(request: ConfirmationRequest): void {
    const previous = this.request();
    this.request.set(request);
    if (previous && previous !== request) previous.reject?.();
  }
  close(): void {
    this.request.set(null);
  }
}
export interface ConfirmationRequest {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptIcon?: string;
  rejectIcon?: string;
  acceptAriaLabel?: string;
  rejectAriaLabel?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  /** @deprecated Compatibility-only request field; ConfirmDialog does not bind keyboard shortcuts from request keys. */ key?: string;
  accept?: () => void;
  reject?: () => void;
}

let nextConfirmationDialogId = 0;

@Component({
  selector: 'orc-confirm-dialog',
  standalone: true,
  imports: [FocusTrapDirective],
  template: `@if (request()) {
    <div
      class="p-confirm-dialog-mask p-component-overlay orc-confirm-backdrop"
      [class]="
        'p-confirm-dialog-mask p-component-overlay orc-confirm-backdrop ' +
        maskStyleClass()
      "
      [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null"
      (click)="dismissableMask() && reject()"
    >
      <section
        #dialog
        orcFocusTrap
        [autoFocus]="false"
        class="p-confirm-dialog p-component orc-confirm"
        [class]="'p-confirm-dialog p-component orc-confirm ' + styleClass()"
        role="alertdialog"
        aria-modal="true"
        [attr.dir]="rtl() ? 'rtl' : null"
        [attr.aria-label]="
          ariaLabelledBy() || request()?.header ? null : 'Confirmation'
        "
        [attr.aria-labelledby]="
          ariaLabelledBy() || (request()?.header ? titleId : null)
        "
        [attr.aria-describedby]="messageId"
        [attr.data-pc-name]="'confirmdialog'"
        (click)="$event.stopPropagation()"
        (keydown.escape)="onEscape($event)"
      >
        @if (request()?.header || request()?.icon) {
          <h2 [id]="titleId">
            @if (request()?.icon) {
              <span aria-hidden="true">{{ request()?.icon }}</span>
            }
            {{ request()?.header }}
          </h2>
        }
        <p [id]="messageId">{{ request()?.message }}</p>
        <footer>
          @if (closable() && closeAriaLabel()) {
            <button
              #closeButton
              type="button"
              class="close"
              (click)="close()"
              [attr.aria-label]="closeAriaLabel()"
            >
              ×
            </button>
          }
          @if (request()?.rejectVisible !== false) {
            <button
              #rejectButton
              type="button"
              [class]="request()?.rejectButtonStyleClass || ''"
              (click)="reject()"
              [attr.aria-label]="request()?.rejectAriaLabel || rejectLabel()"
            >
              {{ request()?.rejectIcon }}
              {{ request()?.rejectLabel || rejectLabel() }}
            </button>
          }
          @if (request()?.acceptVisible !== false) {
            <button
              #acceptButton
              type="button"
              class="accept"
              [class]="request()?.acceptButtonStyleClass || ''"
              (click)="accept()"
              [attr.aria-label]="request()?.acceptAriaLabel || acceptLabel()"
            >
              {{ request()?.acceptIcon }}
              {{ request()?.acceptLabel || acceptLabel() }}
            </button>
          }
        </footer>
      </section>
    </div>
  }`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-confirm-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--orc-component-scrim)}.orc-confirm{width:min(28rem,calc(100% - 2rem));padding:1.25rem;border-radius:.75rem;background:var(--orc-component-surface);box-shadow:0 20px 40px var(--orc-component-shadow-color)}.orc-confirm h2{margin:0 0 .5rem}.orc-confirm p{color:var(--orc-component-text-secondary)}.orc-confirm footer{display:flex;justify-content:flex-end;gap:.5rem}.orc-confirm button{border:1px solid var(--orc-component-border-strong);border-radius:.4rem;background:var(--orc-component-surface);padding:.5rem .8rem}.orc-confirm .accept{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive);color:var(--orc-component-on-interactive)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnDestroy {
  readonly titleId = `orc-confirm-dialog-title-${++nextConfirmationDialogId}`;
  readonly messageId = `orc-confirm-dialog-message-${nextConfirmationDialogId}`;
  readonly request: ConfirmationService['request'];
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly dismissableMask = input(true, { transform: booleanAttribute });
  readonly blockScroll = input(true, { transform: booleanAttribute });
  readonly rtl = input(false, { transform: booleanAttribute });
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly styleClass = input('');
  readonly maskStyleClass = input('');
  readonly closeAriaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly defaultFocus = input<'accept' | 'reject' | 'close' | 'none'>(
    'accept',
  );
  readonly onHide = output<void>();
  readonly onAccept = output<void>();
  readonly onReject = output<void>();
  readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  readonly acceptButton =
    viewChild<ElementRef<HTMLButtonElement>>('acceptButton');
  readonly rejectButton =
    viewChild<ElementRef<HTMLButtonElement>>('rejectButton');
  readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly componentHost = inject(ElementRef<HTMLElement>);
  private readonly platformDocument = inject(DOCUMENT);
  private restoreFocus: HTMLElement | null = null;
  private wasOpen = false;
  private releaseScrollLock?: () => void;
  private lockedDocument?: Document;
  constructor(private readonly service: ConfirmationService) {
    this.request = service.request;
    effect(() => {
      const request = this.request();
      this.syncScrollLock(request);
      if (request && !this.wasOpen) {
        const ownerDocument = this.ownerDocument();
        const activeElement = ownerDocument.activeElement;
        const HTMLElementConstructor = ownerDocument.defaultView?.HTMLElement;
        this.restoreFocus =
          HTMLElementConstructor &&
          activeElement instanceof HTMLElementConstructor
            ? activeElement
            : null;
        queueMicrotask(() => this.focusDefault());
      } else if (!request && this.wasOpen) {
        this.restorePreviousFocus();
      }
      this.wasOpen = Boolean(request);
    });
  }
  acceptLabel(): string {
    return this.request()?.acceptLabel || 'Accept';
  }
  rejectLabel(): string {
    return this.request()?.rejectLabel || 'Reject';
  }
  private focusDefault(): void {
    const preferred = this.defaultFocus();
    if (preferred === 'none') return;
    const target =
      preferred === 'reject'
        ? this.rejectButton()
        : preferred === 'close'
          ? this.closeButton()
          : this.acceptButton();
    (
      target ??
      this.acceptButton() ??
      this.rejectButton() ??
      this.closeButton()
    )?.nativeElement.focus();
  }
  private restorePreviousFocus(): void {
    const target = this.restoreFocus;
    this.restoreFocus = null;
    queueMicrotask(() => target?.isConnected && target.focus());
  }
  private ownerDocument(): Document {
    return (
      this.dialog()?.nativeElement.ownerDocument ??
      this.componentHost.nativeElement.ownerDocument ??
      this.platformDocument
    );
  }
  private syncScrollLock(request: ConfirmationRequest | null): void {
    const ownerDocument = this.ownerDocument();
    if (!request || !this.blockScroll()) {
      this.releaseScrollLock?.();
      this.releaseScrollLock = undefined;
      this.lockedDocument = undefined;
      return;
    }
    if (this.lockedDocument === ownerDocument && this.releaseScrollLock) return;
    this.releaseScrollLock?.();
    this.lockedDocument = ownerDocument;
    this.releaseScrollLock = lockDocumentScroll(ownerDocument);
  }
  private releaseLock(): void {
    this.releaseScrollLock?.();
    this.releaseScrollLock = undefined;
    this.lockedDocument = undefined;
  }
  accept(): void {
    this.request()?.accept?.();
    this.onAccept.emit();
    this.releaseLock();
    this.service.close();
    this.onHide.emit();
    this.restorePreviousFocus();
  }
  reject(): void {
    this.request()?.reject?.();
    this.onReject.emit();
    this.releaseLock();
    this.service.close();
    this.onHide.emit();
    this.restorePreviousFocus();
  }
  close(): void {
    this.reject();
  }
  onEscape(event?: Event): void {
    if (this.closeOnEscape()) {
      event?.preventDefault();
      this.reject();
    }
  }
  ngOnDestroy(): void {
    if (this.wasOpen && this.request()) this.service.close();
    this.releaseLock();
  }
}
