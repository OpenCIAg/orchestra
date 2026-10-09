import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ORC_SHARED_STYLES, OrcOrientation } from '@ciag/orchestra/internal';

/**
 * @deprecated Use `DividerComponent` (`orc-divider` from `@ciag/orchestra/divider`) with
 * `[decorative]="false"` for a named separator. Removed at the 23.0.0 gate.
 */
@Component({
  selector: 'orc-separator',
  standalone: true,
  template: `<div
    class="orc-p2-separator"
    [class.vertical]="orientation() === 'vertical'"
    role="separator"
    [attr.aria-orientation]="orientation()"
    [attr.aria-label]="label() || null"
  ></div>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-separator { width: 100%; height: 1px; background: var(--orc-component-surface-subtle); } .orc-p2-separator.vertical { width: 1px; height: 100%; min-height: 1rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorComponent {
  readonly orientation = input<OrcOrientation>('horizontal');
  readonly label = input('');
}
