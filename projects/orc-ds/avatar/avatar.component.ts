import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AvatarColorVariant,
  AvatarShape,
  AvatarSize,
  AvatarStatus,
  AvatarStatusPosition,
} from './avatar.types';

@Component({
  selector: 'orc-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  // Inputs (Signals API)
  readonly src = input<string>('');
  readonly name = input<string>('');
  readonly initials = input<string>('');
  readonly alt = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly shape = input<AvatarShape>('circular');
  readonly status = input<AvatarStatus | undefined>(undefined);
  readonly statusPosition = input<AvatarStatusPosition>('bottom-right');
  readonly colorVariant = input<AvatarColorVariant>('default');
  readonly bordered = input<boolean>(false);
  readonly clickable = input<boolean>(false);

  // Outputs (Signals API)
  readonly imageError = output<Event>();
  readonly avatarClick = output<MouseEvent>();

  // Estado interno para controle de erro no carregamento da imagem
  readonly imageFailed = signal<boolean>(false);

  constructor() {
    // Reseta estado de erro caso a URL da imagem mude
    effect(
      () => {
        this.src();
        this.imageFailed.set(false);
      },
      { allowSignalWrites: true }
    );
  }

  // ── Sinais Computados ──────────────────────────────────────
  readonly showImage = computed(() => {
    return Boolean(this.src() && !this.imageFailed());
  });

  readonly computedInitials = computed(() => {
    if (this.initials()) {
      return this.initials().trim().toUpperCase().slice(0, 3);
    }
    const fullName = this.name()?.trim();
    if (!fullName) return '';

    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly hasInitials = computed(() => {
    return !this.showImage() && Boolean(this.computedInitials());
  });

  readonly showIcon = computed(() => {
    return !this.showImage() && !this.hasInitials();
  });

  readonly effectiveColorVariant = computed(() => {
    const variant = this.colorVariant();
    if (variant !== 'auto') {
      return variant;
    }

    const key = this.name() || this.initials() || '';
    if (!key) return 'default';

    const variants: AvatarColorVariant[] = ['primary', 'royal', 'orange', 'purple'];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % variants.length;
    return variants[index];
  });

  readonly accessibleLabel = computed(() => {
    if (this.alt()) return this.alt();
    if (this.name()) return `Avatar de ${this.name()}`;
    if (this.computedInitials()) return `Avatar ${this.computedInitials()}`;
    return 'Avatar do usuário';
  });

  readonly statusText = computed(() => {
    switch (this.status()) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'busy':
        return 'Ocupado';
      case 'away':
        return 'Ausente';
      default:
        return '';
    }
  });

  // ── Event Handlers ────────────────────────────────────────
  onImageError(event: Event): void {
    this.imageFailed.set(true);
    this.imageError.emit(event);
  }

  onClick(event: MouseEvent): void {
    if (this.clickable()) {
      this.avatarClick.emit(event);
    }
  }
}
