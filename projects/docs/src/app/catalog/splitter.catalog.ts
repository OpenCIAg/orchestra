import type { ComponentEntry } from '../models/component-entry.model';

export const SPLITTER_CATALOG_ENTRY: ComponentEntry = {
  id: 'splitter',
  name: 'Splitter',
  description:
    'Estrutura de painéis redimensionáveis em orientação horizontal ou vertical.',
  category: 'Layout',
  status: 'beta',
  tags: ['splitter', 'resize', 'panels'],
  icon: 'splitscreen',
  route: '/components/splitter',
};
