import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AspectRatioComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-aspect-ratio-example',
  standalone: true,
  imports: [AspectRatioComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">16 / 9</span
        ><orc-aspect-ratio ratio="16 / 9"
          ><div
            style="
              display: grid;
              place-items: center;
              height: 100%;
              background: #dbeafe;
              color: #1d4ed8;
              font-weight: 700;
            "
          >
            16:9
          </div></orc-aspect-ratio
        >
      </div>
      <div class="example">
        <span class="example__label">1 / 1</span
        ><orc-aspect-ratio ratio="1 / 1"
          ><div
            style="
              display: grid;
              place-items: center;
              height: 100%;
              background: #dcfce7;
              color: #166534;
              font-weight: 700;
            "
          >
            1:1
          </div></orc-aspect-ratio
        >
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AspectRatioExampleComponent {}
