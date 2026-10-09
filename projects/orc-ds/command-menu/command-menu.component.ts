import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

export interface CommandItem {
  label: string;
  shortcut?: string;
  icon?: string;
  keywords?: string[];
  disabled?: boolean;
  command?: () => void;
}

let nextCommandMenuId = 0;

@Component({
  selector: 'orc-command-menu',
  standalone: true,
  template: `
    <section
      class="orc-command"
      [attr.aria-label]="label() || 'Command menu'"
      role="dialog"
    >
      <input
        type="search"
        role="combobox"
        [value]="query()"
        [attr.aria-label]="searchAriaLabel() || 'Search commands'"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="activeOptionId()"
        aria-autocomplete="list"
        aria-expanded="true"
        (input)="setQuery($any($event.target).value)"
        (keydown)="keydown($event)"
        [attr.placeholder]="placeholder() || null"
      />
      <ul [id]="listboxId" role="listbox">
        @for (item of filteredItems(); track $index) {
          <li
            [id]="optionId($index)"
            role="option"
            [class.active]="isActive($index)"
            [attr.aria-selected]="isActive($index)"
            [attr.aria-disabled]="item.disabled ? 'true' : null"
            (click)="choose(item, $index)"
          >
            @if (item.icon) {
              <span class="orc-command-icon" aria-hidden="true">{{
                item.icon
              }}</span>
            }
            <span>{{ item.label }}</span>
            @if (item.shortcut) {
              <kbd>{{ item.shortcut }}</kbd>
            }
          </li>
        } @empty {
          @if (emptyText()) {
            <li class="empty">{{ emptyText() }}</li>
          }
        }
      </ul>
    </section>
  `,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-command{width:min(32rem,100%);padding:.5rem;border:1px solid var(--orc-component-border);border-radius:.65rem;background:var(--orc-component-surface);box-shadow:0 12px 30px var(--orc-component-shadow-color)}.orc-command input{width:100%;padding:.65rem .75rem;border:1px solid var(--orc-component-border-strong);border-radius:.4rem}.orc-command ul{max-height:20rem;overflow:auto;margin:.35rem 0 0;padding:0;list-style:none}.orc-command li[role=option]{display:flex;align-items:center;gap:.5rem;border-radius:.35rem;padding:.6rem;cursor:pointer}.orc-command li[role=option][aria-disabled=true]{cursor:not-allowed;opacity:.55}.orc-command li.active,.orc-command li[role=option]:hover:not([aria-disabled=true]){background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive-hover)}.orc-command kbd{margin-left:auto;color:var(--orc-component-text-muted);font-size:.7rem}.orc-command .empty{padding:.8rem;color:var(--orc-component-text-muted)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandMenuComponent {
  readonly items = input<CommandItem[]>([]);
  readonly query = model('');
  readonly activeIndex = model(0);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly searchAriaLabel = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly itemSelect = output<CommandItem>();

  private readonly instanceId = ++nextCommandMenuId;
  private readonly filteredItemList = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) return this.items();
    return this.items().filter((item) =>
      [item.label, ...(item.keywords || [])]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  });
  private readonly enabledItemIndices = computed(() =>
    this.filteredItemList().flatMap((item, index) =>
      item.disabled ? [] : [index],
    ),
  );
  private readonly normalizedActiveIndex = computed(() => {
    const enabled = this.enabledItemIndices();
    if (!enabled.length) return -1;
    const active = this.activeIndex();
    return enabled.includes(active) ? active : enabled[0];
  });
  readonly listboxId = `orc-command-listbox-${this.instanceId}`;

  filteredItems(): CommandItem[] {
    return this.filteredItemList();
  }

  isActive(index: number): boolean {
    return this.normalizedActiveIndex() === index;
  }

  activeOptionId(): string | null {
    const active = this.normalizedActiveIndex();
    return active >= 0 ? this.optionId(active) : null;
  }

  optionId(index: number): string {
    return `orc-command-option-${this.instanceId}-${index}`;
  }

  setQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(this.enabledIndices()[0] ?? 0);
  }

  keydown(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;

    const enabled = this.enabledIndices();
    if (!enabled.length) return;

    const current = this.normalizedActiveIndex();
    switch (event.key) {
      case 'ArrowDown':
        this.moveActive(event, enabled, current, 1);
        break;
      case 'ArrowUp':
        this.moveActive(event, enabled, current, -1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(enabled[0]);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(enabled[enabled.length - 1]);
        break;
      case 'Enter': {
        const item = this.filteredItems()[current];
        if (item) {
          event.preventDefault();
          this.activate(item);
        }
        break;
      }
    }
  }

  choose(item: CommandItem, index: number): void {
    if (!item.disabled) this.activeIndex.set(index);
    this.activate(item);
  }

  activate(item: CommandItem): void {
    if (item.disabled) return;
    item.command?.();
    this.itemSelect.emit(item);
  }

  private enabledIndices(): number[] {
    return this.enabledItemIndices();
  }

  private moveActive(
    event: KeyboardEvent,
    enabled: number[],
    current: number,
    direction: -1 | 1,
  ): void {
    event.preventDefault();
    const currentPosition = enabled.indexOf(current);
    const nextPosition =
      (currentPosition + direction + enabled.length) % enabled.length;
    this.activeIndex.set(enabled[nextPosition]);
  }
}
