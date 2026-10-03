import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ToolbarComponent,
  ToolbarItemDirective,
} from '@ciag/orchestra/toolbar';
import { IconComponent } from '@ciag/orchestra/icon';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-toolbar-example',
  standalone: true,
  imports: [ToolbarComponent, ToolbarItemDirective, IconComponent],
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
            <orc-icon name="undo" size="sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Refazer"
          >
            <orc-icon name="redo" size="sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Adicionar"
          >
            <orc-icon name="add" size="sm" aria-hidden="true" />
          </button>
        </orc-toolbar>
      </div>
      <div class="example">
        <span class="example__label">Item desabilitado</span>
        <orc-toolbar label="Ações com item desabilitado">
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Anterior"
          >
            <orc-icon name="arrow_back" size="sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            [disabled]="true"
            aria-label="Bloqueado"
          >
            <orc-icon name="block" size="sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="toolbar-action"
            orcToolbarItem
            aria-label="Próximo"
          >
            <orc-icon name="arrow_forward" size="sm" aria-hidden="true" />
          </button>
        </orc-toolbar>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarExampleComponent {}
