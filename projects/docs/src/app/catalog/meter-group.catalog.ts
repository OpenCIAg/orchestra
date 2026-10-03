import type { ComponentEntry } from '../models/component-entry.model';

export const METER_GROUP_CATALOG_ENTRY: ComponentEntry = {
  id: 'meter-group',
  name: 'Meter Group',
  description: 'Grupo de medidores para comparar valores em barra ou círculo.',
  category: 'Data Display',
  status: 'beta',
  tags: ['meter', 'values', 'medidores', 'comparação'],
  icon: 'signal_cellular_alt',
  route: '/components/meter-group',
};
