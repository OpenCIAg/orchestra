import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ORC_SHARED_STYLES, OrcOrientation } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-button-group',
  standalone: true,
  template: `<div
    class="orc-p2-button-group"
    [class.vertical]="orientation() === 'vertical'"
    [class.attached]="attached()"
    role="group"
    [attr.aria-label]="label() || null"
  >
    <ng-content />
  </div>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-button-group { display: inline-flex; gap: .5rem; align-items: center; } .orc-p2-button-group.vertical { flex-direction: column; align-items: stretch; } .orc-p2-button-group.attached { gap: 0; } .orc-p2-button-group.attached ::ng-deep button { border-radius: 0; } .orc-p2-button-group.attached:not(.vertical) ::ng-deep button:first-child { border-radius: .5rem 0 0 .5rem; } .orc-p2-button-group.attached:not(.vertical) ::ng-deep button:last-child { border-radius: 0 .5rem .5rem 0; } .orc-p2-button-group.vertical.attached ::ng-deep button:first-child { border-radius: .5rem .5rem 0 0; } .orc-p2-button-group.vertical.attached ::ng-deep button:last-child { border-radius: 0 0 .5rem .5rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  readonly orientation = input<OrcOrientation>('horizontal');
  readonly attached = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
}
