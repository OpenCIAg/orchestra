import type { ComponentEntry } from '../models/component-entry.model';

export const SWITCH_CATALOG_ENTRY: ComponentEntry = {
  id: 'switch',
  name: 'Switch / Toggle',
  description: 'Alternância de estado binário (on/off) com animação fluida.',
  category: 'Inputs',
  status: 'stable',
  tags: ['toggle', 'on/off', 'boolean', 'switch', 'habilitar'],
  icon: 'toggle_on',
  route: '/components/switch',
};
