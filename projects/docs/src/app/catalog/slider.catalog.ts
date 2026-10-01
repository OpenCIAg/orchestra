import type { ComponentEntry } from '../models/component-entry.model';

export const SLIDER_CATALOG_ENTRY: ComponentEntry = {
  id: 'slider',
  name: 'Slider',
  description:
    'Seleção de valores numéricos e intervalos com arrastar e navegação por teclado.',
  category: 'Inputs',
  status: 'stable',
  tags: ['range', 'numeric', 'slide', 'valor', 'intervalo', 'dual'],
  icon: '🎚️',
  route: '/components/slider',
};
