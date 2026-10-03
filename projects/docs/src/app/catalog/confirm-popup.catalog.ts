import type { ComponentEntry } from '../models/component-entry.model';

export const CONFIRM_POPUP_CATALOG_ENTRY: ComponentEntry = {
  id: 'confirm-popup',
  name: 'Confirm Popup',
  description:
    'Confirmação leve em popup ancorada ao gatilho, sem máscara modal.',
  category: 'Overlay',
  status: 'beta',
  tags: ['confirm', 'popup', 'confirmação'],
  icon: 'help',
  route: '/components/confirm-popup',
};
