import type { ComponentEntry } from '../models/component-entry.model';

export const RATING_CATALOG_ENTRY: ComponentEntry = {
  id: 'rating',
  name: 'Rating',
  description:
    'Avaliação por estrelas e notas com suporte a meias-estrelas, ícones customizados e escala numérica.',
  category: 'Inputs',
  status: 'stable',
  tags: ['rating', 'star', 'estrela', 'avaliação', 'nota', 'score'],
  icon: '⭐',
  route: '/components/rating',
};
