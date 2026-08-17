
import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  computed,
  signal,
  booleanAttribute,
  numberAttribute,
  ContentChild,
  TemplateRef,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TooltipDirective } from '@ciag/orchestra/tooltip';

let nextUniqueId = 0;

@Component({
  selector: 'orc-rating',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
})
export class RatingComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-rating-${++nextUniqueId}`;

  // -- Inputs ---------------------------------------------------------
  readonly id = input<string>(this.uniqueId);
  readonly max = input(5, { transform: numberAttribute });
  readonly stars = input<number | undefined>(undefined, { transform: numberAttribute });
  readonly allowHalf = input(false, { transform: booleanAttribute });
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input(''); readonly iconOnClass = input(''); readonly iconOffClass = input('');
  
  // Array de rótulos ex: ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente']
  readonly tooltips = input<string[]>([]);
  
  // Custom SVG via TemplateRef
  @ContentChild('customIcon') customIconTemplate?: TemplateRef<any>;

  // -- Value (Model / CVA) ------------------------------------------
  readonly value = model<number>(0);
  
  // -- Internal State -----------------------------------------------
  readonly hoverValue = signal<number | null>(null);
  protected readonly cvaDisabled = signal<boolean>(false);
  protected readonly isFocused = signal<boolean>(false);
  readonly onRate = output<{ originalEvent: Event; value: number }>(); readonly onCancel = output<Event>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>();

  // -- Computeds ----------------------------------------------------
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  
  readonly effectiveStars = computed(() => this.stars() ?? this.max());
  readonly starsArray = computed(() => Array.from({ length: this.effectiveStars() }, (_, i) => i + 1));

  readonly displayValue = computed(() => {
    const hover = this.hoverValue();
    return hover !== null ? hover : this.value();
  });

  // -- ControlValueAccessor -----------------------------------------
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    const num = typeof val === 'number' ? val : parseFloat(val);
    this.value.set(!isNaN(num) ? num : 0);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // -- Interactions -------------------------------------------------
  
  onItemClick(event: MouseEvent, index: number, isHalf: boolean = false): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    
    // In numeric mode, we ignore half clicks.
    let selectedValue = this.numeric() ? index : (isHalf && this.allowHalf() ? index - 0.5 : index);

    if (this.clearable() && this.value() === selectedValue) {
      selectedValue = 0;
    }

    this.updateValue(selectedValue);
    this.onTouched();
    this.onRate.emit({ originalEvent: event, value: selectedValue });
  }

  onItemHover(index: number, isHalf: boolean = false): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    const hValue = this.numeric() ? index : (isHalf && this.allowHalf() ? index - 0.5 : index);
    this.hoverValue.set(hValue);
  }

  onMouseLeave(): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.hoverValue.set(null);
  }

  handleFocus(event: Event): void {
    if (this.effectiveDisabled()) return;
    this.isFocused.set(true);
    this.onFocus.emit(event);
  }

  handleBlur(event: Event): void {
    if (this.effectiveDisabled()) return;
    this.isFocused.set(false);
    this.onTouched();
    this.onBlur.emit(event);
  }

  private updateValue(val: number): void {
    const safeVal = Math.max(0, Math.min(val, this.effectiveStars()));
    this.value.set(safeVal);
    this.onChange(safeVal);
  }

  // -- Keyboard Navigation (WCAG) -----------------------------------
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;

    const step = this.allowHalf() && !this.numeric() ? 0.5 : 1;
    let current = this.value();

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.updateValue(current + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.updateValue(current - step);
        break;
      case 'Home':
        event.preventDefault();
        this.updateValue(this.allowHalf() ? 0.5 : 1);
        break;
      case 'End':
        event.preventDefault();
        this.updateValue(this.effectiveStars());
        break;
      case 'Escape':
      case '0':
        if (this.clearable()) {
          event.preventDefault();
          this.updateValue(0);
        }
        break;
    }
  }

  // -- Accessibility Helpers ----------------------------------------
  getTooltip(index: number): string | undefined {
    // index is 1-based
    const tt = this.tooltips();
    if (!tt || tt.length === 0) return undefined;
    return tt[index - 1] || undefined;
  }
}
