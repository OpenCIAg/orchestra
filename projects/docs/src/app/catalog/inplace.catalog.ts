import type { ComponentEntry } from '../models/component-entry.model';

export const INPLACE_CATALOG_ENTRY: ComponentEntry = {
  id: 'inplace',
  name: 'Inplace',
  description: 'Alterna entre visualização e edição do conteúdo no próprio lugar.',
  category: 'Data Display',
  status: 'beta',
  tags: ['inline', 'edit', 'edição', 'inplace'],
  icon: '✏',
  route: '/components/inplace',
};
