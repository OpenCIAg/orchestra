import type { ComponentEntry } from '../models/component-entry.model';

export const LINK_CATALOG_ENTRY: ComponentEntry = {
  id: 'link',
  name: 'Link',
  description: 'Link semântico com estados de foco, desabilitado e externo.',
  category: 'Typography',
  status: 'beta',
  tags: ['link', 'anchor', 'navigation'],
  icon: '↗',
  route: '/components/link',
};
