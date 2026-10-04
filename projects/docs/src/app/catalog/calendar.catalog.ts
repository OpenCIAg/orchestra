import type { ComponentEntry } from '../models/component-entry.model';

export const CALENDAR_CATALOG_ENTRY: ComponentEntry = {
  id: 'calendar',
  name: 'Calendar',
  description: 'Calendário controlado para seleção e navegação por datas.',
  category: 'Data Display',
  status: 'beta',
  tags: ['calendar', 'date', 'month'],
  icon: 'calendar_month',
  route: '/components/calendar',
};
