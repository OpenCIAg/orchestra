import type { ComponentEntry } from '../models/component-entry.model';

export const CONTEXT_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'context-menu',
  name: 'Context Menu',
  description: 'Menu acionado pelo botão direito com posição contextual.',
  category: 'Navigation',
  status: 'beta',
  tags: ['context', 'menu', 'right click'],
  icon: '☷',
  route: '/components/context-menu',
};
