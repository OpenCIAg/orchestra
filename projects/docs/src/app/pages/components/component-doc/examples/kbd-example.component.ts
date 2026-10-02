import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbdComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-kbd-example',
  standalone: true,
  imports: [KbdComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Keyboard hint</span>
        <div class="chip-row">
          <orc-kbd [keys]="['⌘', 'K']" ariaLabel="Command K" /><orc-kbd
            keys="Esc"
            ariaLabel="Escape"
          /><orc-kbd
            [keys]="['↑', '↓']"
            ariaLabel="Setas para cima e para baixo"
          />
        </div>
      </div>
      <p class="example__caption">
        Passe uma string com <code>+</code> ou uma lista de teclas para
        controlar a leitura e o visual.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbdExampleComponent {}
