import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  listPickerEnabledIndexes,
  listPickerEquality,
  stepListPickerActive,
  toggleListPickerValue,
} from '@ciag/orchestra/internal';

export interface ListItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'orc-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-listbox p-component',
    '[class]': 'styleClass()',
    '[attr.id]': 'id() || null',
    '[attr.data-pc-name]': "'listbox'",
  },
})
export class ListComponent {
  readonly items = input<ListItem[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly selection = input<'none' | 'single' | 'multiple'>('none');
  readonly id = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly selectedIds = model<string[]>([]);
  readonly itemSelect = output<ListItem>();
  readonly activeIndex = signal(0);
  readonly listItems = viewChildren<ElementRef<HTMLButtonElement>>('listItem');
  private readonly selectionTouched = signal(false);

  isSelectable(): boolean {
    return this.selection() !== 'none';
  }

  isSelected(item: ListItem): boolean {
    const selectedIds = this.selectedIds();
    return selectedIds.length || this.selectionTouched()
      ? selectedIds.includes(item.id)
      : !!item.selected;
  }

  /** Returns the active tab stop even when the current item becomes disabled. */
  tabIndexFor(index: number): number {
    const items = this.items();
    const active = items[this.activeIndex()];
    const effectiveIndex =
      active && !active.disabled
        ? this.activeIndex()
        : items.findIndex((item) => !item.disabled);
    return !items[index]?.disabled && index === effectiveIndex ? 0 : -1;
  }

  select(item: ListItem): void {
    if (item.disabled) return;

    if (this.isSelectable()) {
      const hasExplicitSelection =
        this.selectedIds().length > 0 || this.selectionTouched();
      const current = hasExplicitSelection
        ? this.selectedIds()
        : this.items()
            .filter((candidate) => candidate.selected)
            .map((candidate) => candidate.id);
      this.selectionTouched.set(true);

      const equality = listPickerEquality(undefined, 'extract');
      if (this.selection() === 'single') {
        this.selectedIds.set([item.id]);
      } else {
        const toggle = toggleListPickerValue(current, item.id, equality);
        if (toggle) this.selectedIds.set(toggle.next);
      }
    }

    this.itemSelect.emit(item);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const items = this.items();
    const enabled = listPickerEnabledIndexes(
      items.length,
      (itemIndex) => !!items[itemIndex].disabled,
    );
    if (!enabled.length) return;

    let target: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      target = stepListPickerActive(
        index,
        event.key === 'ArrowDown' ? 1 : -1,
        enabled,
      );
    } else if (event.key === 'Home') {
      target = enabled[0];
    } else if (event.key === 'End') {
      target = enabled[enabled.length - 1];
    } else {
      return;
    }
    if (target === null) return;

    event.preventDefault();
    this.activeIndex.set(target);
    const destination = target;
    queueMicrotask(() => this.listItems()[destination]?.nativeElement.focus());
  }
}
