import type { ComponentEntry } from '../models/component-entry.model';

export const BLOCK_UI_CATALOG_ENTRY: ComponentEntry = {
  id: 'block-ui',
  name: 'Block UI',
  description:
    'Bloqueia a interação de uma região da página durante operações em andamento.',
  category: 'Overlay',
  status: 'beta',
  tags: ['loading', 'block', 'overlay', 'bloqueio', 'espera'],
  icon: 'pause_circle',
  route: '/components/block-ui',
};
