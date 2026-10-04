import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const SCROLL_AREA_CATALOG_ENTRY: ComponentEntry = {
  id: 'scroll-area',
  name: 'Scroll Area',
  description:
    'Viewport com overflow controlado, sombras e scrollbar tematizado.',
  category: 'Utility',
  status: 'beta',
  tags: ['scroll', 'viewport', 'overflow'],
  icon: 'swipe_vertical',
  route: '/components/scroll-area',
};

export const SCROLL_AREA_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/scroll-area',
  usage: `<orc-scroll-area
  maxHeight="240px"
  orientation="vertical"
  label="Notas do projeto"
>
  Conteúdo longo...
</orc-scroll-area>`,
  guidance: `Defina maxHeight ou maxWidth para criar o viewport. O conteúdo continua sendo fornecido por ng-content e pode conter qualquer markup.`,
  variations: [
    { label: 'Vertical', description: 'Rolagem e sombras no eixo vertical.' },
    {
      label: 'Horizontal',
      description: 'Útil para tabelas ou código extenso.',
    },
    { label: 'Both', description: 'Viewport com os dois eixos.' },
    { label: 'Always visible', description: 'Mantém a scrollbar aparente.' },
  ],
};
