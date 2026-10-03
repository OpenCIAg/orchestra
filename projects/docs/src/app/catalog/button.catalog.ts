import type { ComponentEntry } from '../models/component-entry.model';

export const BUTTON_CATALOG_ENTRY: ComponentEntry = {
  id: 'button',
  name: 'Button',
  description:
    'Elemento de ação principal. Suporta variantes, tamanhos, ícones e estados de loading.',
  category: 'Inputs',
  status: 'stable',
  tags: ['action', 'cta', 'interactive', 'click', 'botão'],
  icon: 'touch_app',
  route: '/components/button',
};
