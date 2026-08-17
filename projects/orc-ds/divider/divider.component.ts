import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

@Component({
  selector: 'orc-divider',
  standalone: true,
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>('horizontal');
  readonly variant = input<DividerVariant>('solid');
  readonly label = input('');
  readonly inset = input(false, { transform: booleanAttribute });
  readonly decorative = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly classes = computed(() => ({
    'orc-divider': true,
    'orc-divider--vertical': this.orientation() === 'vertical',
    'orc-divider--inset': this.inset(),
    [`orc-divider--${this.variant()}`]: true,
    'orc-divider--labeled': !!this.label(),
  }));
}
