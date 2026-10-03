import type { ComponentEntry } from '../models/component-entry.model';

export const PAGINATOR_CATALOG_ENTRY: ComponentEntry = {
  id: 'paginator',
  name: 'Paginator',
  description:
    'Controle de navegação entre páginas de conteúdo com seletor de quantidade de itens.',
  category: 'Navigation',
  status: 'stable',
  tags: ['pages', 'navigation', 'list', 'paginação', 'página', 'paginator'],
  icon: 'more_horiz',
  route: '/components/paginator',
};
