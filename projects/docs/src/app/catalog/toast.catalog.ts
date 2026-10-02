import type { ComponentEntry } from '../models/component-entry.model';

export const TOAST_CATALOG_ENTRY: ComponentEntry = {
  id: 'toast',
  name: 'Toast / Notifications',
  description:
    'Notificação temporária flutuante com posicionamento configurável.',
  category: 'Feedback',
  status: 'stable',
  tags: ['notification', 'snack', 'toast', 'popup', 'notificação'],
  icon: '🔔',
  route: '/components/toast',
};
