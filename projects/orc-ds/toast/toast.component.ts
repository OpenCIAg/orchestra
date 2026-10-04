import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
  DestroyRef,
  inject,
  ElementRef,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastItem } from './toast.types';

@Component({
  selector: 'orc-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'orc-toast-host',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ToastComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly toast = input.required<ToastItem>();

  // ── Outputs (Signals API) ─────────────────────────────────
  readonly dismiss = output<string>();
  readonly actionClick = output<ToastItem>();
  readonly onClose = output<{ originalEvent: Event; message: ToastItem }>();
  readonly onClick = output<{
    originalEvent: MouseEvent;
    message: ToastItem;
  }>();

  // ── Estados Internos Reativos ─────────────────────────────
  readonly isHovered = signal<boolean>(false);
  readonly isFocused = signal(false);
  readonly isPaused = computed(
    () => this.isFocused() || (this.isHovered() && this.toast().pauseOnHover),
  );
  readonly isExiting = signal<boolean>(false);
  readonly progress = signal<number>(100);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;
  private remainingTime = 0;
  private totalDuration = 0;
  private deadline = 0;
  private expiryTimeout: ReturnType<typeof setTimeout> | null = null;

  // ── Sinais Computados ─────────────────────────────────────
  readonly computedRole = computed<string>(() => {
    if (this.toast().role) return this.toast().role!;
    const type = this.toast().type;
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  });

  readonly computedAriaLive = computed<string>(() => {
    if (this.toast().ariaLive) return this.toast().ariaLive!;
    const type = this.toast().type;
    return type === 'error' ? 'assertive' : 'polite';
  });

  readonly hasProgressBar = computed<boolean>(() => {
    const t = this.toast();
    const d = t.duration;
    return Boolean(t.showProgressBar) && d > 0 && isFinite(d);
  });

  constructor() {
    // Inicialização do timer reativo de auto-dismiss com suporte a hover pause
    effect(() => {
      const item = this.toast();
      untracked(() => this.initTimer(item));
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimer();
      this.clearDismissTimeout();
    });
  }

  private initTimer(item: ToastItem): void {
    this.clearTimer();
    this.clearDismissTimeout();
    this.isExiting.set(false);
    this.totalDuration = item.duration;
    this.remainingTime = item.duration;
    this.progress.set(100);
    this.resumeTimer();
  }

  private resumeTimer(): void {
    if (
      this.isPaused() ||
      this.isExiting() ||
      this.totalDuration <= 0 ||
      !Number.isFinite(this.totalDuration)
    )
      return;
    this.clearTimer();
    this.deadline = Date.now() + this.remainingTime;
    this.expiryTimeout = setTimeout(
      () => {
        this.progress.set(0);
        this.handleClose();
      },
      Math.max(0, this.remainingTime),
    );
    // Plain notifications need only one deadline timer, with no polling or
    // reactive updates. Visual progress runs only while it can be seen.
    if (this.hasProgressBar())
      this.timerInterval = setInterval(() => {
        this.progress.set(
          Math.max(
            0,
            ((this.deadline - Date.now()) / this.totalDuration) * 100,
          ),
        );
      }, 50);
  }

  private pauseTimer(): void {
    if (this.expiryTimeout !== null)
      this.remainingTime = Math.max(0, this.deadline - Date.now());
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timerInterval !== null) clearInterval(this.timerInterval);
    this.timerInterval = null;
    if (this.expiryTimeout !== null) clearTimeout(this.expiryTimeout);
    this.expiryTimeout = null;
  }

  private clearDismissTimeout(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }
  }

  onMouseEnter(): void {
    this.isHovered.set(true);
    if (this.isPaused()) this.pauseTimer();
  }

  onMouseLeave(): void {
    const wasPaused = this.isPaused();
    this.isHovered.set(false);
    if (wasPaused && !this.isPaused()) this.resumeTimer();
  }

  onFocusIn(): void {
    this.isFocused.set(true);
    this.pauseTimer();
  }

  onFocusOut(event: FocusEvent): void {
    if (
      event.relatedTarget &&
      this.element.nativeElement.contains(event.relatedTarget as Node)
    )
      return;
    this.isFocused.set(false);
    if (!this.isPaused()) this.resumeTimer();
  }

  handleClose(originalEvent: Event = new Event('close')): void {
    if (this.isExiting()) return;
    this.isExiting.set(true);
    this.clearTimer();
    this.clearDismissTimeout();
    this.onClose.emit({ originalEvent, message: this.toast() });

    // Permite animação de saída antes da remoção final
    this.dismissTimeout = setTimeout(() => {
      this.dismissTimeout = null;
      this.dismiss.emit(this.toast().id);
    }, 200);
  }

  handleToastClick(event: MouseEvent): void {
    this.onClick.emit({ originalEvent: event, message: this.toast() });
  }

  handleAction(): void {
    if (this.toast().action) {
      this.toast().action!.onClick(this.toast());
      this.actionClick.emit(this.toast());
    }
  }
}
