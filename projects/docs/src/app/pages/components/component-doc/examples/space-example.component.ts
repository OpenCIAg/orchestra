import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpaceComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-space-example',
  standalone: true,
  imports: [SpaceComponent],
  template: `
    <div class="example">
      <span class="example__label">Espaçamento consistente</span>
      <orc-space size="1rem" wrap="true">
        <button class="doc-button" type="button">Primary</button>
        <button class="doc-button doc-button--secondary" type="button">
          Secondary
        </button>
        <button class="doc-button doc-button--secondary" type="button">
          Tertiary
        </button>
      </orc-space>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceExampleComponent {}
