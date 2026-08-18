import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';
import { ToastItem, ToastPosition } from './toast.types';

@Component({
  selector: 'orc-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'orc-toast-container-host',
  },
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  // ── Inputs e Outputs para suporte declarativo e via serviço ──
  readonly toasts = input<ToastItem[]>();
  readonly dismiss = output<string>();
  readonly styleClass = input('');
  readonly preventOpenDuplicates = input(false);
  readonly preventDuplicates = input(false);
  readonly showTransformOptions = input('300ms ease-out');
  readonly hideTransformOptions = input('250ms ease-in');
  readonly showTransitionOptions = input('300ms ease-out');
  readonly hideTransitionOptions = input('250ms ease-in');

  constructor() {
    effect(() => {
      this.toastService.setPreventDuplicates(this.preventDuplicates());
      this.toastService.setPreventOpenDuplicates(this.preventOpenDuplicates());
    });
  }

  readonly positions: ToastPosition[] = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
  ];

  /** Lista consolidada de toasts (input declarativo com fallback para o ToastService) */
  readonly activeToasts = computed(() => this.toasts() ?? this.toastService.toasts());

  /** Agrupa os toasts de forma reativa e memorizada por posição */
  readonly toastsByPosition = computed<Record<ToastPosition, ToastItem[]>>(() => {
    const all = this.activeToasts();
    const map: Record<ToastPosition, ToastItem[]> = {
      'top-right': [],
      'top-left': [],
      'top-center': [],
      'bottom-right': [],
      'bottom-left': [],
      'bottom-center': [],
    };

    for (const toast of all) {
      if (map[toast.position]) {
        map[toast.position].push(toast);
      }
    }

    return map;
  });

  handleDismiss(id: string): void {
    this.dismiss.emit(id);
    this.toastService.dismiss(id);
  }
}
