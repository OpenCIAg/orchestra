import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-image-compare',
  standalone: true,
  template: `
    <div
      class="orc-image-compare"
      [style.aspect-ratio]="aspectRatio()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [attr.tabindex]="tabindex()"
      role="group"
    >
      <img class="after" [src]="after()" [attr.alt]="afterAlt() ?? ''" />
      <div class="before" [style.width.%]="effectivePosition()">
        <img [src]="before()" [attr.alt]="beforeAlt() ?? ''" />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        [value]="effectivePosition()"
        (input)="setPosition(+$any($event.target).value)"
        [attr.aria-label]="rangeLabel()"
        [attr.aria-valuetext]="effectivePosition() + '%'"
      />
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-image-compare{position:relative;overflow:hidden;width:100%;background:var(--orc-component-surface-subtle)}.orc-image-compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.orc-image-compare .before{position:absolute;inset:0;overflow:hidden;border-right:2px solid var(--orc-component-border-inverse, var(--orc-component-on-dark))}.orc-image-compare input{position:absolute;inset:auto 0 .5rem;width:calc(100% - 1rem);margin:auto}`,
  ],
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
