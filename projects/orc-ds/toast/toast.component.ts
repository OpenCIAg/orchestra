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
    'class': 'orc-toast-host',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class ToastComponent {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly toast = input.required<ToastItem>();

  // ── Outputs (Signals API) ─────────────────────────────────
  readonly dismiss = output<string>();
  readonly actionClick = output<ToastItem>();
  readonly onClose = output<{ originalEvent: Event; message: ToastItem }>();
  readonly onClick = output<{ originalEvent: MouseEvent; message: ToastItem }>();

  // ── Estados Internos Reativos ─────────────────────────────
  readonly isHovered = signal<boolean>(false);
  readonly isExiting = signal<boolean>(false);
  readonly progress = signal<number>(100);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private remainingTime = 0;
  private totalDuration = 0;
  private lastTick = 0;

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
      this.initTimer(item);
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimer();
    });
  }

  private initTimer(item: ToastItem): void {
    this.clearTimer();
    this.totalDuration = item.duration;
    this.remainingTime = item.duration;
    this.progress.set(100);

    if (this.totalDuration <= 0 || !isFinite(this.totalDuration)) {
      return; // Sem auto-dismiss
    }

    this.lastTick = Date.now();
    const intervalMs = 25;

    this.timerInterval = setInterval(() => {
      if (this.isHovered() && item.pauseOnHover) {
        this.lastTick = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - this.lastTick;
      this.lastTick = now;

      this.remainingTime -= elapsed;
      const pct = Math.max(0, (this.remainingTime / this.totalDuration) * 100);
      this.progress.set(pct);

      if (this.remainingTime <= 0) {
        this.clearTimer();
        this.handleClose();
      }
    }, intervalMs);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onMouseEnter(): void {
    this.isHovered.set(true);
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
    this.lastTick = Date.now();
  }

  handleClose(originalEvent: Event = new Event('close')): void {
    if (this.isExiting()) return;
    this.isExiting.set(true);
    this.clearTimer();
    this.onClose.emit({ originalEvent, message: this.toast() });

    // Permite animação de saída antes da remoção final
    setTimeout(() => {
      this.dismiss.emit(this.toast().id);
    }, 200);
  }

  handleToastClick(event: MouseEvent): void { this.onClick.emit({ originalEvent: event, message: this.toast() }); }

  handleAction(): void {
    if (this.toast().action) {
      this.toast().action!.onClick(this.toast());
      this.actionClick.emit(this.toast());
    }
  }
}
