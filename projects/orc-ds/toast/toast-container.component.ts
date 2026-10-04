import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  input,
  output,
  effect,
  untracked,
  booleanAttribute,
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
    class: 'orc-toast-container-host',
  },
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  // ── Inputs e Outputs para suporte declarativo e via serviço ──
  readonly toasts = input<ToastItem[]>();
  readonly dismiss = output<string>();
  readonly styleClass = input('');
  readonly preventOpenDuplicates = input<boolean | undefined, unknown>(
    undefined,
    {
      transform: (value) =>
        value == null ? undefined : booleanAttribute(value),
    },
  );
  readonly preventDuplicates = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value == null ? undefined : booleanAttribute(value)),
  });
  /** @internal Used by the service's automatically mounted outlet. */
  readonly automatic = input(false);
  private readonly owner = Symbol('toast-outlet');
  readonly showTransformOptions = input('300ms ease-out');
  readonly hideTransformOptions = input('250ms ease-in');
  readonly showTransitionOptions = input('300ms ease-out');
  readonly hideTransitionOptions = input('250ms ease-in');
  readonly ariaLabel = input<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const duplicates = this.preventDuplicates();
      const openDuplicates = this.preventOpenDuplicates();
      if (duplicates !== undefined)
        this.toastService.setPreventDuplicates(duplicates);
      if (openDuplicates !== undefined)
        this.toastService.setPreventOpenDuplicates(openDuplicates);
    });
    effect((onCleanup) => {
      if (this.toasts() === undefined && !this.automatic()) {
        onCleanup(
          untracked(() => this.toastService.registerContainer(this.owner)),
        );
      }
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
  readonly activeToasts = computed(
    () =>
      this.toasts() ??
      (this.automatic() || this.toastService.isContainerOwner(this.owner)
        ? this.toastService.toasts()
        : []),
  );

  /** Agrupa os toasts de forma reativa e memorizada por posição */
  readonly toastsByPosition = computed<Record<ToastPosition, ToastItem[]>>(
    () => {
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
    },
  );

  handleDismiss(id: string): void {
    this.dismiss.emit(id);
    if (this.toasts() === undefined) this.toastService.dismiss(id);
  }
}
