import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionToggleEvent, AccordionVariant } from './accordion.types';
import type { AccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'orc-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  // Inputs (Signals API)
  readonly multiple = input<boolean>(false);
  readonly value = model<string | number | string[] | number[]>(0);
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly variant = input<AccordionVariant>('default');
  readonly styleClass = input('');
  readonly ariaLabel = input('Accordion');
  readonly expandIcon = input<string | undefined>(undefined);
  readonly collapseIcon = input<string | undefined>(undefined);
  readonly selectOnFocus = input(false);
  readonly transitionOptions = input('');

  // Outputs (Signals API)
  readonly expandedChange = output<AccordionToggleEvent>();
  readonly activeIndexChange = output<number | number[]>();
  readonly onOpen = output<AccordionToggleEvent>();
  readonly onClose = output<AccordionToggleEvent>();

  // Lista de itens registrados no accordion
  private readonly items = signal<AccordionItemComponent[]>([]);

  // ── Registro e Gerenciamento de Itens ──────────────────────
  registerItem(item: AccordionItemComponent): void {
    this.items.update(list => [...list, item]);
  }

  unregisterItem(item: AccordionItemComponent): void {
    this.items.update(list => list.filter(i => i !== item));
  }

  onItemToggle(targetItem: AccordionItemComponent, isExpanded: boolean): void {
    if (!this.multiple() && isExpanded) {
      // Fecha todos os outros itens quando multiple for false
      for (const item of this.items()) {
        if (item !== targetItem && item.expanded()) {
          item.expanded.set(false);
          item.closed.emit();
          item.toggle.emit(false);
        }
      }
    }

    this.expandedChange.emit({
      id: targetItem.itemId(),
      expanded: isExpanded,
    });
    this.value.set(isExpanded ? targetItem.itemId() : '');
    const event = { id: targetItem.itemId(), expanded: isExpanded };
    (isExpanded ? this.onOpen : this.onClose).emit(event);
  }

  // ── Navegação por Teclado (WAI-ARIA Accordion Pattern) ─────
  handleKeyNavigation(event: KeyboardEvent, currentItem: AccordionItemComponent): void {
    const enabledItems = this.items().filter(item => !item.disabled());
    const currentIndex = enabledItems.indexOf(currentItem);

    if (currentIndex === -1) return;

    let targetItem: AccordionItemComponent | undefined;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        targetItem = enabledItems[(currentIndex + 1) % enabledItems.length];
        break;

      case 'ArrowUp':
        event.preventDefault();
        targetItem =
          enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length];
        break;

      case 'Home':
        event.preventDefault();
        targetItem = enabledItems[0];
        break;

      case 'End':
        event.preventDefault();
        targetItem = enabledItems[enabledItems.length - 1];
        break;
    }

    if (targetItem) {
      targetItem.focusHeader();
    }
  }
}
