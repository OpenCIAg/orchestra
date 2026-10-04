import type { ComponentEntry } from '../models/component-entry.model';

export const TABLE_CATALOG_ENTRY: ComponentEntry = {
  id: 'table',
  name: 'Table',
  description: 'Tabela de dados com ordenação, seleção e paginação integrada.',
  category: 'Data Display',
  status: 'stable',
  tags: ['grid', 'data', 'tabela', 'rows', 'columns', 'sort'],
  icon: 'table',
  route: '/components/table',
};
