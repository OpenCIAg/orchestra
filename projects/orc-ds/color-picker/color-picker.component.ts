import { ChangeDetectionStrategy, Component, ElementRef, HostListener, booleanAttribute, computed, forwardRef, inject, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ColorPickerSize = 'sm' | 'md' | 'lg';
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsv';

let nextColorPickerId = 0;

const DEFAULT_PRESETS = ['#1C6AED', '#0406AB', '#FF6A1C', '#1CEDB9', '#6A1CED', '#006F4A', '#FB2C36', '#FE9A00', '#141414', '#FFFFFF'];

@Component({
  selector: 'orc-color-picker',
  standalone: true,
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true }],
})
export class ColorPickerComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-color-picker-${++nextColorPickerId}`;

  readonly id = input('');
  readonly label = input('');
  readonly value = model('#1C6AED');
  readonly size = input<ColorPickerSize>('md');
  readonly presets = input<string[]>(DEFAULT_PRESETS);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly showInput = input(true, { transform: booleanAttribute });
  readonly format = input<ColorPickerFormat>('hex'); readonly inline = input(false, { transform: booleanAttribute }); readonly panelStyleClass = input('');
  readonly ariaLabel = input('Escolher cor');
  readonly colorChange = output<string>();
  readonly onChange = output<{ value: string }>(); readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onClear = output<void>();
  readonly isOpen = signal(false);
  private readonly cvaDisabled = signal(false);
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly nativeValue = computed(() => this.toNativeHex(this.value()));

  private cvaChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void { if (typeof value === 'string' && this.isValidColor(value)) this.value.set(value); }
  registerOnChange(fn: (value: string) => void): void { this.cvaChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  toggle(): void { if (!this.effectiveDisabled() && !this.inline()) { const next = !this.isOpen(); this.isOpen.set(next); (next ? this.onShow : this.onHide).emit(); } }
  selectColor(color: string): void { if (!this.effectiveDisabled() && this.isValidColor(color)) { this.update(color); this.isOpen.set(false); } }
  onNativeColor(event: Event): void { this.update((event.target as HTMLInputElement).value.toUpperCase()); }
  onTextInput(event: Event): void { const color = (event.target as HTMLInputElement).value; if (this.isValidColor(color)) this.update(color.toUpperCase()); }
  clear(): void { if (!this.effectiveDisabled()) { this.value.set(''); this.cvaChange(''); this.colorChange.emit(''); this.onChange.emit({ value: '' }); this.onTouched(); this.isOpen.set(false); this.onClear.emit(); this.onHide.emit(); } }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void { if (!this.host.nativeElement.contains(event.target as Node)) this.isOpen.set(false); }

  private update(color: string): void { const hex = this.toNativeHex(color); if (hex === '#000000' && color.toLowerCase() !== '#000000') return; const next = this.format() === 'hex' && color.trim().startsWith('#') ? color.trim() : this.formatColor(hex); this.value.set(next); this.cvaChange(next); this.colorChange.emit(next); this.onChange.emit({ value: next }); this.onTouched(); }
  private isValidColor(color: string): boolean { return Boolean(this.parseColor(color)); }
  private parseColor(color: string): { r: number; g: number; b: number } | null { const value = color.trim(); const hex = value.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/); if (hex) { const raw = hex[1].length === 3 ? hex[1].split('').map(char => char + char).join('') : hex[1]; return { r: parseInt(raw.slice(0, 2), 16), g: parseInt(raw.slice(2, 4), 16), b: parseInt(raw.slice(4, 6), 16) }; } const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i); if (rgb) { const channels = rgb.slice(1, 4).map(Number); return channels.every(channel => channel <= 255) ? { r: channels[0], g: channels[1], b: channels[2] } : null; } const hsv = value.match(/^hsv\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/i); if (hsv) { const h = Number(hsv[1]) / 60; const s = Number(hsv[2]) / 100; const v = Number(hsv[3]) / 100; const c = v * s; const x = c * (1 - Math.abs((h % 2) - 1)); const m = v - c; const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]; return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }; } return null; }
  private formatColor(hex: string): string { const rgb = this.parseColor(hex)!; if (this.format() === 'rgb') return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; if (this.format() === 'hsv') { const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min; let h = 0; if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round(h * 60); if (h < 0) h += 360; const s = max ? Math.round((d / max) * 100) : 0; return `hsv(${h}, ${s}%, ${Math.round(max * 100)}%)`; } return hex; }
  private toNativeHex(color: string): string { const rgb = this.parseColor(color); if (!rgb) return '#000000'; return `#${[rgb.r, rgb.g, rgb.b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`; }
}
