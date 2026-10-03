import type { ComponentEntry } from '../models/component-entry.model';

export const SPEED_DIAL_CATALOG_ENTRY: ComponentEntry = {
  id: 'speed-dial',
  name: 'Speed Dial',
  description: 'Ações secundárias agrupadas a partir de um gatilho flutuante.',
  category: 'Utility',
  status: 'beta',
  tags: ['speed dial', 'actions', 'fab'],
  icon: 'more_vert',
  route: '/components/speed-dial',
};
