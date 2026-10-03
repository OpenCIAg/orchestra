import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'menu',
  name: 'Menu',
  description:
    'Menu acessível com itens controlados, submenus e navegação por teclado.',
  category: 'Navigation',
  status: 'stable',
  tags: ['menu', 'navigation', 'keyboard', 'submenu'],
  icon: 'menu',
  route: '/components/menu',
};

export const MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/menu',
  usage: `<orc-menu
  [items]="items"
  [popup]="true"
  [(visible)]="menuVisible"
  ariaLabel="Ações do projeto"
  (itemSelect)="onItemSelect($event)"
/>`,
  guidance: `Use items ou model para fornecer MenuItem. Em um popup, visible controla a apresentação, o clique fora e Escape fecham o menu, e o conteúdo continua renderizado no local declarado porque appendTo não faz a anexação. Trate itemSelect ou onItemClick para executar a ação escolhida. Itens com items abrem submenus e separator cria divisões semânticas.`,
  variations: [
    {
      label: 'Inline',
      description: 'Lista de ações renderizada no fluxo da página.',
    },
    {
      label: 'Popup',
      description:
        'Menu controlado por visible; clique fora e Escape fecham o popup, que permanece renderizado no local declarado.',
    },
    {
      label: 'Nested items',
      description: 'Itens com items formam submenus aninhados.',
    },
    {
      label: 'Keyboard navigation',
      description: 'Foco ativo e setas, Home, End e Escape navegam a lista.',
    },
  ],
};
