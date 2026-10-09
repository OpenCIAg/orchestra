import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-visually-hidden',
  standalone: true,
  template: `<span class="orc-p2-visually-hidden"><ng-content /></span>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisuallyHiddenComponent {}
