import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from './p2-shared';

/**
 * Compatibility surface: OrganizationChartComponent lives in the canonical
 * `organization-chart` directory; these re-exports keep every p2 entry
 * symbol unchanged.
 */
export { OrganizationChartComponent } from '@ciag/orchestra/organization-chart';
export type { OrganizationNode } from '@ciag/orchestra/organization-chart';

@Component({
  selector: 'orc-knob',
  standalone: true,
  template: `<div
    class="orc-knob"
    [style.width.px]="normalizedSize()"
    [style.height.px]="normalizedSize()"
    [attr.aria-label]="ariaLabel()"
  >
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle
        class="track"
        cx="50"
        cy="50"
        r="40"
        [style.stroke-width.px]="strokeWidth()"
        [style.stroke]="rangeColor()"
      />
      <circle
        class="progress"
        cx="50"
        cy="50"
        r="40"
        [style.stroke-width.px]="strokeWidth()"
        [style.stroke]="valueColor()"
        [style.stroke-dasharray]="circumference"
        [style.stroke-dashoffset]="dashOffset()"
      />
      <text x="50" y="54" text-anchor="middle">
        {{ valueTemplate() || value() + suffix() }}
      </text>
    </svg>
    <input
      [attr.id]="inputId() || null"
      type="range"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [value]="value()"
      [disabled]="disabled() || cvaDisabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-readonly]="readonly() ? 'true' : null"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      (input)="onInput($event)"
      (mousedown)="onReadonlyPointerdown($event)"
      (keydown)="onReadonlyKeydown($event)"
      (focus)="onFocus.emit($event)"
      (blur)="onBlur.emit($event); onModelTouched()"
    />
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-knob{position:relative;display:inline-block;width:8rem;height:8rem}.orc-knob svg{width:100%;height:100%;transform:rotate(-90deg)}.orc-knob circle{fill:none;stroke-width:10}.orc-knob .track{stroke:var(--orc-component-border)}.orc-knob .progress{stroke:var(--orc-component-interactive);stroke-linecap:round;transition:stroke-dashoffset .15s}.orc-knob text{fill:var(--orc-component-text);font-size:1rem;font-weight:700;transform:rotate(90deg);transform-origin:50px 50px}.orc-knob input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KnobComponent),
      multi: true,
    },
  ],
})
export class KnobComponent implements ControlValueAccessor {
  readonly value = model(0);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly suffix = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly size = input<number | undefined>(undefined);
  readonly strokeWidth = input(10);
  readonly valueColor = input('var(--orc-interactive)');
  readonly rangeColor = input('var(--orc-border-strong)');
  readonly valueTemplate = input<string | undefined>(undefined);
  readonly valueChangeEvent = output<number>();
  readonly onChange = output<number>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  protected readonly cvaDisabled = signal(false);
  private onModelChange: (value: number) => void = () => {};
  protected onModelTouched: () => void = () => {};
  readonly circumference = 2 * Math.PI * 40;
  readonly normalizedSize = computed(() => {
    const size = Number(this.size());
    return Number.isFinite(size) && size > 0 ? size : 128;
  });
  readonly dashOffset = computed(() => {
    const range = Math.max(1, this.max() - this.min());
    const fraction = Math.max(
      0,
      Math.min(1, (this.value() - this.min()) / range),
    );
    return this.circumference * (1 - fraction);
  });
  writeValue(value: number | null): void {
    this.value.set(
      this.normalizeValue(value == null ? this.min() : Number(value)),
    );
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  private normalizeValue(value: number): number {
    const min = this.min();
    const max = Math.max(min, this.max());
    const step = Math.max(Number.EPSILON, this.step());
    const snapped = min + Math.round((value - min) / step) * step;
    return Math.max(min, Math.min(max, Number(snapped.toFixed(10))));
  }
  onReadonlyPointerdown(event: MouseEvent): void {
    if (this.readonly()) event.preventDefault();
  }
  onReadonlyKeydown(event: KeyboardEvent): void {
    if (
      this.readonly() &&
      [
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'End',
        'Home',
        'PageDown',
        'PageUp',
        ' ',
      ].includes(event.key)
    )
      event.preventDefault();
  }
  onInput(event: Event): void {
    if (this.disabled() || this.readonly() || this.cvaDisabled()) return;
    const next = this.normalizeValue(
      Number((event.target as HTMLInputElement).value),
    );
    this.value.set(next);
    this.onModelChange(next);
    this.valueChangeEvent.emit(next);
    this.onChange.emit(next);
  }
}
