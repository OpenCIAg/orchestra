import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const PANEL_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'panel-menu',
  name: 'PanelMenu',
  description:
    'Menu em painéis expansíveis com seleção e navegação por teclado.',
  category: 'Navigation',
  status: 'beta',
  tags: ['menu', 'panel', 'navigation', 'keyboard'],
  icon: 'folder',
  route: '/components/panel-menu',
};

export const PANEL_MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-panel-menu
  [items]="items"
  ariaLabel="Seções do projeto"
  (itemSelect)="onSelect($event)"
/>`,
  guidance: `Enter/Space alternam painéis; ArrowUp/ArrowDown/Home/End percorrem a árvore renderizada; ArrowRight abre e ArrowLeft/Escape fecha e retorna ao pai. O contrato atual renderiza a raiz e um nível de filhos.`,
  variations: [
    {
      label: 'Single open',
      description: 'O padrão fecha o painel anterior ao abrir outro.',
    },
    {
      label: 'Multiple',
      description: 'Use multiple para manter vários painéis abertos.',
    },
    {
      label: 'Disabled',
      description: 'Itens desabilitados ficam fora do foco e da seleção.',
    },
  ],
};
