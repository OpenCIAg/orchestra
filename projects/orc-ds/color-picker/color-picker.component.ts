import { ChangeDetectionStrategy, Component, ElementRef, HostListener, booleanAttribute, computed, forwardRef, inject, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ColorPickerSize = 'sm' | 'md' | 'lg';

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
  readonly ariaLabel = input('Escolher cor');
  readonly colorChange = output<string>();
  readonly isOpen = signal(false);
  private readonly cvaDisabled = signal(false);
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly nativeValue = computed(() => this.toNativeHex(this.value()));

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void { if (typeof value === 'string' && this.isValidColor(value)) this.value.set(value); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  toggle(): void { if (!this.effectiveDisabled()) this.isOpen.update(open => !open); }
  selectColor(color: string): void { if (!this.effectiveDisabled() && this.isValidColor(color)) { this.update(color); this.isOpen.set(false); } }
  onNativeColor(event: Event): void { this.update((event.target as HTMLInputElement).value.toUpperCase()); }
  onTextInput(event: Event): void { const color = (event.target as HTMLInputElement).value; if (this.isValidColor(color)) this.update(color.toUpperCase()); }
  clear(): void { if (!this.effectiveDisabled()) { this.update(''); this.isOpen.set(false); } }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void { if (!this.host.nativeElement.contains(event.target as Node)) this.isOpen.set(false); }

  private update(color: string): void { this.value.set(color); this.onChange(color); this.colorChange.emit(color); this.onTouched(); }
  private isValidColor(color: string): boolean { return /^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?$/.test(color); }
  private toNativeHex(color: string): string { if (/^#[0-9A-Fa-f]{3}$/.test(color)) return '#' + color.slice(1).split('').map(char => char + char).join(''); return this.isValidColor(color) ? color : '#000000'; }
}
