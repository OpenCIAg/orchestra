import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-ifta-label',
  standalone: true,
  template: `<div class="orc-ifta"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES],
  styleUrl: './ifta-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IftaLabelComponent {}
