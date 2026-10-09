import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-text',
  standalone: true,
  template: `<span
    [class]="'orc-p2-text orc-p2-text--' + size()"
    [class.muted]="muted()"
    [class.truncate]="truncate()"
    ><ng-content
  /></span>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-text { color: var(--orc-component-text); } .orc-p2-text--sm { font-size: .875rem; } .orc-p2-text--md { font-size: 1rem; } .orc-p2-text--lg { font-size: 1.25rem; } .muted { color: var(--orc-component-text-muted); } .truncate { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly muted = input(false, { transform: booleanAttribute });
  readonly truncate = input(false, { transform: booleanAttribute });
}
