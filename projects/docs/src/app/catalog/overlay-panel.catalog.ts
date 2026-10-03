import type { ComponentEntry } from '../models/component-entry.model';

export const OVERLAY_PANEL_CATALOG_ENTRY: ComponentEntry = {
  id: 'overlay-panel',
  name: 'Overlay Panel',
  description: 'Painel overlay com fechamento por interação externa e teclado.',
  category: 'Overlay',
  status: 'stable',
  tags: ['overlay', 'panel', 'painel', 'popover'],
  icon: 'web_asset',
  route: '/components/overlay-panel',
};
