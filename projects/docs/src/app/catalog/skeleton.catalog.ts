import type { ComponentEntry } from '../models/component-entry.model';

export const SKELETON_CATALOG_ENTRY: ComponentEntry = {
  id: 'skeleton',
  name: 'Skeleton',
  description: 'Placeholders animados para indicar conteúdo em carregamento.',
  category: 'Feedback',
  status: 'stable',
  tags: [
    'skeleton',
    'placeholder',
    'loading',
    'shimmer',
    'pulse',
    'carregamento',
  ],
  icon: '🦴',
  route: '/components/skeleton',
};
