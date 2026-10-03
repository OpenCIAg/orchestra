import type { ComponentEntry } from '../models/component-entry.model';

export const SELECT_CATALOG_ENTRY: ComponentEntry = {
  id: 'select',
  name: 'Select',
  description: 'Dropdown para seleção de uma ou múltiplas opções de uma lista.',
  category: 'Inputs',
  status: 'stable',
  tags: ['dropdown', 'form', 'lista', 'pick', 'escolha'],
  icon: 'arrow_drop_down_circle',
  route: '/components/select',
};
