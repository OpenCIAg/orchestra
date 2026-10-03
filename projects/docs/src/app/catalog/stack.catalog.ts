import type { ComponentEntry } from '../models/component-entry.model';

export const STACK_CATALOG_ENTRY: ComponentEntry = {
  id: 'stack',
  name: 'Stack',
  description:
    'Layout flexível para empilhar elementos com alinhamento previsível.',
  category: 'Layout',
  status: 'beta',
  tags: ['stack', 'flex', 'layout'],
  icon: 'layers',
  route: '/components/stack',
};
