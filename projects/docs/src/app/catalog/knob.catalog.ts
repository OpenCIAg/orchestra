import type { ComponentEntry } from '../models/component-entry.model';

export const KNOB_CATALOG_ENTRY: ComponentEntry = {
  id: 'knob',
  name: 'Knob',
  description:
    'Mostrador circular ajustável para valores numéricos com limites.',
  category: 'Inputs',
  status: 'beta',
  tags: ['dial', 'knob', 'valor', 'circular'],
  icon: '🎚',
  route: '/components/knob',
};
