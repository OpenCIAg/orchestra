import type { ComponentEntry } from '../models/component-entry.model';

export const STEPPER_CATALOG_ENTRY: ComponentEntry = {
  id: 'stepper',
  name: 'Stepper',
  description:
    'Navegação por etapas com seleção controlada e progresso horizontal ou vertical.',
  category: 'Navigation',
  status: 'beta',
  tags: ['stepper', 'progress', 'navigation', 'steps'],
  icon: '➜',
  route: '/components/progress?tab=stepper',
};
