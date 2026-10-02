import type { ComponentEntry } from '../models/component-entry.model';

export const PANEL_CATALOG_ENTRY: ComponentEntry = {
  id: 'panel',
  name: 'Panel',
  description: 'Contêiner com cabeçalho e corpo, opcionalmente recolhível.',
  category: 'Layout',
  status: 'beta',
  tags: ['panel', 'container', 'painel'],
  icon: '▦',
  route: '/components/panel',
};
