import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-icon-field',
  standalone: true,
  template: `<div class="orc-icon-field">
    <span class="icon" aria-hidden="true">{{ icon() }}</span
    ><ng-content />
  </div>`,
  styles: [P2_SHARED_STYLES],
  styleUrl: './icon-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconFieldComponent {
  readonly icon = input('⌕');
}
