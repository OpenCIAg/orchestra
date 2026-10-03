import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TAB_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'tab-menu',
  name: 'Tab Menu',
  description:
    'Navegação horizontal com seleção controlada, foco roving e suporte a links.',
  category: 'Navigation',
  status: 'beta',
  tags: ['tabs', 'navigation', 'keyboard', 'links'],
  icon: 'tab_unselected',
  route: '/components/tab-menu',
};

export const TAB_MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/tab-menu',
  usage: `<orc-tab-menu
  [model]="items"
  [(activeItem)]="activeItem"
  ariaLabel="Seções do projeto"
  (itemSelect)="onItemSelect($event)"
/>`,
  guidance: `Forneça model com itens visíveis e use activeItem para controlar a seleção. Itens disabled ficam fora da sequência de foco; use routerLink quando a navegação deve ser feita pelo Router.`,
  variations: [
    {
      label: 'Controlled selection',
      description: 'activeItem acompanha o estado selecionado.',
    },
    {
      label: 'Keyboard',
      description: 'Setas, Home e End movem o foco entre itens ativos.',
    },
    {
      label: 'Disabled item',
      description: 'Item desabilitado não recebe foco nem ativação.',
    },
    {
      label: 'Scrollable',
      description: 'Itens largos preservam uma linha rolável.',
    },
  ],
};
