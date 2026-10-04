import type { ComponentEntry } from '../models/component-entry.model';

export const IMAGE_COMPARE_CATALOG_ENTRY: ComponentEntry = {
  id: 'image-compare',
  name: 'Image Compare',
  description:
    'Comparação de duas imagens com controle deslizante antes/depois.',
  category: 'Data Display',
  status: 'beta',
  tags: ['image', 'compare', 'antes', 'depois', 'imagem'],
  icon: 'compare',
  route: '/components/image-compare',
};
