import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ColorPickerSize = 'sm' | 'md' | 'lg';
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb' | 'hsv';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const BLACK: RgbColor = { r: 0, g: 0, b: 0 };

let nextColorPickerId = 0;

const DEFAULT_PRESETS = [
  '#1C6AED',
  '#0406AB',
  '#FF6A1C',
  '#1CEDB9',
  '#6A1CED',
  '#006F4A',
  '#FB2C36',
  '#FE9A00',
  '#141414',
  '#FFFFFF',
];

@Component({
  selector: 'orc-color-picker',
  standalone: true,
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
})
export class ColorPickerComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-color-picker-${++nextColorPickerId}`;

  readonly id = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly label = input('');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  /** @deprecated Popup rendering is local to the color picker; this compatibility input has no effect. */
  readonly appendTo = input<unknown>(undefined);
  readonly tabindex = input(0);
  readonly value = model('#1C6AED');
  readonly size = input<ColorPickerSize>('md');
  readonly presets = input<string[]>(DEFAULT_PRESETS);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly showInput = input(true, { transform: booleanAttribute });
  readonly format = input<ColorPickerFormat>('hex');
  readonly inline = input(false, { transform: booleanAttribute });
  readonly panelStyleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly panelAriaLabel = input<string | undefined>(undefined);
  readonly nativeAriaLabel = input<string | undefined>(undefined);
  readonly inputAriaLabel = input<string | undefined>(undefined);
  readonly presetsAriaLabel = input<string | undefined>(undefined);
  /** @deprecated Transition timing is defined by the component stylesheet; this compatibility input has no effect. */
  readonly showTransitionOptions = input('150ms ease');
  /** @deprecated Transition timing is defined by the component stylesheet; this compatibility input has no effect. */
  readonly hideTransitionOptions = input('150ms ease');
  readonly colorChange = output<string>();
  readonly onChange = output<{ value: string }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClear = output<void>();
  readonly isOpen = signal(false);
  private readonly cvaDisabled = signal(false);
  readonly effectiveId = computed(
    () => this.inputId() || this.id() || this.uniqueId,
  );
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  readonly nativeValue = computed(() =>
    this.toNativeHex(this.parseColor(this.value()) ?? BLACK),
  );

  private cvaChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private ownerDocument: Document | null = null;
  private readonly documentClick = (event: MouseEvent): void =>
    this.onDocumentClick(event);

  ngAfterViewInit(): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    this.ownerDocument = ownerDocument;
    ownerDocument.addEventListener('click', this.documentClick);
  }

  ngOnDestroy(): void {
    this.ownerDocument?.removeEventListener('click', this.documentClick);
    this.ownerDocument = null;
  }

  writeValue(value: unknown): void {
    if (typeof value === 'string' && this.isValidColor(value))
      this.value.set(value);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.cvaChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  toggle(): void {
    if (!this.effectiveDisabled() && !this.inline()) {
      const next = !this.isOpen();
      this.isOpen.set(next);
      (next ? this.onShow : this.onHide).emit();
    }
  }
  selectColor(color: string): void {
    if (!this.effectiveDisabled() && this.isValidColor(color)) {
      this.update(color);
      this.isOpen.set(false);
    }
  }
  onNativeColor(event: Event): void {
    this.update((event.target as HTMLInputElement).value.toUpperCase());
  }
  onTextInput(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.isValidColor(color)) this.update(color.toUpperCase());
  }
  clear(): void {
    if (!this.effectiveDisabled()) {
      this.value.set('');
      this.cvaChange('');
      this.colorChange.emit('');
      this.onChange.emit({ value: '' });
      this.onTouched();
      this.isOpen.set(false);
      this.onClear.emit();
      this.onHide.emit();
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node))
      this.isOpen.set(false);
  }

  private update(color: string): void {
    const parsed = this.parseColor(color);
    if (!parsed) return;

    const next =
      this.format() === 'hex' && color.trim().startsWith('#')
        ? color.trim()
        : this.formatColor(parsed);
    this.value.set(next);
    this.cvaChange(next);
    this.colorChange.emit(next);
    this.onChange.emit({ value: next });
    this.onTouched();
  }

  private isValidColor(color: string): boolean {
    return Boolean(this.parseColor(color));
  }

  private parseColor(color: string): RgbColor | null {
    const value = color.trim();
    const hex = value.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);
    if (hex) {
      const raw =
        hex[1].length === 3
          ? hex[1]
              .split('')
              .map((char) => char + char)
              .join('')
          : hex[1];
      return {
        r: parseInt(raw.slice(0, 2), 16),
        g: parseInt(raw.slice(2, 4), 16),
        b: parseInt(raw.slice(4, 6), 16),
      };
    }

    const rgb = value.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
    );
    if (rgb) {
      const [r, g, b] = rgb.slice(1, 4).map(Number);
      return [r, g, b].every((channel) => channel >= 0 && channel <= 255)
        ? { r, g, b }
        : null;
    }

    const hsv = value.match(
      /^(?:hsv|hsb)\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/i,
    );
    if (!hsv) return null;

    const hue = Number(hsv[1]);
    const saturation = Number(hsv[2]);
    const brightness = Number(hsv[3]);
    if (
      hue < 0 ||
      hue > 360 ||
      saturation < 0 ||
      saturation > 100 ||
      brightness < 0 ||
      brightness > 100
    ) {
      return null;
    }

    const h = hue / 60;
    const s = saturation / 100;
    const v = brightness / 100;
    const chroma = v * s;
    const x = chroma * (1 - Math.abs((h % 2) - 1));
    const m = v - chroma;
    const [r, g, b] =
      h < 1
        ? [chroma, x, 0]
        : h < 2
          ? [x, chroma, 0]
          : h < 3
            ? [0, chroma, x]
            : h < 4
              ? [0, x, chroma]
              : h < 5
                ? [x, 0, chroma]
                : [chroma, 0, x];
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  private formatColor(rgb: RgbColor): string {
    if (this.format() === 'rgb') return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (this.format() === 'hsv' || this.format() === 'hsb') {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      let hue = 0;
      if (delta) {
        hue =
          max === r
            ? ((g - b) / delta) % 6
            : max === g
              ? (b - r) / delta + 2
              : (r - g) / delta + 4;
      }
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
      const saturation = max ? Math.round((delta / max) * 100) : 0;
      const format = this.format() === 'hsb' ? 'hsb' : 'hsv';
      return `${format}(${hue}, ${saturation}%, ${Math.round(max * 100)}%)`;
    }
    return this.toNativeHex(rgb);
  }

  private toNativeHex(rgb: RgbColor): string {
    return `#${[rgb.r, rgb.g, rgb.b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }
}
