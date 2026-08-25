import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  ViewChild,
  ElementRef,
  effect,
  computed,
  PLATFORM_ID,
  inject,
  OnDestroy,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@ciag/orchestra/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullScreen' | 'custom';
export type ModalStatus = 'neutral' | 'danger';

@Component({
  selector: 'orc-modal, orc-dialog, orc-dynamic-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  private static activeScrollLocks = 0;
  // ── Referência ao elemento nativo <dialog> ─────────────────
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDialogElement>;

  // ── Inputs e Models ─────────────────────────────────────────
  readonly isOpen = model<boolean>(false);
  /** PrimeNG Dialog-compatible visibility model; isOpen remains supported for Orchestra callers. */
  readonly visible = model<boolean>(false);
  readonly header = input<string | undefined>(undefined);
  readonly modal = input(true); readonly closeOnEscape = input(true); readonly dismissableMask = input(true); readonly closable = input(true); readonly draggable = input(false); readonly resizable = input(false); readonly maximizable = input(false); readonly focusOnShow = input(true); readonly focusTrap = input(true); readonly blockScroll = input(true); readonly autoZIndex = input(true); readonly baseZIndex = input(1000); readonly position = input<'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'>('center'); readonly style = input<string | Record<string, string | number> | undefined>(undefined); readonly styleClass = input(''); readonly maskStyle = input<Record<string, string | number> | undefined>(undefined); readonly maskStyleClass = input(''); readonly contentStyle = input<Record<string, string | number> | undefined>(undefined); readonly contentStyleClass = input(''); readonly appendTo = input<unknown>(undefined); readonly role = input('dialog'); readonly showHeader = input(true); readonly closeIcon = input('×'); readonly closeAriaLabel = input('Close'); readonly minimizeIcon = input('−'); readonly maximizeIcon = input('+'); readonly closeTabindex = input('0'); readonly breakpoints = input<Record<string, string> | undefined>(undefined);
  readonly size = input<ModalSize>('md');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly status = input<ModalStatus>('neutral');
  readonly inline = input<boolean>(false);
  readonly closeOnBackdropClick = input<boolean>(true);
  readonly showCloseButton = input<boolean>(true);
  readonly ariaLabelledBy = input<string>('');
  readonly ariaDescribedBy = input<string>('');
  readonly zIndex = input<number>(1000);
  readonly effectiveZIndex = computed(() => this.autoZIndex() ? Math.max(this.zIndex(), this.baseZIndex()) : this.zIndex());
  readonly keepInViewport = input(true); readonly minX = input(0); readonly minY = input(0); readonly transitionOptions = input<string>('150ms cubic-bezier(0, 0, 0.2, 1)'); readonly rtl = input(false);

  // ── Outputs ─────────────────────────────────────────────────
  readonly closed = output<void>();
  readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onMaximize = output<{ maximized: boolean }>();
  readonly maximized = model(false);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private previousActiveElement: HTMLElement | null = null;
  private hasScrollLock = false;

  constructor() {
    effect(() => {
      this.syncDialogState();
    });
  }

  ngAfterViewInit(): void {
    // A signal may already be true before ViewChild is assigned. The
    // constructor effect cannot observe that non-signal assignment, so sync
    // once after the native dialog enters the view.
    this.syncDialogState();
  }

  private syncDialogState(): void {
    if (!this.isBrowser || this.inline()) return; // Inline mode doesn't use showModal()

    const open = this.isOpen() || this.visible();
    const dialog = this.dialogRef?.nativeElement;

    if (!dialog) return;

    if (open && !dialog.open) {
      this.previousActiveElement = document.activeElement as HTMLElement;
      if (this.modal()) dialog.showModal(); else dialog.show();
      this.acquireScrollLock();
      this.onShow.emit();
      if (this.focusOnShow()) queueMicrotask(() => this.focusInitialElement());
    } else if (!open && dialog.open) {
      dialog.close();
      this.releaseScrollLock();
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }
      this.onHide.emit();
    }
  }

  // ── Computed Classes ────────────────────────────────────────
  readonly modalClasses = computed(() => {
    return {
      'orc-modal': true,
      'orc-modal--inline': this.inline(),
      [`orc-modal--size-${this.size()}`]: true,
      'orc-modal--status-danger': this.status() === 'danger',
      'orc-modal--fullscreen': this.size() === 'fullScreen',
      'orc-modal--maximized': this.maximized()
    };
  });

  // ── Handlers ────────────────────────────────────────────────
  onClose(): void {
    if (this.isOpen() || this.visible()) {
      this.isOpen.set(false); this.visible.set(false);
      this.closed.emit();
    }
  }

  onCancel(event: Event): void {
    // Disparado nativamente ao apertar 'Escape'
    event.preventDefault();
    if (this.closeOnEscape()) this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdropClick() || !this.dismissableMask() || !this.modal()) return;

    const dialog = this.dialogRef.nativeElement;
    // O <dialog> cobre a tela inteira com seu backdrop.
    // O click nele tem rect bounds específicos. Se clicar fora do conteúdo interno, é o backdrop.
    // Como o conteúdo real está no <div class="orc-modal__container">, 
    // clicar no dialog propriamente (se o padding não cobrir a tela) é backdrop.
    // Mas a forma mais segura é checar o target.
    if (event.target === dialog) {
      this.onClose();
    }
  }

  show(): void { this.visible.set(true); this.isOpen.set(true); }
  close(): void { this.onClose(); }
  toggleMaximize(): void { if (!this.maximizable()) return; this.maximized.update(value => !value); this.onMaximize.emit({ maximized: this.maximized() }); }

  private acquireScrollLock(): void {
    if (!this.isBrowser || !this.blockScroll() || this.hasScrollLock) return;
    if (ModalComponent.activeScrollLocks === 0) document.body.style.overflow = 'hidden';
    ModalComponent.activeScrollLocks += 1;
    this.hasScrollLock = true;
  }

  private releaseScrollLock(): void {
    if (!this.isBrowser || !this.hasScrollLock) return;
    ModalComponent.activeScrollLocks = Math.max(0, ModalComponent.activeScrollLocks - 1);
    if (ModalComponent.activeScrollLocks === 0) document.body.style.removeProperty('overflow');
    this.hasScrollLock = false;
  }

  private focusInitialElement(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog || !(this.isOpen() || this.visible())) return;
    const first = dialog.querySelector<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    (first || dialog).focus();
  }

  @HostListener('document:keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (!this.focusTrap() || !(this.isOpen() || this.visible()) || event.key !== 'Tab') return;
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  ngOnDestroy(): void {
    this.releaseScrollLock();
  }
}
