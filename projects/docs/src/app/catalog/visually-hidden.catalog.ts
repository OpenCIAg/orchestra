import type { ComponentEntry } from '../models/component-entry.model';

export const VISUALLY_HIDDEN_CATALOG_ENTRY: ComponentEntry = {
  id: 'visually-hidden',
  name: 'Visually Hidden',
  description:
    'Conteúdo disponível para tecnologias assistivas sem ocupar espaço visual.',
  category: 'Utility',
  status: 'beta',
  tags: ['a11y', 'screen reader', 'hidden'],
  icon: '◉',
  route: '/components/visually-hidden',
};
