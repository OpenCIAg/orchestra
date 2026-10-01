import type { ComponentEntry } from '../models/component-entry.model';

export const EMPTY_STATE_CATALOG_ENTRY: ComponentEntry = {
  id: 'empty-state',
  name: 'Empty State',
  description: 'Mensagem de ausência de dados com ação opcional.',
  category: 'Feedback',
  status: 'beta',
  tags: ['empty', 'feedback', 'action'],
  icon: '∅',
  route: '/components/empty-state',
};
