import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const ICON_CATALOG_ENTRY: ComponentEntry = {
  id: 'icon',
  name: 'Icon',
  description: 'Ícones SVG acessíveis com nomes e tamanhos consistentes.',
  category: 'Utility',
  status: 'beta',
  tags: ['icon', 'svg', 'symbol', 'accessibility'],
  icon: '✦',
  route: '/components/icon',
};

export const ICON_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/icon',
  usage: `import { IconComponent } from '@ciag/orchestra/icon';

<orc-icon
  name="check_circle"
  size="md"
  ariaLabel="Concluído"
/>`,
  guidance: `Ícones decorativos devem permanecer sem ariaLabel. Quando o ícone comunica uma ação ou estado sem texto, forneça um nome acessível. O componente carrega a fonte diretamente do Google Fonts; permita fonts.googleapis.com e fonts.gstatic.com na CSP.`,
  variations: [
    {
      label: 'Catalog',
      description:
        'Catálogo completo de Material Symbols Rounded, atualizado a partir dos metadados oficiais do Google.',
    },
    {
      label: 'Families',
      description: 'Outlined, Rounded ou Sharp com o mesmo nome de ligadura.',
    },
    {
      label: 'Sizes',
      description: 'xs, sm, md, lg, xl ou um número em pixels.',
    },
    {
      label: 'Axes',
      description:
        'Fill, weight, grade e opticalSize são controlados sem CSS adicional.',
    },
    {
      label: 'Decorative / labeled',
      description: 'Semântica definida por ariaLabel e title.',
    },
  ],
};
