import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StackComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-stack-example',
  standalone: true,
  imports: [StackComponent],
  template: `
    <div class="example">
      <span class="example__label">Ritmo vertical</span>
      <orc-stack gap=".75rem">
        <div class="state-note">
          <strong>Passo 1</strong><span>Definir tokens</span>
        </div>
        <div class="state-note">
          <strong>Passo 2</strong><span>Compor componentes</span>
        </div>
        <div class="state-note">
          <strong>Passo 3</strong><span>Verificar comportamento</span>
        </div>
      </orc-stack>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackExampleComponent {}
