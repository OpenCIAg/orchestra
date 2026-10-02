import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { CodeComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

const CODE_EXAMPLE = `const selected = signal('angular');

<orc-combobox
  [options]="options"
  [(value)]="selected"
/>`;

@Component({
  selector: 'doc-code-example',
  standalone: true,
  imports: [CodeComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">TypeScript + copy</span>
        <orc-code
          [code]="code"
          language="typescript"
          (copiedEvent)="onCopied($event)"
        />
      </div>
      <p class="example__caption">
        O botão copia o conteúdo completo e emite <code>copiedEvent</code>.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly code = CODE_EXAMPLE;

  onCopied(code: string): void {
    this.stateChange.emit({ state: `Código copiado · ${code.split('\n')[0]}` });
  }
}
