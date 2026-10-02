import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import {
  ChartComponent,
  type ChartData,
  type ChartType,
} from '@ciag/orchestra/chart';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-chart-example',
  standalone: true,
  imports: [ChartComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Rendered: bar, line, pie, doughnut</span>
        <div class="example-grid example-grid--two">
          <div>
            <span class="example__label">Bar</span>
            <orc-chart
              type="bar"
              [data]="chartData"
              height="180px"
              ariaLabel="Receita trimestral por equipe, barras"
              (onDataSelect)="onDataSelect($event)"
            />
          </div>
          <div>
            <span class="example__label">Line</span>
            <orc-chart
              type="line"
              [data]="chartData"
              height="180px"
              ariaLabel="Receita trimestral por equipe, linhas"
              (onDataSelect)="onDataSelect($event)"
            />
          </div>
          <div>
            <span class="example__label">Pie</span>
            <orc-chart
              type="pie"
              [data]="chartData"
              height="180px"
              ariaLabel="Receita por trimestre, pizza"
              (onDataSelect)="onDataSelect($event)"
            />
          </div>
          <div>
            <span class="example__label">Doughnut</span>
            <orc-chart
              type="doughnut"
              [data]="chartData"
              height="180px"
              ariaLabel="Receita por trimestre, rosca"
              (onDataSelect)="onDataSelect($event)"
            />
          </div>
        </div>
      </div>
      <div class="example">
        <span class="example__label">Compatibility values · unsupported</span>
        <p class="example__caption">
          Estes valores continuam aceitos por <code>ChartType</code>, mas
          atualmente exibem o status abaixo sem renderizar um gráfico.
        </p>
        <div class="example-grid example-grid--two">
          @for (type of compatibilityTypes; track type) {
            <div>
              <span class="example__label">{{ type }}</span>
              <orc-chart
                [type]="type"
                [data]="chartData"
                [ariaLabel]="'Compatibility type ' + type"
                height="140px"
              />
            </div>
          }
        </div>
      </div>
      <div class="example example--muted">
        <span class="example__label">Selection + keyboard</span>
        <p>
          Foque um ponto e use setas, <code>Home</code> ou <code>End</code> para
          mover a seleção; use <code>Enter</code> ou <code>Space</code> para
          emitir <code>onDataSelect</code>.
        </p>
        <code data-testid="chart-selection-state">
          {{ message() }}
        </code>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal('Nenhuma ação emitida ainda.');
  readonly compatibilityTypes: readonly ChartType[] = [
    'scatter',
    'bubble',
    'polarArea',
    'radar',
  ];
  readonly chartData: ChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Platform',
        data: [12, 19, 15, 25],
        backgroundColor: ['#1c6aed', '#174fc4', '#557fea', '#103b99'],
        borderColor: '#174fc4',
      },
      {
        label: 'Services',
        data: [8, 11, 18, 14],
        backgroundColor: ['#1cedb9', '#12bd94', '#62e8c4', '#098b6d'],
        borderColor: '#098b6d',
      },
    ],
  };

  onDataSelect(selection: { index: number; datasetIndex?: number }): void {
    const message = `Chart: ponto ${selection.index + 1}, dataset ${
      (selection.datasetIndex ?? 0) + 1
    }`;
    this.message.set(message);
    this.stateChange.emit({ state: message });
  }
}
