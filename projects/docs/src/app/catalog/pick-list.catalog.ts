import type { ComponentEntry } from '../models/component-entry.model';

export const PICK_LIST_CATALOG_ENTRY: ComponentEntry = {
  id: 'pick-list',
  name: 'PickList',
  description:
    'Transferência acessível entre listas com filtros e ações selecionadas ou em lote.',
  category: 'Data Display',
  status: 'beta',
  tags: ['picklist', 'transfer', 'list', 'selection', 'filter'],
  icon: '⇄',
  route: '/components/pick-list',
};
