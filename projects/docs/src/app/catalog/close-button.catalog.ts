import type { ComponentEntry } from '../models/component-entry.model';

export const CLOSE_BUTTON_CATALOG_ENTRY: ComponentEntry = {
  id: 'close-button',
  name: 'Close Button',
  description: 'Ação compacta e nomeada para fechar overlays e mensagens.',
  category: 'Utility',
  status: 'beta',
  tags: ['close', 'dismiss', 'button'],
  icon: '×',
  route: '/components/close-button',
};
