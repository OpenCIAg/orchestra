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
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@ciag/orchestra/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullScreen' | 'custom';
export type ModalStatus = 'neutral' | 'danger';

@Component({
  selector: 'orc-modal, orc-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnDestroy {
  // ── Referência ao elemento nativo <dialog> ─────────────────
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDialogElement>;

  // ── Inputs e Models ─────────────────────────────────────────
  readonly isOpen = model<boolean>(false);
  /** PrimeNG Dialog-compatible visibility model; isOpen remains supported for Orchestra callers. */
  readonly visible = model<boolean>(false);
  readonly header = input<string | undefined>(undefined);
  readonly modal = input(true); readonly closeOnEscape = input(true); readonly dismissableMask = input(true); readonly closable = input(true); readonly draggable = input(false); readonly resizable = input(false); readonly maximizable = input(false); readonly focusOnShow = input(true); readonly focusTrap = input(true); readonly blockScroll = input(true); readonly style = input<Record<string, string | number> | undefined>(undefined); readonly styleClass = input(''); readonly maskStyle = input<Record<string, string | number> | undefined>(undefined); readonly maskStyleClass = input(''); readonly contentStyle = input<Record<string, string | number> | undefined>(undefined); readonly contentStyleClass = input(''); readonly appendTo = input<unknown>(undefined); readonly role = input('dialog'); readonly showHeader = input(true); readonly closeIcon = input('×'); readonly closeAriaLabel = input('Close'); readonly minimizeIcon = input('−'); readonly maximizeIcon = input('+'); readonly closeTabindex = input('0'); readonly breakpoints = input<Record<string, string> | undefined>(undefined);
  readonly size = input<ModalSize>('md');
  readonly status = input<ModalStatus>('neutral');
  readonly inline = input<boolean>(false);
  readonly closeOnBackdropClick = input<boolean>(true);
  readonly showCloseButton = input<boolean>(true);
  readonly ariaLabelledBy = input<string>('');
  readonly ariaDescribedBy = input<string>('');
  readonly zIndex = input<number>(1000);
  readonly keepInViewport = input(true); readonly minX = input(0); readonly minY = input(0); readonly transitionOptions = input<string>('150ms cubic-bezier(0, 0, 0.2, 1)'); readonly rtl = input(false);

  // ── Outputs ─────────────────────────────────────────────────
  readonly closed = output<void>();
  readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onMaximize = output<{ maximized: boolean }>();
  readonly maximized = model(false);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      
      if (this.inline()) return; // Inline mode doesn't use showModal()

      const open = this.isOpen() || this.visible();
      const dialog = this.dialogRef?.nativeElement;
      
      if (!dialog) return;

      if (open && !dialog.open) {
        this.previousActiveElement = document.activeElement as HTMLElement;
        dialog.showModal();
        if (this.blockScroll()) document.body.style.overflow = 'hidden'; // Scroll lock
        this.onShow.emit();
      } else if (!open && dialog.open) {
        dialog.close();
        document.body.style.removeProperty('overflow');
        if (this.previousActiveElement) {
          this.previousActiveElement.focus();
        }
        this.onHide.emit();
      }
    });
  }

  // ── Computed Classes ────────────────────────────────────────
  readonly modalClasses = computed(() => {
    return {
      'orc-modal': true,
      'orc-modal--inline': this.inline(),
      [`orc-modal--size-${this.size()}`]: true,
      'orc-modal--status-danger': this.status() === 'danger',
      'orc-modal--fullscreen': this.size() === 'fullScreen'
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
    if (this.closeOnEscape()) { event.preventDefault(); this.onClose(); }
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdropClick() || !this.dismissableMask() || !this.modal()) return;

    const dialog = this.dialogRef.nativeElement;
    // O <dialog> cobre a tela inteira com seu backdrop.
    // O click nele tem rect bounds específicos. Se clicar fora do conteúdo interno, é o backdrop.
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    
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

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.body.style.removeProperty('overflow');
    }
  }
}
