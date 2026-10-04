import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SeparatorComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-separator-example',
  standalone: true,
  imports: [SeparatorComponent],
  template: `
    <div class="example-stack divider-demo">
      <div class="example">
        <span class="example__label">Horizontal</span>
        <p>Conteúdo acima</p>
        <orc-separator label="Seção" />
        <p>Conteúdo abaixo</p>
      </div>
      <div class="example divider-vertical-example">
        <span class="example__label">Vertical</span>
        <div class="divider-vertical-wrap">
          <span>Antes</span
          ><orc-separator
            orientation="vertical"
            label="Separador vertical"
          /><span>Depois</span>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorExampleComponent {}
