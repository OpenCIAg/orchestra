import type { ComponentEntry } from '../models/component-entry.model';

export const CHECKBOX_CATALOG_ENTRY: ComponentEntry = {
  id: 'checkbox',
  name: 'Checkbox',
  description:
    'Seleção múltipla de opções independentes com estado indeterminado.',
  category: 'Inputs',
  status: 'stable',
  tags: ['select', 'form', 'boolean', 'toggle', 'check'],
  icon: 'check_box',
  route: '/components/checkbox',
};
