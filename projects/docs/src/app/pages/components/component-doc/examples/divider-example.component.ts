import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerComponent } from '@ciag/orchestra/divider';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-divider-example',
  standalone: true,
  imports: [DividerComponent],
  template: `
    <div class="example-stack divider-demo">
      <div class="example">
        <span class="example__label">Sólido + rótulo</span
        ><orc-divider label="Ou" [decorative]="false" />
      </div>
      <div class="example-grid example-grid--two">
        <div class="example">
          <span class="example__label">Tracejado</span
          ><orc-divider variant="dashed" />
        </div>
        <div class="example">
          <span class="example__label">Pontilhado + recuado</span
          ><orc-divider variant="dotted" [inset]="true" />
        </div>
      </div>
      <div class="example divider-vertical-example">
        <span class="example__label">Vertical</span>
        <div class="divider-vertical-wrap">
          <span>Antes</span
          ><orc-divider
            orientation="vertical"
            variant="dashed"
            [decorative]="false"
          /><span>Depois</span>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerExampleComponent {}
