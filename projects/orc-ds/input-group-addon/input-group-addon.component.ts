import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-input-group-addon',
  standalone: true,
  template: `<span class="orc-input-addon"><ng-content /></span>`,
  styles: [P2_SHARED_STYLES],
  styleUrl: './input-group-addon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupAddonComponent {}
