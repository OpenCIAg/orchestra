import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  contentChildren,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItemComponent } from './breadcrumb-item.component';
import {
  BreadcrumbItemData,
  BreadcrumbSeparator,
  BreadcrumbVariant,
} from './breadcrumb.types';

export interface ProcessedBreadcrumbItem extends Partial<BreadcrumbItemData> {
  label: string;
  isEllipsis: boolean;
  isLast: boolean;
  originalIndex: number;
}

@Component({
  selector: 'orc-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  // Inputs (Signals API)
  readonly items = input<BreadcrumbItemData[] | undefined>(undefined);
  readonly model = input<BreadcrumbItemData[] | undefined>(undefined);
  readonly home = input<BreadcrumbItemData | undefined>(undefined);
  readonly homeAriaLabel = input<string | undefined>(undefined);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');
  readonly separator = input<BreadcrumbSeparator | string>('chevron');
  readonly variant = input<BreadcrumbVariant>('default');
  readonly maxItems = input<number | undefined>(undefined);
  readonly itemsBeforeCollapse = input<number>(1);
  readonly itemsAfterCollapse = input<number>(1);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly expandAriaLabel = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);

  // Outputs (Signals API)
  readonly itemClick = output<{ item: BreadcrumbItemData; index: number }>();
  readonly onItemClick = this.itemClick;

  // Itens filhos registrados via projeção de conteúdo
  readonly breadcrumbItems = contentChildren(BreadcrumbItemComponent);
  readonly effectiveItems = computed(() => {
    const items = this.model() ?? this.items();
    if (!items) return undefined;
    return this.home() ? [this.home()!, ...items] : items;
  });

  // Estado de expansão do colapso (...)
  readonly isExpanded = signal<boolean>(false);

  // Cálculo de itens visíveis quando usamos o modo data-driven com colapso
  readonly processedItems = computed<ProcessedBreadcrumbItem[]>(() => {
    const rawItems = this.effectiveItems();
    if (!rawItems) return [];

    const max = this.maxItems();
    if (!max || rawItems.length <= max || this.isExpanded()) {
      return rawItems.map((item, index) => ({
        ...item,
        isEllipsis: false,
        isLast: index === rawItems.length - 1,
        originalIndex: index,
      }));
    }

    const beforeCount = Math.max(1, this.itemsBeforeCollapse());
    const afterCount = Math.max(1, this.itemsAfterCollapse());

    const beforeItems: ProcessedBreadcrumbItem[] = rawItems
      .slice(0, beforeCount)
      .map((item, idx) => ({
        ...item,
        isEllipsis: false,
        isLast: false,
        originalIndex: idx,
      }));

    const ellipsisItem: ProcessedBreadcrumbItem = {
      label: '...',
      isEllipsis: true,
      isLast: false,
      originalIndex: -1,
    };

    const afterItems: ProcessedBreadcrumbItem[] = rawItems
      .slice(rawItems.length - afterCount)
      .map((item, idx) => ({
        ...item,
        isEllipsis: false,
        isLast: idx === afterCount - 1,
        originalIndex: rawItems.length - afterCount + idx,
      }));

    return [...beforeItems, ellipsisItem, ...afterItems];
  });

  expand(): void {
    this.isExpanded.set(true);
  }

  onItemClicked(item: ProcessedBreadcrumbItem, index: number, event: MouseEvent): void {
    this.itemClick.emit({ item: item as BreadcrumbItemData, index });
  }
}
