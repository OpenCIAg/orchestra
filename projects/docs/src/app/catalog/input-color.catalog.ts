import type { ComponentEntry } from '../models/component-entry.model';

export const INPUT_COLOR_CATALOG_ENTRY: ComponentEntry = {
  id: 'input-color',
  name: 'Input Color',
  description: 'Entrada de cor com valor hexadecimal controlado.',
  category: 'Inputs',
  status: 'beta',
  tags: ['color', 'picker', 'cor', 'hex'],
  icon: '🎨',
  route: '/components/input-color',
};
