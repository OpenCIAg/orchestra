import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-link',
  standalone: true,
  template: `<a
    class="orc-p2-link"
    [attr.href]="disabled() ? null : href()"
    [target]="target() || null"
    [rel]="target() === '_blank' ? 'noopener noreferrer' : null"
    [class.disabled]="disabled()"
    [class.underline]="underline()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-disabled]="disabled() ? 'true' : null"
    [attr.tabindex]="disabled() ? -1 : null"
    [attr.inert]="disabled() ? '' : null"
    (click)="onClick($event)"
    (keydown)="onKeydown($event)"
    ><ng-content
  /></a>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-link { color: var(--orc-component-interactive); text-decoration: none; } .orc-p2-link.underline, .orc-p2-link:hover { text-decoration: underline; } .orc-p2-link.disabled { pointer-events: none; color: var(--orc-component-text-muted); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  readonly href = input('#');
  readonly target = input('');
  readonly ariaLabel = input('');
  readonly underline = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly activated = output<MouseEvent>();
  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.activated.emit(event);
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
