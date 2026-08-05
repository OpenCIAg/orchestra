import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonVariant, SkeletonAnimation } from './skeleton.types';

@Component({
  selector: 'app-skeleton, orc-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  // ── Inputs (Signals API) ──────────────────────────────────
  readonly variant = input<SkeletonVariant>('text');
  readonly animation = input<SkeletonAnimation>('shimmer');
  readonly width = input<string | number>('');
  readonly height = input<string | number>('');
  readonly borderRadius = input<string>('');
  readonly ariaLabel = input<string>('Carregando conteúdo...');

  // ── Host Bindings ─────────────────────────────────────────
  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.variant() === 'circular' ? 'inline-block' : 'block';
  }

  @HostBinding('style.width')
  get hostWidth(): string {
    const w = this.computedWidth();
    return w || (this.variant() === 'circular' ? '40px' : '100%');
  }

  @HostBinding('style.vertical-align')
  readonly hostVerticalAlign = 'middle';

  // ── Computed Dimensions ───────────────────────────────────
  readonly computedWidth = computed(() => {
    const w = this.width();
    if (w) return typeof w === 'number' ? `${w}px` : w;

    switch (this.variant()) {
      case 'circular':
        return '40px';
      case 'text':
      case 'rectangular':
      default:
        return '100%';
    }
  });

  readonly computedHeight = computed(() => {
    const h = this.height();
    if (h) return typeof h === 'number' ? `${h}px` : h;

    switch (this.variant()) {
      case 'circular':
        return '40px';
      case 'rectangular':
        return '96px';
      case 'text':
      default:
        return '14px';
    }
  });

  readonly computedBorderRadius = computed(() => {
    const r = this.borderRadius();
    if (r) return r;

    switch (this.variant()) {
      case 'circular':
        return '50%';
      case 'text':
      case 'rectangular':
      default:
        return '8px';
    }
  });
}
