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
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-knob',
  standalone: true,
  templateUrl: './knob.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './knob.component.scss',
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
