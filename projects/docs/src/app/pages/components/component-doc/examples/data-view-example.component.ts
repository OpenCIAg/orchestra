import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DataViewComponent } from '@ciag/orchestra/p2-doc-components';
import { ButtonComponent } from '@ciag/orchestra/button';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-data-view-example',
  standalone: true,
  imports: [DataViewComponent, ButtonComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Coleção local controlada</span>
        <div class="popover-row">
          <orc-button variant="secondary" (click)="setLayout('grid')">
            Grade
          </orc-button>
          <orc-button variant="secondary" (click)="setLayout('list')">
            Lista
          </orc-button>
          <orc-button variant="secondary" (click)="sort(1)">
            Nome A–Z
          </orc-button>
          <orc-button variant="secondary" (click)="sort(-1)">
            Nome Z–A
          </orc-button>
        </div>
        <ng-template #dataViewItem let-item>
          <strong>{{ item.name }}</strong>
          <span>{{ item.category }} · {{ item.owner }}</span>
        </ng-template>
        <orc-data-view
          [value]="items"
          [itemTemplate]="dataViewItem"
          [(layout)]="layout"
          [(first)]="first"
          [(sortField)]="sortField"
          [(sortOrder)]="sortOrder"
          [(filterValue)]="filter"
          filterBy="name"
          filterAriaLabel="Filtrar componentes"
          header="Componentes publicados"
          [paginator]="true"
          [rows]="2"
          [rowsPerPageOptions]="[2, 3, 5]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first}–{last} de {totalRecords}"
          ariaLabel="Coleção de componentes"
          (onPage)="onPage($event)"
        />
        <div class="example-grid example-grid--two">
          <code>layout = {{ layout() }}</code>
          <code>sort = {{ sortField() || 'none' }} / {{ sortOrder() }}</code>
          <code>first = {{ first() }}</code>
          <code>filter = {{ filter() || 'none' }}</code>
        </div>
      </div>
      <div class="example example--muted">
        <span class="example__label">Lazy / servidor</span>
        <p>
          O exemplo usa processamento local. Com <code>lazy</code>, trate
          <code>onLazyLoad</code>, atualize <code>value</code>/<code
            >totalRecords</code
          >
          e implemente a ordenação remota no consumidor quando necessário.
        </p>
        @if (message(); as message) {
          <code>{{ message }}</code>
        }
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly layout = signal<'grid' | 'list'>('grid');
  readonly first = signal(0);
  readonly sortField = signal<string | undefined>(undefined);
  readonly sortOrder = signal<1 | -1>(1);
  readonly filter = signal('');
  readonly message = signal('');
  readonly items = [
    {
      id: 'calendar',
      name: 'Calendar',
      category: 'Data Display',
      owner: 'Platform',
    },
    { id: 'combobox', name: 'Combobox', category: 'Inputs', owner: 'Forms' },
    {
      id: 'data-table',
      name: 'Data Table',
      category: 'Data Display',
      owner: 'Tables',
    },
    { id: 'tree', name: 'Tree', category: 'Data Display', owner: 'Hierarchy' },
    { id: 'tooltip', name: 'Tooltip', category: 'Overlay', owner: 'Feedback' },
  ];

  ngOnInit(): void {
    this.emit();
  }

  setLayout(layout: 'list' | 'grid'): void {
    this.layout.set(layout);
    this.message.set(`DataView: layout ${layout}`);
    this.emit();
  }

  sort(order: 1 | -1): void {
    this.sortField.set('name');
    this.sortOrder.set(order);
    this.first.set(0);
    this.message.set(
      `DataView: nome ${order === 1 ? 'crescente' : 'decrescente'}`,
    );
    this.emit();
  }

  onPage(event: { first: number; rows: number }): void {
    this.first.set(event.first);
    this.message.set(`DataView: página a partir de ${event.first + 1}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      layout: this.layout(),
      first: this.first(),
      sort: this.sortOrder() === 1 ? 'ascending' : 'descending',
      filter: this.filter(),
    });
  }
}
