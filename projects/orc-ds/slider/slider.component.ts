import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  computed,
  signal,
  ElementRef,
  viewChild,
  booleanAttribute,
  numberAttribute,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  SliderValue,
  SliderSize,
  SliderTooltipMode,
  SliderMark,
  ParsedSliderMark,
} from './slider.types';

let nextSliderUniqueId = 0;

@Component({
  selector: 'orc-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements ControlValueAccessor, OnDestroy {
  private readonly uniqueId = `orc-slider-${++nextSliderUniqueId}`;

  // ── Element References ────────────────────────────────────
  readonly trackRef = viewChild<ElementRef<HTMLElement>>('trackElement');
  readonly startThumbRef = viewChild<ElementRef<HTMLElement>>('startThumb');
  readonly endThumbRef = viewChild<ElementRef<HTMLElement>>('endThumb');

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly id = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string>('');
  readonly range = input(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly animate = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly min = input<number, unknown>(0, {
    transform: (v: unknown) => numberAttribute(v, 0),
  });
  readonly max = input<number, unknown>(100, {
    transform: (v: unknown) => numberAttribute(v, 100),
  });
  readonly step = input<number, unknown>(1, {
    transform: (v: unknown) => numberAttribute(v, 1),
  });
  readonly size = input<SliderSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showTicks = input(false, { transform: booleanAttribute });
  readonly showLabels = input(false, { transform: booleanAttribute });
  readonly marks = input<Record<number, string> | SliderMark[] | number[] | undefined>(undefined);
  readonly showTooltip = input<SliderTooltipMode>('auto');
  readonly tooltip = input<string | undefined>(undefined);
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');
  readonly valueFormatter = input<((val: number) => string) | undefined>(undefined);
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelMin = input<string>('Valor mínimo');
  readonly ariaLabelMax = input<string>('Valor máximo');

  // ── Two-Way Model ─────────────────────────────────────────
  readonly value = model<SliderValue>(0);

  // ── Outputs (Signals API) ─────────────────────────────────
  readonly sliderChange = output<SliderValue>();
  readonly sliderInput = output<SliderValue>();
  readonly onChange = output<{ originalEvent?: Event; value: SliderValue }>();
  readonly onSlideEnd = output<{ originalEvent?: Event; value: SliderValue }>();

  // ── Estado Interno ────────────────────────────────────────
  protected readonly activeThumb = signal<'start' | 'end' | null>(null);
  protected readonly isDragging = signal<boolean>(false);
  protected readonly hoveredThumb = signal<'start' | 'end' | null>(null);
  protected readonly focusedThumb = signal<'start' | 'end' | null>(null);
  protected readonly cvaDisabled = signal<boolean>(false);

  private activePointerId: number | null = null;

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveId = computed(() => this.inputId() || this.id() || this.uniqueId);
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);

  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  readonly minVal = computed(() => this.min());
  readonly maxVal = computed(() => {
    const min = this.minVal();
    const max = this.max();
    return max > min ? max : min + 1;
  });

  readonly stepVal = computed(() => {
    const s = this.step();
    return s > 0 ? s : 1;
  });

  readonly normalizedValues = computed<[number, number]>(() => {
    const raw = this.value();
    const min = this.minVal();
    const max = this.maxVal();
    const isRange = this.range();

    if (isRange) {
      let start: number;
      let end: number;
      if (Array.isArray(raw)) {
        start = Number(raw[0]) || min;
        end = Number(raw[1]) || max;
      } else {
        start = min;
        end = Number(raw) || max;
      }
      start = this.clamp(start, min, max);
      end = this.clamp(end, min, max);
      if (start > end) {
        start = end;
      }
      return [start, end];
    } else {
      let val = typeof raw === 'number' ? raw : Array.isArray(raw) ? raw[0] : min;
      val = this.clamp(Number(val) || min, min, max);
      return [min, val];
    }
  });

  readonly currentStartValue = computed(() => this.normalizedValues()[0]);
  readonly currentEndValue = computed(() => this.normalizedValues()[1]);

  readonly startPercent = computed(() => {
    const min = this.minVal();
    const max = this.maxVal();
    const val = this.currentStartValue();
    return this.calculatePercent(val, min, max);
  });

  readonly endPercent = computed(() => {
    const min = this.minVal();
    const max = this.maxVal();
    const val = this.currentEndValue();
    return this.calculatePercent(val, min, max);
  });

  readonly fillLeftPercent = computed(() => {
    return this.range() ? this.startPercent() : 0;
  });

  readonly fillWidthPercent = computed(() => {
    if (this.range()) {
      return Math.max(0, this.endPercent() - this.startPercent());
    }
    return this.endPercent();
  });

  readonly formattedStartValue = computed(() => {
    const val = this.currentStartValue();
    const fmt = this.valueFormatter();
    return fmt ? fmt(val) : String(val);
  });

  readonly formattedEndValue = computed(() => {
    const val = this.currentEndValue();
    const fmt = this.valueFormatter();
    return fmt ? fmt(val) : String(val);
  });

  readonly parsedMarks = computed<ParsedSliderMark[]>(() => {
    const marksData = this.marks();
    const min = this.minVal();
    const max = this.maxVal();

    if (!marksData) {
      if (this.showLabels()) {
        return [
          { value: min, percent: 0, label: String(min) },
          { value: max, percent: 100, label: String(max) },
        ];
      }
      return [];
    }

    if (Array.isArray(marksData)) {
      return marksData.map((item) => {
        const val = typeof item === 'number' ? item : item.value;
        const lbl = typeof item === 'number' ? String(item) : item.label ?? String(val);
        return {
          value: val,
          percent: this.calculatePercent(val, min, max),
          label: lbl,
        };
      });
    }

    if (typeof marksData === 'object') {
      return Object.entries(marksData).map(([valStr, label]) => {
        const val = Number(valStr);
        return {
          value: val,
          percent: this.calculatePercent(val, min, max),
          label: String(label),
        };
      });
    }

    return [];
  });

  readonly ticks = computed<number[]>(() => {
    if (!this.showTicks()) return [];
    const min = this.minVal();
    const max = this.maxVal();
    const step = this.stepVal();
    const count = Math.floor((max - min) / step);
    if (count > 100) return []; // Evita renderizar milhares de ticks se step for muito pequeno

    const items: number[] = [];
    for (let i = 0; i <= count; i++) {
      const val = min + i * step;
      items.push(this.calculatePercent(val, min, max));
    }
    return items;
  });

  // ── ControlValueAccessor ──────────────────────────────────
  private onModelChange: (value: SliderValue) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.value.set(this.range() ? [this.minVal(), this.maxVal()] : this.minVal());
    } else {
      this.value.set(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ── Handlers de Ponteiro / Arraste ────────────────────────
  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.effectiveDisabled()) return;

    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clickPercent = this.pointerPercent(event, rect);
    const clickedVal = this.percentToValue(clickPercent);

    let targetThumb: 'start' | 'end' = 'end';

    if (this.range()) {
      const startDist = Math.abs(clickedVal - this.currentStartValue());
      const endDist = Math.abs(clickedVal - this.currentEndValue());
      if (startDist < endDist) {
        targetThumb = 'start';
      } else if (startDist === endDist) {
        targetThumb = clickedVal < this.currentStartValue() ? 'start' : 'end';
      } else {
        targetThumb = 'end';
      }
    }

    this.activeThumb.set(targetThumb);
    this.isDragging.set(true);
    this.activePointerId = event.pointerId;

    this.updateValueByTarget(targetThumb, clickedVal, event);

    // Adiciona ouvintes globais para continuidade fluida do arraste
    window.addEventListener('pointermove', this.onGlobalPointerMove);
    window.addEventListener('pointerup', this.onGlobalPointerUp);
    window.addEventListener('pointercancel', this.onGlobalPointerUp);

    // Foca o thumb correspondente para acessibilidade
    if (targetThumb === 'start') {
      this.startThumbRef()?.nativeElement.focus();
    } else {
      this.endThumbRef()?.nativeElement.focus();
    }

    event.preventDefault();
  }

  private onGlobalPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging() || this.effectiveDisabled()) return;

    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const percent = this.pointerPercent(event, rect);
    const currentVal = this.percentToValue(percent);

    const thumb = this.activeThumb();
    if (thumb) {
      this.updateValueByTarget(thumb, currentVal, event);
    }
  };

  private onGlobalPointerUp = (event: PointerEvent): void => {
    if (!this.isDragging()) return;

    this.isDragging.set(false);
    this.activeThumb.set(null);
    this.activePointerId = null;

    window.removeEventListener('pointermove', this.onGlobalPointerMove);
    window.removeEventListener('pointerup', this.onGlobalPointerUp);
    window.removeEventListener('pointercancel', this.onGlobalPointerUp);

    this.onTouched();
    this.sliderChange.emit(this.value());
    this.onSlideEnd.emit({ value: this.value() });
  };

  // ── Navegação por Teclado WCAG ────────────────────────────
  protected onKeyDown(event: KeyboardEvent, thumb: 'start' | 'end'): void {
    if (this.effectiveDisabled()) return;

    const step = this.stepVal();
    const pageJump = Math.max(step * 10, (this.maxVal() - this.minVal()) / 10);
    const currentVal = thumb === 'start' ? this.currentStartValue() : this.currentEndValue();
    let nextVal = currentVal;
    let handled = false;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextVal = currentVal + step;
        handled = true;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        nextVal = currentVal - step;
        handled = true;
        break;
      case 'PageUp':
        nextVal = currentVal + pageJump;
        handled = true;
        break;
      case 'PageDown':
        nextVal = currentVal - pageJump;
        handled = true;
        break;
      case 'Home':
        nextVal = this.minVal();
        handled = true;
        break;
      case 'End':
        nextVal = this.maxVal();
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      this.updateValueByTarget(thumb, nextVal, event);
      this.sliderChange.emit(this.value());
    }
  }

  protected onThumbFocus(thumb: 'start' | 'end'): void {
    this.focusedThumb.set(thumb);
  }

  protected onThumbBlur(): void {
    this.focusedThumb.set(null);
    this.onTouched();
  }

  protected onThumbMouseEnter(thumb: 'start' | 'end'): void {
    this.hoveredThumb.set(thumb);
  }

  protected onThumbMouseLeave(): void {
    this.hoveredThumb.set(null);
  }

  // ── Utilitários de Cálculo e Atualização ───────────────────
  private updateValueByTarget(thumb: 'start' | 'end', rawVal: number, originalEvent?: Event): void {
    const min = this.minVal();
    const max = this.maxVal();
    const steppedVal = this.snapToStep(this.clamp(rawVal, min, max));

    if (this.range()) {
      let [start, end] = this.normalizedValues();
      if (thumb === 'start') {
        start = Math.min(steppedVal, end);
      } else {
        end = Math.max(steppedVal, start);
      }
      const nextRange: [number, number] = [start, end];
      this.value.set(nextRange);
      this.onModelChange(nextRange);
      this.sliderInput.emit(nextRange);
      this.onChange.emit({ originalEvent, value: nextRange });
    } else {
      this.value.set(steppedVal);
      this.onModelChange(steppedVal);
      this.sliderInput.emit(steppedVal);
      this.onChange.emit({ originalEvent, value: steppedVal });
    }
  }

  private snapToStep(val: number): number {
    const min = this.minVal();
    const step = this.stepVal();
    const count = Math.round((val - min) / step);
    const result = min + count * step;
    // Arredonda para evitar problemas de ponto flutuante (ex: 0.1 + 0.2 = 0.30000000000000004)
    const stepDecimals = (step.toString().split('.')[1] || '').length;
    return Number(result.toFixed(stepDecimals));
  }

  private calculatePercent(val: number, min: number, max: number): number {
    if (max <= min) return 0;
    return this.clamp(((val - min) / (max - min)) * 100, 0, 100);
  }

  private percentToValue(percent: number): number {
    const min = this.minVal();
    const max = this.maxVal();
    return min + percent * (max - min);
  }

  private pointerPercent(event: PointerEvent, rect: DOMRect): number {
    if (this.orientation() === 'vertical') return this.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
    return this.clamp((event.clientX - rect.left) / rect.width, 0, 1);
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  shouldShowTooltip(thumb: 'start' | 'end'): boolean {
    const mode = this.showTooltip();
    if (mode === 'never') return false;
    if (mode === 'always') return true;

    // auto: exibe durante arraste, hover ou foco
    const isThisThumbActive = this.activeThumb() === thumb && this.isDragging();
    const isThisThumbHovered = this.hoveredThumb() === thumb;
    const isThisThumbFocused = this.focusedThumb() === thumb;

    return isThisThumbActive || isThisThumbHovered || isThisThumbFocused;
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.onGlobalPointerMove);
    window.removeEventListener('pointerup', this.onGlobalPointerUp);
    window.removeEventListener('pointercancel', this.onGlobalPointerUp);
  }
}
