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
  selector: 'orc-modal',
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
  readonly size = input<ModalSize>('md');
  readonly status = input<ModalStatus>('neutral');
  readonly inline = input<boolean>(false);
  readonly closeOnBackdropClick = input<boolean>(true);
  readonly showCloseButton = input<boolean>(true);
  readonly ariaLabelledBy = input<string>('');
  readonly ariaDescribedBy = input<string>('');
  readonly zIndex = input<number>(1000);

  // ── Outputs ─────────────────────────────────────────────────
  readonly closed = output<void>();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      
      if (this.inline()) return; // Inline mode doesn't use showModal()

      const open = this.isOpen();
      const dialog = this.dialogRef?.nativeElement;
      
      if (!dialog) return;

      if (open && !dialog.open) {
        this.previousActiveElement = document.activeElement as HTMLElement;
        dialog.showModal();
        document.body.style.overflow = 'hidden'; // Scroll lock
      } else if (!open && dialog.open) {
        dialog.close();
        document.body.style.removeProperty('overflow');
        if (this.previousActiveElement) {
          this.previousActiveElement.focus();
        }
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
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.closed.emit();
    }
  }

  onCancel(event: Event): void {
    // Disparado nativamente ao apertar 'Escape'
    event.preventDefault(); // Previne o fechamento nativo para centralizar o estado no isOpen
    this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdropClick()) return;

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

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.body.style.removeProperty('overflow');
    }
  }
}
