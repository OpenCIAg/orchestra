import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-kbd',
  standalone: true,
  template: `<kbd
    class="orc-p2-kbd"
    [attr.aria-label]="ariaLabel().trim() || null"
  >
    @for (key of normalizedKeys(); track $index) {
      <span>{{ key }}</span>
    }
  </kbd>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-kbd { display: inline-flex; gap: .2rem; align-items: center; padding: .15rem .35rem; border: 1px solid var(--orc-component-border-strong); border-bottom-width: 2px; border-radius: .3rem; background: var(--orc-component-surface-subtle); color: var(--orc-component-text-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbdComponent {
  readonly keys = input<string | string[]>('⌘ K');
  readonly ariaLabel = input('');
  readonly normalizedKeys = computed(() => {
    const keys = this.keys();
    return Array.isArray(keys)
      ? keys.map((key) => key.trim()).filter(Boolean)
      : keys
          .trim()
          .split(/\s*(?:\+|\s)\s*/)
          .filter(Boolean);
  });
}
