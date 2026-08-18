import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  signal,
  booleanAttribute,
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
  readonly multiple = input<boolean>(false, { transform: booleanAttribute });
  readonly value = model<string | number | string[] | number[]>(0);
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly variant = input<AccordionVariant>('default');
  readonly styleClass = input('');
  readonly ariaLabel = input('Accordion');
  readonly id = input<string | undefined>(undefined);
  readonly expandIcon = input<string | undefined>(undefined);
  readonly collapseIcon = input<string | undefined>(undefined);
  readonly selectOnFocus = input(false);
  readonly transitionOptions = input('');
  readonly headerAriaLevel = input(2);
  readonly activeIndex = model<number | number[] | null>(0);

  // Outputs (Signals API)
  readonly expandedChange = output<AccordionToggleEvent>();
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

  onItemToggle(targetItem: AccordionItemComponent, isExpanded: boolean, originalEvent: Event = new Event('toggle')): void {
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

    const visibleItems = this.items();
    const activeIndexes = visibleItems.filter(item => item.expanded()).map(item => visibleItems.indexOf(item));
    const activeValue = this.multiple() ? activeIndexes : (activeIndexes[0] ?? null);
    this.activeIndex.set(activeValue);
    this.expandedChange.emit({
      id: targetItem.itemId(),
      expanded: isExpanded,
      originalEvent,
      index: visibleItems.indexOf(targetItem),
    });
    const activeIds = visibleItems.filter(item => item.expanded()).map(item => item.itemId());
    this.value.set(this.multiple() ? activeIds : (activeIds[0] ?? ''));
    const event = { id: targetItem.itemId(), expanded: isExpanded, originalEvent, index: visibleItems.indexOf(targetItem) };
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
