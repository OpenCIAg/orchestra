import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StackComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-stack-example',
  standalone: true,
  imports: [StackComponent],
  template: `
    <div class="example">
      <span class="example__label">Vertical rhythm</span>
      <orc-stack gap=".75rem">
        <div class="state-note">
          <strong>Step 1</strong><span>Define tokens</span>
        </div>
        <div class="state-note">
          <strong>Step 2</strong><span>Compose components</span>
        </div>
        <div class="state-note">
          <strong>Step 3</strong><span>Verify behavior</span>
        </div>
      </orc-stack>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackExampleComponent {}
