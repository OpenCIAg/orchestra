import type { ComponentEntry } from '../models/component-entry.model';

export const PORTAL_CATALOG_ENTRY: ComponentEntry = {
  id: 'portal',
  name: 'Portal',
  description:
    'Ponto de composição para conteúdo que pode ser movido pelo consumidor.',
  category: 'Utility',
  status: 'beta',
  tags: ['portal', 'composition', 'overlay'],
  icon: '◌',
  route: '/components/portal',
};
