import type { ComponentEntry } from '../models/component-entry.model';

export const ORGANIZATION_CHART_CATALOG_ENTRY: ComponentEntry = {
  id: 'organization-chart',
  name: 'Organization Chart',
  description: 'Organograma hierárquico com seleção e nós recolhíveis.',
  category: 'Data Display',
  status: 'beta',
  tags: ['tree', 'org', 'hierarquia', 'organograma'],
  icon: '🏢',
  route: '/components/organization-chart',
};
