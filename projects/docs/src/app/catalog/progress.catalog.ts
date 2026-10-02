import type { ComponentEntry } from '../models/component-entry.model';

export const PROGRESS_CATALOG_ENTRY: ComponentEntry = {
  id: 'progress',
  name: 'Progress',
  description:
    'Barras e círculos de progresso com modos determinado, indeterminado e segmentado.',
  category: 'Feedback',
  status: 'stable',
  tags: [
    'progress',
    'bar',
    'circle',
    'loading',
    'stepper',
    'progresso',
    'upload',
  ],
  icon: '📊',
  route: '/components/progress',
};
