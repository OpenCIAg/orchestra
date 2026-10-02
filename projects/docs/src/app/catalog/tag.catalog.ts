import type { ComponentEntry } from '../models/component-entry.model';

export const TAG_CATALOG_ENTRY: ComponentEntry = {
  id: 'tag',
  name: 'Tag',
  description: 'Rótulo semântico removível para entidades e filtros.',
  category: 'Data Display',
  status: 'beta',
  tags: ['tag', 'label', 'status'],
  icon: '🏷️',
  route: '/components/tag',
};
