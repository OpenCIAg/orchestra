import type { ComponentEntry } from '../models/component-entry.model';

export const MESSAGES_CATALOG_ENTRY: ComponentEntry = {
  id: 'messages',
  name: 'Messages',
  description: 'Lista de mensagens por severidade com ação de fechar.',
  category: 'Feedback',
  status: 'beta',
  tags: ['messages', 'alert', 'mensagens', 'feedback'],
  icon: '💬',
  route: '/components/messages',
};
