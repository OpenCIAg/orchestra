import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  DataTableComponent,
  DataTableColumn,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-data-table-example',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Ordenável + selecionável</span>
        <orc-data-table
          [data]="rows"
          [columns]="columns"
          rowKey="id"
          label="Componentes P2"
          [selectable]="true"
          [(selected)]="selectedRows"
          (rowClick)="onRowClick($event)"
        />
        <code>selected = {{ selectedRows().length }}</code>
      </div>
      <p class="example__caption">
        Clique nos cabeçalhos para ordenar; marque as linhas para controlar a
        seleção.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selectedRows = signal<Record<string, unknown>[]>([]);
  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Componente', sortable: true },
    { key: 'category', header: 'Categoria', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];
  readonly rows: Record<string, unknown>[] = [
    {
      id: 'calendar',
      name: 'Calendar',
      category: 'Data Display',
      status: 'Ready',
    },
    { id: 'combobox', name: 'Combobox', category: 'Inputs', status: 'Beta' },
    {
      id: 'cascade-select',
      name: 'Cascade Select',
      category: 'Inputs',
      status: 'Beta',
    },
    {
      id: 'data-table',
      name: 'Data Table',
      category: 'Data Display',
      status: 'Ready',
    },
    {
      id: 'tree-select',
      name: 'Tree Select',
      category: 'Inputs',
      status: 'Beta',
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  onRowClick(row: Record<string, unknown>): void {
    this.stateChange.emit({
      state: `Linha selecionada: ${String(row['name'] ?? row['id'])}`,
    });
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selectedRows().length,
      rows: this.rows.length,
    });
  }
}
