import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';
export interface MeterItem {
  value: number;
  label?: string;
  color?: string;
}
@Component({
  selector: 'orc-meter-group',
  standalone: true,
  templateUrl: './meter-group.component.html',
  styles: [ORC_SHARED_VARS],
  styleUrl: './meter-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeterGroupComponent {
  readonly values = input<MeterItem[]>([]);
  readonly value = input<MeterItem[] | undefined>(undefined);
  readonly min = input(0);
  readonly max = input(100);
  readonly color = input('#3b82f6');
  readonly label = input('');
  readonly labelPosition = input<'start' | 'end'>('end');
  readonly labelOrientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  private finiteNonNegative(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }
  private finite(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback;
  }
  private readonly normalizedValues = computed<MeterItem[]>(() => {
    const source = this.value() ?? this.values();
    return (Array.isArray(source) ? source : []).map((item) => ({
      ...(item ?? {}),
      value: this.finiteNonNegative(item?.value),
    }));
  });
  private readonly normalizedMinValue = computed(() =>
    this.finite(this.min(), 0),
  );
  private readonly normalizedMaxValue = computed(() =>
    Math.max(this.normalizedMinValue(), this.finite(this.max(), 100)),
  );
  private readonly totalValue = computed(() =>
    this.normalizedValues().reduce((sum, item) => {
      const next = sum + item.value;
      return Number.isFinite(next) ? next : Number.MAX_VALUE;
    }, 0),
  );
  private readonly ariaValueValue = computed(() =>
    Math.max(
      this.normalizedMinValue(),
      Math.min(this.normalizedMaxValue(), this.totalValue()),
    ),
  );
  normalizedMin(): number {
    return this.normalizedMinValue();
  }
  normalizedMax(): number {
    return this.normalizedMaxValue();
  }
  effectiveValues(): MeterItem[] {
    return this.normalizedValues();
  }
  total(): number {
    return this.totalValue();
  }
  ariaValue(): number {
    return this.ariaValueValue();
  }
  percent(item: MeterItem): number {
    const value = this.finiteNonNegative(item?.value);
    const total = this.totalValue();
    const range = this.normalizedMax() - this.normalizedMin();
    if (value === 0 || total === 0 || range <= 0) return 0;
    const share = total > range ? value / total : value / range;
    return Math.max(0, Math.min(100, share * 100));
  }
}
