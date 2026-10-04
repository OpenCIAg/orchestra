import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TreeNode, TreeViewComponent } from '@ciag/orchestra/tree-view';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tree-view-example',
  standalone: true,
  imports: [TreeViewComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Hierarquia expansível</span>
        <orc-tree-view
          [nodes]="nodes"
          label="Arquivos"
          (nodeSelect)="selectNode($event)"
        />
        <code>selected = {{ selectedId() || 'none' }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Teclado</span>
        <p>
          Foque um nó e use <code>←</code>, <code>→</code>, Enter ou Space para
          explorar a árvore.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeViewExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selectedId = signal<string | null>(null);
  readonly nodes: TreeNode[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      children: [
        {
          id: 'apps',
          label: 'Aplicações',
          children: [{ id: 'docs-app', label: 'Docs' }],
        },
        { id: 'packages', label: 'Pacotes' },
      ],
    },
    { id: 'settings', label: 'Configurações', disabled: true },
  ];

  ngOnInit(): void {
    this.emit();
  }

  selectNode(node: TreeNode): void {
    this.selectedId.set(node.id);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selectedId(),
      state: 'keyboard-ready',
    });
  }
}
