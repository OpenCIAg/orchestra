import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderListComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';
import { FooterComponent } from '../../../shared/footer/footer.component';

type OrderListItem = P2Option<string>;

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [RouterModule, OrderListComponent, FooterComponent],
  templateUrl: './order-list-page.component.html',
  styleUrl: './order-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListPageComponent {
  readonly items = signal<OrderListItem[]>([
    { value: 'calendar', label: 'Calendar' },
    { value: 'data-table', label: 'Data Table' },
    { value: 'experimental', label: 'Experimental (disabled)', disabled: true },
    { value: 'tree', label: 'Tree View' },
  ]);
  readonly selection = signal<OrderListItem[]>([]);
  readonly filter = signal('');
  readonly disabled = signal(false);
  readonly selectedLabels = computed(() => {
    const selected = this.selection();
    return selected.length
      ? selected.map((item) => item.label).join(', ')
      : 'Nenhum item selecionado';
  });
  readonly orderLabels = computed(() =>
    this.items()
      .map((item) => item.label)
      .join(' → '),
  );

  updateItems(value: OrderListItem[]): void {
    this.items.set(value);
  }

  updateSelection(value: OrderListItem | OrderListItem[] | null): void {
    this.selection.set(
      value == null ? [] : Array.isArray(value) ? value : [value],
    );
  }
}
