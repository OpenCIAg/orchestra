import type { ComponentEntry } from '../models/component-entry.model';

export const PASSWORD_CATALOG_ENTRY: ComponentEntry = {
  id: 'password',
  name: 'Password',
  description: 'Campo de senha com alternância de visibilidade da máscara.',
  category: 'Inputs',
  status: 'beta',
  tags: ['password', 'senha', 'input', 'form'],
  icon: '🔒',
  route: '/components/password',
};
