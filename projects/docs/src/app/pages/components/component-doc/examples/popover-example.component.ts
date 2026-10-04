import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PopoverComponent } from '@ciag/orchestra/popover';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-popover-example',
  standalone: true,
  imports: [PopoverComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Posicionamento</span>
        <div class="popover-row">
          <orc-popover placement="bottom" label="Detalhes abaixo">
            <button popover-trigger class="doc-button" type="button">
              Bottom
            </button>
            <p class="popover-copy">Conteúdo contextual alinhado ao gatilho.</p>
          </orc-popover>
          <orc-popover placement="top" label="Detalhes acima">
            <button
              popover-trigger
              class="doc-button doc-button--secondary"
              type="button"
            >
              Top
            </button>
            <p class="popover-copy">Escape ou clique fora fecha.</p>
          </orc-popover>
          <orc-popover placement="right" label="Detalhes à direita">
            <button
              popover-trigger
              class="doc-button doc-button--secondary"
              type="button"
            >
              Right
            </button>
            <p class="popover-copy">A posição é escolhida pelo consumidor.</p>
          </orc-popover>
        </div>
      </div>
      <div class="example example--muted">
        <span class="example__label">Estado controlado</span>
        <p>
          Use <code>[(open)]</code> quando o fluxo precisar abrir ou fechar o
          popover por código.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverExampleComponent {}
