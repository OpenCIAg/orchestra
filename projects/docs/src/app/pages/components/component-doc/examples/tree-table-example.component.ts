import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  TreeTableComponent,
  HierarchyNode,
  TreeTableColumn,
} from '@ciag/orchestra/tree-table';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tree-table-example',
  standalone: true,
  imports: [TreeTableComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Treegrid ordenável</span>
        <orc-tree-table
          [value]="nodes"
          [columns]="columns"
          [(selected)]="selected"
          selectionMode="checkbox"
          [filterable]="true"
          filterLabel="Filtrar workspace"
          [paginator]="true"
          [rows]="2"
          [rowsPerPageOptions]="[1, 2, 3]"
          ariaLabel="Tabela hierárquica do workspace"
          [showGridlines]="true"
          (nodeSelect)="onNodeSelect($event)"
        />
        <code>selected rows = {{ selected().size }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Filtro, ordenação, página</span>
        <p>
          {{
            message() ||
              'Filtre, ordene a coluna Responsável ou selecione uma linha.'
          }}
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTableExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly message = signal('');
  readonly columns: TreeTableColumn[] = [
    { key: 'owner', header: 'Responsável', sortable: true },
  ];
  readonly nodes: HierarchyNode[] = [
    {
      key: 'workspace',
      label: 'Workspace',
      data: { owner: 'Platform' },
      children: [
        {
          key: 'apps',
          label: 'Aplicações',
          data: { owner: 'Web' },
          children: [
            { key: 'docs', label: 'Docs', data: { owner: 'Web' } },
            { key: 'admin', label: 'Admin', data: { owner: 'Platform' } },
          ],
        },
        { key: 'packages', label: 'Pacotes', data: { owner: 'Design' } },
      ],
    },
    { key: 'settings', label: 'Configurações', data: { owner: 'Platform' } },
    {
      key: 'archive',
      label: 'Arquivo',
      data: { owner: 'Legacy' },
      disabled: true,
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  onNodeSelect(node: HierarchyNode): void {
    this.message.set(`TreeTable: ${node.label}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selected().size,
      state: this.message() || 'treegrid-ready',
    });
  }
}
