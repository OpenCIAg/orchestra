import type { ComponentEntry } from '../models/component-entry.model';

export const TOOLTIP_CATALOG_ENTRY: ComponentEntry = {
  id: 'tooltip',
  name: 'Tooltip',
  description: 'Dica contextual flutuante ativada por hover ou foco.',
  category: 'Overlay',
  status: 'stable',
  tags: ['hint', 'tip', 'popup', 'hover', 'dica', 'ajuda'],
  icon: '💬',
  route: '/components/tooltip',
};
