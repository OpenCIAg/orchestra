import type { ComponentEntry } from '../models/component-entry.model';

export const RADIO_CATALOG_ENTRY: ComponentEntry = {
  id: 'radio',
  name: 'Radio',
  description: 'Seleção exclusiva entre opções de um grupo.',
  category: 'Inputs',
  status: 'stable',
  tags: ['select', 'form', 'group', 'radio', 'escolha'],
  icon: 'radio_button_checked',
  route: '/components/radio',
};
