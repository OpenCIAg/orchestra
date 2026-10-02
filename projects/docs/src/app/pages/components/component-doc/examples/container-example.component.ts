import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContainerComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-container-example',
  standalone: true,
  imports: [ContainerComponent],
  template: `
    <div class="example">
      <span class="example__label">Constrained content</span>
      <orc-container maxWidth="28rem" padding="0">
        <div class="state-note">
          <strong>maxWidth = 28rem</strong
          ><span>Conteúdo centralizado com padding configurável.</span>
        </div>
      </orc-container>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerExampleComponent {}
