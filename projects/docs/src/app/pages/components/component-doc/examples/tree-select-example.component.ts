import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  TreeSelectComponent,
  TreeSelectNode,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tree-select-example',
  standalone: true,
  imports: [TreeSelectComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Seleção hierárquica</span>
        <orc-tree-select
          label="Destino"
          placeholder="Selecione uma área"
          [nodes]="nodes"
          [(value)]="value"
        />
        <code>value = {{ value() || 'null' }}</code>
      </div>
      <p class="example__caption">
        Expanda os nós com <code>▸</code> e selecione um item folha.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly value = signal<string | null>(null);
  readonly nodes: TreeSelectNode[] = [
    {
      value: 'workspace',
      label: 'Workspace',
      children: [
        {
          value: 'apps',
          label: 'Aplicações',
          children: [
            { value: 'docs', label: 'Docs' },
            { value: 'admin', label: 'Admin' },
          ],
        },
        { value: 'packages', label: 'Pacotes' },
      ],
    },
    { value: 'settings', label: 'Configurações', disabled: true },
  ];

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      state: 'hierarchical selection',
    });
  }
}
