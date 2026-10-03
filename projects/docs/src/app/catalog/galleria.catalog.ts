import type { ComponentEntry } from '../models/component-entry.model';

export const GALLERIA_CATALOG_ENTRY: ComponentEntry = {
  id: 'galleria',
  name: 'Galleria',
  description:
    'Galeria controlada com indicadores, miniaturas e visualização em tela cheia.',
  category: 'Data Display',
  status: 'beta',
  tags: ['galleria', 'gallery', 'image', 'thumbnail', 'fullscreen'],
  icon: 'photo_library',
  route: '/components/galleria',
};
