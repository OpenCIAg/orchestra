import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const CHART_CATALOG_ENTRY: ComponentEntry = {
  id: 'chart',
  name: 'Chart',
  description:
    'Gráficos SVG de barras, linhas, pizza e rosca com seleção por teclado.',
  category: 'Data Display',
  status: 'beta',
  tags: ['chart', 'grafico', 'data', 'svg', 'visualization'],
  icon: 'show_chart',
  route: '/components/chart',
};

export const CHART_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/chart',
  usage: `<orc-chart
  type="bar"
  [data]="chartData"
  ariaLabel="Receita por trimestre"
  (onDataSelect)="handlePointSelection($event)"
/>`,
  guidance: `Os tipos bar, line, pie e doughnut renderizam SVG. scatter, bubble, polarArea e radar permanecem no ChartType por compatibilidade, mas exibem apenas um status de tipo não suportado; eles não renderizam dados. data usa labels e datasets numéricos. Os pontos renderizados são focáveis, recebem nomes acessíveis com rótulo e valor, e aceitam setas, Home, End, Enter e Space. Plugins e responsive são inputs deprecated de compatibilidade e não são executados; o dimensionamento usa width/height e os estilos do host.`,
  variations: [
    {
      label: 'Bar',
      description: 'Compara valores categóricos em uma ou mais séries.',
    },
    {
      label: 'Line',
      description: 'Mostra a sequência dos valores com pontos selecionáveis.',
    },
    {
      label: 'Pie / doughnut',
      description: 'Apresenta fatias baseadas no primeiro dataset.',
    },
    {
      label: 'Compatibility types',
      description:
        'scatter, bubble, polarArea e radar são aceitos pelo tipo público, mas exibem o status de não suportado.',
    },
  ],
};
