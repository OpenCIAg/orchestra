import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpaceComponent } from '@ciag/orchestra/p2-doc-components';
import { ButtonComponent } from '@ciag/orchestra/button';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-space-example',
  standalone: true,
  imports: [SpaceComponent, ButtonComponent],
  template: `
    <div class="example">
      <span class="example__label">Espaçamento consistente</span>
      <orc-space size="1rem" wrap="true">
        <orc-button>Primary</orc-button>
        <orc-button variant="secondary">Secondary</orc-button>
        <orc-button variant="secondary">Tertiary</orc-button>
      </orc-space>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceExampleComponent {}
