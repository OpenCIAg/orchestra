import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  booleanAttribute,
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
  readonly severity = input<BadgeStatus | undefined>(undefined);
  readonly size = input<BadgeSize>('md');
  readonly text = input<string>('');
  readonly value = input<string | number | undefined>(undefined);
  readonly count = input<number | undefined>(undefined);
  readonly maxCount = input<number>(99);
  readonly dot = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly showDefaultIcon = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly dismissible = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly liveRegion = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly pill = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');

  // Outputs (Signals API)
  readonly dismiss = output<MouseEvent>();

  // ── Sinais Computados ──────────────────────────────────────
  readonly effectiveStatus = computed(() => this.severity() ?? this.status());
  readonly displayValue = computed(() => {
    const direct = this.value();
    if (direct !== undefined) return String(direct);
    const val = this.count();
    if (val !== undefined && val !== null) {
      const max = this.maxCount();
      return val > max ? `+${max}` : val.toString();
    }
    return this.text();
  });

  readonly normalizedStatus = computed<string>(() => {
    const s = this.effectiveStatus();
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
    return (this.variant() === 'dot' || this.dot()) && !this.displayValue();
  });

  readonly accessibleLabel = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    if (this.displayValue()) return this.displayValue();
    if (this.isDotOnly()) return `${this.normalizedStatus()} status`;
    return undefined;
  });

  readonly computedRole = computed<'status' | 'img' | undefined>(() => {
    if (this.dismissible()) return undefined;
    if (this.liveRegion()) return 'status';
    return this.isDotOnly() ? 'img' : undefined;
  });

  // ── Handlers ──────────────────────────────────────────────
  onDismissClick(event: MouseEvent): void {
    event.stopPropagation();
    this.dismiss.emit(event);
  }
}
