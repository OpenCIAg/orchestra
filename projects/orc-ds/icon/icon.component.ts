import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconFamily, IconFill, IconGrade, IconName, IconOpticalSize, IconSize, IconWeight } from './icon.types';

export const ORC_MATERIAL_SYMBOL_FAMILIES: readonly IconFamily[] = ['outlined', 'rounded', 'sharp'];

const SIZE_MAP: Readonly<Record<string, string>> = {
  xs: '12px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '40px',
};

const clamp = (value: number, min: number, max: number): number => {
  const numericValue = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(numericValue, min), max);
};

const familyName = (family: IconFamily): string => `Material Symbols ${family.charAt(0).toUpperCase()}${family.slice(1)}`;

@Component({
  selector: 'orc-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input<IconName>('circle');
  readonly family = input<IconFamily>('rounded');
  readonly size = input<IconSize>('md');
  readonly fill = input<IconFill>('outline');
  readonly weight = input<IconWeight>(400);
  readonly grade = input<IconGrade>(0);
  readonly opticalSize = input<IconOpticalSize>('auto');
  readonly ariaLabel = input('');
  readonly title = input('');
  readonly fontFamily = computed(() => familyName(this.family()));
  readonly sizeValue = computed(() => {
    const size = this.size();
    return typeof size === 'number' ? `${Math.max(size, 0)}px` : (SIZE_MAP[size] ?? SIZE_MAP['md']);
  });
  readonly opticalSizeValue = computed(() => {
    const opticalSize = this.opticalSize();
    if (typeof opticalSize === 'number') return clamp(opticalSize, 20, 48);
    const size = this.size();
    const sizeInPixels = typeof size === 'number' ? size : Number.parseFloat(SIZE_MAP[size] ?? SIZE_MAP['md']);
    return clamp(sizeInPixels, 20, 48);
  });
  readonly opticalSizing = computed(() => 'none');
  readonly fontVariationSettings = computed(() => {
    const axes = [
      `'FILL' ${this.fill() === 'filled' ? 1 : 0}`,
      `'wght' ${clamp(this.weight(), 100, 700)}`,
      `'GRAD' ${clamp(this.grade(), -50, 200)}`,
      `'opsz' ${this.opticalSizeValue()}`,
    ];
    return axes.join(', ');
  });
  readonly accessibleName = computed(() => this.ariaLabel().trim() || this.title().trim());
}
