import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-overlay-badge',
  standalone: true,
  template: `<span class="orc-p2-overlay-badge"
    ><ng-content /><span
      class="orc-p2-overlay-badge__value"
      [class.dot]="isDot()"
      [attr.role]="ariaLabel() || !isDot() ? 'img' : null"
      [attr.aria-label]="ariaLabel() || (!isDot() ? value() : null)"
      [attr.aria-hidden]="isDot() && !ariaLabel() ? 'true' : null"
      >{{ isDot() ? '' : value() }}</span
    ></span
  >`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-overlay-badge{position:relative;display:inline-flex}.orc-p2-overlay-badge__value{position:absolute;top:-.45rem;inset-inline-end:-.45rem;min-width:1.15rem;height:1.15rem;padding:0 .25rem;border-radius:999px;background:var(--orc-component-danger);color:var(--orc-component-on-dark);font-size:.7rem;line-height:1.15rem;text-align:center}.orc-p2-overlay-badge__value.dot{width:.6rem;min-width:.6rem;height:.6rem;padding:0}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayBadgeComponent {
  readonly value = input<string | number>('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly isDot = computed(() => this.value() == null || this.value() === '');
}
