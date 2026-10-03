import type { ComponentEntry } from '../models/component-entry.model';

export const DATA_TABLE_CATALOG_ENTRY: ComponentEntry = {
  id: 'data-table',
  name: 'Data Table',
  description:
    'Tabela acessível com ordenação, seleção, loading e estado vazio.',
  category: 'Data Display',
  status: 'beta',
  tags: ['table', 'data', 'sort', 'select'],
  icon: 'table',
  route: '/components/data-table',
};
