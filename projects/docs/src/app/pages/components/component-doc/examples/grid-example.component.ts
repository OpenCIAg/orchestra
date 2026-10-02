import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-grid-example',
  standalone: true,
  imports: [GridComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Colunas responsivas</span>
        <orc-grid [columns]="3" gap=".75rem" label="Cards de métricas">
          <div class="state-note">
            <strong>Coverage</strong><span>92%</span>
          </div>
          <div class="state-note">
            <strong>Componentes</strong><span>42 P2</span>
          </div>
          <div class="state-note">
            <strong>Testes</strong><span>Aprovados</span>
          </div>
        </orc-grid>
      </div>
      <p class="example__caption">
        Remova <code>columns</code> e use <code>minColumnWidth</code> para uma
        grade auto-fit.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridExampleComponent {}
