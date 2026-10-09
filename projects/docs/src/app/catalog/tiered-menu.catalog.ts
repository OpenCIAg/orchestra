import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TIERED_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'tiered-menu',
  name: 'TieredMenu',
  description:
    'Menu hierárquico com submenus, foco roving e navegação por teclado.',
  category: 'Navigation',
  status: 'beta',
  tags: ['menu', 'navigation', 'submenu', 'keyboard'],
  icon: 'schema',
  route: '/components/tiered-menu',
};

export const TIERED_MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/tiered-menu',
  usage: `<orc-tiered-menu
  [items]="items"
  ariaLabel="Navegação do projeto"
  (itemSelect)="onSelect($event)"
/>`,
  guidance: `Use items ou model para fornecer a árvore. ArrowUp/ArrowDown/Home/End navegam no nível atual; ArrowRight abre o submenu e ArrowLeft/Escape retorna ao item pai. A implementação renderiza apenas um nível de filhos; níveis mais profundos permanecem fora do contrato verificado.`,
  variations: [
    {
      label: 'Inline',
      description: 'Menu visível com hierarquia e foco roving.',
    },
    {
      label: 'Popup',
      description: 'Use popup e visible para controlar a abertura.',
    },
    {
      label: 'Disabled',
      description: 'Itens desabilitados não recebem foco nem seleção.',
    },
  ],
};
