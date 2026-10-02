import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TextComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-text-example',
  standalone: true,
  imports: [TextComponent],
  template: `
    <div class="example-stack">
      <div class="example-stack example">
        <span class="example__label">Tons de texto</span>
        <orc-text size="lg">Texto principal</orc-text>
        <orc-text size="md" [muted]="true">Texto secundário</orc-text>
        <orc-text size="sm" [muted]="true">Metadados e apoio</orc-text>
      </div>
      <p class="example__caption">
        Use <code>muted</code> para reduzir a ênfase sem remover informação.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextExampleComponent {}
