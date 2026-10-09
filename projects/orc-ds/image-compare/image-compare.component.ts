import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-image-compare',
  standalone: true,
  templateUrl: './image-compare.component.html',
  styles: [ORC_SHARED_VARS],
  styleUrl: './image-compare.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCompareComponent {
  readonly before = input('');
  readonly after = input('');
  readonly beforeAlt = input<string | undefined>(undefined);
  readonly afterAlt = input<string | undefined>(undefined);
  readonly aspectRatio = input('16 / 9');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly position = model(50);
  readonly effectivePosition = computed(() => this.normalize(this.position()));
  readonly rangeLabel = computed(() =>
    this.ariaLabel()
      ? `${this.ariaLabel()} position`
      : 'Image comparison position',
  );
  readonly onSlide = output<number>();

  setPosition(value: number): void {
    if (!Number.isFinite(value)) return;
    const next = this.normalize(value);
    this.position.set(next);
    this.onSlide.emit(next);
  }

  private normalize(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  }
}
