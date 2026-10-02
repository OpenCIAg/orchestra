import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { P2_SHARED_VARS } from '@ciag/orchestra/internal';
import type { P2Option } from '@ciag/orchestra/internal';

export type { P2Option };

export interface DockItem extends P2Option<string> {
  command?: () => void;
}

@Component({
  selector: 'orc-dock',
  standalone: true,
  template: `
    <nav
      class="orc-dock"
      [class.top]="position() === 'top'"
      [class.bottom]="position() === 'bottom'"
      [attr.aria-label]="label() || 'Dock toolbar'"
      role="toolbar"
    >
      @for (item of items(); track item.value; let index = $index) {
        <button
          #dockItem
          type="button"
          [disabled]="item.disabled"
          [attr.aria-label]="item.label || 'Dock item'"
          [tabindex]="isTabStop(index) ? 0 : -1"
          (focus)="activeIndex.set(index)"
          (keydown)="onKeydown($event, index)"
          (click)="item.command?.()"
        >
          <span aria-hidden="true">{{ item.icon || '•' }}</span>
          <small>{{ item.label }}</small>
        </button>
      }
    </nav>
  `,
  styles: [
    P2_SHARED_VARS +
      `.orc-dock{position:fixed;z-index:20;left:50%;display:flex;gap:.4rem;max-width:calc(100vw - 2rem);overflow-x:auto;transform:translateX(-50%);padding:.5rem;border:1px solid var(--orc-component-border);border-radius:.7rem;background:var(--orc-component-surface);box-shadow:0 10px 25px var(--orc-component-shadow-color)}.orc-dock.top{top:1rem}.orc-dock.bottom{bottom:1rem}.orc-dock button{display:grid;flex:0 0 auto;justify-items:center;gap:.15rem;min-width:3rem;border:0;border-radius:.45rem;background:transparent;padding:.35rem}.orc-dock button:hover:not(:disabled){background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive)}.orc-dock span{font-size:1.3rem}.orc-dock small{font-size:.65rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockComponent {
  readonly items = input<DockItem[]>([]);
  readonly position = input<'top' | 'bottom'>('bottom');
  readonly label = input<string | undefined>(undefined);

  readonly activeIndex = signal(0);
  private readonly enabledItemIndices = computed(() =>
    this.items().flatMap((item, index) => (item.disabled ? [] : [index])),
  );
  private readonly normalizedActiveIndex = computed(() => {
    const enabled = this.enabledItemIndices();
    if (!enabled.length) return -1;
    const active = this.activeIndex();
    return enabled.includes(active) ? active : enabled[0];
  });
  private readonly dockButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('dockItem');

  isTabStop(index: number): boolean {
    return index === this.normalizedActiveIndex();
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;

    const enabled = this.enabledItemIndices();
    if (!enabled.length) return;

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = this.moveIndex(index, 1, enabled);
        break;
      case 'ArrowLeft':
        nextIndex = this.moveIndex(index, -1, enabled);
        break;
      case 'Home':
        nextIndex = enabled[0];
        break;
      case 'End':
        nextIndex = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activeIndex.set(nextIndex);
    this.dockButtons()[nextIndex]?.nativeElement.focus();
  }

  private moveIndex(
    current: number,
    direction: -1 | 1,
    enabled: number[],
  ): number {
    const currentPosition = enabled.indexOf(current);
    const startPosition = currentPosition < 0 ? 0 : currentPosition;
    return enabled[
      (startPosition + direction + enabled.length) % enabled.length
    ];
  }
}
