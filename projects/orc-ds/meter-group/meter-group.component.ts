import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';
export interface MeterItem {
  value: number;
  label?: string;
  color?: string;
}
@Component({
  selector: 'orc-meter-group',
  standalone: true,
  template: `<div
    class="p-metergroup p-component orc-p2-meter"
    [class]="
      'p-metergroup p-component orc-p2-meter orientation-' +
      orientation() +
      ' label-orientation-' +
      labelOrientation() +
      ' ' +
      styleClass()
    "
    [style]="style()"
    [attr.data-pc-name]="'metergroup'"
  >
    @if (label() && labelPosition() === 'start') {
      <small class="orc-p2-meter__label"
        >{{ label() }} {{ ariaValue() }}/{{ normalizedMax() }}</small
      >
    }
    <div
      class="orc-p2-meter__track"
      role="meter"
      [attr.aria-label]="ariaLabel() || label() || 'Meter'"
      [attr.aria-valuemin]="normalizedMin()"
      [attr.aria-valuemax]="normalizedMax()"
      [attr.aria-valuenow]="ariaValue()"
    >
      @for (item of effectiveValues(); track $index) {
        <span
          [style.width.%]="
            orientation() === 'horizontal' ? percent(item) : null
          "
          [style.height.%]="orientation() === 'vertical' ? percent(item) : null"
          [style.background]="item.color || color()"
          [attr.title]="item.label || null"
        ></span>
      }
    </div>
    @if (label() && labelPosition() === 'end') {
      <small class="orc-p2-meter__label"
        >{{ label() }} {{ ariaValue() }}/{{ normalizedMax() }}</small
      >
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-meter{display:grid;gap:.35rem;width:100%;align-items:stretch}.orc-p2-meter__label{min-width:0}.orc-p2-meter__track{display:flex;flex-direction:row;width:100%;height:.65rem;min-width:0;overflow:hidden;border-radius:999px;background:var(--orc-component-surface-subtle)}.orc-p2-meter__track span{display:block;flex:0 0 auto;min-width:0;min-height:0}/* Keep a definite default extent so percentage segment heights resolve; callers can override it through style.height. */.orc-p2-meter.orientation-vertical{display:inline-flex;flex-direction:column;width:auto;height:8rem;min-width:.65rem;min-height:8rem;align-items:center}.orc-p2-meter.orientation-vertical .orc-p2-meter__track{flex:0 0 auto;flex-direction:column;width:.65rem;height:100%;min-height:8rem}.orc-p2-meter.label-orientation-vertical .orc-p2-meter__label{writing-mode:vertical-rl;text-orientation:mixed}.orc-p2-meter.label-orientation-horizontal .orc-p2-meter__label{writing-mode:horizontal-tb;text-orientation:mixed}`,
  ],
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
