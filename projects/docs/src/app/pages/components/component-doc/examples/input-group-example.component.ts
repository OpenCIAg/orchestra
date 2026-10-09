import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputGroupComponent } from '@ciag/orchestra/input-group';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-input-group-example',
  standalone: true,
  imports: [InputGroupComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Prefixo</span
        ><orc-input-group prefix="https://"
          ><input
            class="native-control"
            aria-label="URL"
            placeholder="orchestra.design"
        /></orc-input-group>
      </div>
      <div class="example">
        <span class="example__label">Sufixo</span
        ><orc-input-group suffix=".com"
          ><input
            class="native-control"
            aria-label="Domínio"
            placeholder="example"
        /></orc-input-group>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupExampleComponent {}
