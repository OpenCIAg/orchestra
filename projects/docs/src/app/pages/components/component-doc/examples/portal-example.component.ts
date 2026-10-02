import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PortalComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-portal-example',
  standalone: true,
  imports: [PortalComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Projected content</span>
        <orc-portal
          ><div class="state-note">
            <strong>Portal surface</strong
            ><span
              >O consumidor controla o destino e o ciclo de vida do
              conteúdo.</span
            >
          </div></orc-portal
        >
      </div>
      <p class="example__caption">
        Esta implementação mantém a projeção explícita e aceita um
        <code>target</code> para integrações futuras.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalExampleComponent {}
