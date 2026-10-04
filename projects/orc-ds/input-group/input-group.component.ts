import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-input-group',
  standalone: true,
  templateUrl: './input-group.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupComponent {
  readonly label = input('');
  readonly prefix = input('');
  readonly suffix = input('');
}
