import type { ComponentEntry } from '../models/component-entry.model';

export const DOCK_CATALOG_ENTRY: ComponentEntry = {
  id: 'dock',
  name: 'Dock',
  description: 'Barra de atalhos no estilo dock com posicionamento flexível.',
  category: 'Navigation',
  status: 'beta',
  tags: ['dock', 'shortcuts', 'atalhos', 'navegação'],
  icon: 'space_dashboard',
  route: '/components/dock',
};
