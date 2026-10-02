import type { ComponentEntry } from '../models/component-entry.model';

export const ALERT_CATALOG_ENTRY: ComponentEntry = {
  id: 'alert',
  name: 'Alert',
  description: 'Mensagem inline de feedback com variantes de severidade.',
  category: 'Feedback',
  status: 'stable',
  tags: ['message', 'warning', 'info', 'error', 'alerta', 'mensagem'],
  icon: '⚠️',
  route: '/components/alert',
};
