import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeSize, BadgeStatus, BadgeVariant } from './badge.types';

@Component({
  selector: 'orc-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  // Inputs (Signals API)
  readonly variant = input<BadgeVariant>('soft');
  readonly status = input<BadgeStatus>('primary');
  readonly size = input<BadgeSize>('md');
  readonly text = input<string>('');
  readonly count = input<number | undefined>(undefined);
  readonly maxCount = input<number>(99);
  readonly dot = input<boolean>(false);
  readonly showDefaultIcon = input<boolean>(false);
  readonly dismissible = input<boolean>(false);
  readonly pill = input<boolean>(false);
  readonly ariaLabel = input<string>('');

  // Outputs (Signals API)
  readonly dismiss = output<MouseEvent>();

  // ── Sinais Computados ──────────────────────────────────────
  readonly displayValue = computed(() => {
    const val = this.count();
    if (val !== undefined && val !== null) {
      const max = this.maxCount();
      return val > max ? `+${max}` : val.toString();
    }
    return this.text();
  });

  readonly normalizedStatus = computed<string>(() => {
    const s = this.status();
    switch (s) {
      case 'danger':
        return 'error';
      case 'completed':
        return 'success';
      case 'new':
        return 'info';
      default:
        return s;
    }
  });

  readonly isDotOnly = computed(() => {
    return this.variant() === 'dot' && !this.displayValue();
  });

  readonly accessibleLabel = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    if (this.displayValue()) return this.displayValue();
    return `Badge de status ${this.status()}`;
  });

  // ── Handlers ──────────────────────────────────────────────
  onDismissClick(event: MouseEvent): void {
    event.stopPropagation();
    this.dismiss.emit(event);
  }
}
