import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HoverCardComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-hover-card-example',
  standalone: true,
  imports: [HoverCardComponent],
  template: `
    <div class="example example--centered">
      <span class="example__label">Hover ou foco</span>
      <orc-hover-card label="Detalhes do componente">
        <button hover-card-trigger class="doc-button" type="button">
          Passe o mouse ou foque
        </button>
        <p class="popover-copy">
          Conteúdo contextual permanece associado ao gatilho e abre também com
          foco.
        </p>
      </orc-hover-card>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoverCardExampleComponent {}
