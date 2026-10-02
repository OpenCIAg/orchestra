import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputGroupComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-input-group-example',
  standalone: true,
  imports: [InputGroupComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Prefix</span
        ><orc-input-group prefix="https://"
          ><input
            class="native-control"
            aria-label="URL"
            placeholder="orchestra.design"
        /></orc-input-group>
      </div>
      <div class="example">
        <span class="example__label">Suffix</span
        ><orc-input-group suffix=".com"
          ><input
            class="native-control"
            aria-label="Domain"
            placeholder="example"
        /></orc-input-group>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupExampleComponent {}
