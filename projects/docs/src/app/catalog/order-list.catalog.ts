import type { ComponentEntry } from '../models/component-entry.model';

export const ORDER_LIST_CATALOG_ENTRY: ComponentEntry = {
  id: 'order-list',
  name: 'OrderList',
  description:
    'Lista ordenável com seleção, filtro e controles acessíveis de posição.',
  category: 'Data Display',
  status: 'beta',
  tags: ['orderlist', 'list', 'selection', 'filter', 'reorder'],
  icon: '↕',
  route: '/components/order-list',
};
