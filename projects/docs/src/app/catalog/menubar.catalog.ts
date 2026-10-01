import type { ComponentEntry } from '../models/component-entry.model';

export const MENUBAR_CATALOG_ENTRY: ComponentEntry = {
  id: 'menubar',
  name: 'Menubar',
  description: 'Barra de menus com navegação por setas e atalhos.',
  category: 'Navigation',
  status: 'beta',
  tags: ['menu', 'navigation', 'keyboard'],
  icon: '☰',
  route: '/components/menubar',
};
