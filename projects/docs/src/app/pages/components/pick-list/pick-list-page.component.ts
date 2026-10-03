import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PickListComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { IconComponent } from '@ciag/orchestra/icon';

type PickListItem = P2Option<string>;
type TransferEvent = {
  items: PickListItem[];
  source: PickListItem[];
  target: PickListItem[];
};

@Component({
  selector: 'app-pick-list-page',
  standalone: true,
  imports: [IconComponent, RouterModule, PickListComponent, FooterComponent],
  templateUrl: './pick-list-page.component.html',
  styleUrl: './pick-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickListPageComponent {
  readonly source = signal<PickListItem[]>([
    { value: 'calendar', label: 'Calendar' },
    { value: 'data-table', label: 'Data Table' },
    { value: 'locked', label: 'Experimental', disabled: true },
    { value: 'tree', label: 'Tree View' },
  ]);
  readonly target = signal<PickListItem[]>([
    { value: 'button', label: 'Button' },
  ]);
  readonly disabled = signal(false);
  readonly status = signal('Nenhuma transferência ainda.');

  recordSelectedToTarget(event: TransferEvent): void {
    this.status.set(
      `${event.items.length} item(ns) movido(s) para selecionados.`,
    );
  }

  recordSelectedToSource(event: TransferEvent): void {
    this.status.set(
      `${event.items.length} item(ns) devolvido(s) para disponíveis.`,
    );
  }

  recordAllToTarget(event: TransferEvent): void {
    this.status.set(
      `${event.items.length} item(ns) disponível(is) movido(s) de uma vez.`,
    );
  }

  recordAllToSource(event: TransferEvent): void {
    this.status.set(
      `${event.items.length} item(ns) selecionado(s) devolvido(s) de uma vez.`,
    );
  }
}
