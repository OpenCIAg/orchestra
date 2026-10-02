import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const MEGA_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'mega-menu',
  name: 'MegaMenu',
  description:
    'Menu agrupado em colunas com orientação horizontal ou vertical.',
  category: 'Navigation',
  status: 'beta',
  tags: ['menu', 'mega', 'navigation', 'keyboard'],
  icon: '☰',
  route: '/components/mega-menu',
};

export const MEGA_MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-mega-menu
  [items]="groups"
  orientation="horizontal"
  ariaLabel="Navegação principal"
  (itemSelect)="onSelect($event)"
/>`,
  guidance: `Cada grupo expõe itens folha. ArrowRight/ArrowLeft (ou ArrowDown/ArrowUp no modo vertical), Home e End movem o foco entre itens habilitados; itemSelect e onItemClick informam a ativação.`,
  variations: [
    {
      label: 'Horizontal',
      description: 'Grupos em colunas e navegação lateral.',
    },
    {
      label: 'Vertical',
      description: 'Grupos empilhados e navegação vertical.',
    },
    {
      label: 'Disabled',
      description: 'Grupos e itens desabilitados não são navegáveis.',
    },
  ],
};
