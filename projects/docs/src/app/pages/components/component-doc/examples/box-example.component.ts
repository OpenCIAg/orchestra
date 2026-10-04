import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BoxComponent, TextComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-box-example',
  standalone: true,
  imports: [BoxComponent, TextComponent],
  template: `
    <div class="example">
      <span class="example__label">Primitiva de superfície</span>
      <orc-box padding="1rem" background="#eff6ff" radius=".75rem">
        <orc-text size="lg"
          >Box com padding, fundo e raio controlados.</orc-text
        >
      </orc-box>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoxExampleComponent {}
