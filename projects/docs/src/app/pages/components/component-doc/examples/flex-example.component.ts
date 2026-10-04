import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FlexComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-flex-example',
  standalone: true,
  imports: [FlexComponent],
  template: `
    <div class="example">
      <span class="example__label">Espaço entre</span>
      <orc-flex justify="space-between" align="center" gap=".75rem">
        <div class="state-note"><strong>Left</strong><span>Start</span></div>
        <div class="state-note"><strong>Center</strong><span>Meio</span></div>
        <div class="state-note"><strong>Right</strong><span>End</span></div>
      </orc-flex>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexExampleComponent {}
