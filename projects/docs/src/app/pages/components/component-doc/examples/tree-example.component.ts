import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  TreeComponent,
  HierarchyNode,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tree-example',
  standalone: true,
  imports: [JsonPipe, TreeComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Controlled hierarchy</span>
        <orc-tree
          [nodes]="nodes"
          [(selected)]="selected"
          selectionMode="checkbox"
          [propagateSelectionDown]="true"
          [filter]="true"
          filterPlaceholder="Filtrar nós"
          filterAriaLabel="Filtrar hierarquia"
          label="Estrutura do workspace"
          (nodeSelect)="onNodeSelect($event)"
        />
        <code>selected = {{ selected() | json }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Keyboard + selection</span>
        <p>
          {{
            message() || 'Use setas para navegar e Enter/Space para selecionar.'
          }}
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selected = signal<string | string[] | null>('workspace');
  readonly message = signal('');
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
    this.message.set(`Tree: ${node.label}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selected(),
      state: this.message() || 'keyboard-ready',
    });
  }
}
