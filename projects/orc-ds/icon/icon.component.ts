import { ChangeDetectionStrategy, Component, computed, inject, input, InjectionToken, Provider } from '@angular/core';
import { IconName, IconSize, OrcIconDefinition, IconFill } from './icon.types';

export const ORC_ICON_FALLBACK: OrcIconDefinition = {
  name: 'circle',
  viewBox: '0 0 24 24',
  paths: [{ d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' }],
};

export const ORC_ICON_REGISTRY = new InjectionToken<OrcIconRegistry>('ORC_ICON_REGISTRY');

export interface OrcIconRegistry {
  get(name: string): OrcIconDefinition | undefined;
}

export function provideOrcIcons(...icons: OrcIconDefinition[]): Provider {
  return {
    provide: ORC_ICON_REGISTRY,
    useValue: { get: (name: string) => icons.find((icon) => icon.name === name) },
  };
}

@Component({
  selector: 'orc-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input<IconName>('circle');
  readonly icon = input<OrcIconDefinition | null>(null);
  readonly size = input<IconSize>('md');
  readonly fill = input<IconFill>('outline');
  readonly ariaLabel = input('');
  readonly title = input('');
  private readonly registry = inject<OrcIconRegistry | null>(ORC_ICON_REGISTRY, { optional: true });
  readonly definition = computed(() => this.icon() ?? this.registry?.get(this.name()) ?? ORC_ICON_FALLBACK);
  readonly paths = computed(() => this.fill() === 'filled' ? (this.definition().filledPaths ?? this.definition().paths) : this.definition().paths);
  readonly sizeValue = computed(() => typeof this.size() === 'number' ? `${this.size()}px` : ({ xs: '12px', sm: '16px', md: '20px', lg: '24px', xl: '32px' }[this.size()] ?? '20px'));
}
