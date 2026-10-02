import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ToolbarComponent,
  ToolbarItemDirective,
} from '@ciag/orchestra/toolbar';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-toolbar-example',
  standalone: true,
  imports: [ToolbarComponent, ToolbarItemDirective],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Horizontal + loop</span>
        <orc-toolbar label="Ações de edição">
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Desfazer"
          >
            ↶
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Refazer"
          >
            ↷
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Adicionar"
          >
            ＋
          </button>
        </orc-toolbar>
      </div>
      <div class="example">
        <span class="example__label">Disabled item</span>
        <orc-toolbar label="Ações com item desabilitado">
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Anterior"
          >
            ←
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            [disabled]="true"
            aria-label="Bloqueado"
          >
            ⊘
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Próximo"
          >
            →
          </button>
        </orc-toolbar>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarExampleComponent {}
