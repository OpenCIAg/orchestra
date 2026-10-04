import type { ComponentEntry } from '../models/component-entry.model';

export const CONFIRM_DIALOG_CATALOG_ENTRY: ComponentEntry = {
  id: 'confirm-dialog',
  name: 'Confirm Dialog',
  description:
    'Diálogo de confirmação com ações de aceitar, rejeitar e cancelar.',
  category: 'Overlay',
  status: 'beta',
  tags: ['confirm', 'dialog', 'confirmação', 'modal'],
  icon: 'task_alt',
  route: '/components/confirm-dialog',
};
