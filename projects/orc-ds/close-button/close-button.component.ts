import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

/**
 * @deprecated Use `ButtonComponent` (`orc-button` from `@ciag/orchestra/button`) with
 * `variant="close"`. Removed at the 23.0.0 gate.
 */
@Component({
  selector: 'orc-close-button',
  standalone: true,
  template: `<button
    type="button"
    class="orc-p2-close-button"
    [class]="'orc-p2-close-button orc-p2-close-button--' + size()"
    [disabled]="disabled()"
    [attr.aria-label]="ariaLabel() || 'Close'"
    (click)="close.emit()"
  >
    <span aria-hidden="true">{{ icon() }}</span>
  </button>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-close-button { display: inline-grid; place-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text-secondary); line-height: 1; } .orc-p2-close-button:hover:not(:disabled) { background: var(--orc-component-surface-muted); color: var(--orc-component-text); } .orc-p2-close-button:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; } .orc-p2-close-button--sm { width: 1.5rem; height: 1.5rem; } .orc-p2-close-button--md { width: 2rem; height: 2rem; } .orc-p2-close-button--lg { width: 2.5rem; height: 2.5rem; font-size: 1.3rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly icon = input('×');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly close = output<void>();
}
